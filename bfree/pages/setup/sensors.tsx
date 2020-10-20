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
import IconDirectionsBike from '@material-ui/icons/DirectionsBike';
import IconHeart from '@material-ui/icons/Favorite';
import IconOfflineBolt from '@material-ui/icons/OfflineBolt';
import IconSpeed from '@material-ui/icons/Speed';
import Paper from '@material-ui/core/CardContent';
import Title from '../../components/title';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { useState } from 'react';
import {
	pairDevice,
	readBatteryLevel,
	startHRMNotifications,
	startCyclingPowerMeasurementNotifications,
} from '../../lib/ble';
import BatteryLevel from '../../components/batteryLevel';
import {
	useGlobalState,
	SensorType
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
			verticalAlign: 'center',
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

function ActionButton({ wait, onClick, disabled, children }: { wait: boolean; onClick?: () => void; disabled: boolean; chilren: any; }) {
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

function SensorStatus({ wait, severity, msg }: { wait?: boolean; severity: Color; msg: string }) {
	return <Paper>{wait ? <span>{msg}</span> : <Alert severity={severity}>{msg}</Alert>}</Paper>;
}

function Sensor(props: { children: any; srv: SensorType; unit: string; }) {
	const NOT_CONFIGURED = 'Not configured';
	const [wait, setWait] = useState(false);
	// @ts-ignore
	const [severity, setSeverity]: [Color, (s: Color) => void] = useState('info');
	// @ts-ignore
	const [btDevice, setBtDevice] = useGlobalState(`btDevice_${props.srv}`);
	let [message, setMessage] = useState(btDevice ? `${btDevice.name}` : NOT_CONFIGURED);
	const [batteryLevel, setBatteryLevel] = useState(-1);
	// @ts-ignore
	const [sensorValue, setSensorValue] = useGlobalState(props.srv);


	const unpairDevice = () => {
		if (btDevice) {
			if (btDevice.device.gatt.connected) {
				btDevice.disconnect();
			}
			setBtDevice(null);
			setMessage(NOT_CONFIGURED);
			setBatteryLevel(-1);
			setSensorValue(0);
			setWait(false);
		}
	};
	const scanDevices = () => {
		setWait(true);
		setSeverity('info');

		if (btDevice && btDevice.device.gatt.connected) {
			unpairDevice();
		}

		setTimeout(async () => {
			try {
				setMessage('Requesting BLE Device...');
				// FIXME
				// @ts-ignore
				const newBtDevice = await pairDevice(props.srv, async ({ device, server }) => {
					// Get battery level just once
					try {
						setBatteryLevel(await readBatteryLevel(server));
					} catch (err) {
						console.log(`Device ${device.name} doesn't support battery_level`);
					}

					if (props.srv === 'heart_rate') {
						startHRMNotifications(server, (result) => setSensorValue(result.heartRate));
					} else if (props.srv === 'cycling_power') {
						startCyclingPowerMeasurementNotifications(server, () => {});
					}
				});

				const { device } = newBtDevice;
				console.log(`> Name: ${device.name}\n> Id: ${device.id}\n> Connected: ${device.gatt.connected}`);
				setMessage(`Paired with ${device.name}`);
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
				setWait(false);
			}
		}, 0);
	};

	const classes = useStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.setupCard}>
					<Typography gutterBottom variant="h5" component="h2">
						{props.children}
					</Typography>
					<Typography className={classes.sensorValue}>
						{btDevice ? sensorValue : 'N/A'}&nbsp;{props.unit}
					</Typography>
					<div className={classes.batteryLevel}>
						{batteryLevel >= 0 ? <BatteryLevel batteryLevel={batteryLevel} /> : ''}
					</div>
					<div className={classes.sensorStatus}>
						<SensorStatus wait={wait} severity={severity} msg={message} />
					</div>
				</CardContent>
				<CardActions>
					<ActionButton wait={wait} onClick={scanDevices}>
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
					<Sensor srv="smart_todo">
						<IconDirectionsBike className={classes.inlineIcon} /> Smart Trainer
					</Sensor>
					<Sensor srv="cycling_power" unit="W">
						<IconOfflineBolt className={classes.inlineIcon} /> Power
					</Sensor>
					<Sensor srv="cycling_speed_and_cadence">
						<IconSpeed className={classes.inlineIcon} /> Speed &amp; Cadence
					</Sensor>
					<Sensor srv="heart_rate" unit="BPM">
						<IconHeart className={classes.inlineIcon} /> HRM
					</Sensor>
				</Grid>
			</Box>
		</Container>
	);
}
