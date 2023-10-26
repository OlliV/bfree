import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';

const mintrackpointdelta = 0.0001;

export default function MapTrack({ map, track }) {
	const { trackpoints } = track?.tracks[0]?.segments[0] || [];
	const [polyline, setPolyline] = useState([]);

	useEffect(() => {
		const pointArray = [];

		if (trackpoints.length > 0) {
			let lastlon = parseFloat(trackpoints[0].lon);
			let lastlat = parseFloat(trackpoints[0].lat);

			pointArray.push([lastlon, lastlat]);

			for (let i = 1; i < trackpoints.length; i++) {
				const lon = parseFloat(trackpoints[i].lon);
				const lat = parseFloat(trackpoints[i].lat);

				const latdiff = lat - lastlat;
				const londiff = lon - lastlon;
				if (Math.sqrt(latdiff * latdiff + londiff * londiff) > mintrackpointdelta) {
					lastlon = lon;
					lastlat = lat;
					pointArray.push([lat, lon]);
				}
			}
		}

		setPolyline(pointArray);
	}, [trackpoints]);

	return <Polyline pathOptions={{ color: 'black' }} positions={polyline} />;
}
