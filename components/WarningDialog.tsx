import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function WarningDialog({
	title,
	show,
	handleCancel,
	handleContinue,
	children: message,
}: {
	title: string;
	show: boolean;
	handleCancel: (e: any) => void;
	handleContinue: (e: any) => void;
	children?: any;
}) {
	return (
		<Dialog
			open={show}
			onClose={handleCancel}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">{message || ''}</DialogContentText>
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
