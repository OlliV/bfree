import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Container from '@material-ui/core/Container';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useState } from 'react';
import Head from '../../components/Head';
import Title from '../../components/title';
import { isValidUnsigned } from '../../lib/validation';
import {
	useSetupStyles as useStyles,
	Param,
} from '../../components/SetupComponents';
import PriorityList, { ListItem } from '../../components/PriorityList';
import SetupDialog from '../../components/SetupDialog';
import {
	speedSourceTypes,
	useGlobalState,
} from '../../lib/global';

function SpeedSource() {
	const classes = useStyles();
	const [right, setRight] = useGlobalState('speedSources');
	const [left, setLeft] = useState(speedSourceTypes.filter((a) => !right.find((b) => a.id === b.id)));

	const handleLeftChange = (v) => setLeft(v);
	const handleRightChange = (v) => setRight(v);

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia
					className={classes.media}
					image="/images/cards/tempo.jpg"
					title="Filler image"
				/>
				<Typography gutterBottom variant="h5" component="h2">
					Speed Source
				</Typography>
				<CardContent>
					<Typography gutterBottom>
						<b>Primary source</b><br />{right.length > 0 ? right[0].name : 'None'}
					</Typography>
				</CardContent>
				<CardActions>
					<SetupDialog btnText="Configure" title="Speed Source">
						<DialogContentText>
							The sensors on the right side will be used for measurements.
						</DialogContentText>
						<form noValidate autoComplete="off">
							<PriorityList leftList={left} rightList={right} handleLeftChange={handleLeftChange} handleRightChange={handleRightChange} />
						</form>
					</SetupDialog>
				</CardActions>
			</Card>
		</Grid>
	);
}

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="Measurements" />
			<Box>
				<Title>Measurements</Title>
				<p>Select measurement sources for recording.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<SpeedSource />
				</Grid>
			</Box>
		</Container>
	);
}
