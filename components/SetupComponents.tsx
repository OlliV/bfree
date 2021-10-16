import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useState } from 'react';
import { useGlobalState } from '../lib/global';
import { isValidUnsigned } from '../lib/validation';

export const useSetupStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
			alignItems: 'center',
		},
		setupCard: {
			height: '10em',
		},
		media: {
			height: 120,
		},
		form: {
			'& > *': {
				margin: theme.spacing(1),
				width: '25ch',
			},
		},
	})
);

export function Param({ title, image, children }) {
	const classes = useSetupStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia className={classes.media} image={image} title="Filler image" />
				<Typography gutterBottom variant="h5" component="h2">
					{title}
				</Typography>
				<CardContent className={classes.setupCard}>{children}</CardContent>
			</Card>
		</Grid>
	);
}

export function UnsignedConfigParam({
	title,
	image,
	label,
	configName,
}: {
	title: string;
	image: string;
	label: string;
	configName: string;
}) {
	const classes = useSetupStyles();
	// @ts-ignore
	const [value, setValue] = useGlobalState(configName);
	const [tmp, setTmp] = useState(value);

	const handleChange = (event) => {
		const raw = event.target.value;
		const v = Number(raw);

		setTmp(raw);
		if (isValidUnsigned(v)) {
			setValue(v);
		}
	};

	return (
		<Param title={title} image={image}>
			<form className={classes.form} noValidate autoComplete="off">
				<TextField
					value={tmp}
					error={!isValidUnsigned(Number(tmp))}
					onChange={handleChange}
					id="outlined-basic"
					label={label}
					variant="outlined"
				/>
			</form>
		</Param>
	);
}

export function EnumConfigParam({
	idPrefix,
	title,
	image,
	label,
	helpLabel,
	items,
	configName,
}: {
	idPrefix?: string;
	title: string;
	image: string;
	label: string;
	helpLabel?: string;
	items: [string, string][];
	configName: string;
}) {
	const classes = useSetupStyles();
	// @ts-ignore
	const [value, setValue] = useGlobalState(configName);
	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => setValue(event.target.value as string);

	return (
		<Param title={title} image={image}>
			<FormControl className={classes.form}>
				<InputLabel shrink id="demo-simple-select-placeholder-label-label">
					{label}
				</InputLabel>
				<Select
					labelId={`${idPrefix || label}-label`}
					id={`${idPrefix || label}-label`}
					value={value}
					onChange={handleChange}
				>
					{items.map(([key, name]) => (
						<MenuItem key={key} value={key}>
							{name}
						</MenuItem>
					))}
				</Select>
				{helpLabel ? <FormHelperText>{helpLabel}</FormHelperText> : ''}
			</FormControl>
		</Param>
	);
}
