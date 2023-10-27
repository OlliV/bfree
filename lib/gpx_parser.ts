type Coord = {
	lat: number;
	lon: number;
};
type Trackpoint = Coord & {
	ele: number;
};
type Segment = {
	trackpoints: Trackpoint[];
};
type Track = {
	name?: string;
	segments: Segment[];
};
type Routepoint = Coord;
type Waypoint = Coord;
export type CourseData = {
	tracks: Track[];
	routePoints: Routepoint[];
	waypoints: Waypoint[];
};

export async function parseGpxFile2Document(file: File): Promise<Document> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(e.target.result as string, 'text/xml');
			const errorNode = xmlDoc.querySelector('parsererror');
			if (errorNode) {
				reject(new Error('Failed to parse the GPX file'));
			} else {
				resolve(xmlDoc);
			}
		};
		reader.readAsText(file);
	});
}

function* elIter<T>(el: HTMLCollectionOf<Element>, callback: (el: Element) => T) {
	for (let i = 0; i < el.length; i++) {
		yield callback(el[i]);
	}
}

function getElValue(el: HTMLCollectionOf<Element>) {
	return el[0].childNodes[0].nodeValue;
}

function parseTrackpoints(trackpoints: HTMLCollectionOf<Element>): Trackpoint[] {
	return [
		...elIter<Trackpoint>(trackpoints, (trackpoint) => ({
			lat: parseFloat(trackpoint.getAttribute('lat')),
			lon: parseFloat(trackpoint.getAttribute('lon')),
			ele: parseFloat(getElValue(trackpoint.getElementsByTagName('ele'))),
		})),
	];
}

function parseSegments(segments: HTMLCollectionOf<Element>): Segment[] {
	return [
		...elIter(segments, (segment) => ({
			trackpoints: parseTrackpoints(segment.getElementsByTagName('trkpt')),
		})),
	];
}

function parseTracks(tracks: HTMLCollectionOf<Element>): Track[] {
	return [
		...elIter<Track>(tracks, (track) => ({
			name: getElValue(track.getElementsByTagName('name')),
			segments: parseSegments(track.getElementsByTagName('trkseg')),
		})),
	];
}

export function gpxDocument2obj(doc: Document): CourseData {
	return {
		tracks: parseTracks(doc.documentElement.getElementsByTagName('trk')),
		routePoints: [],
		waypoints: [],
	};
}

export function getMapBounds(obj: CourseData) {
	// TODO support all tracks and segments
	const points = [...obj.tracks[0].segments[0].trackpoints, ...obj.routePoints, ...obj.waypoints];
	const lats = points.map(({ lat }) => lat);
	const lons = points.map(({ lon }) => lon);
	return {
		minlat: Math.min(...lats),
		maxlat: Math.max(...lats),
		minlon: Math.min(...lons),
		maxlon: Math.max(...lons),
	};
}
