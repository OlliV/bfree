import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import { CardContent } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		menuCard: {
			'&:hover': {
				backgroundColor: 'lightgrey',
			},
		},
	})
);

export default function MenuCard({ title, href, children }: { title: string; href: string; children?: any }) {
	const classes = useStyles();

	return (
		<Grid item xs={12}>
			<Link href={href || '/'}>
				<a>
					<Card variant="outlined" className={classes.menuCard}>
						<CardContent>
							<Typography gutterBottom variant="h5" component="h2">
								{title}&nbsp;&rarr;
							</Typography>
							<Typography variant="body2" color="textSecondary" component="p">
								{children || ''}
							</Typography>
						</CardContent>
					</Card>
				</a>
			</Link>
		</Grid>
	);
}
