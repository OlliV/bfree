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
const scriptExample: string = `const hr_hyst = [ 170, 195 ];
let pwr_limit = false;
let interval;
self.addEventListener('message', function(e) {
  const { data: msg } = e;
  let power;
  let endRide = false;

  if (msg.hr >= hr_hyst[1]) {
    pwr_limit = true;
  } else if (msg.hr < hr_hyst[0]) {
    pwr_limit = false;
  }
  if (pwr_limit) {
    power = 100;
  } else {
    if (msg.time < 1800 * 1000) {
      power = 200;
    } else if (msg.time < 3600 * 1000) {
      power = 150;
    } else {
	  power = 100;
      endRide = true;
    }
  }

  self.postMessage({
    time: msg.time,
    power,
	endRide,
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
