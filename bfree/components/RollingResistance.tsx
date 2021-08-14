import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect } from 'react';
import { rollingResistanceCoeff } from '../lib/virtual_params';

const predefinedRollingResistances: [string, number][] = [
	['Wooden track', rollingResistanceCoeff.wood],
	['Concrete', rollingResistanceCoeff.concrete],
	['Asphalt road', rollingResistanceCoeff.asphalt],
	['Rough road', rollingResistanceCoeff.rough],
];

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

export default function RollingResistance({
	rollingResistance,
	setRollingResistance,
}: {
	rollingResistance: number;
	setRollingResistance: (v: number) => void;
}) {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		// @ts-ignore
		setRollingResistance(event.target.value || 0);
	};

	useEffect(() => {
		if (Number.isNaN(rollingResistance)) {
			setRollingResistance(predefinedRollingResistances[2][1]);
		}
	}, []);

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia className={classes.media} image="/images/cards/roller.jpg" title="Filler image" />
				<Typography gutterBottom variant="h5" component="h2">
					Rolling Resistance
				</Typography>
				<CardContent className={classes.setupCard}>
					<FormControl className={classes.formControl}>
						<InputLabel id="demo-simple-select-label">Mode</InputLabel>
						<Select
							labelId="resistance-mode-select-label"
							id="resistance-mode-select"
							value={rollingResistance}
							onChange={handleChange}
						>
							{predefinedRollingResistances.map((r) => (
								<MenuItem key={r[0].toLowerCase().replace(/\s/g, '-')} value={r[1]}>{r[0]}</MenuItem>
							))}
						</Select>
						<br />
						<TextField
							value={rollingResistance}
							error={rollingResistance <= 0}
							onChange={handleChange}
							id="outlined-basic"
							label="fff"
							variant="outlined"
						/>
					</FormControl>
				</CardContent>
			</Card>
		</Grid>
	);
}
