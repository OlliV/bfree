import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import {CardContent} from '@material-ui/core';

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head>
				<title>Bfree Setup</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Box>
				<h1 className={styles.title}>Setup</h1>
				<p className={styles.description}>
					Configure your trainer setup here.
				</p>

				<Grid container direction="row" justify="center" alignItems="center" spacing={2}>
					<Grid item xs={4}>
						<Card variant="outlined">
							<CardContent>
								<Typography gutterBottom variant="h5" component="h2">Bike Setup &rarr;</Typography>
								<Typography variant="body2" color="textSecondary" component="p">
									Set the bike configuration parameters.
								</Typography>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={4}>
						<a href="/setup/sensors">
							<Card variant="outlined">
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">Sensors &rarr;</Typography>
									<Typography variant="body2" color="textSecondary" component="p">
										Connect to BLE sensors.
									</Typography>
								</CardContent>
							</Card>
						</a>
					</Grid>
				</Grid>
			</Box>
		</Container>
	);
}
