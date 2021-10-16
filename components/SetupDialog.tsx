import { useState, Fragment } from 'react';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		form: {
			display: 'flex',
			flexDirection: 'column',
			margin: 'auto',
			width: 'fit-content',
		},
		formControl: {
			marginTop: theme.spacing(2),
			minWidth: 120,
		},
		formControlLabel: {
			marginTop: theme.spacing(1),
		},
	})
);

export default function SetupDialog({ btnText, title, children }) {
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Fragment>
			<Button variant="outlined" color="primary" onClick={handleClickOpen}>
				{btnText}
			</Button>
			<Dialog fullWidth={false} maxWidth="md" open={open} onClose={handleClose} aria-labelledby="dialog-title">
				<DialogTitle id="dialog-title">{title}</DialogTitle>
				<DialogContent>{children}</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
}
