import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { CardContent } from '@mui/material';

const PREFIX = 'MenuCard';
const classes = {
	menuCard: `${PREFIX}-menuCard`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`& .${classes.menuCard}`]: {
		'&:hover': {
			backgroundColor: 'lightgrey',
		},
	},
}));

export default function MenuCard({ title, href, children }: { title: string; href: string; children?: any }) {
	return (
		<StyledGrid item xs={12}>
			<Link href={href || '/'}>
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
			</Link>
		</StyledGrid>
	);
}
