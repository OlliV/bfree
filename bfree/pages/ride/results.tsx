import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import ExportCard from '../../components/ExportCard';
import Head from '../../components/Head';
import InfoCard from '../../components/InfoCard';
import Title from '../../components/title';
import { useGlobalState, setGlobalState } from '../../lib/global';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		exportCard: {
			height: '16.3em',
		},
	})
);

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
	const classes = useStyles();
	const [logger, setLogger] = useGlobalState('currentActivityLog');
	const [title, setTitle] = useState('My Training');
	const [notes, setNotes] = useState('This is just an example.');

	const handleTCXExport = () => {
		const date = new Date().toISOString().slice(0, 10); // TODO get date from the logger
		const filename = `${date}_${title}.tcx`; // RFE Re-eval
		const xmlLines: string[] = [];

		logger.tcx(title, notes, (line: string) => xmlLines.push(line));
		const blob = new Blob(xmlLines, { type: 'application/vnd.garmin.tcx+xml' });

		downloadBlob(blob, filename);
	};

	const handleNameChange = (e) => setTitle(e.target.value);
	const handleNotesChange = (e) => setNotes(e.target.value);

	// Cleanup the logger after the user exists this page.
	useEffect(() => {
		return () => {
			console.log('Discarding the active logger');
			setLogger(null);

			// Make sure the user won't see old time values at the beginning
			// of the next recording session.
			setGlobalState('elapsedTime', 0);
			setGlobalState('elapsedLapTime', 0);
			setGlobalState('rideDistance', 0);
		};
	}, []);

	// TODO Show an error if logger is missing
	return (
		<Container maxWidth="md">
			<Head title="Ride Results" />
			<Box>
				<Title href="/">Results</Title>
				<p>Training ride results.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<InfoCard defaultName={title} onChangeName={handleNameChange} defaultNotes={notes} onChangeNotes={handleNotesChange} />
					<ExportCard title="Export Data" cardContentClassName={classes.exportCard} onClickTCX={handleTCXExport}>
						Here you can download the activity log as a file for importing to other services.
					</ExportCard>
				</Grid>
			</Box>
		</Container>
	);
}
