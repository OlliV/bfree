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
import { createGlobalState } from 'react-hooks-global-state';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { useState } from 'react';
import { pairDevice, readBatteryLevel, startHRMNotifications } from '../../lib/ble';
import BatteryLevel from '../../components/batteryLevel';

const { useGlobalState } = createGlobalState({
	btDevice: null,
	cycling_power: null,
	cycling_speed_and_cadence: null,
	heart_rate: null,
	smart_todo: null, // FIXME
});

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

function ScanButton({ wait, onClick }: { wait: boolean; onClick?: () => void }) {
	const classes = useStyles();

	return (
		<div>
			<Button disabled={wait} variant="contained" onClick={onClick}>
				Scan
				{wait && <CircularProgress size={24} className={classes.buttonProgress} />}
			</Button>
		</div>
	);
}

function SensorStatus({ wait, severity, msg }: { wait?: boolean; severity: Color; msg: string }) {
	return <Paper>{wait ? <span>{msg}</span> : <Alert severity={severity}>{msg}</Alert>}</Paper>;
}

function Sensor(props: { children: any; srv: string; unit: string }) {
	const [wait, setWait] = useState(false);
	// @ts-ignore
	const [severity, setSeverity]: [Color, (s: Color) => void] = useState('info');
	const [btDevice, setBtDevice] = useGlobalState('btDevice');
	let [message, setMessage] = useState(btDevice ? `${btDevice.name}` : 'Not configured');
	const [batteryLevel, setBatteryLevel] = useState(-1);
	// @ts-ignore
	const [sensorValue, setSensorValue] = useGlobalState(props.srv);

	const scanDevices = () => {
		setWait(true);
		setSeverity('info');

		if (btDevice && btDevice.gatt.connected) {
			btDevice.gatt.disconnect();
		}

		setTimeout(async () => {
			try {
				setMessage('Requesting BLE Device...');
				// FIXME
				// @ts-ignore
				const device = await pairDevice(props.srv, async ({ device, server }) => {
					// Get battery level just once
					try {
						setBatteryLevel(await readBatteryLevel(server));
					} catch (err) {
						console.log(`Device ${device.name} doesn't support battery_level`);
					}

					startHRMNotifications(server, (result) => setSensorValue(result.heartRate));
				});

				console.log(`> Name: ${device.name}\n> Id: ${device.id}\n> Connected: ${device.gatt.connected}`);
				setMessage(`Paired with ${device.name}`);
				setBtDevice(device);
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
					<ScanButton wait={wait} onClick={scanDevices}>
						Scan
					</ScanButton>
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
