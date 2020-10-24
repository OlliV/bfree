import IconReportProblem from '@material-ui/icons/ReportProblem';
import Typography from '@material-ui/core/Typography';
import { Tooltip } from '@material-ui/core';
import {
	SensorType,
	speedUnitConv,
	useGlobalState,
} from '../lib/global';

export function SensorValueCC({ sensorValue, className }) {
	const cadence = sensorValue && sensorValue.cadence !== null
		? Math.round(sensorValue.cadence)
		: '--';

	return (
		<Typography className={className}>
			{cadence}&nbsp;RPM
		</Typography>
	);
}

export function SensorValueCP({ sensorValue, className }) {
	return (
		<Typography className={className}>
			{(sensorValue && sensorValue.power !== null) ? sensorValue.power : '--'}&nbsp;W
			<br />
			{(sensorValue && sensorValue.speed !== null) ? sensorValue.speed.toFixed(1) : '--'}&nbsp;km/h
		</Typography>
	);
}

export function SensorValueCSC({ sensorValue, className }) {
	const [units] = useGlobalState('units');

	const speedUnit = speedUnitConv[units.speedUnit];
	const speed = sensorValue && sensorValue.speed !== null
		? (speedUnit.convTo(sensorValue.speed)).toFixed(1)
		: '--';
	const cadence = sensorValue && sensorValue.cadence !== null
		? Math.round(sensorValue.cadence)
		: '--';

	return (
		<Typography className={className}>
			{speed}&nbsp;{speedUnit.name}
			<br />
			{cadence}&nbsp;RPM
		</Typography>
	);
}

export function SensorValueCS({ sensorValue, className }) {
	const [units] = useGlobalState('units');
	const speedUnit = speedUnitConv[units.speedUnit];
	const speed = sensorValue
		? (speedUnit.convTo(sensorValue.speed)).toFixed(1)
		: '--';

	return (
		<Typography className={className}>
			{speed}&nbsp;{speedUnit.name}
		</Typography>
	);
}

export function SensorValueHRM({ sensorValue, className }) {
	return (
		<Typography className={className}>
			{sensorValue ? sensorValue.heartRate : '--'}&nbsp;BPM
		</Typography>
	);
}

export function SensorValueSmartTrainer({ sensorValue, className }) {
	const [units] = useGlobalState('units');
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
		<Typography className={className}>
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

export default function SensorValue({ sensorType, sensorValue, className }: { sensorType: SensorType, sensorValue, className }) {
	switch (sensorType) {
	case 'cycling_cadence':
		return (<SensorValueCC sensorValue={sensorValue} className={className} />);
	case 'cycling_power':
		return (<SensorValueCP sensorValue={sensorValue} className={className} />);
	case 'cycling_speed_and_cadence':
		return (<SensorValueCSC sensorValue={sensorValue} className={className} />);
	case 'cycling_speed':
		return (<SensorValueCS sensorValue={sensorValue} className={className} />);
	case 'heart_rate':
		return (<SensorValueHRM sensorValue={sensorValue} className={className} />);
	case 'smart_trainer':
		return (<SensorValueSmartTrainer sensorValue={sensorValue} className={className} />);
	default:
	return (
		<Typography className={className}>
			Unknown sensor type
		</Typography>
	);
	}
}

