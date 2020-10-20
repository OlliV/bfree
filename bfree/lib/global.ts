import { createGlobalState } from 'react-hooks-global-state';

export type SensorType = 'cycling_power' | 'speed_and_cadence' | 'heart_rate';

export const { useGlobalState } = createGlobalState({
	btDevice_cycling_power: null,
	btDevice_cycling_speed_and_cadence: null,
	btDevice_heart_rate: null,
	btDevice_smart_todo: null, // TODO
	cycling_power: null,
	cycling_speed_and_cadence: null,
	heart_rate: null,
	smart_todo: null, // FIXME
});
