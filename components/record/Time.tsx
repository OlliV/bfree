import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
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
		stopWatchCardTime: {
			float: 'right',
		},
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
						<b>Ride time:</b>{' '}
						<div className={classes.stopWatchCardTime}>{getElapsedTimeStr(elapsedTime)}</div>
						<br />
						<b>Lap time:</b>{' '}
						<div className={classes.stopWatchCardTime}>{getElapsedTimeStr(elapsedLapTime)}</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
