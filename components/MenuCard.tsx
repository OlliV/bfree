import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { CardContent } from '@mui/material';
import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

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
