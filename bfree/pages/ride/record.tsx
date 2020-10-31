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
import { useState, useEffect } from 'react';
import FlightRecorder from '../../components/record/FlightRecorder';
import Graph, { SeriesDataPoint, Series } from '../../components/record/Graph';
import Head from '../../components/Head';
import MeasurementCard from '../../components/record/MeasurementCard';
import ResistanceControl, { Resistance } from '../../components/record/ResistanceControl';
import Ride from '../../components/record/Ride';
import Stopwatch from '../../components/record/Stopwatch';
import Title from '../../components/title';
import { Lap } from '../../lib/activity_log';
import { speedUnitConv } from '../../lib/units';
import { useGlobalState } from '../../lib/global';

const measurementColors = [
	'#ffaeae', // heart_rate
	'#b1e67b', // power
	'#57baeb'  // speed
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
		x:  p.time - startTime,
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
			data: powerData
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
	const { resistance } = router.query;

	if (typeof resistance !== 'string' || !['basic', 'power', 'slope'].includes(resistance)) {
		return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Box>
			<Title disableBack={true}>Free Ride</Title>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<Ride />
				<ResistanceControl resistance={resistance as Resistance} />
				<MeasurementCard type="cycling_cadence" />
				<MeasurementCard type="cycling_speed" ribbonColor={classes.colorSpeed} />
				<MeasurementCard type="cycling_power" ribbonColor={classes.colorPower} />
				<MeasurementCard type="heart_rate" ribbonColor={classes.colorHeartRate} />
				<DataGraph />
			</Grid>
		</Box>
	);
}

function PauseModal({ show, onClose, children }: { show: boolean; onClose: () => void, children: any }) {
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

export default function RideRecord() {
	const classes = useStyles();
	const router = useRouter();
	const { type: rideType } = router.query;
	const [ridePaused, setRidePaused] = useGlobalState('ridePaused');
	const [currentActivityLog] = useGlobalState('currentActivityLog');
	const [rideStartTime, setRideStartTime] = useState(0);
	const [elapsedLapTime, setElapsedLapTime] = useGlobalState('elapsedLapTime');
	const [rideEnded, setRideEnded] = useState(false);

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
		}
	}, [])

	const pauseRide = () => {
		setRidePaused(Date.now());
	};
	const continueRide = () => {
		if (rideStartTime === 0) {
			console.log('set start time');
			setRideStartTime(Date.now());
		}
		setRidePaused(0);
	};
	const handleSplit = () => {
		if (currentActivityLog) {
			const now = Date.now();

			currentActivityLog.lapSplit(now, 'Manual');
			setElapsedLapTime(0);
		}
	}
	const endRide = () => {
		setRidePaused(-1);
		setRideEnded(true);
		router.push('/ride/results');
	};

	let title: string;
	let Dashboard;
	switch (rideType) {
		case 'free':
			title = 'Free Ride';
			Dashboard = FreeRideDashboard;
			break;
		default:
			return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Container maxWidth="md">
			<Head title={title} />
			<Dashboard />
			<FlightRecorder startTime={rideStartTime} />
			<PauseModal show={ridePaused === -1 && !rideEnded} onClose={continueRide}>
				<p id="pause-modal-description">Tap outside of this area to start the ride.</p>
			</PauseModal>
			<PauseModal show={ridePaused > 0} onClose={continueRide}>
				<p id="pause-modal-description">Tap outside of this area to continue.</p>
				<Stopwatch className={classes.pauseStopwatch} startTime={ridePaused} />
			</PauseModal>
			<Box className={classes.bottomActions}>
				<BottomNavigation showLabels>
					<BottomNavigationAction label="Pause" icon={<IconPause />} onClick={pauseRide} />
					<BottomNavigationAction label="Split" icon={<IconSplit />} onClick={handleSplit} />
					<BottomNavigationAction label="End" icon={<IconStop />} onClick={endRide} />
				</BottomNavigation>
			</Box>
		</Container>
	);
}
