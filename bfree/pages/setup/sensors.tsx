import Alert, { Color } from '@material-ui/core/Alert';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconBike from '@material-ui/icons/DirectionsBike';
import IconCadence from '@material-ui/icons/FlipCameraAndroid';
import IconHeart from '@material-ui/icons/Favorite';
import IconPower from '@material-ui/icons/OfflineBolt';
import IconSpeed from '@material-ui/icons/Speed';
import Paper from '@material-ui/core/CardContent';
import Title from '../../components/title';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { useEffect, useState } from 'react';
import Head from '../../components/Head';
import { pairDevice, readBatteryLevel } from '../../lib/ble';
import { startCyclingPowerMeasurementNotifications } from '../../lib/ble_cpp';
import { startCyclingSpeedAndCadenceMeasurementNotifications } from '../../lib/ble_cscp';
import { startHRMNotifications } from '../../lib/ble_hrm';
import { createSmartTrainerController } from '../../lib/ble_trainer';
import BatteryLevel from '../../components/batteryLevel';
import SensorValue from '../../components/SensorValue';
import { TrainerCalibrationModal } from '../../components/TrainerControl';
import { useGlobalState, SensorType, BluetoothServiceType, getGlobalState } from '../../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
			alignItems: 'center',
		},
		wrapper: {
			margin: theme.spacing(1),
			position: 'relative',
		},
		buttonProgress: {
			color: green[500],
			position: 'absolute',
			top: '50%',
			left: '50%',
			marginTop: -12,
			marginLeft: -12,
		},
		setupCard: {
			height: '15em',
		},
		inlineIcon: {
			fontSize: '18px !important',
		},
		sensorStatus: {},
		batteryLevel: {
			position: 'relative',
			float: 'right',
			display: ' inline-block',
			top: '-5.5em',
			marginBottom: '1em',
		},
		sensorValue: {
			position: 'relative',
			marginBottom: '1em',
			width: '300px',
		},
	})
);

function ActionButton({
	wait,
	onClick,
	disabled,
	children,
}: {
	wait: boolean;
	onClick?: () => void;
	disabled?: boolean;
	children: any;
}) {
	const classes = useStyles();

	return (
		<div>
			<Button disabled={wait || disabled} variant="contained" onClick={onClick}>
				{children}
				{wait && <CircularProgress size={24} className={classes.buttonProgress} />}
			</Button>
		</div>
	);
}

function SensorStatus({ wait, severity, children }: { wait?: boolean; severity: Color; children: any }) {
	return (
		<Paper>
			<Alert severity={severity}>{children}</Alert>
		</Paper>
	);
}

