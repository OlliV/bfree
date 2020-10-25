import Modal from '@material-ui/core/Modal';
import { useState } from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useGlobalState } from '../lib/global';

const useStyles = makeStyles({
	root: {
		marginTop: '1em',
		width: '80%',
	},
});

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
			width: 400,
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

function valueText(value: number) {
	return `${value} %`;
}

export function TrainerControlBasicResistance({ className }) {
	const classes = useStyles();
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');

	const setBasicResistance = (_ev: any, value: number) => {
		if (smartTrainerControl) {
			smartTrainerControl.setBasicResistance(value);
		}
	};

	return (
		<div className={className || classes.root}>
			<Typography id="discrete-slider" gutterBottom>
				Basic Resistance
			</Typography>
			<Slider
				defaultValue={0}
				getAriaValueText={valueText}
				aria-labelledby="discrete-slider"
				valueLabelDisplay="auto"
				step={10}
				marks
				min={0}
				max={100}
				disabled={!(smartTrainerControl && smartTrainerControl.setBasicResistance)}
				onChangeCommitted={setBasicResistance}
			/>
		</div>
	);
}

export function TrainerTestModal({ open, onClose }) {
	const classes = useModalStyles();
	const modalStyle = getModalStyle();
	const [btDevice] = useGlobalState(`btDevice_smart_trainer`);

	const handleClose = () => {
		onClose();
	};

	const body = (
		<div style={modalStyle} className={classes.paper}>
			<h2 id="simple-modal-title">Test {(btDevice && btDevice.device.name) || 'trainer'}</h2>
			<TrainerControlBasicResistance className={classes.trainerControl} />
			<p id="simple-modal-description">Adjust the basic resistance by using the slider above.</p>
		</div>
	);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="simple-modal-title"
			aria-describedby="simple-modal-description"
		>
			{body}
		</Modal>
	);
}
