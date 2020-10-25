import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { withStyles, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useGlobalState } from '../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		resistanceControlCard: {
			height: '10em',
		},
		resistanceControlSlider: {
			paddingTop: '3em',
		},
	})
);

const ResistanceSlider = withStyles({
	root: {
		color: 'rgb(222, 35, 91)',
		height: 8,
	},
	thumb: {
		height: 24,
		width: 24,
		backgroundColor: '#fff',
		border: '2px solid currentColor',
		marginTop: -8,
		marginLeft: -12,
		'&:focus, &:hover, &$active': {
			boxShadow: 'inherit',
		},
	},
	active: {},
	valueLabel: {
		left: 'calc(-50% + 4px)',
	},
	markLabel: {
		position: 'absolute',
		marginTop: '4ex',
	},
	track: {
		height: 8,
		borderRadius: 4,
	},
	rail: {
		height: 8,
		borderRadius: 4,
	},
})(Slider);

export default function ResistanceControl({ resistance }) {
	const classes = useStyles();
	let resistanceControlName: string;
	let resistanceStep: number;
	let maxResistance: number;
	let resistanceUnit: string;
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');

	// rgb(222, 35, 91)
	switch (resistance) {
		case 'basic':
			resistanceControlName = 'Basic Resistance';
			resistanceStep = 5;
			maxResistance = 100;
			resistanceUnit = '%';
			//resistanceControl =
			break;
		case 'power':
			resistanceControlName = 'Target Power';
			resistanceStep = 10;
			maxResistance = 2000; // TODO Get the max from somewhere
			resistanceUnit = 'W';
			break;
		case 'slope':
			resistanceControlName = 'Slope';
			resistanceStep = 0.5;
			maxResistance = 40;
			resistanceUnit = '%';
			break;
		default:
			throw new Error(`Invalid resistance type: "${resistance}"`);
	}

	const valuetext = (value: number) => `${value}`;
	const marks: { value: number; label: string }[] = [
		{
			value: 0,
			label: `0 ${resistanceUnit}`,
		},
		{
			value: maxResistance / 2,
			label: `${maxResistance / 2} ${resistanceUnit}`,
		},
		{
			value: maxResistance,
			label: `${maxResistance} ${resistanceUnit}`,
		},
	];

	const handleChange = (_ev: never, value: number) => {
		console.log('Setting', value);

		if (smartTrainerControl) {
			switch (resistance) {
				case 'basic':
					smartTrainerControl.setBasicResistance(value);
					break;
				case 'power':
				case 'slope':
					console.error('Control mode not implemented', resistance);
					break;
			}
		}
	};

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.resistanceControlCard}>
					<Typography id="resistance-control" gutterBottom variant="h5" component="h2">
						{resistanceControlName}
					</Typography>
					<Container>
						<ResistanceSlider
							className={classes.resistanceControlSlider}
							valueLabelDisplay="on"
							aria-labelledby="resistance-control"
							getAriaValueText={valuetext}
							aria-label="resistance slider"
							marks={marks}
							min={0}
							step={resistanceStep}
							max={maxResistance}
							defaultValue={20}
							onChangeCommitted={handleChange}
						/>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
