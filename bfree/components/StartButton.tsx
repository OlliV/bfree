import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useState } from 'react';
import { useGlobalState } from '../lib/global';

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

function WarningDialog({ show, handleCancel, handleContinue }) {
	return (
		<Dialog
			open={show}
			onClose={handleCancel}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{'Continue without a smart trainer?'}</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					There is currently no connection to a smart trainer and therefore trainer control functions will not
					function.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleCancel} color="primary">
					Cancel
				</Button>
				<Button onClick={handleContinue} color="primary" autoFocus>
					Continue
				</Button>
			</DialogActions>
		</Dialog>
	);
}

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
			<WarningDialog show={showWarning} handleCancel={handleCancel} handleContinue={handleContinue} />
		</Grid>
	);
}
