type TrackPoint = {
	time: number;
	position?: {
		lat: number;
		lon: number;
	}; // Used for map courses
	alt?: number; // Altitude in meters
	dist?: number; // Distance in meters
	speed?: number; // Speed in m/s
	cadence?: number;
	power?: number;
	hr?: number;
};
type LapTriggerMethod = 'Manual' | 'Distance' | 'Location' | 'Time' | 'HeartRate';
type Lap = {
	trackPoints: TrackPoint[];
	startTime: number;
	totalTime: number; // sec
	distanceMeters?: number;
	maxSpeed?: number;
	calories?: number;
	avgHR?: number; // Heart rate BPM
	maxHR?: number; // Heart rate BPM
	intensity: 'Active' | 'Resting';
	cadence?: number;
	triggerMethod?: LapTriggerMethod;
};

const PRODUCT_NAME = 'Bfree';
const UNIT_ID = 0;
const PRODUCT_ID = 0;
const VERSION = [0, 1];
const BUILD = [0, 0];
const LANG_ID = 'en';
const PART_NUMBER = '000-00000-00';
const tcxHeader =
	'<?xml version="1.0" encoding="utf-8"?>\n<TrainingCenterDatabase xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2" xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n<Activities><Activity Sport="Biking">\n';
const createNote = (text: string) => `<Notes>${text}</Notes>\n`
const createTcxFooter = (name: string) => `<Training VirtualPartner="false"><Plan Type="Course" IntervalWorkout="false"><Name>${name}</Name></Plan></Training>\n<Creator xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Device_t"><Name>${PRODUCT_NAME}</Name><UnitId>${UNIT_ID}</UnitId><ProductID>${PRODUCT_ID}</ProductID><Version><VersionMajor>${VERSION[0]}</VersionMajor><VersionMinor>${VERSION[1]}</VersionMinor><BuildMajor>${BUILD[0]}</BuildMajor><BuildMinor>${BUILD[1]}</BuildMinor></Version></Creator>\n</Activity></Activities>\n<Author xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Application_t"><Name>${PRODUCT_NAME}</Name><Build><Version><VersionMajor>${VERSION[0]}</VersionMajor><VersionMinor>${VERSION[1]}</VersionMinor><BuildMajor>${BUILD[0]}</BuildMajor><BuildMinor>${BUILD[1]}</BuildMinor></Version></Build><LangID>${LANG_ID}</LangID><PartNumber>${PART_NUMBER}</PartNumber></Author>\n</TrainingCenterDatabase>\n`;

const convTs = (ts: number) => (new Date(ts)).toISOString();

export default function createActivityLog() {
	const laps: Lap[] = [];

	return {
		lapSplit: (time: number, triggerMethod: LapTriggerMethod) => {
			if (laps.length > 0) {
				const lap = laps[laps.length - 1];

				lap.totalTime = time - lap.startTime;
				lap.triggerMethod = triggerMethod;
				// TODO stats
				// - distanceMeters
				// - calories
				const {
					maxSpeed,
					avgHR,
					maxHR,
				} = lap.trackPoints.reduce<any>((acc, cur: TrackPoint, i, arr) => {
					if (acc.maxSpeed < cur.speed) {
						acc.maxSpeed = cur.speed;
					}
					if (acc.maxHR < cur.hr) {
						acc.maxHR = cur.hr;
					}

					acc.avgHR += cur.hr;
					if (i === arr.length - 1) {
						acc.avgHR /= arr.length;
					}
				}, {
					maxSpeed: null,
					avgHR: null,
					maxHR: null,
				});

				if (maxSpeed !== null) {
					lap.maxSpeed = maxSpeed;
				}
				if (avgHR !== null) {
					lap.avgHR = avgHR;
				}
				if (maxHR !== null) {
					lap.maxHR = maxHR;
				}
			}

			laps.push({
				trackPoints: [],
				startTime: time,
				totalTime: 0, // place holder
				intensity: 'Active', // TODO
			});
		},
		addTrackPoint: (trackPoint: TrackPoint) => {
			laps[laps.length - 1].trackPoints.push(trackPoint);
		},
		tcx: (name: string, notes: string | null, outputCb: (line: string) => void) => {
			outputCb(tcxHeader);
			outputCb(`<Id>${convTs(laps[0].trackPoints[0].time)}</Id>\n`);
			laps.forEach((lap) => {
				outputCb(`<Lap StartTime="${convTs(lap.startTime)}">\n`);
				outputCb(`<TotalTimeSeconds>${lap.totalTime}</TotalTimeSeconds>\n`);
				outputCb(`<DistanceMeters>${lap.distanceMeters}</DistanceMeters>\n`);
				outputCb(`<MaximumSpeed>${lap.maxSpeed}</MaximumSpeed>\n`);
				if (lap.calories) outputCb(`<Calories>${lap.calories}</Calories>\n`);
				if (lap.avgHR) outputCb(`<AverageHeartRateBpm><Value>${lap.avgHR}</Value></AverageHeartRateBpm>\n`);
				if (lap.maxHR) outputCb(`<MaximumHeartRateBpm><Value>${lap.maxHR}</Value></MaximumHeartRateBpm>\n`);
				outputCb(`<Intensity>${lap.intensity}</Intensity>\n`);
				if (lap.cadence) outputCb(`<Cadence>${lap.cadence}</Cadence>\n`);
				outputCb(`<TriggerMethod>${lap.triggerMethod || 'Manual'}</TriggerMethod>\n`);

				outputCb('<Track>\n');
				lap.trackPoints.forEach((point) => {
					outputCb(`<Trackpoint><Time>${convTs(point.time)}</Time>\n`);
					if (point.position) outputCb(`<Position><LatitudeDegrees>${point.position.lat}</LatitudeDegrees><LongitudeDegrees>${point.position.lon}</LongitudeDegrees></Position>\n`);
					if (point.alt) outputCb(`<AltitudeMeters>${point.alt.toFixed(3)}</AltitudeMeters>\n`);
					if (point.dist) outputCb(`<DistanceMeters>${point.dist.toFixed(1)}</DistanceMeters>\n`);
					if (point.hr) outputCb(`<HeartRateBpm><Value>${point.hr}</Value></HeartRateBpm>\n`);
					if (point.cadence) outputCb(`<Cadence>${point.cadence}</Cadence>\n`);
					if (point.speed || point.power) {
						outputCb(`<Extensions><ns2:TPX>\n`);
						if (point.speed) outputCb(`<ns2:Speed>${point.speed}</ns2:Speed>\n`);
						if (point.power) outputCb(`<ns2:Watts>${point.power}</ns2:Watts>\n`);
						outputCb(`</ns2:TPX></Extensions>\n`);
					}
					outputCb(`</Trackpoint>\n`);
				});
				outputCb('</Track>\n');
				outputCb('</Lap>\n');
			});
			if (notes) {
				outputCb(createNote(notes));
			}
			outputCb(createTcxFooter(name));
		},
	};
}
