import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSetupStyles } from './SetupComponents';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		formControl: {
			margin: theme.spacing(1),
			minWidth: 120,
		},
	})
);

export default function ResistanceMode({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
	const classes = useSetupStyles();
	const myClasses = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setMode(event.target.value as string);
	};

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia
					className={classes.media}
					image="/images/cards/roller.jpg"
					title="spinning on roller; Klasická kola umístěna na otáčecí válce a zapojena na měřič rychlosti."
				/>
				<Typography gutterBottom variant="h5" component="h2">
					Resistance Mode
				</Typography>
				<CardContent className={classes.setupCard}>
					<FormControl className={myClasses.formControl}>
						<InputLabel id="demo-simple-select-label">Mode</InputLabel>
						<Select
							labelId="resistance-mode-select-label"
							id="resistance-mode-select"
							value={mode}
							onChange={handleChange}
						>
							<MenuItem value={'basic'}>Basic resistance</MenuItem>
							<MenuItem value={'slope'}>Slope</MenuItem>
							<MenuItem value={'power'}>Power</MenuItem>
						</Select>
					</FormControl>
				</CardContent>
			</Card>
		</Grid>
	);
}
