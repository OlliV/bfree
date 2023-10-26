'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import Box from '@mui/material/Box';
import { ReactNode } from 'react';

const OpenStreetMap = ({ children, center, setMap }: { children?: ReactNode; center: number[]; setMap: any }) => {
	return (
		<Box>
			<MapContainer
				style={{
					height: '70vh',
					width: '70vw',
				}}
				// @ts-ignore
				center={center}
				zoom={13}
				scrollWheelZoom={false}
				ref={setMap}
			>
				<TileLayer
					// @ts-ignore
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{children}
			</MapContainer>
		</Box>
	);
};

export default OpenStreetMap;
