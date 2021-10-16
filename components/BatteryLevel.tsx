import Battery0Icon from '@mui/icons-material/BatteryAlert';
import Battery20Icon from '@mui/icons-material/Battery20';
import Battery30Icon from '@mui/icons-material/Battery30';
import Battery50Icon from '@mui/icons-material/Battery50';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery80Icon from '@mui/icons-material/Battery80';
import Battery90Icon from '@mui/icons-material/Battery90';
import Battery100Icon from '@mui/icons-material/BatteryFull';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Tooltip } from '@mui/material';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		batteryLevel: {
			'vertical-align': 'center',
			'font-size': '25px !important',
		},
	})
);

export default function BatteryLevel({ batteryLevel }: { batteryLevel: number }) {
	const classes = useStyles();

	return (
		<Tooltip title={`${batteryLevel} %`}>
			{batteryLevel < 20 ? (
				<Battery0Icon className={classes.batteryLevel} />
			) : batteryLevel < 30 ? (
				<Battery20Icon className={classes.batteryLevel} />
			) : batteryLevel < 50 ? (
				<Battery30Icon className={classes.batteryLevel} />
			) : batteryLevel < 60 ? (
				<Battery50Icon className={classes.batteryLevel} />
			) : batteryLevel < 80 ? (
				<Battery60Icon className={classes.batteryLevel} />
			) : batteryLevel < 90 ? (
				<Battery80Icon className={classes.batteryLevel} />
			) : batteryLevel < 100 ? (
				<Battery90Icon className={classes.batteryLevel} />
			) : (
				<Battery100Icon />
			)}
		</Tooltip>
	);
}
