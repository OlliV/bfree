import Modal from '@mui/material/Modal';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { useState, useEffect } from 'react';
import { useGlobalState } from '../lib/global';
import { speedUnitConv } from '../lib/units';
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
	const [unitSpeed] = useGlobalState('unitSpeed');
	const speedUnit = speedUnitConv[unitSpeed];
	const [btDevice] = useGlobalState(`btDevice_smart_trainer`);
	const [smartTrainerStatus] = useGlobalState('smart_trainer');
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');
	const [targetSpeed, setTargetSpeed] = useState('');
	const [calResult, setCalResult] = useState<'PENDING' | 'PASSED' | 'FAILED'>('PENDING');

	const handleClose = () => {
		onClose();
	};

	useEffect(
		() => {
			let tim: ReturnType<typeof setTimeout>;
			const statusListener = (data) => {
				console.log('cal', data);

				// TODO Show warning for tempCond 1 = too low; 3 = too high

				if (data.targetSpeed) {
					if (data.targetSpeed == -1) {
						setTargetSpeed('slowly');
					} else {
						const targetSpeed = speedUnit.convTo(data.targetSpeed);
						setTargetSpeed(`around ${targetSpeed.toFixed(0)} ${speedUnit.name}`);
					}
				}

				if (data.spinDownCalRes !== undefined) {
					setTargetSpeed('');
					clearTimeout(tim);
					setCalResult(data.spinDownCalRes ? 'PASSED' : 'FAILED');
				}
			};

			if (open && smartTrainerControl) {
				console.log(`Sending a calibration request to the trainer`);
				setCalResult('PENDING');
				const cal = async () => {
					//await smartTrainerControl.sendCalibrationReset();
					await smartTrainerControl.sendCalibrationReq();

					// Calibration response page
					smartTrainerControl.addPageListener(1, statusListener);
					// Calibration in progress page
					smartTrainerControl.addPageListener(2, statusListener);

					// Timeout if we never receive anything conclusive.
					tim = setTimeout(() => {
						setCalResult('FAILED');
						console.log('Cancelling the calibration due to timeout');
						smartTrainerControl.sendCalibrationCancel().catch(console.error);
					}, 30000); // TODO const for this
				};
				cal().catch(console.error);
			}

			return () => {
				if (smartTrainerControl) {
					if (tim) {
						clearTimeout(tim);
						if (calResult === 'PENDING') {
							console.log('Cancelling the calibration');
							smartTrainerControl.sendCalibrationCancel().catch(console.error);
						}
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
			<p id="calibration-modal-description">
				{targetSpeed !== '' ? `Start the calibration by pedaling ${targetSpeed}.` : ''}
			</p>
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
