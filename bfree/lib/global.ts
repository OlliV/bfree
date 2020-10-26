import { Dispatch } from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import { BtDevice } from './ble';
import createActivityLog from './activity_log';

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

export interface UnitConv {
	[index: string]: {
		name: string;
		convTo: (v: number) => number
	}
}

const LOCAL_STORAGE_KEY = 'settings';

export const speedUnitConv: UnitConv = {
	kmph: {
		name: 'km/h',
		convTo: (v) => v * 3.6,
	},
	mph: {
		name: 'mph',
		convTo: (v) => v * 2.237,
	},
};

export const distanceUnitConv: UnitConv = {
	km: {
		name: 'km',
		convTo: (d) => d / 1000,
	},
	m: {
		name: 'm',
		convTo: (d) => d,
	},
	mi: {
		name: 'mi',
		convTo: (d) => d * 0.000621,
	},
}

type SensorSourceType = {
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
	};
	// Sensors
	btDevice_cycling_cadence: null | BtDevice;
	btDevice_cycling_power: null | BtDevice;
	btDevice_cycling_speed: null | BtDevice;
	btDevice_cycling_speed_and_cadence: null | BtDevice;
	btDevice_heart_rate: null | BtDevice;
	btDevice_smart_trainer: null | BtDevice;
	// Measurements
	cycling_cadence: any;
	cycling_power: any;
	cycling_speed: any;
	cycling_speed_and_cadence: any;
	heart_rate: any;
	smart_trainer: any;
	// Control
	smart_trainer_control: any;
	// Recording state
	currentActivityLog: null | ReturnType<typeof createActivityLog>;
	ridePaused: number, // -1 = not started; 0 = not paused; anything else is a timestamp
}

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
	// Load config from local storage
	...(typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))),
};

const { useGlobalState: _useGlobalState, getGlobalState } = createGlobalState(initialState);

function useGlobalState(key: keyof State) {
	const [value, setValue] = _useGlobalState(key);

	const setAndSaveValue = (value: Parameters<typeof setValue>[0]) => {
		setValue(value);
		saveConfig();
	};

	return [value, setAndSaveValue] as const;
}

function saveConfig() {
	const config = {
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
	saveConfig,
}
