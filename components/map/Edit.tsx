import { useState, useMemo } from 'react';
import { FeatureGroup, Circle, Polyline } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { createMarkerIcon } from './Marker';
import { CourseData, Trackpoint } from '../../lib/gpx_parser';
import MapWaypoint from './Waypoint';
import '/node_modules/leaflet/dist/leaflet.css';
import '/node_modules/leaflet-draw/dist/leaflet.draw.css';

function courseToTrackpoints(course: CourseData) {
	// TODO Support multiple tracks and segments
	const { trackpoints } = course?.tracks[0]?.segments[0] || { trackpoints: [] };
	return trackpoints.map(({ lat, lon }) => [lat, lon]);
}

function updateTrackSegment(course: CourseData, i: number, trackpoints: Trackpoint[]) {
	if (!course.tracks[0]) {
		course.tracks[0] = { segments: [] };
	}
	if (!course.tracks[0].segments[i]) {
		course.tracks[0].segments[i] = { trackpoints: [] };
	}

	course.tracks[0].segments[i].trackpoints = trackpoints;

	return course;
}

export default function MapEditCourse({
	initialCourse,
	setCourse,
}: {
	initialCourse?: CourseData;
	setCourse?: (o: CourseData) => void;
}) {
	const [initStr] = useState(() =>
		JSON.stringify(
			initialCourse || {
				tracks: [],
				routes: [],
				waypoints: [],
			}
		)
	);
	const init = useMemo<CourseData>(() => JSON.parse(initStr), [initStr]);
	const initTrackpoints = useMemo(() => courseToTrackpoints(init), [init]);
	const createEvent = (e) => {
		const { layerType, layer } = e;
		console.log('created', e);
		switch (layerType) {
			case 'polyline':
				// TODO How to alt?
				setCourse(
					updateTrackSegment(
						JSON.parse(initStr),
						0,
						layer._latlngs.map((v) => ({ lat: v.lat, lon: v.lng }))
					)
				);
				break;
			case 'marker':
				break;
			default:
				console.error(`Layer type not supported: ${layerType}`);
		}
	};
	const editEvent = (e) => {
		console.log('edited', e);
		for (const [key, layer] of Object.entries(e.layers._layers)) {
			console.log(layer);
			// @ts-ignore
			if (layer._latlngs) {
				// Polyline
				// TODO Detect which segment was changed
				setCourse(
					updateTrackSegment(
						JSON.parse(initStr),
						0,
						// @ts-ignore
						layer._latlngs.map((v) => ({ lat: v.lat, lon: v.lng }))
					)
				);
				// @ts-ignore
			} else if (layer._latlng) {
				// Marker
				console.log('marker');
			} else {
				console.error('Layer type not supported');
			}
		}
	};
	const deleteEvent = (e) => {
		// TODO
		console.log('deleted', e);
	};

	return (
		<FeatureGroup>
			<EditControl
				position="topleft"
				draw={{
					polygon: false,
					rectangle: false,
					circle: false,
					circlemarker: false,
					marker: { icon: createMarkerIcon() },
				}}
				onCreated={createEvent}
				onEdited={editEvent}
				onDeleted={deleteEvent}
			/>
			<Polyline positions={initTrackpoints} />
			<>
				{init.waypoints.map(({ lat, lon, name }, i: number) => (
					<MapWaypoint key={i} position={[lat, lon]}>
						{name}
					</MapWaypoint>
				))}
			</>
		</FeatureGroup>
	);
}
