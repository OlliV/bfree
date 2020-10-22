import { BluetoothServiceType } from "./global";

async function connect(device) {
	try {
		const server = await exponentialBackoff(3 /* max retries */, 2 /* seconds delay */,
			async () => {
				time(`Connecting to Bluetooth Device (${device.name})...`);
				return await device.gatt.connect();
			});

		console.log(`Bluetooth Device connected (${device.name}).`);
		return server;
	} catch (err) {
		time(`Failed to reconnect (${device.name}).`);
		return null;
	}
}

interface BtDevice {
	device: any;
	server: any;
}

/*
 * @param connectCb is called on the initial connect as well as on reconnects. This allows restarting the notifications.
 */
export async function pairDevice(service: BluetoothServiceType, connectCb: (dev: BtDevice) => Promise<void>) {
	const options = {
		//acceptAllDevices: true,
		filters: [ { services: [service] } ],
		optionalServices: ['battery_service'],
	};

	// @ts-ignore
	const device = await navigator.bluetooth.requestDevice(options);
	const onDisconnected = (e) => {
		console.log('> Bluetooth Device disconnected'); // TODO Show the name
		connect(device).then(async (server) => {
			const btDevice = {
				device,
				server,
			};

			await connectCb(btDevice);
		}).catch(console.error);
	}

	device.addEventListener('gattserverdisconnected', onDisconnected);
	const server = await connect(device);
	connectCb({
		device,
		server,
	});

	return {
		device,
		disconnect: () => {
			console.log(`> Disconnecting ${device.name}`);
			device.removeEventListener('gattserverdisconnected', onDisconnected);
			device.gatt.disconnect();
		}
	};
}

export async function readBatteryLevel(server) {
	const batteryService = await server.getPrimaryService('battery_service');
	const characteristic = await batteryService.getCharacteristic('battery_level');

	const value = await characteristic.readValue();
	return value.getUint8(0);
}

export async function startBatteryLevelNotifications(server, cb) {
	const service = await server.getPrimaryService('battery_service');
	const characteristic = await service.getCharacteristic('battery_level');

	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		cb(event.target.value.getUint8(0));
	});

	await characteristic.readValue();
	characteristic.startNotifications();

	return characteristic;
}

export async function startHRMNotifications(server, cb) {
	const service = await server.getPrimaryService('heart_rate');
	const characteristic = await service.getCharacteristic('heart_rate_measurement');

	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		const value = event.target.value;
		const flags = value.getUint8(0);
		const rate16Bits = flags & 0x1;
		const result: {
			ts: number;
			heartRate: number;
			contactDetected?: boolean;
			energyExpended?: number;
			rrIntervals?: number[]
		} = {
			ts: Date.now(),
			heartRate: 0,
		};

		let index = 1;
		if (rate16Bits) {
			result.heartRate = value.getUint16(index, /*littleEndian=*/true);
			index += 2;
		} else {
			result.heartRate = value.getUint8(index);
			index += 1;
		}
		const contactDetected = flags & 0x2;
		const contactSensorPresent = flags & 0x4;
		if (contactSensorPresent) {
			result.contactDetected = !!contactDetected;
		}
		const energyPresent = flags & 0x8;
		if (energyPresent) {
			result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
			index += 2;
		}
		const rrIntervalPresent = flags & 0x10;
		if (rrIntervalPresent) {
			let rrIntervals = [];
			for (; index + 1 < value.byteLength; index += 2) {
				rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
			}
			result.rrIntervals = rrIntervals;
		}

		cb(result);
	});

	characteristic.startNotifications();

	return characteristic;
}

export async function readCyclingPowerFeature(service) {
	const characteristic = await service.getCharacteristic('cycling_power_feature');

	const value = await characteristic.readValue();
	const flags = value.getUint32(0, true);
	const feature: {
		pedalPowerBalance: boolean;
		accumulatedTorque: boolean;
		wheelRevolutionData: boolean;
		crankRevolutionData: boolean;
		extremeMagnitudes: boolean;
		extremeAngles: boolean;
		deadSpotAngles: boolean; /* Top Dead Spot Present and Bottom Dead Spot Present bits of the Cycling Power Measurement characteristic */
		accumulatedEnergy: boolean;
		offsetCompensationIndicator: boolean;
		sensorMeasurementContext: 'force' | 'torque';
		instantaneousMeasurementDirection: boolean;
		offsetCompensation: boolean;
		cyclingPowerMeasurementContentMasking: boolean;
		multipleSensorLocations: boolean;
		crankLengthAdjustment: boolean;
		chainLengthAdjustment: boolean;
		chainWeightAdjustment: boolean;
		spanLengthAdjustment: boolean;
		factoryCalibration: boolean;
		enhancedOffsetCompensation: boolean;
	} = {
		pedalPowerBalance: !!(flags & 0x001),
		accumulatedTorque: !!(flags & 0x002),
		wheelRevolutionData: !!(flags & 0x004),
		crankRevolutionData: !!(flags & 0x008),
		extremeMagnitudes: !!(flags & 0x010),
		extremeAngles: !!(flags & 0x020),
		deadSpotAngles: !!(flags & 0x040),
		accumulatedEnergy: !!(flags & 0x080),
		offsetCompensationIndicator: !!(flags & 0x100),
		sensorMeasurementContext: !(flags & 0x10000) ? 'force' : 'torque',
		instantaneousMeasurementDirection: !!(flags & 0x20000),
		offsetCompensation: false, // TODO Where is this bit???
		cyclingPowerMeasurementContentMasking: false, // TODO Where is this bit???
		multipleSensorLocations: false, // TODO Where is this bit???
		crankLengthAdjustment: false, // TODO Where is this bit???
		chainLengthAdjustment: false, // TODO Where is this bit???
		chainWeightAdjustment: false, // TODO Where is this bit???
		spanLengthAdjustment: false, // TODO Where is this bit???
		factoryCalibration: false, // TODO Where is this bit???
		enhancedOffsetCompensation: false, // TODO Where is this bit???
	};

	return feature;
}

