import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSetupStyles } from './SetupComponents';

export default function ExportCard({ title, children, onClickTCX }) {
	const classes = useSetupStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.setupCard}>
					<Typography gutterBottom variant="h5" component="h2">
						{title}
					</Typography>
					{children}
				</CardContent>
				<CardActions>
					<Button variant="contained" onClick={onClickTCX}>
						Export TCX
					</Button>
				</CardActions>
			</Card>
		</Grid>
	);
}
