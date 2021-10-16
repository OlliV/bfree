import Modal from '@mui/material/Modal';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useState, useEffect } from 'react';
import { useGlobalState } from '../lib/global';
import SensorValue from './SensorValue';

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
			smartTrainerControl.setBasicResistance(value).catch(console.error);
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
			<h2 id="trainer-test-modal-title">Test {(btDevice && btDevice.device.name) || 'trainer'}</h2>
			<TrainerControlBasicResistance className={classes.trainerControl} />
			<p id="trainer-test-modal-description">Adjust the basic resistance by using the slider above.</p>
		</div>
	);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="trainer-test-modal-title"
			aria-describedby="trainer-test-modal-description"
		>
			{body}
		</Modal>
	);
}

export function TrainerCalibrationModal({ open, onClose }) {
	const classes = useModalStyles();
	const modalStyle = getModalStyle();
	const [btDevice] = useGlobalState(`btDevice_smart_trainer`);
	const [smartTrainerStatus] = useGlobalState('smart_trainer');
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');
	const [targetSpeed, setTargetSpeed] = useState('slowly');
	const [calResult, setCalResult] = useState('PENDING');

	const handleClose = () => {
		onClose();
	};

	useEffect(
		() => {
			let tim;
			const statusListener = (data) => {
				console.log(data);
				if (data.targetSpeed) {
					// TODO How to mi/h
					setTargetSpeed(`around ${data.targetSpeed.toFixed(0)} km/h`);
				}
				// TODO We should read spinDownCalRes here!!
				// data.spinDownCalRes true/false === passed/failed if req was received
				// spinDownCalStat == pending
				// use  speedCond, // 0 = NA; 1 = too low; 2 = ok
				if (data.spindownTimeRes > 0) {
					setCalResult('PASSED');
					clearTimeout(tim);
				}
				// TODO When fail?
			};

			if (open && smartTrainerControl) {
				console.log(`Sending a calibration request to the trainer`);
				setCalResult('PENDING');
				const cal = async () => {
					await smartTrainerControl.sendCalibrationReq();
					await smartTrainerControl.sendSpinDownCalibrationReq();

					smartTrainerControl.addPageListener(1, statusListener);
					smartTrainerControl.addPageListener(2, statusListener);

					// YOLO timeout
					tim = setTimeout(() => {
						setCalResult('FAILED');
					}, 30000); // TODO const for this
				};
				cal().catch(console.error);
			}

			return () => {
				if (smartTrainerControl) {
					if (tim) {
						clearTimeout(tim);
						smartTrainerControl.removePageListener(1, statusListener);
						smartTrainerControl.removePageListener(2, statusListener);
					}
					tim = null;
				}
			};
		},
		// We don't actually care if smartTrainerControl changes because the user
		// in that case the user should just reopen the modal.
		[open] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const body = (
		<div style={modalStyle} className={classes.paper}>
			<h2 id="calibration-modal-title">Calibrate {(btDevice && btDevice.device.name) || 'trainer'}</h2>
			<p id="calibration-modal-description">Start the calibration by pedaling {targetSpeed}.</p>
			<p>
				<b>Calibration status:</b> {calResult}
			</p>
			<SensorValue sensorType={'smart_trainer'} sensorValue={smartTrainerStatus} />
		</div>
	);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="calibration-modal-title"
			aria-describedby="calibration-modal-description"
		>
			{body}
		</Modal>
	);
}
