import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useSetupStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
			alignItems: 'center',
		},
		setupCard: {
			height: '10em',
		},
		media: {
			height: 120,
		},
		form: {
			'& > *': {
				margin: theme.spacing(1),
				width: '25ch',
			},
		}
	})
);

export function Param({ title, image, children }) {
	const classes = useSetupStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia
					className={classes.media}
					image={image}
					title="Filler image"
				/>
				<Typography gutterBottom variant="h5" component="h2">
					{title}
				</Typography>
				<CardContent className={classes.setupCard}>
					{children}
				</CardContent>
			</Card>
		</Grid>
	);
}
