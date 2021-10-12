import { useRouter } from 'next/router';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	// TODO This doesn't always work
	createStyles({
		title: {
			//marginLeft: '-2.5ex',
		},
		arrow: {
			'&:hover': {
				color: 'grey',
				cursor: 'pointer',
			},
		},
		arrowDisabled: {
			visibility: 'hidden',
		},
	})
);

export default function Title({
	disableBack,
	href,
	children,
}: {
	disableBack?: boolean;
	href?: string;
	children: any;
}) {
	const classes = useStyles();
	const router = useRouter();
	const handleOnClick = (e) => {
		if (disableBack) {
			e.preventDefault();
		} else if (href) {
			router.push(href);
		} else {
			router.back();
		}
	};

	return (
		<Typography gutterBottom variant="h2" component="h2" className={classes.title}>
			<span className={disableBack ? classes.arrowDisabled : classes.arrow} onClick={handleOnClick}>
				&larr;
			</span>
			&nbsp;{children}
		</Typography>
	);
}
