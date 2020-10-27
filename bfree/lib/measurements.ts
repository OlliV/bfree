import { SensorSourceType, getGlobalState, useGlobalState } from "./global";

export type Measurement = 'cycling_cadence' | 'cycling_power' | 'cycling_speed' | 'heart_rate';

export type CscMeasurements = {
	ts: number,
	cumulativeWheelRevolutions: number | null;
	lastWheelEvent: number | null;
	cumulativeCrankRevolutions: number | null;
	lastCrankEvent: number | null;
	speed: number | null;
	cadence: number | null;
}

export type TrainerMeasurements = {
	ts: number;
	elapsedTime?: number;
	instantPower?: number;
	power?: number;
	accumulatedPower?: number;
	cadence?: number;
	accumulatedDistance?: number;
	heartRate?: number;
	calStatus: {
		powerCalRequired: boolean;
		resistanceCalRequired: boolean;
		userConfigRequired: boolean;
	}
}

export type HrmMeasurements = {
	ts: number;
	heartRate: number;
	contactDetected?: boolean;
	energyExpended?: number;
	rrIntervals?: number[]
}

// TODO Skip sensor if the data is stale?
function useMeasurement(sources: string, predicate: (m: any) => boolean) {
	// @ts-ignore
	const srcArr = getGlobalState(sources);
	const v = srcArr.map((v: SensorSourceType) => v.id).map(useGlobalState).find((m: any) => predicate(m[0]));
	if (v) {
		return v[0];
	}
	return null;
}

function getMeasurement(sources: string, predicate: (m: any) => boolean) {
	// @ts-ignore
	const srcArr = getGlobalState(sources);
	return srcArr.map((v: SensorSourceType) => v.id).map(getGlobalState).find((m: any) => predicate(m)) || null;
}

export function useCyclingCadenceMeasurement(): CscMeasurements | null {
	return useMeasurement('cadenceSources',
		(d: CscMeasurements) => d && d.cadence !== null && d.cadence !== undefined);
}

export function getCyclingCadenceMeasurement(): CscMeasurements | null {
	return getMeasurement('cadenceSources',
		(d: CscMeasurements) => d && d.cadence !== null && d.cadence !== undefined);
}

export function useCyclingPowerMeasurement() {
	// TODO Power is not typed
	return useMeasurement('powerSources',
		(d: any) => d && d.power !== null && d.power !== undefined);
}

export function getCyclingPowerMeasurement() {
	// TODO Power is not typed
	return getMeasurement('powerSources',
		(d: any) => d && d.power !== null && d.power !== undefined);
}

export function useCyclingSpeedMeasurement(): CscMeasurements | null {
	return useMeasurement('speedSources',
		(d: CscMeasurements) => d && d.speed !== null && d.speed !== undefined);
}

export function getCyclingSpeedMeasurement(): CscMeasurements | null {
	return getMeasurement('speedSources',
		(d: CscMeasurements) => d && d.speed !== null && d.speed !== undefined);
}

export function useHeartRateMeasurement(): HrmMeasurements | null {
	// Currently we only support one source for heart rate.
	return useGlobalState('heart_rate')[0];
}

export function getHeartRateMeasurement(): HrmMeasurements | null {
	// Currently we only support one source for heart rate.
	return getGlobalState('heart_rate');
}

export function useMeasurementByType(type: Measurement) {
	switch (type) {
		case 'cycling_cadence':
			return useCyclingCadenceMeasurement();
		case 'cycling_power':
			return useCyclingPowerMeasurement();
		case 'cycling_speed':
			return useCyclingSpeedMeasurement();
		case 'heart_rate':
			return useHeartRateMeasurement();
	}
}
