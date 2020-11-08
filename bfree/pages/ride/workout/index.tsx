import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import IconAdd from '@material-ui/icons/Add';
import IconBike from '@material-ui/icons/DirectionsBike';
import IconButton from '@material-ui/core/IconButton';
import IconFavorite from '@material-ui/icons/Favorite';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconDownload from '@material-ui/icons/GetApp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from '../../../components/Head';
import Title from '../../../components/title';
import downloadBlob from '../../../lib/download_blob';
import { getWorkouts, getWorkoutDate, deleteWorkout } from '../../../lib/workout_storage';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			maxWidth: 345,
		},
		fab: {
			float: 'right',
			marginBottom: '2em',
			marginTop: '2em',
			marginRight: '8em',
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
	}),
);

function WorkoutCard({ workout, onChange }) {
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
		router.push(`/ride/workout/edit?id=${workout.id}`);
	};
	const handleDelete = () => {
		setAnchorEl(null);
		deleteWorkout(workout.id);
		onChange();
	};
	const handleDownload = () => {
		const notes = workout.notes.split('\n').map((s: string) => `// ${s}`).join('\n');
		const blob = new Blob([notes, '\n\n', workout.script], { type: 'text/javascript' });

		downloadBlob(blob, `${workout.name}.js`);
	};

	return (
		<Grid item xs={10}>
			<Card variant="outlined" className={classes.root}>
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
						  id={`edit-menu-${workout.id}`}
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
      		  title={workout.name}
      		  subheader={getWorkoutDate(workout)}
      		/>
			{/* Add preview here */}
			<CardContent>
				<Typography variant="body2" color="textSecondary" component="p">
					{workout.notes}
				</Typography>
			</CardContent>
			<CardActions disableSpacing>
				<IconButton aria-label="add to favorites">
					<IconFavorite />
				</IconButton>
				<IconButton aria-label="download">
					<IconDownload onClick={handleDownload} />
				</IconButton>
				<IconButton aria-label="Ride">
					<IconBike />
				</IconButton>
			</CardActions>
			</Card>
		</Grid>
	);
}

export default function Workout() {
	const classes = useStyles();
	const router = useRouter();
	const [workouts, setWorkouts] = useState(() => getWorkouts());
	const handleChange = () => setWorkouts(getWorkouts());

	// Get the workouts when we enter this page;
	// Otherwise we'd show stale data after an edit.
	// Interestingly there is a short delay
	useEffect(() => {
		setWorkouts(getWorkouts());
	}, []);

	return (
		<Container maxWidth="sm">
			<Head title="Workout" />
			<Box>
				<Title href="/ride">Workout</Title>
				<p>Create and execute scripted workouts.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					{
						workouts.map((w) => (<WorkoutCard workout={w} onChange={handleChange} key={w.id} />))
					}
				</Grid>
				<Fab color="primary" aria-label="add" className={classes.fab} onClick={() => router.push('/ride/workout/edit')}>
					<IconAdd />
				</Fab>
			</Box>
		</Container>
	);
}
