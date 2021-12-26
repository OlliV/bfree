import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Title from '../../components/Title';
import MyHead from '../../components/MyHead';
import { isValidUnsigned } from '../../lib/validation';
import { useSetupStyles as useStyles, Param } from '../../components/SetupComponents';
import { useGlobalState } from '../../lib/global';

const bikeTypeInfo =
	'Bike type is used to estimate the drag coefficient which is needed to calculate a realistic wind resistance.';
const wheelCircumInfo = 'Wheel diameter is used for distance calculation.';
const bikeWeightInfo = 'Bike weight is used to calculate the gravitational resistance when the slope control is used.';

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
		<Param title="Wheel Circumference" info={wheelCircumInfo} image="/images/cards/wheel.jpg">
			<TextField
				autoComplete="off"
				className={classes.form}
				value={tmp}
				error={!isValidUnsigned(Number(tmp))}
				onChange={handleChange}
				id="outlined-basic"
				label="mm"
				variant="outlined"
			/>
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
		<Param title="Bike Weight" info={bikeWeightInfo} image="/images/cards/weight.jpg">
			<TextField
				autoComplete="off"
				className={classes.form}
				value={tmp}
				error={!isValidUnsigned(Number(tmp))}
				onChange={handleChange}
				id="outlined-basic"
				label="kg"
				variant="outlined"
			/>
		</Param>
	);
}

function BikeType() {
	const classes = useStyles();
	const [bike, setBike] = useGlobalState('bike');

	const handleChange = (event) => {
		setBike({
			...bike,
			type: event.target.value,
		});
	};

	return (
		<Param title="Bike Type" info={bikeTypeInfo} image="/images/cards/patent.jpg">
			<FormControl className={classes.form}>
				<Select variant="standard" value={bike.type} onChange={handleChange} defaultValue="road">
					<MenuItem value="atb">ATB/MTB</MenuItem>
					<MenuItem value="commuter">Commuter</MenuItem>
					<MenuItem value="road">Road</MenuItem>
					<MenuItem value="racing">Racing</MenuItem>
				</Select>
			</FormControl>
		</Param>
	);
}

export default function SetupBike() {
	return (
		<Container maxWidth="md">
			<MyHead title="Bike" />
			<Box>
				<Title href="/setup">Bike</Title>
				<p>Setup the bike measurements.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<WheelCircumference />
					<BikeWeight />
					<BikeType />
				</Grid>
			</Box>
		</Container>
	);
}
