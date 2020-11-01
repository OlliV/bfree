import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState } from 'react';
import Head from '../../components/Head';
import Title from '../../components/title';
import WorkoutPreviewModal from '../../components/WorkoutPreview';
import WorkoutScriptEditor from '../../components/WorkoutScriptEditor';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
	})
);

const defaultName = 'My Workout';
const defaultNotes = 'This is just an example.';
// TODO Commands that can be sent back
// - split
// - end ride
const scriptExample: string = `self.addEventListener('message', function(e) {
  self.postMessage({
    power: '150W'
  });
}, false);
`;

export default function RideResults() {
	const classes = useStyles();
	const [workoutScript, setWorkoutScript] = useState(scriptExample);
	const [showPreview, setShowPreview] = useState(false);

	return (
		<Container maxWidth="md">
			<Head title="Workout Editor" />
			<Box>
				<Title href="/">Workout Editor</Title>
				<p>Create or edit a workout.</p>

				<Grid container direction="row" spacing={2}>
					<WorkoutScriptEditor
						code={workoutScript}
						onCodeChange={setWorkoutScript}
						defaultName={defaultName}
						defaultNotes={defaultNotes}
						onClickSave={() => {}}
						onClickDiscard={() => {}}
						onClickPreview={() => setShowPreview(true)}
					/>
				</Grid>
			</Box>
			<WorkoutPreviewModal code={workoutScript} open={showPreview} onClose={() => setShowPreview(false)}/>
		</Container>
	);
}
