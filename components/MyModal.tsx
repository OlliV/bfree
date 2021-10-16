import Modal, { ModalProps } from '@mui/material/Modal';
import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

const defaultModalStyle = {
	width: '80vw',
	height: '68vh',
};

const useModalStyles = makeStyles((theme: Theme) => {
	const top = 50;
	const left = 50;

	return createStyles({
		paper: {
			position: 'absolute',
			top: `${top}%`,
			left: `${left}%`,
			transform: `translate(-${top}%, -${left}%)`,
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
	});
});

export default function MyModal(
	props: { title: string; description: string; modalStyle?: any; children: any } & Omit<ModalProps, 'children'>
) {
	const classes = useModalStyles();
	const { title, description, open, onClose, modalStyle, children, ...rest } = props;

	return (
		<Modal
			open={open}
			onClose={onClose}
			{...rest}
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<div style={modalStyle || defaultModalStyle} className={classes.paper}>
				<h2 id="modal-title">{title}</h2>
				<p id="modal-description">{description}</p>
				{children}
			</div>
		</Modal>
	);
}
