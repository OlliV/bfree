import Editor from 'react-simple-code-editor';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { highlight, languages } from 'prismjs';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		card: {
			height: '40em',
		},
	})
);

export default function ({code, onValueChange}) {
	const classes = useStyles();

	return (
		<Grid item xs={6}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						Workout Script
					</Typography>
					<Editor
						value={code}
						onValueChange={onValueChange}
						highlight={code => highlight(code, languages.js)}
						padding={10}
						style={{
							fontFamily: '"Fira code", "Fira Mono", monospace',
							fontSize: 12,
						}}
					/>
				</CardContent>
			</Card>
		</Grid>
	);
}
