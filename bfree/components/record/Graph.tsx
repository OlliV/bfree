import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ResponsiveLine } from '@nivo/line';
import { getElapsedTimeStr } from '../../lib/format';

export type SeriesDataPoint = {
	x: number;
	y: number;
};
export type Series = {
	id: string;
	data: SeriesDataPoint[];
}[];

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		graphContainer: {
			display: 'flex',
			height: '35vh',
			width: '100%',
			background: 'white',
			transition: '0.3s',
		},
	})
);

export default function Graph({
	series,
	colors,
	curve,
	enableArea,
	enableLegends,
	isInteractive,
}: {
	series: Series;
	colors: string[];
	curve?:
		| 'linear'
		| 'step'
		| 'natural'
		| 'basis'
		| 'cardinal'
		| 'catmullRom'
		| 'monotoneX'
		| 'monotoneY'
		| 'stepAfter'
		| 'stepBefore';
	enableArea?: boolean;
	enableLegends?: boolean;
	isInteractive?: boolean;
}) {
	const classes = useStyles();

	return (
		<Card variant="outlined">
			<CardContent>
				<Container className={classes.graphContainer}>
					<ResponsiveLine
						isInteractive={isInteractive || false}
						data={series}
						curve={curve ?? 'natural'}
						enableArea={enableArea || false}
						areaBlendMode="multiply"
						margin={{
							top: 10,
							right: 30,
							bottom: 50,
							left: 30,
						}}
						xFormat={getElapsedTimeStr}
						yFormat={(v) => Number(v).toFixed(2)}
						xScale={{
							type: 'linear',
						}}
						yScale={{
							type: 'linear',
							stacked: false,
							min: 'auto',
							max: 'auto',
						}}
						axisTop={null}
						axisBottom={{
							orient: 'bottom',
							tickSize: 5,
							tickPadding: 5,
							tickRotation: -45,
							format: getElapsedTimeStr,
							tickValues: 20,
						}}
						axisLeft={{
							orient: 'left',
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
						}}
						axisRight={{
							orient: 'left',
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
						}}
						colors={colors}
						layers={['grid', 'markers', 'axes', 'areas', 'lines', 'slices', 'mesh', 'legends']}
						legends={
							enableLegends
								? [
										{
											anchor: 'bottom-right',
											direction: 'row',
											justify: false,
											translateX: 0,
											translateY: 0,
											itemsSpacing: 0,
											itemDirection: 'left-to-right',
											itemWidth: 80,
											itemHeight: 20,
											itemOpacity: 0.75,
											symbolSize: 12,
											symbolShape: 'circle',
											symbolBorderColor: 'rgba(0, 0, 0, .5)',
											effects: [
												{
													on: 'hover',
													style: {
														itemBackground: 'rgba(0, 0, 0, .03)',
														itemOpacity: 1,
													},
												},
											],
										},
								  ]
								: undefined
						}
						useMesh={true}
						theme={{
							textColor: '#a1a1a1',
						}}
					/>
				</Container>
			</CardContent>
		</Card>
	);
}
