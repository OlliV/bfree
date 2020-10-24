import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
		}
	})
);

export function Param({ title, image, children }) {
	const classes = useSetupStyles();

	return (
		<Grid item xs={4}>
			<Card variant="outlined">
				<CardMedia
					className={classes.media}
					image={image}
					title="Filler image"
				/>
				<Typography gutterBottom variant="h5" component="h2">
					{title}
				</Typography>
				<CardContent className={classes.setupCard}>
					{children}
				</CardContent>
			</Card>
		</Grid>
	);
}

export function UnsignedConfigParam({ title, image, label, configName }: { title: string; image: string; label: string; configName: string }) {
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
				<TextField value={tmp} error={!isValidUnsigned(Number(tmp))} onChange={handleChange} id="outlined-basic" label={label} variant="outlined" />
			</form>
		</Param>
	);
}

export function EnumConfigParam({ title, image, label, helpLabel, items, configName }: { title: string; image: string; label: string; helpLabel?: string; items: [string, string][], configName: string }) {
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
					labelId={`${label}-label`}
					id={`${label}-label`}
					value={value}
					onChange={handleChange}
				>
					{ items.map(([key, name]) => (<MenuItem key={key} value={key}>{name}</MenuItem>)) }
				</Select>
				{helpLabel ? <FormHelperText>{helpLabel}</FormHelperText> : ''}
			</FormControl>
		</Param>
	);
}
