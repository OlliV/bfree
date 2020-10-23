import Title from '../../components/title';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Head from '../../components/Head';

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

// TODO Priority order config for sensor measurements
// e.g.
// power from 1. pm 2. trainer
// speed from 1. speed sensor 2. trainer

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="Setup" />
			<Box>
				<Title>Setup</Title>
				<p>Configure your trainer setup here.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="Rider" href="/setup/rider">
						Configure the rider profile.
					</MenuCard>
					<MenuCard title="Bike" href="/setup/bike">
						Setup the bike configuration parameters.
					</MenuCard>
					<MenuCard title="Sensors" href="/setup/sensors">
						Connect to BLE sensors.
					</MenuCard>
				</Grid>
			</Box>
		</Container>
	);
}
