import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Title from '../../components/title';
import Head from '../../components/Head';

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="Bike" />
			<Box>
				<Title>Bike</Title>
				<p>Setup the bike parameters.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
				</Grid>
			</Box>
		</Container>
	);
}
