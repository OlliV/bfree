import Backdrop from '@material-ui/core/Backdrop';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import DefaultErrorPage from 'next/error';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import IconPause from '@material-ui/icons/Pause';
import IconStop from '@material-ui/icons/Stop';
import IconSplit from '@material-ui/icons/Timer';
import Modal from '@material-ui/core/Modal';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState } from 'react';
import { useRouter } from 'next/router';
import FlightRecorder from '../../components/record/FlightRecorder';
import Head from '../../components/Head';
import ResistanceControl from '../../components/record/ResistanceControl';
import Title from '../../components/title';
import Stopwatch from '../../components/record/Stopwatch';
import Time from '../../components/record/Time';
import MeasurementCard from '../../components/record/MeasurementCard';
import { useGlobalState } from '../../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
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

function FreeRideDashboard() {
	const classes = useStyles();
	const router = useRouter();
	const { resistance } = router.query;
	const [ridePaused] = useGlobalState('ridePaused');
	const [currentActivityLog] = useGlobalState('currentActivityLog');

	if (typeof resistance !== 'string' || !['basic', 'power', 'slope'].includes(resistance)) {
		return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Box>
			<Title disableBack={true}>Free Ride</Title>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<Time />
				<ResistanceControl resistance={resistance} />
				<MeasurementCard type="cycling_power" />
				<MeasurementCard type="cycling_speed" />
				<MeasurementCard type="cycling_cadence" />
				<MeasurementCard type="heart_rate" />
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
