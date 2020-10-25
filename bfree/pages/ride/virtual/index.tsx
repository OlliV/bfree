import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../../components/Head';
import Title from '../../../components/title';

export default function RideWorkout() {
	return (
		<Container maxWidth="md">
			<Head title="Virtual Ride" />
			<Box>
				<Title>Virtual Ride</Title>
				<p>Select something if you can...</p>

				<Grid container direction="row" alignItems="center" spacing={2}></Grid>
			</Box>
		</Container>
	);
}