export async function startCyclingPowerMeasurementNotifications(server, cb) {
	const service = await server.getPrimaryService('cycling_power');
	const feature = await readCyclingPowerFeature(service);

	let prevRevs = null;
	let prevLastWheelEvent = null;

	const characteristic = await service.getCharacteristic('cycling_power_measurement');
	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		const value = event.target.value;

		const flags = value.getUint16(0, true);
		const wheelRevolutionDataPresent = !!(flags & 0x10) && feature.wheelRevolutionData;
		const crankRevolutionDataPresent = !!(flags & 0x20) && feature.crankRevolutionData;

		// This field is mandatory and in the first position
		const instantaneousPower = value.getUint16(2, true);

		let cumulativeWheelRevolutions = null;
		let lastWheelEvent = null;
		let instantaneousSpeed = null;

		if (wheelRevolutionDataPresent) {
			// The field index may change if there are other fields present.
			// See CPS_v1.1 3.2
			// @ts-ignore TS doesn't like number + bool
			const iWheelRevolutionDataFieldPair = 4 + feature.pedalPowerBalance + feature.accumulatedTorque;

			cumulativeWheelRevolutions = value.getUint32(iWheelRevolutionDataFieldPair, true);
			lastWheelEvent = value.getUint16(iWheelRevolutionDataFieldPair + 4, true);

			if (prevRevs !== null && prevLastWheelEvent !== null) {
				const curRevs = cumulativeWheelRevolutions;
				const deltaRevs = curRevs - prevRevs;

				const curLastWheelEvent = lastWheelEvent;
				const deltaWheelEvents = curLastWheelEvent >= prevLastWheelEvent
					? curLastWheelEvent - prevLastWheelEvent
					: 0xffff - prevLastWheelEvent + curLastWheelEvent + 1;

				// TODO This should be configurable!
				// mm => m
				const circumferenceM = 2097 / 1000;
				// 2048 = as per CPS_v1.1:
				// > The ‘wheel event time’ is a free-running-count of
				// > 1/2048 second units and it represents the time when the wheel
				// > revolution was detected by the wheel rotation sensor.
				// The final result is m/s
				instantaneousSpeed = ((circumferenceM * deltaRevs) / (deltaWheelEvents / 2048)) || 0;
			}
			prevRevs = cumulativeWheelRevolutions;
			prevLastWheelEvent = lastWheelEvent;
		}

		cb({
			ts: Date.now(), // ms
			cumulativeWheelRevolutions,
			lastWheelEvent,
			power: instantaneousPower, // Watts
			speed: instantaneousSpeed, // m/s
		});
	});
	characteristic.startNotifications();

	return characteristic;
}

