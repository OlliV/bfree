import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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

export default function StartButton({ disabled, href }: { disabled?: boolean; href: string }) {
	const classes = useStyles();

	const handleOnClick = (e) => {
		if (disabled) {
			e.preventDefault();
		}
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
		</Grid>
	);
}
