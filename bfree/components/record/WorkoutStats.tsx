import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import IconResistance from '@material-ui/icons/FitnessCenter';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		inlineIcon: {
			fontSize: '18px !important',
		},
		stopwatchCard: {
			height: '10em',
		},
		value: {
			float: 'right',
		},
	})
);

export default function WorkoutStats() {
	const classes = useStyles();

	/* TODO Show the actual workout stats */
	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.stopwatchCard}>
					<Typography gutterBottom variant="h5" component="h2">
						<IconResistance className={classes.inlineIcon} /> Workout
					</Typography>
					<Container>
						<b>Current:</b> <div className={classes.value}>W/slope/basicResistance and a progress bar</div>
						<br />
						<b>Next:</b> <div className={classes.value}>start time & resistance</div>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
