import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import IconStart from '@mui/icons-material/PlayArrow';
import IconStartDisabled from '@mui/icons-material/PlayDisabled';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useGlobalState } from '../lib/global';
import WarningDialog from './WarningDialog';

const PREFIX = 'StartButton';
const classes = {
	bottomActions: `${PREFIX}-bottomActions`,
	button: `${PREFIX}-button`,
	buttonDisabled: `${PREFIX}-buttonDisabled`,
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

	[`& .${classes.buttonDisabled}`]: {
		color: 'lightgrey',
		cursor: 'not-allowed',
	},
}));

export default function StartButton({ disabled, href }: { disabled?: boolean; href: string }) {
	const router = useRouter();
	const [showWarning, setShowWarning] = useState(false);
	const [btDevice_smart_trainer] = useGlobalState('btDevice_smart_trainer');

	const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
		if (disabled) {
			e.preventDefault();
		} else if (!btDevice_smart_trainer) {
			e.preventDefault();
			setShowWarning(true);
		} else {
			e.preventDefault();
			router.push(href);
		}
	};

	const handleCancel = () => {
		setShowWarning(false);
	};
	const handleContinue = () => {
		setShowWarning(false);
		router.push(href);
	};

	return (
		<StyledBox>
			<BottomNavigation showLabels className={classes.bottomActions}>
				<BottomNavigationAction
					className={disabled ? classes.buttonDisabled : classes.button}
					label="Start"
					icon={disabled ? <IconStartDisabled /> : <IconStart />}
					onClick={handleOnClick}
				/>
				<WarningDialog
					title={'Continue without a smart trainer?'}
					show={showWarning}
					handleCancel={handleCancel}
					handleContinue={handleContinue}
				>
					There is currently no connection to a smart trainer and therefore trainer control functions will not
					function.
				</WarningDialog>
			</BottomNavigation>
		</StyledBox>
	);
}
