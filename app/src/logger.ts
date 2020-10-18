type TrackPoint = {
    power: number;
    cadence: number;
    speed: number;
    hr: number;
    time: number;
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
    intensity?: string;
    cadence?: number;
    triggerMethod?: LapTriggerMethod;
}

const tcxHeader = '<?xml version="1.0" encoding="utf-8"?>\n<TrainingCenterDatabase xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd" xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2" xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n<Activities><Activity Sport="Biking">\n';
const tcxFooter = '</Activity></Activities>\n</TrainingCenterDatabase>';

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
            });
        },
        addTrackPoint: (trackPoint: TrackPoint) => {
            laps[laps.length - 1].trackPoints.push(trackPoint);
        },
        tcx: (outputCb: (line: string) => void) => {
            outputCb(tcxHeader);
            outputCb(`<Id>${laps[0].trackPoints[0].time}</Id>\n`);
            laps.forEach((lap) => {
                outputCb(`<Lap StartTime="${lap.startTime}">\n`);
                outputCb(`<TotalTimeSeconds>${lap.totalTime}</TotalTimeSeconds>\n`);
                outputCb(`<DistanceMeters>${lap.distanceMeters}</DistanceMeters>\n`);
                outputCb(`<MaximumSpeed>${lap.maxSpeed}</MaximumSpeed>\n`);
                if (lap.calories) outputCb(`<Calories>${lap.calories}</Calories>\n`);
                if (lap.avgHR) outputCb(`<AverageHeartRateBpm><Value>${lap.avgHR}</Value></AverageHeartRateBpm>\n`);
                if (lap.maxHR) outputCb(`<MaximumHeartRateBpm><Value>${lap.maxHR}</Value></MaximumHeartRateBpm>\n`);
                outputCb(`<Intensity>${lap.intensity || 'Active'}</Intensity>\n`);
                if (lap.cadence) outputCb(`<Cadence>${lap.cadence}</Cadence>\n`);
                outputCb(`<TriggerMethod>${lap.triggerMethod || 'Manual'}</TriggerMethod>\n`);

                outputCb('<Track>\n')
                lap.trackPoints.forEach((point) => {
                    outputCb(`<Trackpoint><Time>${point.time}</Time>\n`);
                    outputCb(`<Cadence>${point.cadence}</Cadence>\n`);
                    outputCb(`<Extensions><ns3:TPX><ns3:Watts>${point.power}</ns3:Watts></ns3:TPX></Extensions>\n`);
                    outputCb(`</Trackpoint>\n`);
                });
                outputCb('</Track>\n')

                outputCb('</Lap>\n');
            });
            outputCb(tcxFooter);
        }
    }
}
