import { useEffect } from 'react';
import { useGlobalState, getGlobalState, setGlobalState } from '../../lib/global';
import createActivityLog from '../../lib/activity_log';

export default function FlightRecorder({ startTime }: { startTime: number }) {
	const [samplingRate] = useGlobalState('samplingRate');
	const [logger, setLogger] = useGlobalState('currentActivityLog');

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

				const cadence = getGlobalState('cycling_cadence');
				const power = getGlobalState('cycling_power');
				const speed = getGlobalState('cycling_speed');
				const speedAndCadence = getGlobalState('cycling_speed_and_cadence');
				const heartRate = getGlobalState('heart_rate');
				const smartTrainer = getGlobalState('smart_trainer');

				// TODO Select the right sources
				// TODO Do whatever filtering is required
				const now = Date.now();
				logger.addTrackPoint({
					time: now,
					speed: !speed ? undefined : speed.speed,
					power: !power ? undefined : power.power, // TODO Speed should averaged over x sec or so?
				});

				// Update elapsed time
				let elapsedTime = getGlobalState('elapsedTime');
				let elapsedLapTime = getGlobalState('elapsedLapTime');
				elapsedTime += now - offset;
				elapsedLapTime += now - offset;
				offset = now;
				//setElapsedTime(elapsedTime);
				//setElapsedLapTime(elapsedLapTime);
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
		};
	}, [logger]);

	return <div></div>;
}
