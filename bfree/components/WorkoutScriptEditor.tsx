import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		card: {
			height: '40em',
		},
		editor: {
			overflow: 'scroll',
			fontFamily: '"Fira code", "Fira Mono", monospace',
			fontSize: 12,
		}
	})
);

export default function ({code, onChange}) {
	const classes = useStyles();

	const handleChane = (e) => onChange(e.target.value);

	return (
		<Grid item xs={6}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						Workout Script
					</Typography>
					<TextField
						multiline
						fullWidth
						rows={19}
						variant="outlined"
						margin="none"
						defaultValue={code}
						onChange={handleChane}
						InputProps={{
							classes: {
								input: classes.editor
							}
						}}
					/>
				</CardContent>
			</Card>
		</Grid>
	);
}