function Sensor(props: { children: any; sensorType: SensorType }) {
	const pairedWithMessage = (btd) => (btd ? `Paired with\n${btd.device.name}` : 'Not configured');
	const [btAvailable, setBtAvailable] = useState(false);
	const [pairingRequest, setPairingRequest] = useState(false);
	const [isPairing, setIsPairing] = useState(false);
	// @ts-ignore
	const [severity, setSeverity]: [Color, (s: Color) => void] = useState('info');
	// @ts-ignore
	const [btDevice, setBtDevice] = useGlobalState(`btDevice_${props.sensorType}`);
	let [message, setMessage] = useState(pairedWithMessage(btDevice));
	const [batteryLevel, setBatteryLevel] = useState(-1);
	const [sensorValue, setSensorValue] = useGlobalState(props.sensorType);
	const [smartTrainerControl, setSmartTrainerControl] = useGlobalState('smart_trainer_control');
	const [showSmartTrainerCalibrationModal, setShowSmartTrainerCalibrationModal] = useState(false);

	const unpairDevice = () => {
		if (btDevice) {
			if (btDevice.device.gatt.connected) {
				btDevice.disconnect();
			}
			setBtDevice(null);
			setMessage(pairedWithMessage(null));
			setBatteryLevel(-1);
			setSensorValue(null);
			if (props.sensorType === 'smart_trainer') {
				setSmartTrainerControl(null);
			}
			setIsPairing(false);
		}
	};

	useEffect(() => {
		navigator.bluetooth.getAvailability().then(v => setBtAvailable(v)).catch(() => {});
	}, []);

	useEffect(() => {
		if (pairingRequest) {
			setPairingRequest(false);
			setIsPairing(true);
			setSeverity('info');
			if (btDevice && btDevice.device.gatt.connected) {
				unpairDevice();
			}

			(async () => {
				try {
					setMessage('Requesting BLE Device...');

					/* Map internal sensor type to Bt service name */
					const srvMap: { [key: string]: BluetoothServiceType } = {
						cycling_cadence: 'cycling_speed_and_cadence',
						cycling_power: 'cycling_power',
						cycling_speed: 'cycling_speed_and_cadence',
						cycling_speed_and_cadence: 'cycling_speed_and_cadence',
						heart_rate: 'heart_rate',
						smart_trainer: '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e', // TACX ANT+ FE-C over BLE
					};

					const newBtDevice = await pairDevice(srvMap[props.sensorType], async ({ device, server }) => {
						// Get battery level just once
						try {
							setBatteryLevel(await readBatteryLevel(server));
						} catch (err) {
							console.log(`Device ${device.name} doesn't support battery_level`);
						}

						try {
							if (props.sensorType === 'cycling_power') {
								await startCyclingPowerMeasurementNotifications(server, setSensorValue);
							} else if (
								['cycling_speed_and_cadence', 'cycling_cadence', 'cycling_speed'].includes(
									props.sensorType
								)
							) {
								await startCyclingSpeedAndCadenceMeasurementNotifications(server, setSensorValue);
							} else if (props.sensorType === 'heart_rate') {
								await startHRMNotifications(server, setSensorValue);
							} else if (props.sensorType === 'smart_trainer') {
								const controller = await createSmartTrainerController(server, setSensorValue);
								await controller.startNotifications();

								const { weight: userWeightKg } = getGlobalState('rider');
								const { weight: bikeWeightKg, wheelCircumference } = getGlobalState('bike');
								await controller.sendUserConfiguration({
									userWeightKg,
									bikeWeightKg,
									wheelCircumference,
								});

								setSmartTrainerControl(controller);
							} else {
								console.error('Invalid sensor type');
							}
						} catch (err) {
							setSeverity('error');
							setMessage(`${err}`);
						}
					});

					const { device } = newBtDevice;
					console.log(`> Name: ${device.name}\n> Id: ${device.id}\n> Connected: ${device.gatt.connected}`);
					setSeverity('info');
					setMessage(pairedWithMessage(newBtDevice));
					setBtDevice(newBtDevice);
				} catch (err) {
					const msg = `${err}`;
					if (msg.startsWith('NotFoundError: User cancelled')) {
						setSeverity('warning');
						setMessage('Pairing cancelled');
					} else {
						setSeverity('error');
						setMessage(`${err}`);
					}
				} finally {
					setIsPairing(false);
				}
			})();
		}
	}, [pairingRequest]);

	const scanDevices = () => {
		setPairingRequest(true);
	};

	const classes = useStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.setupCard}>
					<Typography gutterBottom variant="h5" component="h2">
						{props.children}
					</Typography>
					<SensorValue
						sensorType={props.sensorType}
						sensorValue={sensorValue}
						className={classes.sensorValue}
					/>
					<div className={classes.batteryLevel}>
						{batteryLevel >= 0 ? <BatteryLevel batteryLevel={batteryLevel} /> : ''}
					</div>
					<div className={classes.sensorStatus}>
						<SensorStatus wait={isPairing} severity={severity}>
							{message.split('\n').map((line, i) => (
								<span key={i}>
									{`${line}`}
									<br />
								</span>
							))}
						</SensorStatus>
					</div>
					{props.sensorType === 'smart_trainer' ? (
						<TrainerCalibrationModal
							open={showSmartTrainerCalibrationModal}
							onClose={() => setShowSmartTrainerCalibrationModal(false)}
						/>
					) : (
						''
					)}
				</CardContent>
				<CardActions>
					<ActionButton wait={isPairing} disabled={!btAvailable} onClick={scanDevices}>
						Scan
					</ActionButton>
					<ActionButton wait={false} disabled={!btDevice} onClick={unpairDevice}>
						Unpair
					</ActionButton>
					{props.sensorType === 'smart_trainer' ? (
						<ActionButton
							wait={!smartTrainerControl && !!btDevice}
							disabled={!btDevice}
							onClick={() => setShowSmartTrainerCalibrationModal(true)}
						>
							Calibrate
						</ActionButton>
					) : (
						''
					)}
				</CardActions>
			</Card>
		</Grid>
	);
}

export default function SetupSensors() {
	const classes = useStyles();

	return (
		<Container maxWidth="md">
			<Head title="Senors" />
			<Box>
				<Title>Sensors</Title>
				<p>Connect your smart trainer, HRM, and other sensors using BLE.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<Sensor sensorType="smart_trainer">
						<IconBike className={classes.inlineIcon} /> Smart Trainer
					</Sensor>
					<Sensor sensorType="cycling_power">
						<IconPower className={classes.inlineIcon} /> Power
					</Sensor>
					<Sensor sensorType="cycling_speed_and_cadence">
						<IconCadence className={classes.inlineIcon} /> Speed &amp; Cadence
					</Sensor>
					<Sensor sensorType="cycling_cadence">
						<IconCadence className={classes.inlineIcon} /> Cadence
					</Sensor>
					<Sensor sensorType="cycling_speed">
						<IconSpeed className={classes.inlineIcon} /> Speed
					</Sensor>
					<Sensor sensorType="heart_rate">
						<IconHeart className={classes.inlineIcon} /> HRM
					</Sensor>
				</Grid>
			</Box>
		</Container>
	);
}
