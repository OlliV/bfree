import Backdrop from '@material-ui/core/Backdrop';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import DefaultErrorPage from 'next/error';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import IconPause from '@material-ui/icons/Pause';
import IconStop from '@material-ui/icons/Stop';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FlightRecorder from '../../components/FlightRecorder';
import Head from '../../components/Head';
import ResistanceControl from '../../components/ResistanceControl';
import Title from '../../components/title';
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

	if (typeof resistance !== 'string' || !['basic', 'power', 'slope'].includes(resistance)) {
		return <DefaultErrorPage statusCode={400} />;
	}

	return (
		<Box>
			<Title disableBack={true}>Free Ride</Title>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<ResistanceControl resistance={resistance} />
			</Grid>
		</Box>
	);
}

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
function getElapsedStr(t: number) {
	const min = Math.floor(t / 60000);
	const sec = Math.floor((t % (1000 * 60)) / 1000);

	return `${zeroPad(min, 2)}:${zeroPad(sec, 2)}`;
}

function Stopwatch({ startTime, className }: { startTime: number; className?: any }) {
	const [time, setTime] = useState(() => Date.now() - startTime);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTime(Date.now() - startTime);
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [time]);

	return <div className={className}>{getElapsedStr(time)}</div>;
}

export default function RideRecord() {
	const classes = useStyles();
	const router = useRouter();
	const { type: rideType } = router.query;
	const [ridePaused, setRidePaused] = useGlobalState('ridePaused');
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
		// The effect above will stop recording.
		setRidePaused(Date.now());
	};
	const continueRide = () => {
		// TODO Continue recording
		setRidePaused(0);
	};
	const stopRide = () => {
		// TODO Stop recording
		router.push('/ride/results');
	};

	return (
		<Container maxWidth="md">
			<Head title={title} />
			<Dashboard />
			<FlightRecorder />
			<Modal
				aria-labelledby="pause-modal-title"
				aria-describedby="pause-modal-description"
				className={classes.pauseModal}
				open={ridePaused != 0}
				onClose={continueRide}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={ridePaused != 0}>
					<div className={classes.pausePaper}>
						<h2 id="pause-modal-title">Ride Paused</h2>
						<p id="pause-modal-description">Tap outside of this area to continue.</p>
						<Stopwatch className={classes.pauseStopwatch} startTime={ridePaused} />
					</div>
				</Fade>
			</Modal>
			<Box className={classes.bottomActions}>
				<BottomNavigation showLabels>
					<BottomNavigationAction label="Pause" icon={<IconPause />} onClick={pauseRide} />
					<BottomNavigationAction label="Stop" icon={<IconStop />} onClick={stopRide} />
				</BottomNavigation>
			</Box>
		</Container>
	);
}
