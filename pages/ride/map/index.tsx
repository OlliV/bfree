import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MyHead from '../../../components/MyHead';
import Title from '../../../components/Title';

const DynamicMap = dynamic(() => import('../../../components/OpenStreetMap'), {
  ssr: false
});

export default function RideWorkout() {
	return (
		<Container maxWidth="md">
			<MyHead title="Map Ride" />
			<Box>
				<Title href="/ride">Map Ride</Title>
				<p>Plan your ride.</p>

				<DynamicMap />

				<Grid container direction="row" alignItems="center" spacing={2}></Grid>
			</Box>
		</Container>
	);
}
