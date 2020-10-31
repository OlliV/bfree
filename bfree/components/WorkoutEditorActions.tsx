import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {useState} from 'react';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		card: {
			height: '20em',
		},
		nameField: {
			paddingBottom: '2.5em',
		},
	})
);

export default function WorkoutEditorActions({
	defaultName,
	defaultNotes,
	onClickSave,
	onClickDiscard
}: {
	defaultName: string;
	defaultNotes: string;
	onClickSave: (e: any) => void;
	onClickDiscard: (e: any) => void;
}) {
	const classes = useStyles();
	const [name, setName] = useState(defaultName);
	const [notes, setNotes] = useState(defaultNotes);

	const onClickPreview = () => {
		console.log('Preview requested');
	};

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						Workout Actions
					</Typography>
					<form>
						<TextField
							id="act-name"
							label="Workout Name"
							defaultValue={name}
							onChange={(e) => setName(e.target.value)}
							className={classes.nameField} />
						<TextField
							id="act-notes"
							label="Notes"
							multiline
							rows={4}
							defaultValue={notes}
							onChange={(e) => setNotes(e.target.value)}
							variant="outlined"
						/>
					</form>
				</CardContent>
				<CardActions>
					<Button variant="contained" onClick={onClickSave}>
						Save
					</Button>
					<Button variant="contained" onClick={onClickDiscard}>
						Discard
					</Button>
					<Button variant="contained" onClick={onClickPreview}>
						Preview
					</Button>
				</CardActions>
			</Card>
		</Grid>
	)
}
