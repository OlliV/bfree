import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../components/Head';
import Title from '../../components/title';

export default function RideFree() {
	return (
		<Container maxWidth="md">
			<Head title="Free Ride" />
			<Box>
				<Title>Free Ride</Title>
				<p>
					Start a free ride.
				</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
				</Grid>
			</Box>
		</Container>
	);
}
