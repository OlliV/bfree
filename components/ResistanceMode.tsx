import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		setupCard: {
			height: '15em',
		},
		media: {
			height: 120,
		},
		formControl: {
			'& > *': {
				margin: theme.spacing(1),
				width: '25ch',
			},
		},
	})
);

export default function ResistanceMode({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
	const classes = useStyles();

	const handleChange = (event: SelectChangeEvent<string>, _child?: object) => {
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
					<FormControl className={classes.formControl}>
						<InputLabel id="demo-simple-select-label">Mode</InputLabel>
						<Select
							variant="standard"
							labelId="resistance-mode-select-label"
							id="resistance-mode-select"
							value={mode}
							onChange={handleChange}
						>
							<MenuItem value={'basic'}>Basic resistance</MenuItem>
							<MenuItem value={'power'}>Power</MenuItem>
							<MenuItem value={'slope'}>Slope</MenuItem>
						</Select>
					</FormControl>
				</CardContent>
			</Card>
		</Grid>
	);
}
