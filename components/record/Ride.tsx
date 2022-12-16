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
import { smartDistanceUnitConv } from '../../lib/units';

const valueStyle: SxPropsTheme = {
	float: 'right',
};

export default function Ride() {
	const distanceUnit = useGlobalState('unitDistance')[0];
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
						<b>Ride distance:</b>{' '}
						<Box sx={valueStyle}>{smartDistanceUnitConv(distanceUnit, rideDistance)}</Box>
						<br />
						<b>Lap distance:</b> <Box sx={valueStyle}>--</Box>
					</Container>
				</CardContent>
			</Card>
		</Grid>
	);
}
