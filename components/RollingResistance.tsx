import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useEffect, useState } from 'react';
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

function getTrackImg(rollingResistance: number) {
	if (rollingResistance <= predefinedRollingResistances[0][1]) {
		// wooden
		return '/images/cards/wooden.jpg';
	} else if (rollingResistance <= predefinedRollingResistances[1][1]) {
		// Concrete
		return '/images/cards/concrete.jpg';
	} else if (rollingResistance <= predefinedRollingResistances[2][1]) {
		// Asphalt
		return '/images/cards/slope.jpg';
	} else {
		// Rough
		return '/images/cards/dirt_road.jpg';
	}
}

export default function RollingResistance({
	rollingResistance,
	setRollingResistance,
}: {
	rollingResistance: number;
	setRollingResistance: ReturnType<typeof useState>[1];
}) {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		// @ts-ignore
		setRollingResistance(event.target.value || 0);
	};

	useEffect(() => {
		setRollingResistance((prev) => (Number.isNaN(prev) ? predefinedRollingResistances[2][1] : prev));
	}, [setRollingResistance]);

	return (
        <Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia className={classes.media} image={getTrackImg(rollingResistance)} title="Filler image" />
				<Typography gutterBottom variant="h5" component="h2">
					Rolling Resistance
				</Typography>
				<CardContent className={classes.setupCard}>
					<FormControl className={classes.formControl}>
						<InputLabel id="demo-simple-select-label">Mode</InputLabel>
						<Select
							labelId="resistance-mode-select-label"
							id="resistance-mode-select"
							value={rollingResistance || 0}
							onChange={handleChange}
						>
							{predefinedRollingResistances.map((r) => (
								<MenuItem key={r[0].toLowerCase().replace(/\s/g, '-')} value={r[1]}>
									{r[0]}
								</MenuItem>
							))}
						</Select>
						<br />
						<TextField
							value={rollingResistance || 0}
							error={rollingResistance <= 0}
							onChange={handleChange}
							id="outlined-basic"
							label="Coefficient"
							variant="outlined"
						/>
					</FormControl>
				</CardContent>
			</Card>
		</Grid>
    );
}
