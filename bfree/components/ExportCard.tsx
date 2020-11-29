import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useSetupStyles } from './SetupComponents';

export default function ExportCard({
	title,
	children,
	onClickTCX,
	cardContentClassName,
}: {
	title: string;
	children: any;
	onClickTCX: () => void;
	cardContentClassName?: string;
}) {
	const classes = useSetupStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={cardContentClassName || classes.setupCard}>
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
