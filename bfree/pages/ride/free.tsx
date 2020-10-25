import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Head from '../../components/Head';
import StartButton from '../../components/StartButton';
import ResistanceMode from '../../components/ResistanceMode';
import Title from '../../components/title';
import { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		startButton: {
			position: 'fixed',
			bottom: 10,
		},
	})
);

export default function RideFree() {
	const classes = useStyles();
	const [resistanceMode, setResistanceMode] = useState('');

	return (
		<Container maxWidth="md">
			<Head title="Free Ride" />
			<Box>
				<Title>Free Ride</Title>
				<p>Start a free ride.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<ResistanceMode mode={resistanceMode} setMode={setResistanceMode} />
				</Grid>
			</Box>
			<Box width="50%" className={classes.startButton}>
				<StartButton disabled={!resistanceMode} href={`/ride/record?type=free&resistance=${resistanceMode}`} />
			</Box>
		</Container>
	);
}
