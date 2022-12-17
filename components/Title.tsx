import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';

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
		// @ts-ignore
		<StyledTypography gutterBottom variant="h2" component="h2" className={className}>
			<span className={disableBack ? classes.arrowDisabled : classes.arrow} onClick={handleOnClick}>
				&larr;
			</span>
			&nbsp;{children}
		</StyledTypography>
	);
}
