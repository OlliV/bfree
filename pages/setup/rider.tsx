import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MyHead from '../../components/MyHead';
import TextField from '@material-ui/core/TextField';
import Title from '../../components/Title';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { isValidUnsigned } from '../../lib/validation';
import { useState } from 'react';
import { useSetupStyles as useStyles, Param } from '../../components/SetupComponents';
import { useGlobalState } from '../../lib/global';

export const useHRMStyles = makeStyles((theme: Theme) =>
	createStyles({
		textField: {
			width: '11ch',
		},
	})
);

function Weight() {
	const classes = useStyles();
	const [rider, setRider] = useGlobalState('rider');
	const [tmp, setTmp] = useState(rider.weight);

	const handleChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(value)) {
			setRider({
				...rider,
				weight: value,
			});
		}
	};

	return (
		<Param title="Weight" image="/images/cards/scale.jpg">
			<form className={classes.form} noValidate autoComplete="off">
				<TextField
					value={tmp}
					error={!isValidUnsigned(Number(tmp))}
					onChange={handleChange}
					id="outlined-basic"
					label="kg"
					variant="outlined"
				/>
			</form>
		</Param>
	);
}

function FTPValue() {
	const classes = useStyles();
	const [rider, setRider] = useGlobalState('rider');
	const [tmp, setTmp] = useState(rider.ftp);

	const handleChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(value)) {
			setRider({
				...rider,
				ftp: value,
			});
		}
	};

	return (
		<Param title="FTP" image="/images/cards/ftp.jpg">
			<form className={classes.form} noValidate autoComplete="off">
				<TextField
					value={tmp}
					error={!isValidUnsigned(Number(tmp))}
					onChange={handleChange}
					id="outlined-basic"
					label="Watt"
					variant="outlined"
				/>
			</form>
		</Param>
	);
}

function HeartRate() {
	const classes = useStyles();
	const classesHrm = useHRMStyles();
	const [rider, setRider] = useGlobalState('rider');
	const [tmpRest, setTmpRest] = useState(rider.heartRate.rest);
	const [tmpMax, setTmpMax] = useState(rider.heartRate.max);

	const handleRestChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmpRest(raw);
		if (isValidUnsigned(value)) {
			setRider({
				...rider,
				heartRate: {
					rest: value,
					max: rider.heartRate.max,
				},
			});
		}
	};
	const handleMaxChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmpMax(raw);
		if (isValidUnsigned(value)) {
			setRider({
				...rider,
				heartRate: {
					rest: rider.heartRate.rest,
					max: value,
				},
			});
		}
	};

	return (
		<Param title="Heart Rate" image="/images/cards/tempo.jpg">
			<Container>
				<form className={classes.form} noValidate autoComplete="off">
					<TextField
						value={tmpRest}
						error={!isValidUnsigned(Number(tmpRest))}
						onChange={handleRestChange}
						id="outlined-basic"
						label="Rest BPM"
						variant="outlined"
						className={classesHrm.textField}
					/>
					<TextField
						value={tmpMax}
						error={!isValidUnsigned(Number(tmpMax))}
						onChange={handleMaxChange}
						id="outlined-basic"
						label="Max BPM"
						variant="outlined"
						className={classesHrm.textField}
					/>
				</form>
			</Container>
		</Param>
	);
}

export default function SetupRider() {
	return (
		<Container maxWidth="md">
			<MyHead title="Rider" />
			<Box>
				<Title href="/setup">Rider</Title>
				<p>Set the rider weight and other measurements.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<Weight />
					<FTPValue />
					<HeartRate />
				</Grid>
			</Box>
		</Container>
	);
}
