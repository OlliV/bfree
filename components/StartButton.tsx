import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState } from 'react';
import { useGlobalState } from '../lib/global';
import WarningDialog from './WarningDialog';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		button: {
			'&:hover': {
				backgroundColor: 'lightgrey',
			},
		},
		buttonDisabled: {
			cursor: 'not-allowed',
		},
		center: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'bottom',
			height: '3ex',
		},
	})
);

export default function StartButton({ disabled, href }: { disabled?: boolean; href: string }) {
	const classes = useStyles();
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
		<Grid item xs={12}>
			<Link href={href}>
				<a onClick={handleOnClick}>
					<Card variant="outlined" className={disabled ? classes.buttonDisabled : classes.button}>
						<CardContent>
							<Box className={classes.center}>
								<Typography gutterBottom variant="h5" component="h2">
									Start
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</a>
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
		</Grid>
	);
}
