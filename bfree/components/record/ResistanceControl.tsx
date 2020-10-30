import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { withStyles, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useGlobalState } from '../../lib/global';

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

const objectMap = (obj: any, fn: (v: any, k: string, i: number) => any): any => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
const valuetext = (value: number) => `${value}`;

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

type Resistance = 'basic' | 'power' | 'slope';
const params: {
	[k in Resistance]: {
		resistanceControlName: string;
		resistanceStep: number;
		maxResistance: number;
		resistanceUnit: string;
		defaultResistance: number;
	}
} = {
	basic: {
		resistanceControlName: 'Basic Resistance',
		resistanceStep: 5,
		maxResistance: 100,
		resistanceUnit: '%',
		defaultResistance: 20,
	},
	power: {
		resistanceControlName: 'Target Power',
		resistanceStep: 10,
		maxResistance: 1000, // TODO Get the max from somewhere
		resistanceUnit: 'W',
		defaultResistance: 150,
	},
	slope: {
		resistanceControlName: 'Slope',
		resistanceStep: 0.5,
		maxResistance: 40,
		resistanceUnit: '%',
		defaultResistance: 5,
	}
};
const r2marks: { [k in Resistance]: { value: number; label: string }[]} = objectMap(params, (v) => ([
	{
		value: 0,
		label: `0 ${v.resistanceUnit}`,
	},
	{
		value: v.maxResistance / 2,
		label: `${v.maxResistance / 2} ${v.resistanceUnit}`,
	},
	{
		value: v.maxResistance,
		label: `${v.maxResistance} ${v.resistanceUnit}`,
	}
]));

export default function ResistanceControl({ resistance }: { resistance: Resistance }) {
	const classes = useStyles();
	const {
		resistanceControlName,
		resistanceStep,
		maxResistance,
		defaultResistance,
	} = params[resistance];
	const marks = r2marks[resistance];
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');

	const handleChange = (_ev: never, value: number) => {
		console.log('Setting', value);

		if (smartTrainerControl) {
			switch (resistance) {
				case 'basic':
					smartTrainerControl.sendBasicResistance(value).catch(console.error);
					break;
				case 'power':
					smartTrainerControl.sendTargetPower(value).catch(console.error);
					break;
				case 'slope':
					smartTrainerControl.sendSlope(value, 0.004).catch(console.error);
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
							defaultValue={defaultResistance}
							onChangeCommitted={handleChange}
						/>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
