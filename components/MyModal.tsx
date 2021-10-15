import Modal, { ModalProps } from '@material-ui/core/Modal';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

function getModalStyle() {
	const top = 50;
	const left = 50;

	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	};
}

const useModalStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			position: 'absolute',
			width: '80vw',
			height: '68vh',
			backgroundColor: theme.palette.background.paper,
			border: '2px solid #000',
			boxShadow: theme.shadows[5],
			padding: theme.spacing(2, 4, 3),
		},
		trainerControl: {
			marginTop: '1em',
			margin: 'auto',
			width: '80%',
		},
	})
);

export default function MyModal(
	props: { title: string; description: string; children: any } & Omit<ModalProps, 'children'>
) {
	const classes = useModalStyles();
	const modalStyle = getModalStyle();
	const { title, description, open, onClose, children, ...rest } = props;

	return (
		<Modal
			open={open}
			onClose={onClose}
			{...rest}
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<div style={modalStyle} className={classes.paper}>
				<h2 id="modal-title">{title}</h2>
				<p id="modal-description">{description}</p>
				{children}
			</div>
		</Modal>
	);
}
