import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { CardContent } from '@mui/material';
import { useState } from 'react';
import { useGlobalState } from '../lib/global';
import WarningDialog from './WarningDialog';

const PREFIX = 'StartButton';
const classes = {
	button: `${PREFIX}-button`,
	buttonDisabled: `${PREFIX}-buttonDisabled`,
	center: `${PREFIX}-center`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`& .${classes.button}`]: {
		'&:hover': {
			backgroundColor: 'lightgrey',
		},
	},

	[`& .${classes.buttonDisabled}`]: {
		cursor: 'not-allowed',
	},

	[`& .${classes.center}`]: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'bottom',
		height: '3ex',
	},
}));

export default function StartButton({ disabled, href }: { disabled?: boolean; href: string }) {
	const router = useRouter();
	const [showWarning, setShowWarning] = useState(false);
	const [btDevice_smart_trainer] = useGlobalState('btDevice_smart_trainer');

	const handleOnClick = (e) => {
		if (disabled) {
			e.preventDefault();
		} else if (!btDevice_smart_trainer) {
			e.preventDefault();
			setShowWarning(true);
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
		<StyledGrid item xs={12}>
			<Link href={href} onClick={handleOnClick}>
				<Card variant="outlined" className={disabled ? classes.buttonDisabled : classes.button}>
					<CardContent>
						<Box className={classes.center}>
							<Typography gutterBottom variant="h5" component="h2">
								Start
							</Typography>
						</Box>
					</CardContent>
				</Card>
			</Link>
			<WarningDialog
				title={'Continue without a smart trainer?'}
				show={showWarning}
				handleCancel={handleCancel}
				handleContinue={handleContinue}
			>
				There is currently no connection to a smart trainer and therefore trainer control functions will not
				function.
			</WarningDialog>
		</StyledGrid>
	);
}
