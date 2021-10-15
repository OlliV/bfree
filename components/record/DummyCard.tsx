import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconHourglass from '@material-ui/icons/HourglassEmpty';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		dummyCard: {
			height: '10em',
		},
		inlineIcon: {
			fontSize: '18px !important',
		},
	})
);

export default function DummyCard() {
	const classes = useStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.dummyCard}>
					<Typography id="resistance-control" gutterBottom variant="h5" component="h2">
						<IconHourglass className={classes.inlineIcon} /> Loading...
					</Typography>
					<Container>
						Starting your ride...
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
