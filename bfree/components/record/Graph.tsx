import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ResponsiveLine } from '@nivo/line';
import { getElapsedTimeStr } from '../../lib/format';

export type SeriesDataPoint = {
		x: number;
		y: number;
}
export type Series = {
	id: string;
	data: SeriesDataPoint[]
}[]

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

export default function Graph({ series, colors, isInteractive }: { series: Series, colors: string[], isInteractive?: boolean }) {
	const classes = useStyles();

	return (
		<Card variant="outlined">
			<CardContent>
				<Container className={classes.graphContainer}>
					<ResponsiveLine
						isInteractive={isInteractive || false}
						data={series}
						curve="natural"
						margin={{
							top: 10,
							right: 30,
							bottom: 50,
							left: 30,
						}}
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
						useMesh={true}
						theme={{
							textColor: '#a1a1a1',
						}}
					/>
				</Container>
			</CardContent>
		</Card>
	);
};
