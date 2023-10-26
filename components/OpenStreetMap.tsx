'use client'

import L from 'leaflet'
import MarkerIcon from '../node_modules/leaflet/dist/images/marker-icon.png'
import MarkerShadow from '../node_modules/leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

function MyLocationButton({ setPosition }) {
	const getMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setPosition([position.coords.latitude, position.coords.longitude])
            })
        } else {
            console.log("Geolocation is not supported by this browser.")
        }
	};

    return (
		<Button variant="contained" onClick={getMyLocation}>Get My Location</Button>
    )
}

function StartMarker({pos}) {
	const map = useMap();

	useEffect(() => {
		map.flyTo(pos, map.getZoom());
	}, [map, pos]);

	return (<Marker icon={
		new L.Icon({
			iconUrl: MarkerIcon.src,
			iconRetinaUrl: MarkerIcon.src,
			iconSize: [25, 41],
			iconAnchor: [12.5, 41],
			popupAnchor: [0, -41],
			shadowUrl: MarkerShadow.src,
			shadowSize: [41, 41],
		})
	} position={pos}>
	<Popup>
		You are here.
	</Popup>
</Marker>);
}

const OpenStreetMap = () => {

    const [coord, setCoord] = useState([51.505, -0.09])

    return (
        <Box>
			<Stack spacing={2} direction="row">
            <MyLocationButton setPosition={setCoord} />
			<Button variant="contained">Load GPX</Button>
			</Stack>
            <MapContainer style={{
                height: '70vh',
                width: '70vw'
            }} center={coord} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

			<StartMarker pos={coord} />
            </MapContainer>
        </Box>
    )
}

export default OpenStreetMap
