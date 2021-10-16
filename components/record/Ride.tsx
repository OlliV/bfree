import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconTimelapse from '@mui/icons-material/Timelapse';
import Typography from '@mui/material/Typography';
import SxPropsTheme from '../../lib/SxPropsTheme';
import { getElapsedTimeStr } from '../../lib/format';
import { useGlobalState } from '../../lib/global';

const valueStyle: SxPropsTheme = {
	float: 'right',
};

function valueToDistance(value: number | null): string {
	if (typeof value === 'number') {
		if (value < 1000) {
			return `${value.toFixed(0)} m`;
		} else {
			return `${(value / 1000).toFixed(2)} km`;
		}
	}
	return '--';
}

export default function Ride() {
	const [elapsedTime] = useGlobalState('elapsedTime');
	const [elapsedLapTime] = useGlobalState('elapsedLapTime');
	const [rideDistance] = useGlobalState('rideDistance');

	// TODO meters & km based on length
	// TODO lap distance

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent sx={{ height: '10em' }}>
					<Typography gutterBottom variant="h5" component="h2">
						<IconTimelapse sx={{ fontSize: '18px !important' }} /> Time &amp; Distance
					</Typography>
					<Container>
						<b>Ride time:</b> <Box sx={valueStyle}>{getElapsedTimeStr(elapsedTime)}</Box>
						<br />
						<b>Lap time:</b> <Box sx={valueStyle}>{getElapsedTimeStr(elapsedLapTime)}</Box>
						<br />
						<b>Ride distance:</b> <Box sx={valueStyle}>{valueToDistance(rideDistance)}</Box>
						<br />
						<b>Lap distance:</b> <Box sx={valueStyle}>--</Box>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
