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
export async function pairDevice(service: 'cycling_power' | 'cycling_speed_and_cadence' | 'heart_rate', connectCb: (dev: BtDevice) => Promise<void>) {
	const options = {
		//acceptAllDevices: true,
		filters: [ { services: [service] } ],
		optionalServices: ['battery_service'],
	};

	// @ts-ignore
	const device = await navigator.bluetooth.requestDevice(options);
	const onDisconnected = () => {
		console.log('> Bluetooth Device disconnected');
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
		server
	});

	return device;
}

export async function readBatteryLevel(server) {
	// @ts-ignore
	const batteryService = await server.getPrimaryService('battery_service');
	const characteristic = await batteryService.getCharacteristic('battery_level');

	const value = await characteristic.readValue();
	return value.getUint8(0);
}

export async function startHRMNotifications(server, cb) {
	return startNotifications(server, 'heart_rate', 'heart_rate_measurement', cb)
}

export async function startNotifications(server, serviceName: string, characteristicName: string, cb) {
	// @ts-ignore
	const service = await server.getPrimaryService(serviceName);
	const characteristic = await service.getCharacteristic(characteristicName);

	if (characteristicName === 'battery_level') {
		characteristic.addEventListener('characteristicvaluechanged', (event) => {
			cb(event.target.value.getUint8(0));
		});
		await characteristic.readValue();
	} else if (characteristicName === 'heart_rate_measurement') {
		characteristic.addEventListener('characteristicvaluechanged', (event) => {
			const value = event.target.value;
			const flags = value.getUint8(0);
			let rate16Bits = flags & 0x1;
			const result: { heartRate: number, contactDetected?: boolean, energyExpended?: number, rrIntervals?: number[] } = {
				heartRate: 0
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
			let rrIntervalPresent = flags & 0x10;
			if (rrIntervalPresent) {
				let rrIntervals = [];
				for (; index + 1 < value.byteLength; index += 2) {
					rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
				}
				result.rrIntervals = rrIntervals;
			}

			cb(result);
		});
	} else {
		characteristic.addEventListener('characteristicvaluechanged', (event) => {
			// TODO Just pass the raw thing?
			cb(event);
		});
	}
	characteristic.startNotifications();

	return characteristic;
}

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