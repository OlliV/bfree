import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconResistance from '@mui/icons-material/FitnessCenter';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useEffect, useState, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import { useGlobalState, ControlParams } from '../../lib/global';
import {
	stdBikeFrontalArea,
	stdBikeDragCoefficient,
	rollingResistanceCoeff,
	calcWindResistanceCoeff,
} from '../../lib/virtual_params';

const PREFIX = 'ResistanceControl';
const classes = {
	root: `${PREFIX}-root`,
	thumb: `${PREFIX}-thumb`,
	active: `${PREFIX}-active`,
	valueLabel: `${PREFIX}-valueLabel`,
	markLabel: `${PREFIX}-markLabel`,
	track: `${PREFIX}-track`,
	rail: `${PREFIX}-rail`,
	resistanceControlCard: `${PREFIX}-resistanceControlCard`,
	resistanceControlSlider: `${PREFIX}-resistanceControlSlider`,
	inlineIcon: `${PREFIX}-inlineIcon`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`& .${classes.resistanceControlCard}`]: {
		height: '10em',
	},

	[`& .${classes.resistanceControlSlider}`]: {
		paddingTop: '3em',
	},

	[`& .${classes.inlineIcon}`]: {
		fontSize: '18px !important',
	},
}));

export type Resistance = 'basic' | 'power' | 'slope';
type SendResistanceFunc = (value: number) => Promise<void>;

const objectMap = (obj: any, fn: (v: any, k: string, i: number) => any): any =>
	Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
const valuetext = (value: number) => `${value}`;

const ResistanceSlider = Slider;

const params: {
	[k in Resistance]: {
		resistanceControlName: string;
		resistanceStep: number;
		maxResistance: number;
		resistanceUnit: string;
		defaultResistance: number;
	};
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
	},
};
const r2marks: { [k in Resistance]: { value: number; label: string }[] } = objectMap(params, (v) => [
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
	},
]);

export default function ResistanceControl({
	resistance,
	rollingResistance,
}: {
	resistance: Resistance;
	rollingResistance?: number;
}) {
	const isBreakpoint = useMediaQuery('(min-width:800px)');
	const { resistanceControlName, resistanceStep, maxResistance, resistanceUnit, defaultResistance } =
		params[resistance];
	const marks = isBreakpoint ? r2marks[resistance] : null;
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');
	const [_controlParams, setControlParams] = useGlobalState('control_params');
	const [bike] = useGlobalState('bike');
	const [enabled, setEnabled] = useState(false);
	const altitude = 0;
	const windSpeed = 0; // head/tail component.
	const draftingFactor = 1.0; // 0.0 would be no air resistance simulation, where as 1.0 means no drafting effect.
	const windResistanceCoeff = useMemo(
		() => calcWindResistanceCoeff(stdBikeFrontalArea[bike.type], stdBikeDragCoefficient[bike.type], altitude),
		[bike]
	);
	const sendResistance = useMemo((): SendResistanceFunc => {
		if (!smartTrainerControl) {
			return async (_value: number) => {
				console.log('sendResistance failed: No smart trainer connected');
			};
		}
		switch (resistance) {
			case 'basic':
				return async (value: number) => await smartTrainerControl.sendBasicResistance(value);
			case 'power':
				return async (value: number) => await smartTrainerControl.sendTargetPower(value);
			case 'slope':
				return async (value: number) => {
					await smartTrainerControl.sendWindResistance(windResistanceCoeff, windSpeed, draftingFactor);
					await smartTrainerControl.sendSlope(value, rollingResistance || rollingResistanceCoeff.asphalt);
					setControlParams((prev: ControlParams) => ({ ...prev, slope: value }));
				};
			default:
				throw new Error('Unknown resistance mode');
		}
	}, [resistance, rollingResistance, smartTrainerControl, windResistanceCoeff, setControlParams]);

	// Set the initial resistance and mode + register a cleanup.
	// Note: defaultResistance is not in the deps because we don't care
	//       if it changes.
	// TODO sendResistance could change in theory
	useEffect(() => {
		sendResistance(defaultResistance)
			.catch(console.error)
			.then(() => setEnabled(true));

		return () => {
			// Reset resistance to zero.
			sendResistance(0).catch(console.error);
			setControlParams((prev: ControlParams) => {
				const newParams = { ...prev };

				delete newParams.slope;

				return newParams;
			});
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleChange = (_ev: never, value: number) => {
		setEnabled(false);
		sendResistance(value)
			.catch(console.error)
			.then(() => setEnabled(true));
	};

	return (
		<StyledGrid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.resistanceControlCard}>
					<Typography id="resistance-control" gutterBottom variant="h5" component="h2">
						<IconResistance className={classes.inlineIcon} /> {isBreakpoint ? resistanceControlName : ''}
					</Typography>
					<Container>
						<ResistanceSlider
							className={classes.resistanceControlSlider}
							valueLabelDisplay="on"
							aria-labelledby="resistance-control"
							getAriaValueText={valuetext}
							aria-label="resistance slider"
							disabled={!enabled}
							marks={marks}
							min={0}
							step={resistanceStep}
							max={maxResistance}
							defaultValue={defaultResistance}
							onChangeCommitted={handleChange}
							classes={{
								root: classes.root,
								thumb: classes.thumb,
								active: classes.active,
								valueLabel: classes.valueLabel,
								markLabel: classes.markLabel,
								track: classes.track,
								rail: classes.rail,
							}}
						/>
					</Container>
				</CardContent>
			</Card>
		</StyledGrid>
	);
}
