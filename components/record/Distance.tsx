import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
