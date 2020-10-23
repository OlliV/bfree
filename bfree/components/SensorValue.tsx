import IconReportProblem from '@material-ui/icons/ReportProblem';
import Typography from '@material-ui/core/Typography';
import { Tooltip } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
	SensorType,
	speedUnitConv,
	useGlobalState,
} from '../lib/global';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		sensorValue: {
		},
	})
);

export function SensorValueCC(sensorValue) {
	const classes = useStyles();

	const cadence = sensorValue && sensorValue.cadence !== null
		? Math.round(sensorValue.cadence)
		: '--';

	return (
		<Typography className={classes.sensorValue}>
			{cadence}&nbsp;RPM
		</Typography>
	);
}

export function SensorValueCP(sensorValue) {
	const classes = useStyles();

	return (
		<Typography className={classes.sensorValue}>
			{(sensorValue && sensorValue.power !== null) ? sensorValue.power : '--'}&nbsp;W
			<br />
			{(sensorValue && sensorValue.speed !== null) ? sensorValue.speed.toFixed(1) : '--'}&nbsp;km/h
		</Typography>
	);
}

export function SensorValueCSC(sensorValue) {
	const [units] = useGlobalState('units');
	const classes = useStyles();

	const speedUnit = speedUnitConv[units.speedUnit];
	const speed = sensorValue && sensorValue.speed !== null
		? (sensorValue.speed * speedUnit.mul).toFixed(1)
		: '--';
	const cadence = sensorValue && sensorValue.cadence !== null
		? Math.round(sensorValue.cadence)
		: '--';

	return (
		<Typography className={classes.sensorValue}>
			{speed}&nbsp;{speedUnit.name}
			<br />
			{cadence}&nbsp;RPM
		</Typography>
	);
}

export function SensorValueCS(sensorValue) {
	const [units] = useGlobalState('units');
	const classes = useStyles();
	const speedUnit = speedUnitConv[units.speedUnit];
	const speed = sensorValue
		? (sensorValue.speed * speedUnit.mul).toFixed(1)
		: '--';

	return (
		<Typography className={classes.sensorValue}>
			{speed}&nbsp;{speedUnit.name}
		</Typography>
	);
}

export function SensorValueHRM(sensorValue) {
	const classes = useStyles();

	return (
		<Typography className={classes.sensorValue}>
			{sensorValue ? sensorValue.heartRate : '--'}&nbsp;BPM
		</Typography>
	);
}

export function SensorValueSmartTrainer(sensorValue) {
	const [units] = useGlobalState('units');
	const classes = useStyles();
	let power = '--';
	let calRequired;

	if (sensorValue) {
		if (sensorValue.power != null) {
			power = sensorValue.power;
		}

		const warns = [];
		const { calStatus } = sensorValue;
		if (calStatus.powerCalRequired) {
			warns.push('Power calibration required');
		}
		if (calStatus.resistanceCalRequired) {
			warns.push('Resistance calibration required');
		}
		if (calStatus.userConfigRequired) {
			warns.push('User configuration required');
		}
		if (warns.length > 0) {
			calRequired = warns.join(', ');
		}
	}

	return (
		<Typography className={classes.sensorValue}>
			{power}&nbsp;W
			<br />
			{(calRequired) ? (
				<Tooltip title={calRequired}>
					<IconReportProblem />
				</Tooltip>
			) : ''}
		</Typography>
	);
}

export default function SensorValue({ sensorType, sensorValue }: { sensorType: SensorType, sensorValue }) {
	const [units] = useGlobalState('units');
	const classes = useStyles();

	switch (sensorType) {
	case 'cycling_cadence':
		return SensorValueCC(sensorValue);
	case 'cycling_power':
		return SensorValueCP(sensorValue);
	case 'cycling_speed_and_cadence':
		return SensorValueCSC(sensorValue);
	case 'cycling_speed':
		return SensorValueCS(sensorValue);
	case 'heart_rate':
		return SensorValueHRM(SensorValue);
	case 'smart_trainer':
		return SensorValueSmartTrainer(sensorValue);
	default:
	return (
		<Typography className={classes.sensorValue}>
			Unknown sensor type
		</Typography>
	);
	}
}

