import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import {CardContent} from '@material-ui/core';
import {Props} from 'react';

async function scanDevices() {
	const log = (line: string) => console.log(line);
	let options = {
		acceptAllDevices: true
	};

	try {
		log('Requesting Bluetooth Device...');
		log('with ' + JSON.stringify(options));
		// @ts-ignore
		const device = await navigator.bluetooth.requestDevice(options);

		log('> Name:             ' + device.name);
		log('> Id:               ' + device.id);
		log('> Connected:        ' + device.gatt.connected);
	} catch(error)  {
		log('Argh! ' + error);
	}
}

function Sensor(props: { title: string, srv: string }) {
	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">{props.title}</Typography>
					<Button variant="contained" onClick={scanDevices}>Scan</Button>
				</CardContent>
			</Card>
		</Grid>
	);
}

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head>
				<title>Bfree Sensors</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Box>
				<h1 className={styles.title}>Sensors</h1>
				<p className={styles.description}>
					Connect your smart trainer, HRM, and other sensors using BLE.
				</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<Sensor title="🧠 Smart Trainer" srv="???"/>
					<Sensor title="⚡️ Power" srv="cycling_power"/>
					<Sensor title="🚴 Speed &amp; Cadence" srv="cycling_speed_and_cadence"/>
					<Sensor title="❤️ HRM" srv="heart_rate"/>
				</Grid>
			</Box>
		</Container>
	);
}
