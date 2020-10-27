import { TrainerMeasurements } from './measurements';

const TACX_FEC_OVER_BLE_SERVICE_UUID = '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e';
const TACX_FEC_CHARACTERISTIC_TX = '6e40fec2-b5a3-f393-e0a9-e50e24dcca9e';
const TACX_FEC_CHARACTERISTIC_RX = '6e40fec3-b5a3-f393-e0a9-e50e24dcca9e';

function calcChecksum(buf: DataView) {
	let checksum = 0;

	for (let i = 0; i < buf.byteLength - 1; i++) {
		checksum ^= buf.getUint8(i);
	}

	return checksum;
}

function setSendHeader(msg: DataView, len: number) {
		msg.setUint8(0, 0xa4); // sync
		msg.setUint8(1, len);  // len
		msg.setUint8(2, 0x4f); // type
		msg.setUint8(3, 0x05); // channel
}

export async function createSmartTrainerController(server: BluetoothRemoteGATTServer) {
	const service = await server.getPrimaryService(TACX_FEC_OVER_BLE_SERVICE_UUID);
	const characteristic = await service.getCharacteristic(TACX_FEC_CHARACTERISTIC_RX);

	const setBasicResistance = async (value) => {
		const buf = new ArrayBuffer(13);
		const msg = new DataView(buf);

		value = Math.round(Math.abs(value) * 2) & 0xff;

		// Header
		setSendHeader(msg, 0x09);

		// Payload
		msg.setUint8(4, 0x30); // page
		msg.setUint8(5, 0xff);
		msg.setUint8(6, 0xff);
		msg.setUint8(7, 0xff);
		msg.setUint8(8, 0xff);
		msg.setUint8(9, 0xff);
		msg.setUint8(10, 0xff);
		msg.setUint8(11, value);

		// Checksum
		msg.setUint8(12, calcChecksum(msg));

		characteristic.writeValue(buf);
	};

	const sendTargetPower = (value) => {
		const buf = new ArrayBuffer(13);
		const msg = new DataView(buf);

		value = Math.round(Math.abs(value * 4));

		// Header
		setSendHeader(msg, 0x09);

		// Payload
		msg.setUint8(4, 0x31); // page
		msg.setUint8(5, 0xff);
		msg.setUint8(6, 0xff);
		msg.setUint8(7, 0xff);
		msg.setUint8(8, 0xff);
		msg.setUint8(9, 0xff);
		msg.setUint8(10, value & 0x00ff);
		msg.setUint8(11, (value & 0xff00) >> 8);

		// Checksum
		msg.setUint8(12, calcChecksum(msg));

		characteristic.writeValue(buf);
	};

	return {
		characteristic,
		setBasicResistance,
		sendTargetPower,
	};
}

