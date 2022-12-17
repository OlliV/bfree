import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import IconPause from '@mui/icons-material/Pause';
import IconSplit from '@mui/icons-material/Timer';
import IconStop from '@mui/icons-material/Stop';
import { styled } from '@mui/material/styles';

const PREFIX = 'RecordActionButtons';
const classes = {
	bottomActions: `${PREFIX}-bottomActions`,
	button: `${PREFIX}-button`,
};

const StyledBox = styled(Box)(({ theme }) => ({
	[`& .${classes.bottomActions}`]: {
		position: 'fixed',
		left: 0,
		bottom: 0,
		width: '100vw',
	},

	[`& .${classes.button}`]: {
		'&:hover': {
			color: 'lightgrey',
		},
	},
}));

export function RecordActionButtons({
	onClickPause,
	onClickSplit,
	onClickEnd,
}: {
	onClickPause: (e?: React.MouseEvent<HTMLElement>) => void;
	onClickSplit: (e?: React.MouseEvent<HTMLElement>) => void;
	onClickEnd: (e?: React.MouseEvent<HTMLElement>) => void;
}) {
	return (
		<StyledBox>
			<BottomNavigation showLabels className={classes.bottomActions}>
				<BottomNavigationAction
					className={classes.button}
					label="Pause"
					icon={<IconPause />}
					onClick={onClickPause}
				/>
				<BottomNavigationAction
					className={classes.button}
					label="Split"
					icon={<IconSplit />}
					onClick={onClickSplit}
				/>
				<BottomNavigationAction
					className={classes.button}
					label="End"
					icon={<IconStop />}
					onClick={onClickEnd}
				/>
			</BottomNavigation>
		</StyledBox>
	);
}
