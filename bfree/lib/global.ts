import { createGlobalState } from 'react-hooks-global-state';

export type BluetoothServiceType =
	'cycling_power' |
	'cycling_speed_and_cadence' |
	'heart_rate';
export type SensorType =
	'cycling_cadence' |
	'cycling_power' |
	'cycling_speed' |
	'cycling_speed_and_cadence' |
	'heart_rate' |
	'smart_trainer';

export const speedUnitConv = {
	kmph: {
		name: 'km/h',
		mul: 3.6,
	},
	mph: {
		name: 'mph',
		mul: 2.237,
	},
};

export const { useGlobalState } = createGlobalState({
	// Config
	units: {
		distanceUnit: 'km',
		speedUnit: 'kmph',
	},
	// Sensors
	btDevice_cycling_cadence: null,
	btDevice_cycling_power: null,
	btDevice_cycling_speed: null,
	btDevice_cycling_speed_and_cadence: null,
	btDevice_heart_rate: null,
	btDevice_smart_trainer: null, // TODO
	// Measurements
	cycling_cadence: null,
	cycling_power: null,
	cycling_speed: null,
	cycling_speed_and_cadence: null,
	heart_rate: null,
	// Control
	smart_trainer: null, // FIXME
});
