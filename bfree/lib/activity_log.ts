export type TrackPoint = {
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
export type LapTriggerMethod = 'Manual' | 'Distance' | 'Location' | 'Time' | 'HeartRate';
export type Lap = {
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

const PRODUCT_NAME = 'Bfree App';
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

	const calcLapStats = (lap: Lap, time: number, triggerMethod: LapTriggerMethod) => {
		const { trackPoints } = lap;

		lap.totalTime = time - lap.startTime;
		lap.triggerMethod = triggerMethod;

		const {
			maxSpeed,
			avgHR,
			maxHR,
		} = trackPoints.reduce<any>((acc, cur: TrackPoint, i, arr) => {
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

			return acc;
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

		lap.distanceMeters = (trackPoints.length > 0) ? (trackPoints[trackPoints.length - 1].dist || 0) : 0;
		lap.calories = 0; // TODO not supported yet.
	}

	return {
		getLapStartTime: (lapIndex?: number): number => {
			const lap = typeof lapIndex === 'number' ? laps[lapIndex] : laps[laps.length - 1];

			if (!lap) {
				return NaN;
			}

			return lap.startTime;
		},
		getCurrentLap: (): undefined | Lap => {
			return laps[laps.length - 1];
		},
		lapSplit: (time: number, triggerMethod: LapTriggerMethod) => {
			if (laps.length > 0) {
				calcLapStats(laps[laps.length - 1], time, triggerMethod);
			}

			laps.push({
				trackPoints: [],
				startTime: time,
				totalTime: 0, // placeholder
				intensity: 'Active', // TODO Does it ever change?
			});
		},
		addTrackPoint: (trackPoint: TrackPoint) => {
			laps[laps.length - 1].trackPoints.push(trackPoint);
		},
		endActivityLog: (time: number, triggerMethod: LapTriggerMethod) => {
			if (laps.length > 0) {
				calcLapStats(laps[laps.length - 1], time, triggerMethod);
			}
		},
		tcx: (name: string, notes: string | null, outputCb: (line: string) => void) => {
			outputCb(tcxHeader);
			outputCb(`<Id>${convTs(laps[0].trackPoints[0].time)}</Id>\n`);
			laps.forEach((lap) => {
				outputCb(`<Lap StartTime="${convTs(lap.startTime)}">\n`);
				outputCb(`<TotalTimeSeconds>${lap.totalTime}</TotalTimeSeconds>\n`);
				outputCb(`<DistanceMeters>${lap.distanceMeters || 0}</DistanceMeters>\n`);
				outputCb(`<MaximumSpeed>${lap.maxSpeed || 0}</MaximumSpeed>\n`);
				if (lap.calories !== undefined) outputCb(`<Calories>${lap.calories}</Calories>\n`);
				if (lap.avgHR !== undefined) outputCb(`<AverageHeartRateBpm><Value>${lap.avgHR.toFixed(0)}</Value></AverageHeartRateBpm>\n`);
				if (lap.maxHR !== undefined) outputCb(`<MaximumHeartRateBpm><Value>${lap.maxHR.toFixed(0)}</Value></MaximumHeartRateBpm>\n`);
				outputCb(`<Intensity>${lap.intensity}</Intensity>\n`);
				if (lap.cadence !== undefined) outputCb(`<Cadence>${lap.cadence}</Cadence>\n`);
				outputCb(`<TriggerMethod>${lap.triggerMethod || 'Manual'}</TriggerMethod>\n`);

				outputCb('<Track>\n');
				lap.trackPoints.forEach((point) => {
					outputCb(`<Trackpoint><Time>${convTs(point.time)}</Time>\n`);
					if (point.position !== undefined) outputCb(`<Position><LatitudeDegrees>${point.position.lat}</LatitudeDegrees><LongitudeDegrees>${point.position.lon}</LongitudeDegrees></Position>\n`);
					if (point.alt !== undefined) outputCb(`<AltitudeMeters>${point.alt.toFixed(3)}</AltitudeMeters>\n`);
					if (point.dist !== undefined) outputCb(`<DistanceMeters>${point.dist.toFixed(1)}</DistanceMeters>\n`);
					if (point.hr !== undefined) outputCb(`<HeartRateBpm><Value>${point.hr.toFixed(0)}</Value></HeartRateBpm>\n`);
					if (point.cadence !== undefined) outputCb(`<Cadence>${point.cadence.toFixed(0)}</Cadence>\n`);
					if (point.speed !== undefined || point.power !== undefined) {
						outputCb(`<Extensions><ns2:TPX>\n`);
						if (point.speed !== undefined) outputCb(`<ns2:Speed>${point.speed}</ns2:Speed>\n`);
						if (point.power !== undefined) outputCb(`<ns2:Watts>${point.power}</ns2:Watts>\n`);
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
