import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import DialogContentText from '@mui/material/DialogContentText';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import MyHead from '../../components/MyHead';
import Title from '../../components/Title';
import { classes, StyledCard } from '../../components/SetupComponents';
import PriorityList from '../../components/PriorityList';
import SetupDialog from '../../components/SetupDialog';
import { cadenceSourceTypes, speedSourceTypes, powerSourceTypes, useGlobalState } from '../../lib/global';

function DaqSourceCard({ title, image, configName, sourceTypes }) {
	const [right, setRight] = useGlobalState(configName);
	const [left, setLeft] = useState(sourceTypes.filter((a) => !right.find((b) => a.id === b.id)));

	const handleLeftChange = (v) => setLeft(v);
	const handleRightChange = (v) => setRight(v);

	return (
		<Grid item xs="auto">
			<StyledCard variant="outlined">
				<CardMedia className={classes.media} image={image} title="Filler image" />
				<Typography gutterBottom variant="h5" component="h2">
					{title}
				</Typography>
				<CardContent sx={{ height: '12ex' }}>
					<Typography gutterBottom sx={{ width: '10em' }}>
						<b>Primary source</b>
						<br />
						{right.length > 0 ? right[0].name : 'None'}
					</Typography>
				</CardContent>
				<CardActions>
					<SetupDialog btnText="Configure" title={title}>
						<DialogContentText>
							The sensors on the right side will be used for measurements, prioritized in top-down order.
						</DialogContentText>
						<PriorityList
							leftList={left}
							rightList={right}
							handleLeftChange={handleLeftChange}
							handleRightChange={handleRightChange}
						/>
					</SetupDialog>
				</CardActions>
			</StyledCard>
		</Grid>
	);
}

export default function SetupMeasurements() {
	return (
		<Container maxWidth="md">
			<MyHead title="Measurements" />
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