export async function startCyclingSpeedAndCadenceMeasurementNotifications(server, cb) {
	const service = await server.getPrimaryService('cycling_speed_and_cadence');
	const characteristic = await service.getCharacteristic('csc_measurement');

	let prevCumulativeWheelRevolutions = null;
	let prevLastWheelEvent = null;
	let prevCumulativeCrankRevolutions = null;
	let prevLastCrankEvent = null;

	characteristic.addEventListener('characteristicvaluechanged', (event) => {
		const value = event.target.value;

		const flags = value.getUint8(0, true);
		const wheelRevolutionDataPresent = !!(flags & 0x1);
		const crankRevolutionDataPresent = !!(flags & 0x2);

		let cumulativeWheelRevolutions = null;
		let lastWheelEvent = null;
		let cumulativeCrankRevolutions = null;
		let lastCrankEvent = null;
		let speed = null;
		let cadence = null;

		if (wheelRevolutionDataPresent) {
			cumulativeWheelRevolutions = value.getUint32(1, true);
			lastWheelEvent = value.getUint16(5, true);

			if (prevCumulativeWheelRevolutions !== null && prevLastWheelEvent !== null) {
				const prevRevs = prevCumulativeWheelRevolutions;
				const curRevs = cumulativeWheelRevolutions;
				const deltaRevs = curRevs - prevRevs;

				// @ts-ignore sensorValue is never undefined here
				const curLastWheelEvent = lastWheelEvent;
				const deltaWheelEvents = curLastWheelEvent >= prevLastWheelEvent
					? curLastWheelEvent - prevLastWheelEvent
					: 0xffff - prevLastWheelEvent + curLastWheelEvent + 1;

				// TODO This should be configurable!
				// mm => m
				const circumferenceM = 2097 / 1000;
				// 1024 = as per CSCS_SPECv10:
				// > The ‘wheel event time’ is a free-running-count of
				// > 1/1024 second units and it represents the time when the
				// > wheel revolution was detected by the wheel rotation sensor.
				// The final result is m/s
				speed = ((circumferenceM * deltaRevs) / (deltaWheelEvents / 1024)) || 0;
			}
			prevCumulativeWheelRevolutions = cumulativeWheelRevolutions;
			prevLastWheelEvent = lastWheelEvent;
		}
		if (crankRevolutionDataPresent) {
			cumulativeCrankRevolutions = value.getUint16(wheelRevolutionDataPresent ? 7 : 1, true);
			lastCrankEvent = value.getUint16(wheelRevolutionDataPresent ? 9 : 3, true);

			if (prevLastCrankEvent !== null && prevLastWheelEvent !== null) {
				const prevRevs = prevCumulativeCrankRevolutions;
				const curRevs = cumulativeCrankRevolutions;
				const deltaRevs = curRevs >= prevRevs
					? curRevs - prevRevs
					: 0xffff - prevRevs + curRevs + 1;

				const curLastCrankEvent = lastCrankEvent;
				const deltaLastCrankEvent = curLastCrankEvent >= prevLastCrankEvent
					? curLastCrankEvent - prevLastCrankEvent
					: 0xffff - prevLastCrankEvent + curLastCrankEvent + 1;

				cadence = ((deltaRevs / deltaLastCrankEvent) * 60) || 0;
			}
			prevCumulativeCrankRevolutions = cumulativeCrankRevolutions;
			prevLastCrankEvent = lastCrankEvent;
		}

		cb({
			ts: Date.now(),
			cumulativeWheelRevolutions,
			lastWheelEvent,
			cumulativeCrankRevolutions,
			lastCrankEvent,
			speed,
			cadence,
		});
	});
	characteristic.startNotifications();

	return characteristic;
}

export async function startSmartTrainerNotifications(server, cb) {
	const service = await server.getPrimaryService('6e40fec1-b5a3-f393-e0a9-e50e24dcca9e');
	const characteristic = await service.getCharacteristic('6e40fec2-b5a3-f393-e0a9-e50e24dcca9e'); // TX
	//const characteristic = await service.getCharacteristic('6e40fec3-b5a3-f393-e0a9-e50e24dcca9e'); // RX

	// This is here because we will be receiving different message types and
	// we need to keep the previous results.
	let prevResult: {
		elapsedTime?: number;
		instantPower?: number;
		power?: number;
		accumulatedPower?: number;
		cadence?: number;
		accumulatedDistance?: number;
		heartRate?: number;
		calStatus?: {
			powerCalRequired: boolean;
			resistanceCalRequired: boolean;
			userConfigRequired: boolean;
		}
	} = { };

	characteristic.addEventListener('characteristicvaluechanged', (event) => {
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
		let compChecksum = 0;
		for (let i = 0; i < value.byteLength - 1; i++) {
			compChecksum ^= value.getUint8(i);
		}
		const checksum = value.getUint8(3 + msgLen);
		if (checksum !== compChecksum) {
			console.error(`Invalid ANT+ message checksum ${checksum} != ${compChecksum}`);
			return;
		}

		const channelNo = value.getUint8(3);
		console.log('tacx', {
			msgLen,
			msgId,
			channelNo,
		});

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
			// TODO
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
			result.calStatus = {
				powerCalRequired,
				resistanceCalRequired,
				userConfigRequired,
			};
			result.cadence = instantaneousCadence;
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
		} else if (pageNumber === 80) { // Manufacturer ID
		} else if (pageNumber === 81) { // Product info
		}

		// We probably shouldn't be mutating a result object but always
		// create a new copy, thus we make a copy here.
		prevResult = JSON.parse(JSON.stringify(result))

		cb(result);
	});
	characteristic.startNotifications();
}

// RFE is this ever needed? We can just unpair and throwaway everything.
export async function stopNotifications(characteristic) {
	characteristic.stopNotifications();
}

async function exponentialBackoff(max, delay, toTry) {
	return new Promise((resolve, reject) => _exponentialBackoff(max, delay, toTry, resolve, reject));
}

async function _exponentialBackoff(max, delay, toTry, success, fail) {
	try {
		success(await toTry());
	} catch(error) {
		if (max === 0) {
			return fail(error);
		}
		time('Retrying in ' + delay + 's... (' + max + ' tries left)');
		setTimeout(function() {
			_exponentialBackoff(--max, delay * 2, toTry, success, fail);
		}, delay * 1000);
	}
}

function time(text: string) {
	console.log(`[${new Date().toJSON().substr(11, 8)}]${text}`);
}
