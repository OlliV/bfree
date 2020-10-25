import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import Title from '../../components/title';
import Head from '../../components/Head';
import { isValidUnsigned } from '../../lib/validation';
import { useSetupStyles as useStyles, Param } from '../../components/SetupComponents';
import { useGlobalState } from '../../lib/global';

function WheelCircumference() {
	const classes = useStyles();
	const [bike, setBike] = useGlobalState('bike');
	const [tmp, setTmp] = useState(bike.wheelCircumference);

	const handleChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(value)) {
			setBike({
				...bike,
				wheelCircumference: value,
			});
		}
	};

	return (
		<Param title="Wheel Circumference" image="/images/cards/wheel.jpg">
			<form className={classes.form} noValidate autoComplete="off">
				<TextField
					value={tmp}
					error={!isValidUnsigned(Number(tmp))}
					onChange={handleChange}
					id="outlined-basic"
					label="mm"
					variant="outlined"
				/>
			</form>
		</Param>
	);
}

function BikeWeight() {
	const classes = useStyles();
	const [bike, setBike] = useGlobalState('bike');
	const [tmp, setTmp] = useState(bike.weight);

	const handleChange = (event) => {
		const raw = event.target.value;
		const value = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(value)) {
			setBike({
				...bike,
				weight: value,
			});
		}
	};

	return (
		<Param title="Bike Weight" image="/images/cards/weight.jpg">
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

export default function SetupBike() {
	return (
		<Container maxWidth="md">
			<Head title="Bike" />
			<Box>
				<Title>Bike</Title>
				<p>Setup the bike measurements.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<WheelCircumference />
					<BikeWeight />
				</Grid>
			</Box>
		</Container>
	);
}
