import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconHourglass from '@mui/icons-material/HourglassEmpty';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

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
					<Container>Starting your ride...</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
