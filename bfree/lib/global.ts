import { createGlobalState } from 'react-hooks-global-state';

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

export const { useGlobalState } = createGlobalState({
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
});
