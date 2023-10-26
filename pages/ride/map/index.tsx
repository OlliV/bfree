import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import MyHead from '../../../components/MyHead';
import Title from '../../../components/Title';
import OpenStreetMap from '../../../components/OpenStreetMap';
import MapMarker from '../../../components/MapMarker';

type OpenStreetMapArg = Parameters<typeof OpenStreetMap>[0];
type MapMarkerArg = Parameters<typeof MapMarker>[0];

const DynamicMap = dynamic<OpenStreetMapArg>(() => import('../../../components/OpenStreetMap'), {
	ssr: false,
});
const DynamicMapMarker = dynamic<MapMarkerArg>(() => import('../../../components/MapMarker'), {
	ssr: false,
});

function MyLocationButton({ setPosition }) {
	const getMyLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				setPosition([position.coords.latitude, position.coords.longitude]);
			});
		} else {
			console.log('Geolocation is not supported by this browser.');
		}
	};

	return (
		<Button variant="contained" onClick={getMyLocation}>
			Get My Location
		</Button>
	);
}

export default function RideMap() {
	const [map, setMap] = useState(null);
	const [coord, setCoord] = useState([51.505, -0.09]);

	return (
		<Container maxWidth="md">
			<MyHead title="Map Ride" />
			<Box>
				<Title href="/ride">Map Ride</Title>
				<p>Plan your ride.</p>

				<Stack
					spacing={2}
					direction="row"
					sx={{
						pb: '1ex',
					}}
				>
					<MyLocationButton setPosition={setCoord} />
					<Button variant="contained">Load GPX</Button>
				</Stack>

				<DynamicMap center={coord} setMap={setMap}>
					<DynamicMapMarker map={map} position={coord} />
				</DynamicMap>

				<Grid container direction="row" alignItems="center" spacing={2}></Grid>
			</Box>
		</Container>
	);
}
