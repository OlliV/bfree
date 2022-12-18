import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { AlertColor } from '@mui/material/Alert';
import { TrainerMeasurements } from '../lib/measurements';
import { styled } from '@mui/material/styles';
import { useGlobalState } from '../lib/global';
import { useRouter } from 'next/router';

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

function BackButton({ disable, onClick }: { disable: boolean; onClick?: (e?: React.MouseEvent<HTMLElement>) => void }) {
	return (
		<StyledTypography>
			<span className={disable ? classes.arrowDisabled : classes.arrow} onClick={onClick}>
				&larr; &nbsp;
			</span>
		</StyledTypography>
	);
}

function getSmartTrainerWarns(smartTrainerStatus: null | TrainerMeasurements): [AlertColor, string][] {
	const warns: [AlertColor, string][] = [];

	const { calStatus } = smartTrainerStatus || ({ calStatus: {} } as TrainerMeasurements);
	if (calStatus.powerCalRequired) {
		warns.push(['warning', 'Trainer power calibration required']);
	}
	if (calStatus.resistanceCalRequired) {
		warns.push(['warning', 'Trainer resistance calibration required']);
	}
	if (calStatus.userConfigRequired) {
		warns.push(['warning', 'Trainer user configuration required']);
	}

	return warns;
}

function Notifications() {
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
	const [smartTrainerStatus] = useGlobalState('smart_trainer');
	const notifications: [AlertColor, string][] = [];

	notifications.push(...getSmartTrainerWarns(smartTrainerStatus));

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;

	return (
		<IconButton size="large" aria-label={`show ${notifications.length} new notifications`} color="inherit">
			<Badge badgeContent={notifications.length} color="error" onClick={handleClick}>
				<NotificationsIcon />
			</Badge>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<Stack sx={{ width: '100%' }} spacing={1}>
					{notifications.map(([s, v], i) => (
						<Alert severity={s} key={`notification_${i}`}>
							{v}
						</Alert>
					))}
				</Stack>
			</Popover>
		</IconButton>
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
				<Toolbar>
					<BackButton disable={disableBack} onClick={goBack} />
					<Typography variant="h6" noWrap component="div">
						{children}
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<Box>
						<Notifications />
					</Box>
				</Toolbar>
			</AppBar>
			<Offset />
		</Box>
	);
}
