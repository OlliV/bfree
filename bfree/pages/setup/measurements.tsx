import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Container from '@material-ui/core/Container';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useState } from 'react';
import Head from '../../components/Head';
import Title from '../../components/title';
import { useSetupStyles as useStyles } from '../../components/SetupComponents';
import PriorityList from '../../components/PriorityList';
import SetupDialog from '../../components/SetupDialog';
import { cadenceSourceTypes, speedSourceTypes, powerSourceTypes, useGlobalState } from '../../lib/global';

function DaqSourceCard({ title, image, configName, sourceTypes }) {
	const classes = useStyles();
	const [right, setRight] = useGlobalState(configName);
	const [left, setLeft] = useState(sourceTypes.filter((a) => !right.find((b) => a.id === b.id)));

	const handleLeftChange = (v) => setLeft(v);
	const handleRightChange = (v) => setRight(v);

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia className={classes.media} image={image} title="Filler image" />
				<Typography gutterBottom variant="h5" component="h2">
					{title}
				</Typography>
				<CardContent>
					<Typography gutterBottom>
						<b>Primary source</b>
						<br />
						{right.length > 0 ? right[0].name : 'None'}
					</Typography>
				</CardContent>
				<CardActions>
					<SetupDialog btnText="Configure" title={title}>
						<DialogContentText>
							The sensors on the right side will be used for measurements.
						</DialogContentText>
						<form noValidate autoComplete="off">
							<PriorityList
								leftList={left}
								rightList={right}
								handleLeftChange={handleLeftChange}
								handleRightChange={handleRightChange}
							/>
						</form>
					</SetupDialog>
				</CardActions>
			</Card>
		</Grid>
	);
}

export default function SetupMeasurements() {
	return (
		<Container maxWidth="md">
			<Head title="Measurements" />
			<Box>
				<Title href="/setup">Measurements</Title>
				<p>Select measurement sources for recording.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<DaqSourceCard
						title="Speed Source"
						image="/images/cards/tempo.jpg"
						configName="speedSources"
						sourceTypes={speedSourceTypes}
					/>
					<DaqSourceCard
						title="Cadence Source"
						image="/images/cards/pedals.jpg"
						configName="cadenceSources"
						sourceTypes={cadenceSourceTypes}
					/>
					<DaqSourceCard
						title="Power Source"
						image="/images/cards/force.jpg"
						configName="powerSources"
						sourceTypes={powerSourceTypes}
					/>
				</Grid>
			</Box>
		</Container>
	);
}
