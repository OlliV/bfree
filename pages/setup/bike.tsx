import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Title from '../../components/Title';
import MyHead from '../../components/MyHead';
import { isValidUnsigned } from '../../lib/validation';
import { classes, StyledParam, ParamInfo } from '../../components/SetupComponents';
import { useGlobalState } from '../../lib/global';

const bikeInfo = `Bike type is used to estimate the drag coefficient which is needed to calculate a realistic wind resistance.
Wheel diameter is used for distance calculation.
Bike weight is used to calculate the gravitational resistance when the slope control is used.`;

function WheelCircumference() {
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
		<TextField
			autoComplete="off"
			className={classes.form}
			value={tmp}
			error={!isValidUnsigned(Number(tmp))}
			onChange={handleChange}
			id="outlined-basic"
			label="Wheel Circumference"
			variant="outlined"
			InputProps={{
				endAdornment: <InputAdornment position="end">mm</InputAdornment>,
			}}
		/>
	);
}

function BikeWeight() {
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
		<TextField
			autoComplete="off"
			className={classes.form}
			value={tmp}
			error={!isValidUnsigned(Number(tmp))}
			onChange={handleChange}
			id="outlined-basic"
			label="Bike Weight"
			variant="outlined"
			InputProps={{
				endAdornment: <InputAdornment position="end">kg</InputAdornment>,
			}}
		/>
	);
}

function BikeType() {
	const [bike, setBike] = useGlobalState('bike');

	const handleChange = (event) => {
		setBike({
			...bike,
			type: event.target.value,
		});
	};

	return (
		<Select variant="standard" label="Bike Type" value={bike.type} onChange={handleChange} defaultValue="road">
			<MenuItem value="atb">ATB/MTB</MenuItem>
			<MenuItem value="commuter">Commuter</MenuItem>
			<MenuItem value="road">Road</MenuItem>
			<MenuItem value="racing">Racing</MenuItem>
		</Select>
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
					<StyledParam title="Bike Parameters" info={bikeInfo} image="/images/cards/patent.jpg">
						<FormControl className={classes.form}>
							<BikeType />
							<WheelCircumference />
							<BikeWeight />
						</FormControl>
					</StyledParam>
				</Grid>
			</Box>
		</Container>
	);
}
