import Backdrop from '@material-ui/core/Backdrop';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import DefaultErrorPage from 'next/error';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import IconPause from '@material-ui/icons/Pause';
import IconSplit from '@material-ui/icons/Timer';
import IconStop from '@material-ui/icons/Stop';
import Modal from '@material-ui/core/Modal';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import FlightRecorder from '../../components/record/FlightRecorder';
import Graph, { SeriesDataPoint, Series } from '../../components/record/Graph';
import MyHead from '../../components/MyHead';
import MeasurementCard from '../../components/record/MeasurementCard';
import WorkoutController from '../../components/record/WorkoutController';
import ResistanceControl, { Resistance } from '../../components/record/ResistanceControl';
import DummyCard from '../../components/record/DummyCard';
import Ride from '../../components/record/Ride';
import Stopwatch from '../../components/record/Stopwatch';
import Title from '../../components/Title';
import { Lap, LapTriggerMethod } from '../../lib/activity_log';
import { speedUnitConv } from '../../lib/units';
import { useGlobalState } from '../../lib/global';

type RideType = 'free' | 'workout';

const measurementColors = [
	'#ffaeae', // heart_rate
	'#b1e67b', // power
	'#57baeb', // speed
];

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		colorPower: {
			background: measurementColors[1],
		},
		colorSpeed: {
			background: measurementColors[2],
		},
		colorHeartRate: {
			background: measurementColors[0],
		},
		bottomActions: {
			position: 'fixed',
			left: 0,
			bottom: 0,
			width: '100vw',
		},
		pauseModal: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		pausePaper: {
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
		pauseStopwatch: {
			textAlign: 'center',
		},
	})
);

function lap2Series(lap: Lap, speedUnit): Series {
	const { startTime } = lap;

	const hrData: SeriesDataPoint[] = lap.trackPoints.map((p) => ({
		x: p.time - startTime,
		y: typeof p.hr === 'number' ? p.hr : 0,
	}));
	const powerData: SeriesDataPoint[] = lap.trackPoints.map((p) => ({
		x: p.time - startTime,
		y: typeof p.power === 'number' ? p.power : 0,
	}));
	const speedData: SeriesDataPoint[] = lap.trackPoints.map((p) => ({
		x: p.time - startTime,
		y: typeof p.speed === 'number' ? speedUnit.convTo(p.speed) : 0,
	}));

	return [
		{
			id: 'HR (BPM)',
			data: hrData,
		},
		{
			id: 'Power [W]',
			data: powerData,
		},
		{
			id: `Speed [${speedUnit.name}]`,
			data: speedData,
		},
	];
}

function DataGraph() {
	const [logger] = useGlobalState('currentActivityLog');
	const [unitSpeed] = useGlobalState('unitSpeed');
	const speedUnit = speedUnitConv[unitSpeed];
	let series: Series = [];

	if (logger) {
		const lap = logger.getCurrentLap();
		if (lap) {
			series = lap2Series(lap, speedUnit);
		}
	}

	return (
		<Grid item xs={12}>
			<Graph series={series} colors={measurementColors} />
		</Grid>
	);
}

function FreeRideDashboard() {
	const router = useRouter();
	const classes = useStyles();
	const [logger] = useGlobalState('currentActivityLog');
	const { resistance } = router.query;
	const rollingResistance = Number(router.query.rollingResistance);

	if (typeof resistance !== 'string' || !['basic', 'power', 'slope'].includes(resistance)) {
		return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Box>
			<Title disableBack={true}>Free Ride</Title>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<Ride />
				{logger ? (
					<ResistanceControl resistance={resistance as Resistance} rollingResistance={rollingResistance} />
				) : (
					<DummyCard />
				)}
				<MeasurementCard type="cycling_cadence" />
				<MeasurementCard type="cycling_speed" ribbonColor={classes.colorSpeed} />
				<MeasurementCard type="cycling_power" ribbonColor={classes.colorPower} />
				<MeasurementCard type="heart_rate" ribbonColor={classes.colorHeartRate} />
				<DataGraph />
			</Grid>
		</Box>
	);
}

function WorkoutDashboard({
	setMeta,
	doSplit,
	endRide,
}: {
	setMeta: (avatar: string, name: string) => void;
	doSplit: (time: number, triggerMethod: LapTriggerMethod) => void;
	endRide: (notes?: string) => void;
}) {
	const router = useRouter();
	const classes = useStyles();
	const [logger] = useGlobalState('currentActivityLog');
	const { id } = router.query;

	// TODO should also check if router.isReady
	if (typeof id !== 'string') {
		return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Box>
			<Title disableBack={true}>Workout</Title>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<Ride />
				{logger ? <WorkoutController setMeta={setMeta} doSplit={doSplit} endRide={endRide} /> : <DummyCard />}
				<MeasurementCard type="cycling_cadence" />
				<MeasurementCard type="cycling_speed" ribbonColor={classes.colorSpeed} />
				<MeasurementCard type="cycling_power" ribbonColor={classes.colorPower} />
				<MeasurementCard type="heart_rate" ribbonColor={classes.colorHeartRate} />
				<DataGraph />
			</Grid>
		</Box>
	);
}

