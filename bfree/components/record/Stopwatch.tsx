import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { withStyles, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState, useRef } from 'react';

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

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

function getElapsedStr(t: number) {
	const min = Math.floor(t / 60000);
	const sec = Math.floor((t % (1000 * 60)) / 1000);

	return `${zeroPad(min, 2)}:${zeroPad(sec, 2)}`;
}

export function Stopwatch({ startTime, isStopped, className }: { startTime: number; isStopped?: boolean; className?: any }) {
	const [time, setTime] = useState(() => Date.now() - startTime);
	const [reset, setReset] = useState(false);

	// Reset time if startTime changes
	useEffect(() => {
		setReset(true);
	}, [startTime]);

	useEffect(() => {
		if (isStopped) {
			return;
		}

		let offset = Date.now();
		let t = time;

		if (reset) {
			t = 0;
			setTime(t);
			setReset(false);
		}

		const intervalId = setInterval(() => {
			const delta = () => {
				const now = Date.now();
				const d = now - offset;

				offset = now;
				return d;
			}

			t += delta();
			setTime(t);
		}, 15);

		return () => {
			clearInterval(intervalId);
		};
	}, [startTime, isStopped, reset]);

	return <div className={className}>{getElapsedStr(time)}</div>;
}

export function StopwatchCard({ startTime, lapStartTime, isStopped }: { startTime: number, lapStartTime: number, isStopped: boolean }) {
	const classes = useStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						Time
					</Typography>
					<Container>
						<b>Ride time:</b> <Stopwatch className={classes.stopWatchCardTime} startTime={startTime} isStopped={isStopped} />
						<br />
						<b>Lap time:</b> <Stopwatch className={classes.stopWatchCardTime} startTime={lapStartTime} isStopped={isStopped} />
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
