import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useEffect, useMemo, useState } from 'react';
import MyHead from '../../../components/MyHead';
import Title from '../../../components/Title';
import OpenStreetMap from '../../../components/map/OpenStreetMap';
import MapMarker from '../../../components/map/Marker';
import Course from '../../../components/map/Course';
import ImportFileButton from '../../../components/ImportFileButton';
import { CourseData, getMapBounds, gpxDocument2obj, parseGpxFile2Document } from '../../../lib/gpx_parser';

type OpenStreetMapArg = Parameters<typeof OpenStreetMap>[0];
type MapMarkerArg = Parameters<typeof MapMarker>[0];
type CourseArg = Parameters<typeof Course>[0];

const DynamicMap = dynamic<OpenStreetMapArg>(() => import('../../../components/map/OpenStreetMap'), {
	ssr: false,
});
const DynamicMapMarker = dynamic<MapMarkerArg>(() => import('../../../components/map/Marker'), {
	ssr: false,
});
const DynamicCourse = dynamic<CourseArg>(() => import('../../../components/map/Course'), {
	ssr: false,
});

function MyLocationButton({ map, setPosition }) {
	const getMyLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				const pos = [position.coords.latitude, position.coords.longitude];
				setPosition(pos);
				if (map) {
					map.flyTo(pos, map.getZoom());
				}
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
	const [coord, setCoord] = useState<[number, number]>([51.505, -0.09]);
	const [course, setCourse] = useState<CourseData|null>(null);
	const bounds = useMemo(() => course && getMapBounds(course), [course]);

	useEffect(() => {
		if (map && bounds) {
			map.fitBounds([
				[bounds.minlat, bounds.minlon],
				[bounds.maxlat, bounds.maxlon],
			]);
		}
	}, [map, bounds]);

	const importGpx = (file: File) => {
		parseGpxFile2Document(file)
			.then((xmlDoc: Document) => {
				setCourse(gpxDocument2obj(xmlDoc));
			})
			.catch((err) => {
				console.error('Would be nice to show this:', err);
			});
	};

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
					<MyLocationButton map={map} setPosition={setCoord} />
					<ImportFileButton onFile={importGpx}>Import GPX</ImportFileButton>
					<Button variant="contained" color="secondary" onClick={() => setCourse(null)}>Clear Map</Button>
				</Stack>

				<DynamicMap center={coord} setMap={setMap}>
					<DynamicMapMarker position={coord}>You are here.</DynamicMapMarker>
					{course ? <DynamicCourse map={map} course={course} /> : <></>}
				</DynamicMap>

				<Grid container direction="row" alignItems="center" spacing={2}></Grid>
			</Box>
		</Container>
	);
}
