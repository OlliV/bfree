import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconTimelapse from '@mui/icons-material/Timelapse';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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
