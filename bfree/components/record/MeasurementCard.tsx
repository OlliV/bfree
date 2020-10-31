import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import IconBike from '@material-ui/icons/DirectionsBike';
import IconCadence from '@material-ui/icons/FlipCameraAndroid';
import IconHeart from '@material-ui/icons/Favorite';
import IconPower from '@material-ui/icons/OfflineBolt';
import IconSpeed from '@material-ui/icons/Speed';
import Typography from '@material-ui/core/Typography';
import { Measurement, CscMeasurements, HrmMeasurements, useMeasurementByType } from '../../lib/measurements';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
	})
);

type DisplayValue = {
	value: string;
	unit: string;
}

export default function MeasurementCard({ type, ribbonColor }: { type: Measurement, ribbonColor?: string }) {
	const classes = useStyles();
	const speedUnit = speedUnitConv[useGlobalState('unitSpeed')[0]];

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
	const toEl = (v: DisplayValue) => (<span>{v.value}&nbsp;{v.unit}</span>);
	const [title, fn] = contentByType[type];

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardHeader className={`${classes.cardHeader} ${ribbonColor || ''}`} />
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						{title}
					</Typography>
					<Typography>
						{toEl(fn(useMeasurementByType(type)))}
					</Typography>
				</CardContent>
			</Card>
		</Grid>
	);
}
