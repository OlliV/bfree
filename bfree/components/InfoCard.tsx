import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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

export default function ExportCard({ defaultName, onChangeName, defaultNotes, onChangeNotes }) {
	const classes = useStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom defaultValue={defaultName} variant="h5" component="h2">
						Activity Info
					</Typography>
					<form>
						<TextField
							id="act-name"
							label="Activity Name"
							defaultValue={defaultName}
							onChange={onChangeName}
							className={classes.nameField} />
						<TextField
							id="act-notes"
							label="Notes"
							multiline
							rows={4}
							defaultValue={defaultNotes || ''}
							onChange={onChangeNotes}
							variant="outlined"
						/>
					</form>
				</CardContent>
			</Card>
		</Grid>
	);
}
