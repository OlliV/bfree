import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconCancel from '@mui/icons-material/Cancel';
import IconSave from '@mui/icons-material/Save';
import IconTimeLine from '@mui/icons-material/Timeline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useState, useEffect } from 'react';
import EditActionButtons from './EditActionButtons';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		card: {
			height: '45em',
		},
		nameField: {
			paddingBottom: '2.5em',
		},
		editor: {
			overflow: 'scroll',
			fontFamily: '"Fira code", "Fira Mono", monospace',
			fontSize: 12,
		},
	})
);

export default function WorkoutScriptEditor({
	defaultName,
	defaultNotes,
	code,
	onCodeChange,
	onClickSave,
	onClickDiscard,
	onClickPreview,
}: {
	defaultName: string;
	defaultNotes: string;
	code: string;
	onCodeChange: (txt: string) => void;
	onClickSave: (e: any, name: string, notes: string) => void;
	onClickDiscard: (e: any) => void;
	onClickPreview: (e: any) => void;
}) {
	const classes = useStyles();
	const [name, setName] = useState(defaultName);
	const [notes, setNotes] = useState(defaultNotes);
	const handleChange = (e) => onCodeChange(e.target.value);

	useEffect(() => {
		setName(defaultName);
	}, [defaultName]);
	useEffect(() => {
		setNotes(defaultNotes);
	}, [defaultNotes]);

	return (
		<Grid item xs={12}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						Workout Script
					</Typography>
					<EditActionButtons
						onClickSave={(e: any) => onClickSave(e, name, notes)}
						onClickDiscard={onClickDiscard}
						onClickPreview={onClickPreview}
					/>
					<form>
						<TextField
							id="act-name"
							label="Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={classes.nameField}
						/>
						<TextField
							id="act-notes"
							label="Notes"
							multiline
							rows={2}
							fullWidth
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							variant="outlined"
						/>
						<TextField
							multiline
							fullWidth
							rows={14}
							variant="outlined"
							margin="none"
							value={code}
							onChange={handleChange}
							InputProps={{
								classes: {
									input: classes.editor,
								},
							}}
						/>
					</form>
				</CardContent>
			</Card>
		</Grid>
	);
}
