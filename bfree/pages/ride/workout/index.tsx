import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../../components/Head';
import Title from '../../../components/title';

export default function RideWorkout() {
	return (
		<Container maxWidth="md">
			<Head title="Workout" />
			<Box>
				<Title>Workout</Title>
				<p>
					Select the workout mode.
				</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
				</Grid>
			</Box>
		</Container>
	);
}
