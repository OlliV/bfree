import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconHome from '@mui/icons-material/Home';
import MyHead from '../../../components/MyHead';
import Title from '../../../components/Title';
import OpenStreetMap from '../../../components/map/OpenStreetMap';
import MapMarker from '../../../components/map/Marker';
import Course from '../../../components/map/Course';
import MapEditCourse from '../../../components/map/Edit';
import CourseList from '../../../components/CourseList';
import StartButton from '../../../components/StartButton';
import CreateCourse from '../../../components/CreateCourse';
import { CourseData, getMapBounds, gpxDocument2obj, parseGpxFile2Document } from '../../../lib/gpx_parser';

type OpenStreetMapArg = Parameters<typeof OpenStreetMap>[0];
type MapMarkerArg = Parameters<typeof MapMarker>[0];
type CourseArg = Parameters<typeof Course>[0];
type MapEditCourseArg = Parameters<typeof MapEditCourse>[0];

const DynamicMap = dynamic<OpenStreetMapArg>(() => import('../../../components/map/OpenStreetMap'), {
	ssr: false,
});
const DynamicMapMarker = dynamic<MapMarkerArg>(() => import('../../../components/map/Marker'), {
	ssr: false,
});
const DynamicCourse = dynamic<CourseArg>(() => import('../../../components/map/Course'), {
	ssr: false,
});
const DynamicMapEditCourse = dynamic<MapEditCourseArg>(() => import('../../../components/map/Edit'), {
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
	const [editMode, setEditMode] = useState(false);
	const [coord, setCoord] = useState<[number, number]>([51.505, -0.09]);
	const [course, setCourse] = useState<CourseData | null>(null);
	const [courseName, setCourseName] = useState<string>();
	const bounds = useMemo(() => course && getMapBounds(course), [course]);
	const mapSize = {
		width: '70vw',
		height: '70vh',
	};

	useEffect(() => {
		if (
			map &&
			bounds &&
			[bounds.minlat, bounds.minlon, bounds.maxlat, bounds.maxlon].some((v) => Number.isFinite(v))
		) {
			map.fitBounds([
				[bounds.minlat, bounds.minlon],
				[bounds.maxlat, bounds.maxlon],
			]);
		}
	}, [map, bounds]);

	const importGpx = async (file: File) => {
		let data: CourseData | null;

		try {
			const xmlDoc = await parseGpxFile2Document(file);

			data = gpxDocument2obj(xmlDoc);
			setCourse(data);
		} catch (err) {
			console.error('Would be nice to show this:', err);
		}

		return data;
	};
	const newCourse = (name: string, file: File) => {
		(async () => {
			let data: CourseData | null;

			if (file) {
				data = await importGpx(file);
			}
			if (name) {
				setCourseName(name);
			} else if (data && data.routes.length && data.routes[0].name) {
				setCourseName(data.routes[0].name);
			} else if (data && data.tracks.length && data.tracks[0].name) {
				setCourseName(data.tracks[0].name);
			} else {
				setCourseName('Untitled');
			}
		})();
	};

	return (
		<Container maxWidth="md">
			<MyHead title="Map Ride" />
			<Box>
				<Title href="/ride">Map Ride</Title>
				<p>Plan your ride.</p>

				<Grid container spacing={2} sx={{ ml: '-20vw', width: '70vw' }}>
					<Grid item xs={4}>
						<Typography variant="h6">Courses</Typography>
					</Grid>
					<Grid item xs={2}>
						<Typography variant="h6">{courseName}</Typography>
					</Grid>
					<Grid item xs={6}>
						<ButtonGroup variant="contained">
							<CreateCourse newCourse={newCourse} />
							<MyLocationButton map={map} setPosition={setCoord} />
							<Button
								variant="contained"
								color="secondary"
								onClick={() => setCourse(null)}
								disabled={editMode}
							>
								Clear Map
							</Button>
							<FormGroup>
								<FormControlLabel
									control={<Switch size="medium" onChange={(e) => setEditMode(e.target.checked)} />}
									label="Edit"
									sx={{ ml: 1, textTransform: 'uppercase' }}
								/>
							</FormGroup>
						</ButtonGroup>
					</Grid>
					<Grid item xs={4}>
						<CourseList height={mapSize.height} />
					</Grid>

					<Grid item xs={8}>
						<DynamicMap center={coord} width={mapSize.width} height={mapSize.height} setMap={setMap}>
							<DynamicMapMarker icon={<IconHome />} position={coord}>
								You are here.
							</DynamicMapMarker>
							{editMode ? <DynamicMapEditCourse initialCourse={course} setCourse={setCourse} /> : null}
							{course && !editMode ? <DynamicCourse course={course} /> : null}
						</DynamicMap>
					</Grid>
				</Grid>
				<StartButton disabled={editMode} href={`/ride/record?type=map&mapId=todo`} />
			</Box>
		</Container>
	);
}
