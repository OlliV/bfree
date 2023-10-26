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

function* elIter(el: HTMLCollectionOf<Element>, callback: (el: Element) => any) {
	for (let i = 0; i < el.length; i++) {
		yield callback(el[i]);
	}
}

function getElValue(el: HTMLCollectionOf<Element>) {
	return el[0].childNodes[0].nodeValue;
}

function parseTrackpoints(trackpoints: HTMLCollectionOf<Element>) {
	return [
		...elIter(trackpoints, (trackpoint) => ({
			lon: parseFloat(trackpoint.getAttribute('lon')),
			lat: parseFloat(trackpoint.getAttribute('lat')),
			ele: getElValue(trackpoint.getElementsByTagName('ele')),
		})),
	];
}

function parseSegments(segments: HTMLCollectionOf<Element>) {
	return [
		...elIter(segments, (segment) => ({
			trackpoints: parseTrackpoints(segment.getElementsByTagName('trkpt')),
		})),
	];
}

function parseTracks(tracks: HTMLCollectionOf<Element>) {
	return [
		...elIter(tracks, (track) => ({
			name: getElValue(track.getElementsByTagName('name')),
			segments: parseSegments(track.getElementsByTagName('trkseg')),
		})),
	];
}

export function gpxDocument2obj(doc: Document) {
	return { tracks: parseTracks(doc.documentElement.getElementsByTagName('trk')) };
}
