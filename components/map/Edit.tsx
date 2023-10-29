import { useState, useRef, useMemo } from 'react';
import L from 'leaflet';
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
	const featureGroupRef = useRef();
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
	const editEvent = (e) => {
		if (!featureGroupRef.current) {
			return;
		}

		const newCourse = JSON.parse(initStr);
		let seg = 0;
		let wp = 0;

		newCourse.tracks = [{ segments: [] }];
		newCourse.waypoints = [];

		// @ts-ignore
		for (const [_key, layer] of Object.entries(featureGroupRef.current.getLayers())) {
			if (layer instanceof L.Polyline) {
				// @ts-ignore
				if (layer._latlngs && layer._latlngs.length > 0) {
					// @ts-ignore
					updateTrackSegment(
						newCourse,
						seg++,
						layer._latlngs.map((v) => ({ lat: v.lat, lon: v.lng }))
					);
				}
			} else if (layer instanceof L.Marker) {
				// @ts-ignore
				newCourse.waypoints[wp++] = { lat: layer._latlng.lat, lon: layer._latlng.lng };
			}
		}

		setCourse(newCourse);
	};

	return (
		<FeatureGroup ref={featureGroupRef}>
			<EditControl
				position="topleft"
				draw={{
					polygon: false,
					rectangle: false,
					circle: false,
					circlemarker: false,
					marker: { icon: createMarkerIcon() },
				}}
				onCreated={editEvent}
				onEdited={editEvent}
				onDeleted={editEvent}
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
