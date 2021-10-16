import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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
