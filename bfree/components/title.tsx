import { useRouter } from 'next/router'
import Typography from '@material-ui/core/Typography';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {Box} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	// TODO This doesn't always work
	createStyles({
		title: {
			marginLeft: '-2.5ex',
		},
		arrow: {
			'&:hover': {
				color: 'grey',
				cursor: 'pointer',
			},
		}
	}),
);

export default ({ children }: { children: any }) => {
	const classes = useStyles();
	const router = useRouter();
	const back = () => router.back();

	return (<Typography gutterBottom variant="h2" component="h2" className={classes.title}><span className={classes.arrow} onClick={back}>&larr;</span>&nbsp;{children}</Typography>);
}
