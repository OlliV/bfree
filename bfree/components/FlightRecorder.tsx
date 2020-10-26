import { useGlobalState, getGlobalState } from '../lib/global';
import { useEffect } from 'react';
import createActivityLog from '../lib/activity_log';

export default function FlightRecorder({ startTime }: { startTime: number }) {
	const [samplingRate] = useGlobalState('samplingRate');
	const [logger, setLogger] = useGlobalState('currentActivityLog');

	if (!logger && startTime !== 0) {
		try {
			const l = createActivityLog();
			l.lapSplit(startTime, 'Manual'); // Initial lap
			setLogger(l);
		} catch (err) {
			// TODO Show an error to the user
			console.error(err);
		}
	}

	useEffect(() => {
		if (!logger) {
			console.log('Waiting for logger');
			return;
		}

		const intervalId = setInterval(() => {
			try {
				if (getGlobalState('ridePaused') != 0) {
					// The recording is paused.
					return;
				}

				const cadence = getGlobalState('cycling_cadence');
				const power = getGlobalState('cycling_power');
				const speed = getGlobalState('cycling_speed');
				const speedAndCadence = getGlobalState('cycling_speed_and_cadence');
				const heartRate = getGlobalState('heart_rate');
				const smartTrainer = getGlobalState('smart_trainer');

				// TODO Select the right sources
				// TODO Do whatever filtering is required
				logger.addTrackPoint({
					time: Date.now(),
					speed: !speed ? undefined : speed.speed,
					power: !power ? undefined : power.power, // TODO Speed should averaged over x sec or so?
				});

				console.log('tick');
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
