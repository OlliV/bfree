import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconCadence from '@mui/icons-material/FlipCameraAndroid';
import IconHeart from '@mui/icons-material/Favorite';
import IconPower from '@mui/icons-material/OfflineBolt';
import IconSpeed from '@mui/icons-material/Speed';
import Typography from '@mui/material/Typography';
import { Measurement, CscMeasurements, HrmMeasurements, useMeasurementByType } from '../../lib/measurements';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import SxPropsTheme from '../../lib/SxPropsTheme';
import { useState, useEffect, useMemo } from 'react';
import { UnitConv, speedUnitConv } from '../../lib/units';
import { useGlobalState } from '../../lib/global';

type DisplayValue = {
	value: number;
	unit: string;
};

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		cardHeader: {
			padding: 2,
		},
		card: {
			height: '10em',
		},
		valuesTable: {
			border: 0,
			width: '100%',
			borderCollapse: 'collapse',
			borderSpacing: 0,
			borderWidth: 0,
		},
		header: {
			textAlign: 'left',
			fontWeight: 'bold',
		},
		value: {
			width: '10em',
			textAlign: 'right',
		},
		unit: {
			textAlign: 'left',
		},
	})
);

const iconStyle: SxPropsTheme = {
	fontSize: '18px !important',
}

function getContentByType(classes, speedUnit: UnitConv[''], type: Measurement) {
	/* eslint-disable react/jsx-key */
	const contentByType: { [K in Measurement]: [Element | JSX.Element, (m: any) => DisplayValue, number] } = {
		cycling_cadence: [
			<span>
				<IconCadence sx={iconStyle} /> Cadence
			</span>,
			(m: CscMeasurements) => ({ value: m ? m.cadence : NaN, unit: 'RPM' }),
			0,
		],
		cycling_power: [
			<span>
				<IconPower sx={iconStyle} /> Power
			</span>,
			(m: any) => ({ value: m ? m.power : NaN, unit: 'W' }),
			0,
		],
		cycling_speed: [
			<span>
				<IconSpeed sx={iconStyle} /> Speed
			</span>,
			(m: CscMeasurements) => ({ value: m && m.speed ? speedUnit.convTo(m.speed) : NaN, unit: speedUnit.name }),
			1,
		],
		heart_rate: [
			<span>
				<IconHeart sx={iconStyle} /> Heart Rate
			</span>,
			(m: HrmMeasurements) => ({ value: m ? m.heartRate : NaN, unit: 'BPM' }),
			1,
		],
	};
	/* eslint-enable react/jsx-key */

	return contentByType[type];
}

export default function MeasurementCard({ type, ribbonColor }: { type: Measurement; ribbonColor?: string }) {
	const classes = useStyles();
	const speedUnit = speedUnitConv[useGlobalState('unitSpeed')[0]];
	const [title, fn, digits] = useMemo(() => getContentByType(classes, speedUnit, type), [classes, type, speedUnit]);
	const m = useMeasurementByType(type);
	const { value, unit } = fn(m);
	const [{ avg, max }, setAgg] = useState({ avg: 0, max: NaN, n: 0 });

	useEffect(() => {
		const { value: v } = fn(m);

		setAgg((prev) => {
			const newValue = { ...prev };

			// RFE Sometimes avg goes NaN, this should sort of fix it.
			// Issue #49
			if (Number.isNaN(prev.avg) || prev.avg === Infinity) {
				newValue.avg = 0;
				newValue.n = 0;
			} else if (!Number.isNaN(v)) {
				newValue.avg = prev.avg + (v - prev.avg) / (prev.n + 1);
				newValue.n++;
			}

			if (Number.isNaN(prev.max) || (v > prev.max && v < Infinity)) {
				newValue.max = v;
			}

			return newValue;
		});
	}, [fn, m, setAgg]);

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardHeader className={`${classes.cardHeader} ${ribbonColor || ''}`} />
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						{title}
					</Typography>
					<Container>
						<table className={classes.valuesTable}>
							<tbody>
								<tr>
									<th className={classes.header}>Current:</th>
									<td className={classes.value}>
										{Number.isNaN(value) ? '--' : value.toFixed(digits)}
									</td>
									<td className={classes.unit}>{unit}</td>
								</tr>
								<tr>
									<th className={classes.header}>Avg:</th>
									<td className={classes.value}>{avg.toFixed(digits)}</td>
									<td className={classes.unit}></td>
								</tr>
								<tr>
									<th className={classes.header}>Max:</th>
									<td className={classes.value}>{Number.isNaN(max) ? '--' : max.toFixed(digits)}</td>
									<td className={classes.unit}></td>
								</tr>
							</tbody>
						</table>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
