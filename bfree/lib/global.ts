import { createGlobalState } from 'react-hooks-global-state';
import { BtDevice } from './ble';
import createActivityLog from './activity_log';
import { CscMeasurements, HrmMeasurements } from './measurements';

export type BluetoothServiceType =
	'cycling_power' |
	'cycling_speed_and_cadence' |
	'heart_rate' |
	'6e40fec1-b5a3-f393-e0a9-e50e24dcca9e'; // TACX ANT+ FE-C over BLE
export type SensorType =
	'cycling_cadence' |
	'cycling_power' |
	'cycling_speed' |
	'cycling_speed_and_cadence' |
	'heart_rate' |
	'smart_trainer';

export type SensorSourceType = {
	id: SensorType;
	name: string;
}

export const cadenceSourceTypes: SensorSourceType[] = [
	{
		id: 'cycling_cadence',
		name: 'cadence sensor',
	},
	{
		id: 'cycling_speed_and_cadence',
		name: 'speed and cadence sensor',
	},
	{
		id: 'cycling_power',
		name: 'power sensor',
	},
	{
		id: 'smart_trainer',
		name: 'trainer',
	},
];

export const speedSourceTypes: SensorSourceType[] = [
	{
		id: 'cycling_power',
		name: 'power sensor',
	},
	{
		id: 'cycling_speed',
		name: 'speed sensor',
	},
	{
		id: 'cycling_speed_and_cadence',
		name: 'speed and cadence sensor',
	},
	{
		id: 'smart_trainer',
		name: 'trainer',
	},
];

export const powerSourceTypes: SensorSourceType[] = [
	{
		id: 'cycling_power',
		name: 'power sensor',
	},
	{
		id: 'smart_trainer',
		name: 'trainer',
	},
];

type State = {
	// Config
	samplingRate: number;
	cadenceSources: SensorSourceType[];
	speedSources: SensorSourceType[];
	powerSources: SensorSourceType[];
	unitDistance: 'km' | 'm' | 'mi';
	unitSpeed: 'kmph' | 'mph';
	rider: {
		weight: number;
		ftp: number;
		heartRate: {
			rest: number;
			max: number;
		};
	};
	bike: {
		wheelCircumference: number;
		weight: number;
		type: 'atb' | 'commuter' | 'road' | 'racing';
	};
	// Sensors
	btDevice_cycling_cadence: null | BtDevice;
	btDevice_cycling_power: null | BtDevice;
	btDevice_cycling_speed: null | BtDevice;
	btDevice_cycling_speed_and_cadence: null | BtDevice;
	btDevice_heart_rate: null | BtDevice;
	btDevice_smart_trainer: null | BtDevice;
	// Measurements
	cycling_cadence: null | CscMeasurements;
	cycling_power: any;
	cycling_speed: null | CscMeasurements;
	cycling_speed_and_cadence: any;
	heart_rate: null | HrmMeasurements;
	smart_trainer: any;
	// Control
	smart_trainer_control: any;
	// Recording state
	currentActivityLog: null | ReturnType<typeof createActivityLog>;
	ridePaused: number, // -1 = not started; 0 = not paused; anything else is a timestamp
	elapsedTime: number,
	elapsedLapTime: number,
	rideDistance: number,
}

const LOCAL_STORAGE_KEY = 'settings';
const initialState: State = {
	// Config
	samplingRate: 1, // Hz
	cadenceSources: [],
	speedSources: [],
	powerSources: [],
	unitDistance: 'km',
	unitSpeed: 'kmph',
	rider: {
		weight: 70,
		ftp: 200,
		heartRate: {
			rest: 50,
			max: 200,
		},
	},
	bike: {
		wheelCircumference: 2097, // mm
		weight: 10, // kg
		type: 'road',
	},
	// Sensors
	btDevice_cycling_cadence: null,
	btDevice_cycling_power: null,
	btDevice_cycling_speed: null,
	btDevice_cycling_speed_and_cadence: null,
	btDevice_heart_rate: null,
	btDevice_smart_trainer: null,
	// Measurements
	cycling_cadence: null,
	cycling_power: null,
	cycling_speed: null,
	cycling_speed_and_cadence: null,
	heart_rate: null,
	smart_trainer: null,
	// Control
	smart_trainer_control: null,
	// Recording state
	currentActivityLog: null,
	ridePaused: -1,
	elapsedTime: 0,
	elapsedLapTime: 0,
	rideDistance: 0,
	// Load config from local storage
	...(typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))),
};

const { useGlobalState: _useGlobalState, getGlobalState, setGlobalState } = createGlobalState(initialState);

type ConfigKey =
	'samplingRate' |
	'cadenceSources' |
	'speedSources' |
	'powerSources' |
	'unitDistance' |
	'unitSpeed' |
	'rider' |
	'bike';

function useGlobalState(key: keyof State) {
	const [value, setValue] = _useGlobalState(key);

	const setAndSaveValue = (value: Parameters<typeof setValue>[0]) => {
		setValue(value);

		// Defer saving to not disturb the render loop.
		setTimeout(() => {
			saveConfig();
		}, 0);
	};

	return [value, setAndSaveValue] as const;
}

function saveConfig() {
	const config: { [k in ConfigKey]: any } = {
		samplingRate: getGlobalState('samplingRate'),
		cadenceSources: getGlobalState('cadenceSources'),
		speedSources: getGlobalState('speedSources'),
		powerSources: getGlobalState('powerSources'),
		unitDistance: getGlobalState('unitDistance'),
		unitSpeed: getGlobalState('unitSpeed'),
		rider: getGlobalState('rider'),
		bike: getGlobalState('bike'),
	};

	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
};

export {
	useGlobalState,
	getGlobalState,
	setGlobalState,
	saveConfig,
}
