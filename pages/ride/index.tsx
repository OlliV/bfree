import Title from '../../components/Title';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MyHead from '../../components/MyHead';
import MenuCard from '../../components/MenuCard';

export default function Ride() {
	return (
		<Container maxWidth="md">
			<MyHead title="Ride" />
			<Box>
				<Title href="/">Ride</Title>
				<p>Select the ride type.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="Free Ride" href="/ride/free">
						Adjust resistance as you ride.
					</MenuCard>
					<MenuCard title="Workout" href="/ride/workout">
						Predefined workout profiles.
					</MenuCard>
					<MenuCard title="Virtual Ride" href="/ride/virtual">
						Virtual ride with a recorded profile and video.
					</MenuCard>
				</Grid>
			</Box>
		</Container>
	);
}
