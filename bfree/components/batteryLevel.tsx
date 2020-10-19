import Battery0Icon from '@material-ui/icons/BatteryAlert';
import Battery20Icon from '@material-ui/icons/Battery20';
import Battery30Icon from '@material-ui/icons/Battery30';
import Battery50Icon from '@material-ui/icons/Battery50';
import Battery60Icon from '@material-ui/icons/Battery60';
import Battery80Icon from '@material-ui/icons/Battery80';
import Battery90Icon from '@material-ui/icons/Battery90';
import Battery100Icon from '@material-ui/icons/BatteryFull';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import {Tooltip} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		batteryLevel: {
			'vertical-align': 'center',
			'font-size': '25px !important',
		}
	}),
);

export default function BatteryLevel({ batteryLevel }: { batteryLevel: number }) {
	const classes = useStyles();

	return (
		<Tooltip title={`${batteryLevel} %`}>
			{
				batteryLevel < 20 ? (<Battery0Icon className={classes.batteryLevel}/>)
				: batteryLevel < 30 ? (<Battery20Icon className={classes.batteryLevel}/>)
				: batteryLevel < 50 ? (<Battery30Icon className={classes.batteryLevel}/>)
				: batteryLevel < 60 ? (<Battery50Icon className={classes.batteryLevel}/>)
				: batteryLevel < 80 ? (<Battery60Icon className={classes.batteryLevel}/>)
				: batteryLevel < 90 ? (<Battery80Icon className={classes.batteryLevel}/>)
				: batteryLevel < 100 ? (<Battery90Icon className={classes.batteryLevel}/>)
				: (<Battery100Icon/>)
			}
		</Tooltip>
	);
}
