import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconTimelapse from '@material-ui/icons/Timelapse';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { getElapsedTimeStr } from '../../lib/format';
import { useGlobalState } from '../../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		stopwatchCard: {
			height: '10em',
		},
		value: {
			float: 'right',
		},
		inlineIcon: {
			fontSize: '18px !important',
		},
	})
);

function valueToDistance(value: number | null): string {
	if (typeof value === 'number') {
		if (value < 1000) {
			return `${value.toFixed(0)} m`;
		} else {
			return `${(value / 1000).toFixed(2)} km`;
		}
	}
	return '--';
}

export default function Ride() {
	const classes = useStyles();
	const [elapsedTime] = useGlobalState('elapsedTime');
	const [elapsedLapTime] = useGlobalState('elapsedLapTime');
	const [rideDistance] = useGlobalState('rideDistance');

	// TODO meters & km based on length
	// TODO lap distance

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						<IconTimelapse className={classes.inlineIcon} /> Time &amp; Distance
					</Typography>
					<Container>
						<b>Ride time:</b> <div className={classes.value}>{getElapsedTimeStr(elapsedTime)}</div>
						<br />
						<b>Lap time:</b> <div className={classes.value}>{getElapsedTimeStr(elapsedLapTime)}</div>
						<br />
						<b>Ride distance:</b> <div className={classes.value}>{valueToDistance(rideDistance)}</div>
						<br />
						<b>Lap distance:</b> <div className={classes.value}>--</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
