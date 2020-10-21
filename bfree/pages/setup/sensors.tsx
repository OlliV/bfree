import Alert, { Color } from '@material-ui/core/Alert';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from 'next/head';
import IconBike from '@material-ui/icons/DirectionsBike';
import IconCadence from '@material-ui/icons/FlipCameraAndroid';
import IconHeart from '@material-ui/icons/Favorite';
import IconPower from '@material-ui/icons/OfflineBolt';
import IconSpeed from '@material-ui/icons/Speed';
import Paper from '@material-ui/core/CardContent';
import Title from '../../components/title';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import {
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	pairDevice,
	readBatteryLevel,
	startHRMNotifications,
	startCyclingPowerMeasurementNotifications,
	startCyclingSpeedMeasurementNotifications,
} from '../../lib/ble';
import BatteryLevel from '../../components/batteryLevel';
import {
	useGlobalState,
	SensorType,
	BluetoothServiceType,
} from '../../lib/global';

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
		sensorStatus: {
			marginTop: '5em',
		},
		batteryLevel: {
			position: 'relative',
			float: 'right',
			display: ' inline-block',
			marginBottom: '1em',
		},
		sensorValue: {
			position: 'relative',
			float: 'left',
			display: ' inline-block',
			marginBottom: '1em',
		},
	})
);

function ActionButton({ wait, onClick, disabled, children }: { wait: boolean; onClick?: () => void; disabled?: boolean; children: any; }) {
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
	return <Paper><Alert severity={severity}>{children}</Alert></Paper>;
}

function SensorValue({ sensorType, sensorValue }) {
	const classes = useStyles();

	if (sensorType === 'cycling_cadence') {
		return (
			<Typography className={classes.sensorValue}>
				{sensorValue ? sensorValue.cadence : '--'}&nbsp;RPM
			</Typography>
		);
	} else if (sensorType === 'cycling_power') {
		return (
			<Typography className={classes.sensorValue}>
				{sensorValue ? sensorValue.instantaneousPower : '--'}&nbsp;W
				<br />
				{(sensorValue && sensorValue.instantaneousSpeed !== null) ? sensorValue.instantaneousSpeed.toFixed(1) : '--'}&nbsp;km/h
	</Typography>
		);
	} else if (sensorType === 'cycling_speed') {
		return (
			<Typography className={classes.sensorValue}>
				{sensorValue ? sensorValue.instantaneousSpeed.toFixed(1) : '--'}&nbsp;km/h
			</Typography>
		);
	} else if (sensorType === 'heart_rate') {
		return (
			<Typography className={classes.sensorValue}>
				{sensorValue ? sensorValue.heartRate : '--'}&nbsp;BPM
			</Typography>
		);
	} else if (sensorType === 'smart_trainer') {
		// TODO Smart trainer values
		return (
			<Typography className={classes.sensorValue}>
				--
			</Typography>
		);
	}
}

