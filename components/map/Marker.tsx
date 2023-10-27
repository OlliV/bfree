'use client';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { useEffect } from 'react';
import MarkerIcon from '../../node_modules/leaflet/dist/images/marker-icon.png';
import MarkerShadow from '../../node_modules/leaflet/dist/images/marker-shadow.png';

export default function MapMarker({ map, position }) {
	useEffect(() => {
		if (map) {
			map.flyTo(position, map.getZoom());
		}
	}, [map, position]);

	return (
		<Marker
			position={position}
			// @ts-ignore
			icon={
				new L.Icon({
					iconUrl: MarkerIcon.src,
					iconRetinaUrl: MarkerIcon.src,
					iconSize: [25, 41],
					iconAnchor: [12.5, 41],
					popupAnchor: [0, -41],
					shadowUrl: MarkerShadow.src,
					shadowSize: [41, 41],
				})
			}
		>
			<Popup>
				You are here.
				{`${position}`}
			</Popup>
		</Marker>
	);
}
