import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import IconResistance from '@material-ui/icons/FitnessCenter';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { useGlobalState, getGlobalState, ControlParams } from '../../lib/global';
import createWorkoutRunner, { RunnerResponse } from '../../lib/workout_runner';
import { readWorkout } from '../../lib/workout_storage';
import { LapTriggerMethod } from '../../lib/activity_log';
import {
	stdBikeFrontalArea,
	stdBikeDragCoefficient,
	rollingResistanceCoeff,
	calcWindResistanceCoeff,
} from '../../lib/virtual_params';
import {
	getCyclingCadenceMeasurement,
	getCyclingPowerMeasurement,
	getCyclingSpeedMeasurement,
	getHeartRateMeasurement,
} from '../../lib/measurements';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		inlineIcon: {
			fontSize: '18px !important',
		},
		stopwatchCard: {
			height: '10em',
		},
		value: {
			float: 'right',
		},
	})
);

export default function WorkoutController({ doSplit, endRide }: { doSplit: (time: number, lapTrigger: LapTriggerMethod) => void, endRide: () => void }) {
	const classes = useStyles();
	const router = useRouter();
	const [elapsedTime] = useGlobalState('elapsedTime');
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');
	const [_controlParams, setControlParams] = useGlobalState('control_params');
	const [bike] = useGlobalState('bike');
	const [workoutRunner, setWorkoutRunner] = useState<ReturnType<typeof createWorkoutRunner>>();
	const [enabled, setEnabled] = useState(false);
	const altitude = 0;
	const windSpeed = 0; // head/tail component.
	const draftingFactor = 1.0; // 0.0 would be no air resistance simulation, where as 1.0 means no drafting effect.
	const windResistanceCoeff = useMemo(
		() => calcWindResistanceCoeff(stdBikeFrontalArea[bike.type], stdBikeDragCoefficient[bike.type], altitude),
		[bike]
	);
	const [message, setMessage] = useState('');

	const sendBasic = async (value: number) => {
		await smartTrainerControl.sendBasicResistance(value);
	};
	const sendPower = async (value: number) => {
		await smartTrainerControl.sendTargetPower(value);
	};
	const sendSlope = async (value: number) => {
		await smartTrainerControl.sendWindResistance(windResistanceCoeff, windSpeed, draftingFactor);
		// TODO Configurable rolling resistance
		await smartTrainerControl.sendSlope(value, rollingResistanceCoeff.asphalt);
		setControlParams((prev: ControlParams) => ({ ...prev, slope: value }));
	};

	// Load workout runner
	useEffect(() => {
		let wr: ReturnType<typeof createWorkoutRunner>;
		if (!smartTrainerControl) {
			// TODO Show error
			console.error('No smart trainer registered');
			return;
		}

		const { id: workoutId, type: rideType } = router.query;
		if (router.isReady && rideType === 'workout' && typeof workoutId === 'string') {
			setWorkoutRunner((prevRunner) => {
				if (prevRunner) {
					// Hopefully we'll never end up doing this because this
					// could break the running exercise.
					prevRunner.terminate();
				}

				const { script } = readWorkout(workoutId) || {};
				if (!script) {
					// TODO We should show an error
					return null;
				}

				wr = createWorkoutRunner(script);
				wr.onMessage((msg: RunnerResponse) => {
					// TODO Technically we should check that msg.time makes sense
					if ((+!!msg.basicLoad + +!!msg.power + +!!msg.slope +
						 +msg.doStop) > 1) {
						// TODO Better error handling
						console.error('Only one of the three resistance controls can be set at once');
						return;
					}

					if (msg.basicLoad) {
						sendBasic(msg.basicLoad).catch(console.error);
					} else if (msg.power) {
						sendPower(msg.power).catch(console.error);
					} else if (msg.slope) {
						sendSlope(msg.slope).catch(console.error);
					} else if (msg.doSplit) {
						doSplit(msg.time, msg.doSplit);
					} else if (msg.doStop) {
						endRide();
					}

					if (msg.message) {
						setMessage((_prev) => msg.message);
					}
				});

				return wr;
			});
		}

		return () => {
			if (wr) {
				// Reset resistance to zero.
				sendBasic(0).catch(console.error);
				setControlParams((prev: ControlParams) => {
					const newParams = { ...prev };

					delete newParams.slope;

					return newParams;
				});

				wr.terminate();
			}
		};
	}, [router.isReady, smartTrainerControl]);

	// Call the workout script on every tick.
	// How? We sort of cheat a bit, we never registered to any event but we
	// happen to know that elapsedTime is only updated at the tick of the
	// logger.
	useEffect(() => {
		if (!workoutRunner) {
			return;
		}

		const cadence = getCyclingCadenceMeasurement();
		const power = getCyclingPowerMeasurement();
		const speed = getCyclingSpeedMeasurement();
		const heartRate = getHeartRateMeasurement();
		const distance = getGlobalState('rideDistance');

		workoutRunner.sendMessage({
			time: elapsedTime,
			distance,
			speed: speed.speed,
			cadence: cadence.cadence,
			heartRate: heartRate.heartRate,
			power: power.power,
		});
	}, [workoutRunner, elapsedTime]);

	/* TODO Show the actual workout stats */
	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						<IconResistance className={classes.inlineIcon} /> Workout
					</Typography>
					<Container>
						<b>Message:</b> <p>{message}</p>
						<b>Current:</b> <div className={classes.value}>W/slope/basicResistance and a progress bar</div>
						<br />
						<b>Next:</b> <div className={classes.value}>start time & resistance</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}