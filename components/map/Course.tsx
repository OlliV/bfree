import { useEffect, useMemo } from 'react';
import { CircleMarker } from 'react-leaflet';
import AntPath from '../../components/map/AntPath';
import MapWaypoint from './Waypoint';
import { CourseData } from '../../lib/gpx_parser';

export default function MapCourse({ map, course }: { map: any; course: CourseData }) {
	const { trackpoints } = course?.tracks[0]?.segments[0] || { trackpoints: [] };
	const waypoints = course?.waypoints || [];
	const polyline = useMemo<[number, number][]>(() => trackpoints.map(({ lat, lon }) => [lat, lon]), [trackpoints]);
	const first = polyline[0];
	const last = polyline[polyline.length - 1];

	useEffect(() => {
		if (map && polyline.length > 0) {
			map.flyTo(polyline[0], map.getZoom());
		}
	}, [map, polyline]);

	return (
		<>
			{/* @ts-ignore*/}
			{first ? <CircleMarker center={first} radius={20} pathOptions={{ color: 'blue' }} /> : null}
			{/* @ts-ignore */}
			{last ? <CircleMarker center={last} radius={20} pathOptions={{ color: 'red' }} /> : null}
			<AntPath positions={polyline} options={{ hardwareAccelerated: true, delay: 2000 }} />
			<>
				{waypoints.map(({lat, lon, name}, i: number) => <MapWaypoint key={i} position={[lat, lon]}>{name}</MapWaypoint>)}
			</>
		</>
	);
}