export async function startSmartTrainerNotifications(server: BluetoothRemoteGATTServer, measurementsCb: (res: TrainerMeasurements) => void) {
	const service = await server.getPrimaryService(TACX_FEC_OVER_BLE_SERVICE_UUID);
	const characteristic = await service.getCharacteristic(TACX_FEC_CHARACTERISTIC_TX);

	// This is here because we will be receiving different message types and
	// we need to keep the previous results.
	let prevResult: TrainerMeasurements = {
		ts: Date.now(),
		calStatus: {
			powerCalRequired: false,
			resistanceCalRequired: false,
			userConfigRequired: false,
		}
	};

	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		// @ts-ignore
		const value = event.target.value;

		const sync = value.getUint8(0);
		if (sync !== 0xa4) {
			console.error('Invalid ANT+ message sync byte', sync);
			return;
		}
		const msgLen = value.getUint8(1);
		const msgId = value.getUint8(2);
		if (value.byteLength < 3 + msgLen + 1) {
			console.error('Invalid ANT+ message size');
			return;
		}

		/*
		 * Verify the checksum.
		 */
		const checksum = value.getUint8(3 + msgLen);
		if (checksum !== calcChecksum(value)) {
			console.error(`Invalid ANT+ message checksum ${checksum}`);
			return;
		}

		const channelNo = value.getUint8(3);
		if (channelNo !== 0x05) {
			console.error(`No idea what to do with channelNo ${channelNo}`);
			return;
		}
		//console.log('tacx', {
		//	msgLen,
		//	msgId,
		//	channelNo,
		//});

		const result = prevResult;

		const offset = 4;
		const pageNumber = value.getUint8(offset);
		console.log('tacx received page', pageNumber);
		if (pageNumber === 1) { // Calibration request and response
		} else if (pageNumber === 2) { // Calibration in progress
		} else if (pageNumber === 16) { // General data page
			const equipmentType = {
				16: 'General',
				19: 'Treadmill',
				20: 'Elliptical',
				21: 'Stationary bike',
				22: 'Rower',
				23: 'Climber',
				24: 'Nordic Skier',
				25: 'Trainer',
			}[value.getUint8(offset + 1) & 0x1f] || 'Unknown';
			const elapsedTime = value.getUint8(offset + 2) * 0.25; // Unit 0.25 sec; rollover 64 sec
			const accumulatedDistance = value.getUint8(offset + 3); // meters
			const heartRate = value.getUint8(offset + 6);
			const capabilityBits = value.getUint8(offset + 7);
			const capabilities = {
				hrSource: !!(capabilityBits & 0x3),
				distanceCap: !!(capabilityBits & 0x4),
				speedIsVirtual: !!(capabilityBits & 0x8),
			}
			console.log({
				equipmentType,
				capabilities,
				heartRate,
				elapsedTime,
				accumulatedDistance,
			});

			result.elapsedTime = elapsedTime;
			result.accumulatedDistance = accumulatedDistance;
			result.heartRate = heartRate;
		} else if (pageNumber === 17) { // General settings
		} else if (pageNumber === 21) { // Stationary specific page
			const cadence = value.getUint8(offset + 4);
			const instantPower = value.getUint8(offset + 5) | (value.getUint8(offset + 4) << 8);
			const fecState = value.getUint8(offset + 7) >> 4;

			result.cadence = cadence;
			result.power = instantPower;
		} else if (pageNumber === 25) { // Trainer specific page
			const updateEventCount = value.getUint8(offset + 1);
			const instantaneousCadence = value.getUint8(offset + 2);
			const accumulatedPower = value.getUint8(offset + 3) | value.getUint8(offset + 4) << 8;
			const instantaneousPower = value.getUint8(offset + 5) | (value.getUint8(offset + 6) & 0x0f) << 8;

			const calBits = (value.getUint8(offset + 6) & 0xf0) >> 4;
			const powerCalRequired = !!(calBits & 0x1);
			const resistanceCalRequired = !!(calBits & 0x2);
			const userConfigRequired = !!(calBits & 0x4);

			const powerOverLimits = value.getUint8(offset + 7) & 0xf;
			const fecState = value.getUint8(offset + 7) >> 4;

			console.log({
				updateEventCount,
				instantaneousCadence,
				accumulatedPower,
				instantaneousPower,
				powerOverLimits,
				fecState,
				calStatus: {
					powerCalRequired,
					resistanceCalRequired,
					userConfigRequired,
				}
			});

			result.accumulatedPower = accumulatedPower;
			result.power = instantaneousPower;
			result.cadence = instantaneousCadence;
			result.calStatus.powerCalRequired = powerCalRequired;
			result.calStatus.resistanceCalRequired = resistanceCalRequired;
			result.calStatus.userConfigRequired = userConfigRequired;
		} else if (pageNumber === 32) { // Trainer torque page
			const updateEventCount = value.getUint8(offset + 1);
			const wheelRevolutions = value.getUint8(offset + 2); // Rollover 256
			const wheelAccumulatedPeriod = value.getUint8(offset + 3) | value.getUint8(offset + 4) << 8;
			const accumulatedTorque = value.getUint8(offset + 5) | value.getUint8(offset + 6) << 8;
			const fecState = value.getUint8(offset + 7) >> 4;
		} else if (pageNumber === 48) { // Basic resistance
		} else if (pageNumber === 49) { // Target power
		} else if (pageNumber === 50) { // Wind resistance
		} else if (pageNumber === 51) { // Track resistance
		} else if (pageNumber === 54) { // FE Trainer capabilities
			const maxResistance = value.getUint8(offset + 5) | value.getUint8(offset + 6) << 8;
			const capabilities = value.getUint8(offset + 7); // TODO
		} else if (pageNumber === 55) { // User configuration
		} else if (pageNumber === 70) { // Request data
		} else if (pageNumber === 71) { // Command status
			const lastCommandReceived = value.getUint8(offset + 1);
			const lastCommandSeq = value.getUint8(offset + 2);
			const lastCommandStatus = value.getUint8(offset + 3);
			if (lastCommandReceived === 48) { // FE basic resistance
				const setResistanceAck = value.getUint8(offset + 7) / 2;
			} else if (lastCommandReceived === 49) { // FE target power
				const targetPowerAck = value.getUint8(offset + 6) >> 2 | value.getUint8(offset + 7) << 6;
			} else if (lastCommandReceived === 50) { // Wind resistance
				const windResistanceAck = value.getUint8(offset + 5) * 0.01;
				const windSpeedAck = value.getUint8(offset + 6);
				const draftingFactorAck = value.getUint8(offset + 7);
			} else if (lastCommandReceived === 51) { // Track resistance
				const setGradeAck = (value.getUint8(5) | value.getUint8(6) << 8) * 0.01;
				const setRollingResistanceAck = value.getUint8(7);
			}
		} else if (pageNumber === 80) { // Manufacturer ID
		} else if (pageNumber === 81) { // Product info
		}

		result.ts = Date.now();

		// We probably shouldn't be mutating a result object but always
		// create a new copy, thus we make a copy here.
		prevResult = JSON.parse(JSON.stringify(result))

		measurementsCb(result);
	});
	characteristic.startNotifications();
}
