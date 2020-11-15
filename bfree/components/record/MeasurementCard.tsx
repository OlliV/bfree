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
import { speedUnitConv } from '../../lib/units';
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
	value: string;
	unit: string;
}

function getContentByType(classes, speedUnit, type: Measurement) {
	const contentByType: { [K in Measurement]: [ Element | JSX.Element, (m: any) => DisplayValue ] } = {
		cycling_cadence: [
			(<span><IconCadence className={classes.inlineIcon} /> Cadence</span>),
			(m: CscMeasurements) => ({ value: m ? m.cadence.toFixed(0) : '--', unit: 'RPM' }),
		],
		cycling_power: [
			(<span><IconPower className={classes.inlineIcon} /> Power</span>),
			(m: any) => ({ value: m ? m.power.toFixed(0) : '--', unit: 'W' }),
		],
		cycling_speed: [
			(<span><IconSpeed className={classes.inlineIcon} /> Speed</span>),
			(m: CscMeasurements) => ({ value: m && m.speed ? speedUnit.convTo(m.speed).toFixed(1) : '--', unit: speedUnit.name }),
		],
		heart_rate: [
			(<span><IconHeart className={classes.inlineIcon} /> Heart Rate</span>),
			(m: HrmMeasurements) => ({ value: m ? m.heartRate.toFixed(0) : '--', unit: 'BPM' }),
		],
	};

	return contentByType[type];
}

export default function MeasurementCard({ type, ribbonColor }: { type: Measurement, ribbonColor?: string }) {
	const classes = useStyles();
	const speedUnit = speedUnitConv[useGlobalState('unitSpeed')[0]];
	const [title, fn] = useMemo(() => getContentByType(classes, speedUnit, type), [type])
	const m = useMeasurementByType(type);
	const { value, unit } = fn(m);
	const [avg, setAvg] = useState(0);
	const [max, setMax] = useState(0);
	const [n, setN] = useState(0);

	useEffect(() => {
		const v = Number(value);

		if (!Number.isNaN(v)) {
			setAvg(avg + (v - avg) / (n + 1));
			setN(n + 1);
		}

		if (v > max) {
			setMax(v);
		}
	}, [m]);

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardHeader className={`${classes.cardHeader} ${ribbonColor || ''}`} />
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						{title}
					</Typography>
					<Typography>
						<Container>
							<table className={classes.valuesTable}>
								<tr>
									<th className={classes.header}>
										Current:
									</th>
									<td className={classes.value}>
										{value}
									</td>
									<td className={classes.unit}>
										{unit}
									</td>
								</tr>
								<tr>
									<th className={classes.header}>
										Avg:
									</th>
									<td className={classes.value}>
										{avg}
									</td>
									<td className={classes.unit}>
									</td>
								</tr>
								<tr>
									<th className={classes.header}>
										Max:
									</th>
									<td className={classes.value}>
										{max}
									</td>
									<td className={classes.unit}>
									</td>
								</tr>
							</table>
						</Container>
					</Typography>
				</CardContent>
			</Card>
		</Grid>
	);
}
