import { ResponsiveLine, Serie } from '@nivo/line';
import { CourseData } from '../../lib/gpx_parser';

function haversine([lat1, lon1], [lat2, lon2]) {
	const R = 6371e3; // m
	const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // m
}

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export default function Ele({ course }: { course?: CourseData }) {
	let dist = 0;
	const data: Serie[] =
		!course || !course.tracks || course.tracks.length === 0
			? [
					{
						id: 'none',
						color: 'hsl(218, 70%, 50%)',
						data: [
							{ x: 0, y: 0 },
							{ x: 1, y: 0 },
						],
					},
			  ]
			: course.tracks.map((track) => ({
					id: track.name,
					color: 'hsl(218, 70%, 50%)',
					data: track.segments
						.map(({ trackpoints: tp }) => tp)
						.flat(1)
						.map((tp, i, arr) => ({
							x: i == 0 ? dist : (dist += haversine([arr[i - 1].lat, arr[i - 1].lon], [tp.lat, tp.lon])),
							y: tp.ele,
						})),
			  }));
	console.log('lol', data);

	return (
		<ResponsiveLine
			data={data}
			margin={{ top: 10, right: 10, bottom: 50, left: 45 }}
			xScale={{ type: 'linear', min: 0, max: 'auto' }}
			xFormat=" >-.2s"
			yScale={{ type: 'linear', min: 0, max: 'auto' }}
			yFormat=" >-.2f"
			curve="monotoneX"
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 45,
				format: ' >-.2s',
				legend: 'distance',
				legendOffset: 36,
				legendPosition: 'middle',
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: '.2s',
				legend: 'elevation',
				legendOffset: -40,
				legendPosition: 'middle',
			}}
			colors={{ scheme: 'purple_orange' }}
			lineWidth={1}
			enablePoints={false}
			pointSize={4}
			pointColor={{ theme: 'background' }}
			pointBorderWidth={1}
			pointBorderColor={{ from: 'serieColor' }}
			pointLabelYOffset={-12}
			enableArea={true}
			useMesh={true}
			enableSlices="x"
			sliceTooltip={(v) => {
				const point = v?.slice?.points[0];
				return point ? `${point.data?.xFormatted}m, ${point.data.yFormatted}m` : '';
			}}
			gridXValues={[0, 20, 40, 60, 80, 100, 120]}
			gridYValues={[0, 500, 1000, 1500, 2000, 2500]}
			legends={[]}
		/>
	);
}