function Sensor(props: { children: any; sensorType: SensorType; }) {
	const pairedWithMessage = (btd) => btd ? `Paired with\n${btd.device.name}` : 'Not configured';
	const [pairingRequest, setPairingRequest] = useState(false);
	const [isPairing, setIsPairing] = useState(false);
	// @ts-ignore
	const [severity, setSeverity]: [Color, (s: Color) => void] = useState('info');
	// @ts-ignore
	const [btDevice, setBtDevice] = useGlobalState(`btDevice_${props.sensorType}`);
	let [message, setMessage] = useState(pairedWithMessage(btDevice));
	const [batteryLevel, setBatteryLevel] = useState(-1);
	const [sensorValue, setSensorValue] = useGlobalState(props.sensorType);
	const sensorValueRef = useRef();

	sensorValueRef.current = sensorValue;

	const unpairDevice = () => {
		if (btDevice) {
			if (btDevice.device.gatt.connected) {
				btDevice.disconnect();
			}
			setBtDevice(null);
			setMessage(pairedWithMessage(null));
			setBatteryLevel(-1);
			setSensorValue(null);
			setIsPairing(false);
		}
	};

	useEffect(() => {
		function updateCyclingPower(result) {
			const sensorValue = sensorValueRef.current;
			let instantaneousSpeed = null;

			if (result.feature.wheelRevolutionData && sensorValue) {
				// @ts-ignore sensorValue is never undefined here
				const prevRevs = sensorValue.cumulativeWheelRevolutions;
				const curRevs = result.cumulativeWheelRevolutions;
				const deltaRevs = curRevs - prevRevs;

				// @ts-ignore sensorValue is never undefined here
				const prevLastWheelEvent = sensorValue.lastWheelEvent;
				const curLastWheelEvent = result.lastWheelEvent;
				const deltaWheelEvents = curLastWheelEvent >= prevLastWheelEvent
					? curLastWheelEvent - prevLastWheelEvent
					: 0xffff - prevLastWheelEvent + curLastWheelEvent + 1;

				// TODO This should be configurable!
				// mm => m
				const circumferenceM = 2097 / 1000;
				// 2048 = as per CPS_v1.1:
				// > The ‘wheel event time’ is a free-running-count of
				// > 1/2048 second units and it represents the time when the wheel
				// > revolution was detected by the wheel rotation sensor.
				// 3.6 = m/s => km/h
				instantaneousSpeed = ((circumferenceM * deltaRevs) / (deltaWheelEvents / 2048) * 3.6) || 0;
			}

			setSensorValue({
				ts: Date.now(),
				instantaneousPower: result.instantaneousPower,
				instantaneousSpeed,
				cumulativeWheelRevolutions: result.cumulativeWheelRevolutions,
				lastWheelEvent: result.lastWheelEvent,
			})
		}
		function updateHeartRate(result) {
			setSensorValue({
				ts: Date.now(),
				heartRate: result.heartRate,
			});
		}

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
						heart_rate: 'heart_rate',
					};

					const newBtDevice = await pairDevice(srvMap[props.sensorType], async ({ device, server }) => {
						// Get battery level just once
						try {
							setBatteryLevel(await readBatteryLevel(server));
						} catch (err) {
							console.log(`Device ${device.name} doesn't support battery_level`);
						}

						if (props.sensorType === 'cycling_power') {
							startCyclingPowerMeasurementNotifications(server, updateCyclingPower);
						} else if (props.sensorType === 'cycling_speed') {
							// TODO
							//startCyclingSpeedMeasurementNotifications(server, (result) => setSensorValue());
						} else if (props.sensorType === 'heart_rate') {
							startHRMNotifications(server, updateHeartRate);
						}
					});

					const { device } = newBtDevice;
					console.log(`> Name: ${device.name}\n> Id: ${device.id}\n> Connected: ${device.gatt.connected}`);
					setSeverity('info');
					setMessage(pairedWithMessage(newBtDevice));
					setBtDevice(newBtDevice);
				} catch (error) {
					const msg = `${error}`;
					if (msg.startsWith('NotFoundError: User cancelled')) {
						setSeverity('warning');
					} else {
						setSeverity('error');
					}
					setMessage(`${error}`);
				} finally {
					setIsPairing(false);
				}
			})();
		}
	})

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
					<SensorValue sensorType={props.sensorType} sensorValue={sensorValue} />
					<div className={classes.batteryLevel}>
						{batteryLevel >= 0 ? <BatteryLevel batteryLevel={batteryLevel} /> : ''}
					</div>
					<div className={classes.sensorStatus}>
						<SensorStatus wait={isPairing} severity={severity}>
							{message.split('\n').map((line, i) => (<span key={i}>{`${line}`}<br /></span>))}
						</SensorStatus>
					</div>
				</CardContent>
				<CardActions>
					<ActionButton wait={isPairing} onClick={scanDevices}>
						Scan
					</ActionButton>
					<ActionButton wait={false} disabled={!btDevice} onClick={unpairDevice}>
						Unpair
					</ActionButton>
				</CardActions>
			</Card>
		</Grid>
	);
}

export default function Setup() {
	const classes = useStyles();

	return (
		<Container maxWidth="md">
			<Head>
				<title>Bfree Sensors</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
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
