import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import { timeUnitConv, speedUnitConv, distanceUnitConv } from '../lib/units';
import createWorkoutRunner, { RunnerResponse } from '../lib/workout_runner';
import Graph, { Series } from './record/Graph';
import { useGlobalState } from '../lib/global';

const graphColors = [
	'#b1e67b', // load resistance
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

function PreviewParams({
	onChange,
}: {
	onChange: (o: { endTime: number; endDistance: number; speed: number }) => void;
}) {
	const speedUnit = speedUnitConv[useGlobalState('unitSpeed')[0]];
	const distanceUnit = distanceUnitConv[useGlobalState('unitDistance')[0]];
	const [endTime, setEndTime] = useState<number>(0);
	const [endDistance, setEndDistance] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(0);
	const [prev, setPrev] = useState<string>();

	const propagateChange = () => {
		onChange({
			endTime: endTime * 60,
			endDistance: distanceUnit.convToBase(endDistance),
			speed: speedUnit.convToBase(speed),
		});
	};

	const handleEndTimeChange = (e) => {
		const time: number = Number(e.target.value);

		setEndTime(time);
		if (prev === 'distance') {
			setSpeed(speedUnit.convTo(distanceUnit.convToBase(endDistance) / (time * 60)));
		} else if (prev === 'speed') {
			setEndDistance(distanceUnit.convTo(speedUnit.convToBase(speed) * (time * 60)));
		}

		propagateChange();
	};

	const handleEndDistanceChange = (e) => {
		const distance: number = Number(e.target.value);

		setEndDistance(distance);
		if (prev === 'time') {
			setSpeed(speedUnit.convTo(distanceUnit.convToBase(distance) / (endTime * 60)));
		} else if (prev === 'speed') {
			setEndTime(distanceUnit.convToBase(distance) / speedUnit.convToBase(speed) / 60);
		}

		propagateChange();
	};

	const handleSpeedChange = (e) => {
		const speed: number = Number(e.target.value);

		setSpeed(speed);
		if (prev === 'time') {
			setEndDistance(distanceUnit.convTo(speedUnit.convToBase(speed) * (endTime * 60)));
		} else if (prev === 'distance') {
			setEndTime(distanceUnit.convToBase(endDistance) / speedUnit.convToBase(speed) / 60);
		}

		propagateChange();
	};

	return (
		<form noValidate autoComplete="off">
			<TextField
				value={endTime.toFixed(2)}
				onChange={handleEndTimeChange}
				onBlur={() => setPrev('time')}
				id="outlined-basic"
				label="End Time [min]"
				variant="outlined"
			/>
			<TextField
				value={endDistance.toFixed(2)}
				onChange={handleEndDistanceChange}
				onBlur={() => setPrev('distance')}
				id="outlined-basic"
				label={`End Distance [${distanceUnit.name}]`}
				variant="outlined"
			/>
			<TextField
				value={speed.toFixed(2)}
				onChange={handleSpeedChange}
				onBlur={() => setPrev('speed')}
				id="outlined-basic"
				label={`Speed [${speedUnit.name}]`}
				variant="outlined"
			/>
		</form>
	);
}

export default function WorkoutPreviewModal({ code, open, onClose }) {
	const classes = useModalStyles();
	const modalStyle = getModalStyle();
	const [params, setParams] = useState({ endTime: 0, endDistance: 0, speed: 0 });
	const [series, setSeries] = useState([]);

	const handleClose = () => {
		onClose();
	};

	useEffect(() => {
		let runner;

		if (open && typeof code === 'string') {
			console.log('Creating a worker');
			const newSeries: Series = [
				{
					id: 'load',
					data: [
						{
							x: -0.1,
							y: 0,
						},
					],
				},
			];

			let tim;
			new Promise((resolve, reject) => {
				tim = setTimeout(() => {
					if (runner) {
						runner.terminate();
						runner = null;
					}
					reject(new Error('Simulation timed out'));
				}, 20000);

				// @ts-ignore
				runner = createWorkoutRunner(code);

				runner.onMessage((msg: RunnerResponse) => {
					newSeries[0].data.push({
						x: msg.time,
						y: msg.basicLoad ?? msg.power ?? msg.slope,
					});

					if (msg.time >= params.endTime * 1000) {
						resolve();
					}
				});

				const endTime = Number(params.endTime) * 1000;
				if (endTime <= 0 || endTime > 86400000) {
					return resolve();
				}

				// TODO Allow iterating over distance
				const step = endTime / 50;
				for (let time = 0; time <= endTime; time += step) {
					runner.sendMessage({
						time: time,
						distance: params.speed * time,
						speed: params.speed,
					});
				}
			})
				.then(() => {
					if (tim) {
						clearTimeout(tim);
					}
					if (runner) {
						runner.terminate();
						runner = null;
					}
					console.log('Simulation completed');
					setSeries(newSeries);
				})
				.catch(console.error);
		}

		return () => {
			if (runner) {
				console.log('Terminating the worker');
				runner.terminate();
			}
		};
	}, [open, code, params]);

	const body = (
		<div style={modalStyle} className={classes.paper}>
			<h2 id="workout-preview-modal-title">Workout Preview</h2>
			<p id="workout-preview-modal-description">
				Adjust the parameters below to see how they affect to the workout.
			</p>
			<PreviewParams onChange={setParams} />
			<Graph
				series={series}
				colors={graphColors}
				curve="stepAfter"
				enableArea={true}
				enableLegends={true}
				isInteractive={true}
			/>
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
