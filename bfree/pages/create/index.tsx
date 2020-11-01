import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../components/Head';
import Title from '../../components/title';

export default function Creator() {
	return (
		<Container maxWidth="md">
			<Head title="Creator" />
			<Box>
				<Title>Creator</Title>
				<p>Create, edit and preview scripted workouts.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
				</Grid>
			</Box>
		</Container>
	);
}
