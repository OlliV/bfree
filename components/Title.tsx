import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Theme } from '@mui/material/styles';
import {Box} from '@mui/system';
import BatteryLevel from './BatteryLevel';

const PREFIX = 'Title';
const classes = {
	arrow: `${PREFIX}-arrow`,
	arrowDisabled: `${PREFIX}-arrowDisabled`,
};

const StyledTypography = styled(Typography)(({ theme }) => ({
	[`& .${classes.arrow}`]: {
		'&:hover': {
			color: 'grey',
			cursor: 'pointer',
		},
	},

	[`& .${classes.arrowDisabled}`]: {
		visibility: 'hidden',
	},
}));

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function BackButton({disable, onClick }: { disable: boolean, onClick?: (e?: React.MouseEvent<HTMLElement>) => void }) {
	return (
		<StyledTypography>
			<span className={disable ? classes.arrowDisabled : classes.arrow} onClick={onClick}>
				&larr;
				&nbsp;
			</span>
		</StyledTypography>
	);
}

export default function Title({
	disableBack,
	href,
	className,
	children,
}: {
	disableBack?: boolean;
	href?: string;
	className?: string;
	children: any;
}) {
	const router = useRouter();

	const goBack = (e: React.MouseEvent<HTMLElement>) => {
		if (disableBack) {
			e.preventDefault();
		} else if (href) {
			router.push(href);
		} else {
			router.back();
		}
	};

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="fixed" elevation={0} sx={{ left: 0, width: '100vw' }}>
				<Toolbar >
					<BackButton disable={disableBack} onClick={goBack}/>
					<Typography
						variant="h6"
						noWrap
						component="div"
					>
						{children}
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<Box>
						{/*<BatteryLevel batteryLevel={-1}/>*/}
					</Box>
				</Toolbar>
			</AppBar>
			<Offset />
		</Box>
	);
}
