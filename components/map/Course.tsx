import { useEffect, useMemo, useState } from 'react';
import { Polyline } from 'react-leaflet';
import {CourseData} from '../../lib/gpx_parser';

export default function MapCourse({ map, course }: {map: any, course: CourseData}) {
	const { trackpoints } = course?.tracks[0]?.segments[0] || {trackpoints: []};
	const polyline = useMemo(() => trackpoints.map(({lat, lon}) => [lat, lon]), [trackpoints]);

	useEffect(() => {
		if (map && polyline.length > 0) {
			map.flyTo(polyline[0], map.getZoom());
		}
	}, [,map, polyline]);

	return <Polyline pathOptions={{ color: 'black' }} positions={polyline} />;
}
