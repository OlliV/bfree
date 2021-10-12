import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconDownload from '@material-ui/icons/GetApp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from '../components/Head';
import Title from '../components/Title';
import downloadBlob from '../lib/download_blob';
import { getActivityLogs, deleteActivityLog } from '../lib/activity_log';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		cardRoot: {
			minWidth: 345,
			maxWidth: 345,
		},
		fab: {
			display: 'flex',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginBottom: '2em',
			marginTop: '2em',
		},
		media: {
			height: 0,
			paddingTop: '56.25%', // 16:9
		},
		expand: {
			transform: 'rotate(0deg)',
			marginLeft: 'auto',
			transition: theme.transitions.create('transform', {
				duration: theme.transitions.duration.shortest,
			}),
		},
		expandOpen: {
			transform: 'rotate(180deg)',
		},
		avatar: {
			backgroundColor: red[500],
		},
	})
);

function RideCard({ log, onChange }: { log: ReturnType<typeof getActivityLogs>[1]; onChange: () => void }) {
	const classes = useStyles();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleEdit = () => {
		setAnchorEl(null);
		//router.push(`/ride/workout/edit?id=${workout.id}`);
	};
	const handleDelete = () => {
		setAnchorEl(null);
		deleteActivityLog(log.id);
		onChange();
	};
	const handleDownload = () => {
		const { logger } = log;
		const filename = `${logger.getStartTimeISO().slice(0, 10)}_${log.name}.tcx`;
		const xmlLines: string[] = [];

		logger.tcx(log.name, log.notes, (line: string) => xmlLines.push(line));
		const blob = new Blob(xmlLines, { type: 'application/vnd.garmin.tcx+xml' });

		downloadBlob(blob, filename);
	};

	return (
		<Grid item xs={10}>
			<Card variant="outlined" className={classes.cardRoot}>
				<CardHeader
					avatar={
						<Avatar aria-label="recipe" className={classes.avatar}>
							R
						</Avatar>
					}
					action={
						<div>
							<IconButton aria-label="settings" onClick={handleMenuClick}>
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
					title={log.name}
					subheader={log.date}
				/>
				{/* Add preview here */}
				<CardContent>
					<Typography variant="body2" color="textSecondary" component="p">
						{log.notes}
					</Typography>
				</CardContent>
				<CardActions disableSpacing>
					<IconButton aria-label="download" onClick={handleDownload}>
						<IconDownload />
					</IconButton>
				</CardActions>
			</Card>
		</Grid>
	);
}

export default function History() {
	const classes = useStyles();
	const router = useRouter();
	const [logs, setLogs] = useState(() => getActivityLogs());
	const handleChange = () => setLogs(getActivityLogs());

	useEffect(() => {
		setLogs(getActivityLogs());
	}, []);

	return (
		<Container maxWidth="sm">
			<Head title="Previous Rides" />
			<Box>
				<Title href="/">Previous Rides</Title>
				<p>Manage and export previous rides.</p>

				<Grid container direction="column" alignItems="center" spacing={2}>
					{logs.map((log) => (
						<RideCard log={log} onChange={handleChange} key={log.id} />
					))}
				</Grid>
			</Box>
		</Container>
	);
}
