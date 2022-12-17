import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import IconHeart from '@mui/icons-material/Favorite';
import IconPower from '@mui/icons-material/OfflineBolt';
import IconSpeed from '@mui/icons-material/Speed';
import SxPropsTheme from '../../lib/SxPropsTheme';

const PREFIX = 'ResistanceControl';
const classes = {
	root: `${PREFIX}-root`,
	thumb: `${PREFIX}-thumb`,
	active: `${PREFIX}-active`,
	valueLabel: `${PREFIX}-valueLabel`,
	markLabel: `${PREFIX}-markLabel`,
	track: `${PREFIX}-track`,
	rail: `${PREFIX}-rail`,
	resistanceControlCard: `${PREFIX}-resistanceControlCard`,
	resistanceControlSlider: `${PREFIX}-resistanceControlSlider`,
	inlineIcon: `${PREFIX}-inlineIcon`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`& .${classes.resistanceControlCard}`]: {
		height: '10em',
	},

	[`& .${classes.resistanceControlSlider}`]: {
		paddingTop: '3em',
	},

	[`& .${classes.inlineIcon}`]: {
		fontSize: '18px !important',
	},
}));

const iconStyle: SxPropsTheme = {
	fontSize: '18px !important',
};

export default function MeasurementColorCard({
	colors,
}: {
	colors: { heart_rate: string; power: string; speed: string };
}) {
	return (
		<StyledGrid item xs={4}>
			<Card variant="outlined">
				<Typography gutterBottom variant="h5" component="h2">
					Colors
				</Typography>
				<CardContent className={classes.resistanceControlCard}>
					<Container>
						<IconPower sx={{ ...iconStyle, color: colors.power }} />
						<IconSpeed sx={{ ...iconStyle, color: colors.speed }} />
						<IconHeart sx={{ ...iconStyle, color: colors.heart_rate }} />
					</Container>
				</CardContent>
			</Card>
		</StyledGrid>
	);
}
