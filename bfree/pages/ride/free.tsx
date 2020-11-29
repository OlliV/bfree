import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import Head from '../../components/Head';
import StartButton from '../../components/StartButton';
import ResistanceMode from '../../components/ResistanceMode';
import RollingResistance from '../../components/RollingResistance';
import Title from '../../components/Title';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		startButton: {
			position: 'fixed',
			bottom: 10,
		},
	})
);

function makeStartUrl(resistanceMode: string, rollingResistance: number) {
	if (resistanceMode === 'slope') {
		return `/ride/record?type=free&resistance=${resistanceMode}&rollingResistance=${rollingResistance}`;
	}
	return `/ride/record?type=free&resistance=${resistanceMode}`;
}

export default function RideFree() {
	const classes = useStyles();
	const [resistanceMode, setResistanceMode] = useState('');
	const [rollingResistance, setRollingResistance] = useState(NaN);

	useEffect(() => {
		if (resistanceMode !== 'slope') {
			setRollingResistance(NaN);
		}
	}, [resistanceMode]);

	return (
		<Container maxWidth="md">
			<Head title="Free Ride" />
			<Box>
				<Title href="/ride">Free Ride</Title>
				<p>Start a free ride exercise.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<ResistanceMode mode={resistanceMode} setMode={setResistanceMode} />
					{resistanceMode === 'slope' ? (
						<RollingResistance
							rollingResistance={rollingResistance}
							setRollingResistance={setRollingResistance}
						/>
					) : (
						<br />
					)}
				</Grid>
			</Box>
			<Box width="50%" className={classes.startButton}>
				<StartButton disabled={!resistanceMode} href={makeStartUrl(resistanceMode, rollingResistance)} />
			</Box>
		</Container>
	);
}
