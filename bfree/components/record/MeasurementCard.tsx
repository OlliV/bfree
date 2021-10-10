import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconCadence from '@material-ui/icons/FlipCameraAndroid';
import IconHeart from '@material-ui/icons/Favorite';
import IconPower from '@material-ui/icons/OfflineBolt';
import IconSpeed from '@material-ui/icons/Speed';
import Typography from '@material-ui/core/Typography';
import { Measurement, CscMeasurements, HrmMeasurements, useMeasurementByType } from '../../lib/measurements';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState, useEffect, useMemo } from 'react';
import { UnitConv, speedUnitConv } from '../../lib/units';
import { useGlobalState } from '../../lib/global';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		cardHeader: {
			padding: 2,
		},
		card: {
			height: '10em',
		},
		inlineIcon: {
			fontSize: '18px !important',
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

type DisplayValue = {
	value: number;
	unit: string;
};

function getContentByType(classes, speedUnit: UnitConv[""], type: Measurement) {
	/* eslint-disable react/jsx-key */
	const contentByType: { [K in Measurement]: [Element | JSX.Element, (m: any) => DisplayValue, number] } = {
		cycling_cadence: [
			<span>
				<IconCadence className={classes.inlineIcon} /> Cadence
			</span>,
			(m: CscMeasurements) => ({ value: m ? m.cadence : NaN, unit: 'RPM' }),
			0,
		],
		cycling_power: [
			<span>
				<IconPower className={classes.inlineIcon} /> Power
			</span>,
			(m: any) => ({ value: m ? m.power : NaN, unit: 'W' }),
			0,
		],
		cycling_speed: [
			<span>
				<IconSpeed className={classes.inlineIcon} /> Speed
			</span>,
			(m: CscMeasurements) => ({ value: m && m.speed ? speedUnit.convTo(m.speed) : NaN, unit: speedUnit.name }),
			1,
		],
		heart_rate: [
			<span>
				<IconHeart className={classes.inlineIcon} /> Heart Rate
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
	const [title, fn, digits] = useMemo(() => getContentByType(classes, speedUnit, type), [type, speedUnit]);
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
				newValue.avg = prev.avg + (v - prev.avg) / (prev.n + 1),
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
