'use client';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import MarkerIcon from '../../node_modules/leaflet/dist/images/marker-icon.png';
import MarkerShadow from '../../node_modules/leaflet/dist/images/marker-shadow.png';
import { ReactNode } from 'react';

export function createMarkerIcon() {
	return new L.Icon({
		iconUrl: MarkerIcon.src,
		iconRetinaUrl: MarkerIcon.src,
		iconSize: [25, 41],
		iconAnchor: [12.5, 41],
		popupAnchor: [0, -41],
		shadowUrl: MarkerShadow.src,
		shadowSize: [41, 41],
	});
}

export default function MapMarker({ position, children }: { position: [number, number]; children?: ReactNode }) {
	return (
		<Marker
			position={position}
			// @ts-ignore
			icon={createMarkerIcon()}
		>
			<Popup>{children}</Popup>
		</Marker>
	);
}
