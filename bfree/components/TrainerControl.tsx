import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import {useGlobalState} from '../lib/global';

const useStyles = makeStyles({
	root: {
		marginTop: '1em',
		width: '80%',
	},
});

function valueText(value: number) {
	return `${value} %`;
}

export function TrainerControlBasicResistance({className}) {
	const classes = useStyles();
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');

	const setBasicResistance = (_ev: any, value: number) => {
		if (smartTrainerControl) {
			smartTrainerControl.setBasicResistance(value);
		}
	}

	return (
		<div className={className || classes.root}>
			<Typography id="discrete-slider" gutterBottom>
				Basic Resistance
			</Typography>
			<Slider
				defaultValue={0}
				getAriaValueText={valueText}
				aria-labelledby="discrete-slider"
				valueLabelDisplay="off"
				step={10}
				marks
				min={0}
				max={100}
				disabled={!(smartTrainerControl && smartTrainerControl.setBasicResistance)}
				onChangeCommitted={setBasicResistance}
			/>
		</div>
	);
}
