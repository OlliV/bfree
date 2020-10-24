import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import Head from '../../components/Head';
import Title from '../../components/title';
import { isValidUnsigned } from '../../lib/validation';
import {
	useSetupStyles as useStyles,
	Param,
} from '../../components/SetupComponents';
import {
	useGlobalState,
} from '../../lib/global';

function SamplingRate() {
	const classes = useStyles();
	const [samplingRate, setSamplingRate] = useGlobalState('samplingRate');
	const [tmp, setTmp] = useState(samplingRate);

	const handleChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(value)) {
			setSamplingRate(samplingRate);
		}
	};

	return (
		<Param title="Sampling Rate" image="/images/cards/tic_tac.jpg">
			<form className={classes.form} noValidate autoComplete="off">
				<TextField value={tmp} error={!isValidUnsigned(Number(tmp))} onChange={handleChange} id="outlined-basic" label="Hz" variant="outlined" />
			</form>
		</Param>
	);
}

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="General" />
			<Box>
				<Title>General</Title>
				<p>
					Configure measurement units and UX settings.
				</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<SamplingRate />
				</Grid>
			</Box>
		</Container>
	);
}
