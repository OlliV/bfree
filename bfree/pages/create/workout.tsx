import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import Head from '../../components/Head';
import Title from '../../components/title';
import WorkoutScriptEditor from '../../components/WorkoutScriptEditor';
import createWorkoutRunner from '../../lib/workout_runner';
import WorkoutEditorActions from '../../components/WorkoutEditorActions';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
	})
);

const defaultName = 'My Workout';
const defaultNotes = 'This is just an example.';
// TODO Commands that can be sent back
// - split
// - end ride
const scriptExample: string = `
self.addEventListener('message', function(e) {
  self.postMessage({
    power: '150W'
  });
}, false);
`;

export default function RideResults() {
	const classes = useStyles();
	const [workoutRunner, setWorkoutRunner] = useState();
	const [workoutScript, setWorkoutScript] = useState(scriptExample);

	// Cleanup the logger after the user exists this page.
	useEffect(() => {
		return () => {
			if (workoutRunner) {
				// @ts-ignore
				workoutRunner.terminate();
			}
		};
	}, []);

	return (
		<Container maxWidth="md">
			<Head title="Workout Editor" />
			<Box>
				<Title href="/">Workout Editor</Title>
				<p>Create or edit a workout.</p>

				<Grid container direction="row" spacing={2}>
					<WorkoutScriptEditor code={workoutScript} onValueChange={setWorkoutScript} />
					<WorkoutEditorActions defaultName={defaultName} defaultNotes={defaultNotes} onClickSave={() => {}} onClickDiscard={() => {}}/>
				</Grid>
			</Box>
		</Container>
	);
}
