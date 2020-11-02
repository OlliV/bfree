import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import { timeUnitConv, speedUnitConv, distanceUnitConv } from '../lib/units';
import createWorkoutRunner from '../lib/workout_runner';
import Graph, { Series } from './record/Graph';
import { useGlobalState } from '../lib/global';

const graphColors = [
	'#ffaeae', // heart_rate
	'#b1e67b', // power
	'#57baeb'  // speed
];

const series: Series = [
	{
		id: 'abc',
		data: [
			{
				x: 0,
				y: 0,
			},
			{
				x: 1,
				y: 1,
			},
			{
				x: 2,
				y: 2,
			},
			{
				x: 3,
				y: 3,
			},
			{
				x: 4,
				y: 4,
			},
		],
	}
];

function getModalStyle() {
	const top = 50;
	const left = 50;

	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	};
}

const useModalStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			position: 'absolute',
			width: '80vw',
			height: '68vh',
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
		trainerControl: {
			marginTop: '1em',
			margin: 'auto',
			width: '80%',
		},
	})
);

function PreviewParams() {
	const speedUnit = speedUnitConv[useGlobalState('unitSpeed')[0]];
	const distanceUnit = distanceUnitConv[useGlobalState('unitDistance')[0]];
	const [endTime, setEndTime] = useState<number>(0);
	const [endDistance, setEndDistance] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(0);
	const [prev, setPrev] = useState<string>();

	const handleEndTimeChange = (e) => {
		const time: number = Number(e.target.value);

		setEndTime(time);
		if (prev === 'distance') {
			setSpeed(speedUnit.convTo(distanceUnit.convToBase(endDistance) / (time * 60)));
		} else if (prev === 'speed') {
			setEndDistance(distanceUnit.convTo(distanceUnit.convToBase(speed) * (time * 60)));
		}
	};

	const handleEndDistanceChange = (e) => {
		const distance: number = Number(e.target.value);

		setEndDistance(distance);
		if (prev === 'time') {
			setSpeed(speedUnit.convTo(distanceUnit.convToBase(distance) / (endTime * 60)));
		} else if (prev === 'speed') {
			setEndTime((distanceUnit.convToBase(distance) / speedUnit.convToBase(speed)) / 60);
		}
	};

	const handleSpeedChange = (e) => {
		const speed: number = Number(e.target.value);

		setSpeed(speed);
		if (prev === 'time') {
			setEndDistance(distanceUnit.convTo(speedUnit.convToBase(speed) * (endTime * 60)));
		} else if (prev === 'distance') {
			setEndTime((distanceUnit.convToBase(endDistance) / speedUnit.convToBase(speed)) / 60);
		}
	};

	return (
		<form noValidate autoComplete="off">
			<TextField value={endTime.toFixed(2)} onChange={handleEndTimeChange} onBlur={() => setPrev('time')} id="outlined-basic" label="End Time [min]" variant="outlined" />
			<TextField value={endDistance.toFixed(2)} onChange={handleEndDistanceChange} onBlur={() => setPrev('distance')} id="outlined-basic" label="End Distance [km]" variant="outlined" />
			<TextField value={speed.toFixed(2)} onChange={handleSpeedChange} onBlur={() => setPrev('speed')} id="outlined-basic" label="Speed [km/h]" variant="outlined" />
		</form>
	);
}

export default function WorkoutPreviewModal({ code, open, onClose }) {
	const classes = useModalStyles();
	const modalStyle = getModalStyle();
	const [workoutRunner, setWorkoutRunner] = useState();

	const handleClose = () => {
		onClose();
	};

	useEffect(() => {
		let runner;

		if (open && typeof code === 'string') {
			console.log('Creating a worker');
			// @ts-ignore
			runner = createWorkoutRunner(code);
			setWorkoutRunner(runner);
		}

		return () => {
			if (runner) {
				console.log('Terminating the worker');
				runner.terminate();
			}
		};
	}, [open, code]);

	const body = (
		<div style={modalStyle} className={classes.paper}>
			<h2 id="workout-preview-modal-title">Workout Preview</h2>
			<p id="workout-preview-modal-description">Adjust the parameters below to see how they affect to the workout.</p>
			<PreviewParams />
			<Graph series={series} colors={graphColors}/>
		</div>
	);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="workout-preview-modal-title"
			aria-describedby="workout-preview-modal-description"
		>
			{body}
		</Modal>
	);
}
