import Title from '../../components/title';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../components/Head';
import MenuCard from '../../components/MenuCard';

// TODO Priority order config for sensor measurements
// e.g.
// power from 1. pm 2. trainer
// speed from 1. speed sensor 2. trainer

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="Setup" />
			<Box>
				<Title>Setup</Title>
				<p>Configure your trainer setup here.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="General" href="/setup/general">
						Configure measurement units and UX settings.
					</MenuCard>
					<MenuCard title="Measurements" href="/setup/measurements">
						Select measurement sources for recording.
					</MenuCard>
					<MenuCard title="Rider" href="/setup/rider">
						Configure the rider profile.
					</MenuCard>
					<MenuCard title="Bike" href="/setup/bike">
						Set the bike measurements.
					</MenuCard>
					<MenuCard title="Sensors" href="/setup/sensors">
						Connect to BLE sensors.
					</MenuCard>
				</Grid>
			</Box>
		</Container>
	);
}
