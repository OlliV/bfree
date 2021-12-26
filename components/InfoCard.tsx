import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const PREFIX = 'InfoCard';
const classes = {
	card: `${PREFIX}-card`,
	nameField: `${PREFIX}-nameField`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`& .${classes.card}`]: {
		height: '20em',
	},

	[`& .${classes.nameField}`]: {
		paddingBottom: '2.5em',
	},
}));

export default function ExportCard({ defaultName, onChangeName, defaultNotes, onChangeNotes }) {
	return (
		<StyledGrid item xs={4}>
			<Card variant="outlined">
				<CardContent className={classes.card}>
					<Typography gutterBottom variant="h5" component="h2">
						Activity Info
					</Typography>
					<TextField
						id="act-name"
						label="Activity Name"
						defaultValue={defaultName}
						onChange={onChangeName}
						className={classes.nameField}
					/>
					<TextField
						id="act-notes"
						label="Notes"
						multiline
						rows={4}
						defaultValue={defaultNotes || ''}
						onChange={onChangeNotes}
						variant="outlined"
					/>
				</CardContent>
			</Card>
		</StyledGrid>
	);
}
