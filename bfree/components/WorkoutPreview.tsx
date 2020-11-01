import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import createWorkoutRunner from '../lib/workout_runner';

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
			height: '45vh',
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
			<p id="workout-preview-modal-description">Lorem ipsum.</p>
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
