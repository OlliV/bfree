import { useEffect } from 'react';
import { useGlobalState, getGlobalState, setGlobalState } from '../../lib/global';
import createActivityLog from '../../lib/activity_log';
import {getCyclingCadenceMeasurement, getCyclingPowerMeasurement, getCyclingSpeedMeasurement, getHeartRateMeasurement} from '../../lib/measurements';

export default function FlightRecorder({ startTime }: { startTime: number }) {
	const [samplingRate] = useGlobalState('samplingRate');
	const [logger, setLogger] = useGlobalState('currentActivityLog');
	const [bikeParams] = useGlobalState('bike');

	useEffect(() => {
		if (!logger && startTime !== 0) {
			try {
				const l = createActivityLog();
				l.lapSplit(startTime, 'Manual'); // Initial lap
				setGlobalState('elapsedTime', 0);
				setGlobalState('elapsedLapTime', 0);
				setLogger(l);
			} catch (err) {
				// TODO Show an error to the user
				console.error(err);
			}
		}
	}, [startTime]);

	useEffect(() => {
		let resetOffset = true;
		let offset: number;

		if (!logger) {
			console.log('Waiting for logger');
			return;
		}

		const intervalId = setInterval(() => {
			try {
				if (getGlobalState('ridePaused') != 0) {
					// The recording is paused.
					resetOffset = true;
					return;
				}
				if (resetOffset) {
					resetOffset = false;
					offset = Date.now();
				}

				const cadence = getCyclingCadenceMeasurement();
				const power = getCyclingPowerMeasurement();
				const speed = getCyclingSpeedMeasurement();
				const heartRate = getHeartRateMeasurement();
				//const smartTrainer = getGlobalState('smart_trainer');

				// TODO Do whatever filtering is required
				const now = Date.now();
				logger.addTrackPoint({
					time: now,
					dist: !speed ? undefined : speed.cumulativeWheelRevolutions * (bikeParams.wheelCircumference / 1000),
					speed: !speed ? undefined : speed.speed,
					cadence: !cadence ? undefined : cadence.cadence,
					power: !power ? undefined : power.power, // TODO Power should averaged over x sec or so?
					hr: !heartRate ? undefined : heartRate.heartRate,
				});

				// Update elapsed time
				let elapsedTime = getGlobalState('elapsedTime');
				let elapsedLapTime = getGlobalState('elapsedLapTime');
				elapsedTime += now - offset;
				elapsedLapTime += now - offset;
				offset = now;
				setGlobalState('elapsedTime', elapsedTime);
				setGlobalState('elapsedLapTime', elapsedLapTime);

				console.log(`tick! ride: ${(elapsedTime / 1000).toFixed(2)} lap: ${(elapsedLapTime / 1000).toFixed(2)}`);
			} catch (err) {
				// TODO Show an error to the user
				console.error(err);
			}
		}, samplingRate * 1000);

		return () => {
			// Stop recording
			clearInterval(intervalId);
			// TODO Might not always be manual trigger
			logger.endActivityLog(Date.now(), 'Manual');
		};
	}, [logger]);

	return <div></div>;
}
