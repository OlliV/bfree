import IconReportProblem from '@mui/icons-material/ReportProblem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Tooltip } from '@mui/material';
import { SensorType, useGlobalState } from '../lib/global';
import { speedUnitConv } from '../lib/units';

export function SensorValueCC({ sensorValue, className }) {
	const cadence = sensorValue && sensorValue.cadence !== null ? Math.round(sensorValue.cadence) : '--';

	return <Typography className={className}>{cadence}&nbsp;RPM</Typography>;
}

export function SensorValueCP({ sensorValue, className }) {
	return (
		<Typography className={className}>
			{sensorValue && sensorValue.power !== null ? sensorValue.power : '--'}&nbsp;W
			<br />
			{sensorValue && sensorValue.speed !== null ? sensorValue.speed.toFixed(1) : '--'}&nbsp;km/h
		</Typography>
	);
}

export function SensorValueCSC({ sensorValue, className }) {
	const [unitSpeed] = useGlobalState('unitSpeed');

	const speedUnit = speedUnitConv[unitSpeed];
	const speed = sensorValue && sensorValue.speed !== null ? speedUnit.convTo(sensorValue.speed).toFixed(1) : '--';
	const cadence = sensorValue && sensorValue.cadence !== null ? Math.round(sensorValue.cadence) : '--';

	return (
		<Typography className={className}>
			{speed}&nbsp;{speedUnit.name}
			<br />
			{cadence}&nbsp;RPM
		</Typography>
	);
}

export function SensorValueCS({ sensorValue, className }) {
	const [unitSpeed] = useGlobalState('unitSpeed');
	const speedUnit = speedUnitConv[unitSpeed];
	const speed = sensorValue ? speedUnit.convTo(sensorValue.speed).toFixed(1) : '--';

	return (
		<Typography className={className}>
			{speed}&nbsp;{speedUnit.name}
		</Typography>
	);
}

export function SensorValueHRM({ sensorValue, className }) {
	return <Typography className={className}>{sensorValue ? sensorValue.heartRate : '--'}&nbsp;BPM</Typography>;
}

export function SensorWarn({ text }: { text: string }) {
	return (
		<Box sx={{ position: 'absolute', width: '1em', right: 0.5, zIndex: 10 }}>
			<Tooltip title={text} describeChild={true} enterTouchDelay={10}>
				<IconReportProblem />
			</Tooltip>
		</Box>
	);
}

export function SensorValueSmartTrainer({ sensorValue, className }) {
	const [unitSpeed] = useGlobalState('unitSpeed');
	const speedUnit = speedUnitConv[unitSpeed];

	let power = '--';
	let speed = '--';
	let calRequired: string;

	if (sensorValue) {
		if (sensorValue.power != null) {
			power = sensorValue.power;
		}
		speed = sensorValue.speed != null ? speedUnit.convTo(sensorValue.speed).toFixed(1) : '--';

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
		<Box>
			{calRequired ? (
				<SensorWarn text={calRequired} />
			) : (
				''
			)}
			<Typography className={className}>
				{power}&nbsp;W
				<br />
				{speed}&nbsp;{speedUnit.name}
			</Typography>
		</Box>
	);
}

export default function SensorValue({
	sensorType,
	sensorValue,
	className,
}: {
	sensorType: SensorType;
	sensorValue;
	className?: string;
}) {
	switch (sensorType) {
		case 'cycling_cadence':
			return <SensorValueCC sensorValue={sensorValue} className={className} />;
		case 'cycling_power':
			return <SensorValueCP sensorValue={sensorValue} className={className} />;
		case 'cycling_speed_and_cadence':
			return <SensorValueCSC sensorValue={sensorValue} className={className} />;
		case 'cycling_speed':
			return <SensorValueCS sensorValue={sensorValue} className={className} />;
		case 'heart_rate':
			return <SensorValueHRM sensorValue={sensorValue} className={className} />;
		case 'smart_trainer':
			return <SensorValueSmartTrainer sensorValue={sensorValue} className={className} />;
		default:
			return <Typography className={className}>Unknown sensor type</Typography>;
	}
}