function PauseModal({ show, onClose, children }: { show: boolean; onClose: () => void; children: any }) {
	const classes = useStyles();

	return (
		<Modal
			aria-labelledby="pause-modal-title"
			aria-describedby="pause-modal-description"
			className={classes.pauseModal}
			open={show}
			onClose={onClose}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{
				timeout: 500,
			}}
		>
			<Fade in={show}>
				<div className={classes.pausePaper}>
					<h2 id="pause-modal-title">Ride Paused</h2>
					{children}
				</div>
			</Fade>
		</Modal>
	);
}

function getRideType(rideType: string | string[]): RideType {
	switch (rideType) {
		case 'free':
		case 'workout':
			return rideType;
		default:
			return undefined;
	}
}

function getDashboardConfig(rideType: RideType) {
	switch (rideType) {
		case 'free':
			return {
				title: 'Free Ride',
				Dashboard: FreeRideDashboard,
			};
		case 'workout':
			return {
				title: 'Workout',
				Dashboard: WorkoutDashboard,
			};
		default:
			return {};
	}
}

export default function RideRecord() {
	const classes = useStyles();
	const router = useRouter();
	const rideType = getRideType(router.query.type);
	const [ridePaused, setRidePaused] = useGlobalState('ridePaused');
	const [currentActivityLog] = useGlobalState('currentActivityLog');
	const [rideStartTime, setRideStartTime] = useState(0);
	const [elapsedLapTime, setElapsedLapTime] = useGlobalState('elapsedLapTime');
	const [rideEnded, setRideEnded] = useState<boolean>(false);
	const { title, Dashboard } = useMemo(() => getDashboardConfig(rideType), [router.isReady, rideType]);

	// Prevent screen locking while recording
	useEffect(() => {
		let wakeLock = null;

		(async () => {
			try {
				// @ts-ignore
				wakeLock = await navigator.wakeLock.request('screen');
				console.log('WakeLock acquired');
			} catch (err) {
				console.log(`WakeLock failed: ${err.name}, ${err.message}`);
			}
		})();

		return () => {
			wakeLock.release().then(() => console.log('WakeLock released'));
			wakeLock = null;
		};
	}, []);

	const pauseRide = () => {
		setRidePaused(Date.now());
	};
	const continueRide = () => {
		if (rideStartTime === 0) {
			const now = Date.now();
			console.log(`Set ride start time: ${now}`);
			setRideStartTime(now);
		}
		setRidePaused(0);
	};
	const doSplit = (time: number, triggerMethod: LapTriggerMethod) => {
		if (currentActivityLog) {
			currentActivityLog.lapSplit(time, triggerMethod);
			setElapsedLapTime(0);
		}
	};
	const handleSplit = () => {
		doSplit(Date.now(), 'Manual');
	};
	const setMeta = (avatar: string, name: string) => {
		currentActivityLog.setAvatar(avatar);
		currentActivityLog.setName(name);
	};
	const endRide = (notes?: string) => {
		if (notes) {
			currentActivityLog.setNotes(notes);
		}
		setRidePaused(-1);
		setRideEnded(true);
		router.push('/ride/results');
	};
	const handleEndRide = () => {
		if (rideType === 'workout') {
			// Typically a workout would give us some results as notes at the
			// end of the ride.
			endRide('Inconclusive.');
		} else {
			endRide();
		}
	};

	if (!title) {
		return <DefaultErrorPage statusCode={400} />;
	} else {
		return (
			<Container maxWidth="md">
				<MyHead title={title} />
				<Dashboard setMeta={setMeta} doSplit={doSplit} endRide={endRide} />
				<FlightRecorder startTime={rideStartTime} />
				<PauseModal show={ridePaused === -1 && !rideEnded} onClose={continueRide}>
					<p id="pause-modal-description">Tap outside of this area to start the ride.</p>
				</PauseModal>
				<PauseModal show={ridePaused > 0} onClose={continueRide}>
					<p id="pause-modal-description">Tap outside of this area to continue.</p>
					<Stopwatch
						className={classes.pauseStopwatch}
						startTime={ridePaused}
						isPaused={ridePaused === 0 || ridePaused === -1}
					/>
				</PauseModal>
				<Box className={classes.bottomActions}>
					<BottomNavigation showLabels>
						<BottomNavigationAction label="Pause" icon={<IconPause />} onClick={pauseRide} />
						<BottomNavigationAction label="Split" icon={<IconSplit />} onClick={handleSplit} />
						<BottomNavigationAction label="End" icon={<IconStop />} onClick={handleEndRide} />
					</BottomNavigation>
				</Box>
			</Container>
		);
	}
}
