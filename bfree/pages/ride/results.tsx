import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import ExportCard from '../../components/ExportCard';
import Head from '../../components/Head';
import Title from '../../components/title';
import createActivityLog from '../../lib/activity_log';

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');

	a.href = url;
	a.download = filename;

	const clickHandler = () => {
		setTimeout(() => {
			URL.revokeObjectURL(url);
			a.removeEventListener('click', clickHandler);
		}, 150);
	};

	a.addEventListener('click', clickHandler, false);
	a.click();

	return a;
}

export default function RideResults() {

	// TODO Remove this example data
	const logger = createActivityLog();
	logger.lapSplit(0, 'Manual');
	logger.addTrackPoint({
		time: 1,
		speed: 420,
		power: 666,
	});
	logger.addTrackPoint({
		time: 2,
		speed: 420,
		power: 666,
	});

	const handleTCXExport = () => {
		const title = 'My Training';
		const notes = 'This is just an example.';
		const date = (new Date()).toISOString().slice(0, 10); // TODO get date from the logger
		const filename = `${date}_${title}.tcx`; // RFE Re-eval
		const xmlLines: string[] = [];

		logger.tcx(title, notes, (line: string) => xmlLines.push(line));
		const blob = new Blob(xmlLines, { type: 'application/vnd.garmin.tcx+xml' });

		downloadBlob(blob, filename);
	};

	return (
		<Container maxWidth="md">
			<Head title="RideResults" />
			<Box>
				<Title>Results</Title>
				<p>Training ride results.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<ExportCard title="Export Data" onClickTCX={handleTCXExport}>
						Here you can download the activity log as a file for importing to other services.
					</ExportCard>
				</Grid>
			</Box>
		</Container>
	);
}
