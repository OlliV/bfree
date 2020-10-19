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

export async function pairDevice(service: 'cycling_power' | 'cycling_speed_and_cadence' | 'heart_rate') {
	const options = {
		//acceptAllDevices: true,
		filters: [ { services: [service] } ],
		optionalServices: ['battery_service'],
	};

	// @ts-ignore
	const device = await navigator.bluetooth.requestDevice(options);
	const onDisconnected = () => {
	  console.log('> Bluetooth Device disconnected');
	  connect(device).catch(console.error);
	}

	device.addEventListener('gattserverdisconnected', onDisconnected);
	const server = await connect(device);

	return {
		device,
		server,
	};
}

export async function readBatteryLevel(server) {
	// @ts-ignore
	const batteryService = await server.getPrimaryService('battery_service');
	const characteristic = await batteryService.getCharacteristic('battery_level');

	const value = await characteristic.readValue();
	return value.getUint8(0);
}

export async function startNotifications(server, serviceName: string, characteristicName: string, setValue) {
	// @ts-ignore
	const service = await server.getPrimaryService(serviceName);
	const characteristic = await service.getCharacteristic(characteristicName);

	if (characteristicName === 'battery_level') {
		characteristic.addEventListener('characteristicvaluechanged', (event) => {
			setValue(event.target.value.getUint8(0));
		});
	} else if (service === 'heart_rate') {
		// TODO
		// @ts-ignore
		//const hrmService = await server.getPrimaryService(service);
		//const hrm = await hrmService.getCharacteristic('heart_rate_measurement');
		//console.log('hr bpm"' + await hrm.readValue());
	} else {
		characteristic.addEventListener('characteristicvaluechanged', (event) => {
			// TODO Just pass the raw thing?
			setValue(event);
		});
	}
	await characteristic.readValue();
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
