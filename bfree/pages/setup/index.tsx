import Title from '../../components/title';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from 'next/head';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		menuCard: {
			'&:hover': {
				backgroundColor: 'lightgrey',
			},
		},
	})
);

function MenuCard({ title, href, children }: { title: string; href: string; children?: any }) {
	const classes = useStyles();

	return (
		<Grid item xs={12}>
			<Link href={href || '/'}>
				<a>
					<Card variant="outlined" className={classes.menuCard}>
						<CardContent>
							<Typography gutterBottom variant="h5" component="h2">
								{title}&nbsp;&rarr;
							</Typography>
							<Typography variant="body2" color="textSecondary" component="p">
								{children || ''}
							</Typography>
						</CardContent>
					</Card>
				</a>
			</Link>
		</Grid>
	);
}

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head>
				<title>Bfree Setup</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Box>
				<Title>Setup</Title>
				<p>Configure your trainer setup here.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="Bike Setup" href="">
						Set the bike configuration parameters.
					</MenuCard>
					<MenuCard title="Sensors" href="/setup/sensors">
						Connect to BLE sensors.
					</MenuCard>
				</Grid>
			</Box>
		</Container>
	);
}
