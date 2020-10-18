type TrackPoint = {
	time: number;
	position?: {
		lat: number;
		lon: number;
	};
	alt?: number; // Altitude in meters
	dist?: number; // Distance in meters
	speed?: number;
	cadence?: number;
	power?: number;
	hr?: number;
};
type LapTriggerMethod = 'Manual' | 'Distance' | 'Location' | 'Time' | 'HeartRate';
type Lap = {
	trackPoints: TrackPoint[];
	startTime: number;
	totalTime?: number; // sec
	distanceMeters?: number;
	maxSpeed?: number;
	calories?: number;
	avgHR?: number; // Heart rate BPM
	maxHR?: number; // Heart rate BPM
	intensity: 'Active' | 'Resting';
	cadence?: number;
	triggerMethod?: LapTriggerMethod;
};

const tcxHeader =
	'<?xml version="1.0" encoding="utf-8"?>\n<TrainingCenterDatabase xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2" xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n<Activities><Activity Sport="Biking">\n';
const tcxFooter = '</Activity></Activities>\n</TrainingCenterDatabase>\n';

export default function createLogger() {
	const laps: Lap[] = [];

	return {
		lapSplit: (time: number, triggerMethod: LapTriggerMethod) => {
			if (laps.length > 0) {
				const lap = laps[laps.length - 1];

				lap.totalTime = time - lap.startTime;
				lap.triggerMethod = triggerMethod;
				// TODO calc stats
			}
			laps.push({
				trackPoints: [],
				startTime: time,
				intensity: 'Active', // TODO
			});
		},
		addTrackPoint: (trackPoint: TrackPoint) => {
			laps[laps.length - 1].trackPoints.push(trackPoint);
		},
		tcx: (outputCb: (line: string) => void) => {
			outputCb(tcxHeader);
			outputCb(`<Id>${laps[0].trackPoints[0].time}</Id>\n`); // FIXME should be like 2020-10-15T18:28:45.299Z
			laps.forEach((lap) => {
				outputCb(`<Lap StartTime="${lap.startTime}">\n`); // FIXME should be like 2020-10-15T18:28:45.299Z
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
					outputCb(`<Trackpoint><Time>${point.time}</Time>\n`);
					// TODO position. example: <Position><LatitudeDegrees>45.62398910522461</LatitudeDegrees><LongitudeDegrees>6.797249794006348</LongitudeDegrees></Position>
					// TODO alitude. example: <AltitudeMeters>909.0</AltitudeMeters>
					// TODO distance. example: <DistanceMeters>0.0</DistanceMeters>
					if (point.cadence) outputCb(`<Cadence>${point.cadence}</Cadence>\n`);
					if (point.speed || point.power) {
						outputCb(`<Extensions><ns2:TPX>\n`);
						if (point.speed) outputCb(`<ns2:Speed>${point.speed}</ns2:Speed>\n`); // example 1.471523
						if (point.power) outputCb(`<ns2:Watts>${point.power}</ns2:Watts>\n`);
						outputCb(`</ns2:TPX></Extensions>\n`);
					}
					outputCb(`</Trackpoint>\n`);
				});
				outputCb('</Track>\n');

				outputCb('</Lap>\n');
			});
			outputCb(tcxFooter);
		},
	};
}
