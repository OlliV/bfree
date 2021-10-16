import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useGlobalState } from '../../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		stopwatchCard: {
			height: '10em',
		},
		distance: {
			float: 'right',
		},
	})
);

export default function Distance() {
	const classes = useStyles();
	const [rideDistance] = useGlobalState('rideDistance');

	// TODO meters & km based on length
	// TODO lap distance
	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						Distance
					</Typography>
					<Container>
						<b>Ride distance:</b> <div className={classes.distance}>{rideDistance}</div>
						<br />
						<b>Lap distance:</b> <div className={classes.distance}>--</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
