import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useEffect, useMemo } from 'react';
import ExportCard from '../../components/ExportCard';
import MyHead from '../../components/MyHead';
import InfoCard from '../../components/InfoCard';
import Title from '../../components/Title';
import { useGlobalState, setGlobalState } from '../../lib/global';
import downloadBlob from '../../lib/download_blob';
import { createActivityLog, saveActivityLog } from '../../lib/activity_log';
import { getDayPeriod } from '../../lib/locale';

const PREFIX = 'results';
const classes = {
	exportCard: `${PREFIX}-exportCard`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
	[`& .${classes.exportCard}`]: {
		height: '16.3em',
	},
}));

function maybeSetDefaults(logger: ReturnType<typeof createActivityLog>): { name?: string; notes?: string } {
	if (!logger) {
		return {};
	}

	if (logger.getName().length === 0) {
		logger.setName(`Training ${getDayPeriod(new Date(logger.getStartTime() || Date.now()))}`);
	}
	if (logger.getNotes().length === 0) {
		logger.setNotes('This is just an example.');
	}

	return {
		name: logger.getName(),
		notes: logger.getNotes(),
	};
}

export default function RideResults() {
	const [logger, setLogger] = useGlobalState('currentActivityLog');
	const { name: defaultName, notes: defaultNotes } = useMemo(() => maybeSetDefaults(logger), [logger]);

	const handleTCXExport = () => {
		const name = logger.getName();
		const filename = `${logger.getStartTimeISO().slice(0, 10)}_${name}.tcx`;
		const xmlLines: string[] = [];

		logger.tcx((line: string) => xmlLines.push(line));
		const blob = new Blob(xmlLines, { type: 'application/vnd.garmin.tcx+xml' });

		downloadBlob(blob, filename);
	};
	const handleNameChange = (e) => {
		if (logger) {
			logger.setName(e.target.value);
			saveActivityLog(logger);
		}
	};
	const handleNotesChange = (e) => {
		if (logger) {
			logger.setNotes(e.target.value);
			saveActivityLog(logger);
		}
	};

	// Cleanup the logger after the user exists this page.
	useEffect(() => {
		return () => {
			console.log('Discarding the active logger');
			setLogger(() => null);

			// Make sure the user won't see old time values at the beginning
			// of the next recording session.
			setGlobalState('elapsedTime', 0);
			setGlobalState('elapsedLapTime', 0);
			setGlobalState('rideDistance', 0);
		};
	}, []);

	// TODO Show an error if logger is missing
	return (
		<StyledContainer maxWidth="md">
			<MyHead title="Ride Results" />
			<Box>
				<Title href="/">Results</Title>
				<p>Training ride results.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<InfoCard
						defaultName={defaultName}
						onChangeName={handleNameChange}
						defaultNotes={defaultNotes}
						onChangeNotes={handleNotesChange}
					/>
					<ExportCard
						title="Export Data"
						cardContentClassName={classes.exportCard}
						onClickTCX={handleTCXExport}
					>
						Here you can download the activity log as a file for importing to other services.
					</ExportCard>
				</Grid>
			</Box>
		</StyledContainer>
	);
}
