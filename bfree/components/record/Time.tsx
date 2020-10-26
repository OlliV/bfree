import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { getElapsedTimeStr } from '../../lib/format';
import { useGlobalState } from '../../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		stopwatchCard: {
			height: '10em',
		},
		stopWatchCardTime: {
			float: 'right',
		}
	})
);

export default function Time() {
	const classes = useStyles();
	const [elapsedTime] = useGlobalState('elapsedTime');
	const [elapsedLapTime] = useGlobalState('elapsedLapTime');

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						Time
					</Typography>
					<Container>
						<b>Ride time:</b> <div className={classes.stopWatchCardTime}>{getElapsedTimeStr(elapsedTime)}</div>
						<br />
						<b>Lap time:</b> <div className={classes.stopWatchCardTime}>{getElapsedTimeStr(elapsedLapTime)}</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
