import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import IconDownload from '@mui/icons-material/GetApp';
import IconMoreVert from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MyHead from '../components/MyHead';
import MyModal from '../components/MyModal';
import Title from '../components/Title';
import EditActionButtons from '../components/EditActionButtons';
import downloadBlob from '../lib/download_blob';
import { createActivityLog, deleteActivityLog, getActivityLogs, saveActivityLog } from '../lib/activity_log';

const PREFIX = 'history';
const classes = {
	cardRoot: `${PREFIX}-cardRoot`,
	fab: `${PREFIX}-fab`,
	media: `${PREFIX}-media`,
	expand: `${PREFIX}-expand`,
	expandOpen: `${PREFIX}-expandOpen`,
	avatar: `${PREFIX}-avatar`,
	nameField: `${PREFIX}-nameField`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
	[`& .${classes.cardRoot}`]: {
		minWidth: 345,
		maxWidth: 345,
	},

	[`& .${classes.fab}`]: {
		display: 'flex',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginBottom: '2em',
		marginTop: '2em',
	},

	[`& .${classes.media}`]: {
		height: 0,
		paddingTop: '56.25%', // 16:9
	},

	[`& .${classes.expand}`]: {
		transform: 'rotate(0deg)',
		marginLeft: 'auto',
		transition: theme.transitions.create('transform', {
			duration: theme.transitions.duration.shortest,
		}),
	},

	[`& .${classes.expandOpen}`]: {
		transform: 'rotate(180deg)',
	},

	[`& .${classes.avatar}`]: {
		backgroundColor: red[500],
	},

	[`& .${classes.nameField}`]: {
		paddingBottom: '2.5em',
	},
}));

const editModalStyle = {
	width: '20em',
	height: '30em',
};

function EditModal({
	open,
	onClose,
	logger,
}: {
	open: boolean;
	onClose: () => void;
	logger: ReturnType<typeof createActivityLog>;
}) {
	const [newName, setNewName] = useState(() => logger.getName());
	const [newNotes, setNewNotes] = useState(() => logger.getNotes());

	const handleNameChange = (e) => {
		setNewName(e.target.value);
	};
	const handleNotesChange = (e) => {
		setNewNotes(e.target.value);
	};
	const onClickSave = () => {
		logger.setName(newName);
		logger.setNotes(newNotes);
		saveActivityLog(logger);
		onClose();
	};
	const onClickDiscard = (e: any) => {
		onClose();
	};

	return (
		<MyModal
			title="Edit Ride"
			description="Here you can edit the activity metadata."
			modalStyle={editModalStyle}
			open={open}
			onClose={onClose}
		>
			{open ? (
				<Grid item>
					<form onSubmit={onClickSave}>
						<TextField
							id="act-name"
							label="Activity Name"
							defaultValue={logger.getName()}
							onChange={handleNameChange}
							className={classes.nameField}
						/>
						<TextField
							id="act-notes"
							label="Notes"
							multiline
							rows={4}
							defaultValue={logger.getNotes()}
							onChange={handleNotesChange}
							variant="outlined"
						/>
						<EditActionButtons
							style={{ marginTop: 0 }}
							onClickSave={onClickSave}
							onClickDiscard={onClickDiscard}
						/>
					</form>
				</Grid>
			) : (
				''
			)}
		</MyModal>
	);
}

function RideCard({ log, onChange }: { log: ReturnType<typeof getActivityLogs>[1]; onChange: () => void }) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const name = log.logger.getName();
	const notes = log.logger.getNotes();

	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleEdit = () => {
		setAnchorEl(null);
		setShowEditModal(true);
	};
	const handleDelete = () => {
		setAnchorEl(null);
		deleteActivityLog(log.id);
		onChange();
	};
	const handleDownload = () => {
		const { logger } = log;
		const filename = `${logger.getStartTimeISO().slice(0, 10)}_${logger.getName()}.tcx`;
		const xmlLines: string[] = [];

		logger.tcx((line: string) => xmlLines.push(line));
		const blob = new Blob(xmlLines, { type: 'application/vnd.garmin.tcx+xml' });

		downloadBlob(blob, filename);
	};

	return (
		<Grid item xs={10}>
			<Card variant="outlined" className={classes.cardRoot}>
				<CardHeader
					avatar={
						<Avatar aria-label="recipe" className={classes.avatar}>
							{log.logger.getAvatar()}
						</Avatar>
					}
					action={
						<div>
							<IconButton aria-label="settings" onClick={handleMenuClick} size="large">
								<IconMoreVert />
							</IconButton>
							<Menu
								id={`edit-menu-${log.id}`}
								anchorEl={anchorEl}
								keepMounted
								open={!!anchorEl}
								onClose={handleClose}
							>
								<MenuItem onClick={handleEdit}>Edit</MenuItem>
								<MenuItem onClick={handleDelete}>Delete</MenuItem>
							</Menu>
						</div>
					}
					title={name}
					subheader={log.date}
				/>
				{/* Add preview here */}
				<CardContent>
					<Typography variant="body2" color="textSecondary" component="p">
						{notes}
					</Typography>
				</CardContent>
				<CardActions disableSpacing>
					<IconButton aria-label="download" onClick={handleDownload} size="large">
						<IconDownload />
					</IconButton>
				</CardActions>
			</Card>
			<EditModal open={showEditModal} onClose={() => setShowEditModal(false)} logger={log.logger} />
		</Grid>
	);
}

export default function History() {
	const router = useRouter();
	const [logs, setLogs] = useState(() => getActivityLogs());
	const handleChange = () => setLogs(getActivityLogs());

	useEffect(() => {
		setLogs(getActivityLogs());
	}, []);

	return (
		<StyledContainer maxWidth="sm">
			<MyHead title="Previous Rides" />
			<Box>
				<Title href="/">Previous Rides</Title>
				<p>Manage and export previous rides.</p>

				<Grid container direction="column" alignItems="center" spacing={2}>
					{logs.map((log) => (
						<RideCard log={log} onChange={handleChange} key={log.id} />
					))}
				</Grid>
			</Box>
		</StyledContainer>
	);
}
