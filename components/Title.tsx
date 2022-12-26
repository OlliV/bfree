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
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import BatteryLevel from './BatteryLevel';
import { GlobalState, sensorNames, SensorType, useGlobalState } from '../lib/global';
import { TrainerMeasurements } from '../lib/measurements';

type Notification = {
	severity: AlertColor;
	icon?: React.ReactNode;
	permanent?: boolean; // can't be cleared with X, i.e. action is mandatory
	text: string;
};

const sxArrowEnabled = {
	'&:hover': {
		color: 'grey',
		cursor: 'pointer',
	},
};

const sxArrowDisabled = {
	visibility: 'hidden',
};

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function BackButton({ disable, onClick }: { disable: boolean; onClick?: (e?: React.MouseEvent<HTMLElement>) => void }) {
	return (
		<Typography sx={disable ? sxArrowDisabled : sxArrowEnabled} onClick={onClick}>
			&larr; &nbsp;
		</Typography>
	);
}

function getSmartTrainerWarns(smartTrainerStatus: null | TrainerMeasurements): Notification[] {
	const warns: Notification[] = [];

	if (!smartTrainerStatus) {
		return [
			{
				severity: 'error',
				permanent: true,
				text: 'Smart trainer not connected',
			},
		];
	}

	const { calStatus } = smartTrainerStatus;
	if (calStatus.powerCalRequired) {
		warns.push({ severity: 'warning', permanent: true, text: 'Trainer power calibration required' });
	}
	if (calStatus.resistanceCalRequired) {
		warns.push({ severity: 'warning', permanent: true, text: 'Trainer resistance calibration required' });
	}
	if (calStatus.userConfigRequired) {
		warns.push({ severity: 'warning', permanent: true, text: 'Trainer user configuration required' });
	}

	return warns;
}

const batteryPoweredSensors: SensorType[] = [
	'cycling_cadence',
	'cycling_power',
	'cycling_speed',
	'cycling_speed_and_cadence',
	'heart_rate',
	'smart_trainer',
];

function useBatteryLevelAlerts(): Notification[] {
	const sensors: [sensorType: string, battLevel: number][] = batteryPoweredSensors.map((sensorType) => [
		sensorType,
		useGlobalState(`batt_${sensorType}` as keyof GlobalState)[0], // eslint-disable-line react-hooks/rules-of-hooks
	]);

	const getIcon = (l: number) => <BatteryLevel batteryLevel={l} />;
	return sensors
		.filter(([_, battLevel]) => battLevel >= 0 && battLevel <= 20)
		.map(([sensorType, battLevel], i) => ({
			severity: 'warning',
			icon: getIcon(battLevel),
			text: `Low battery: ${sensorNames[sensorType]}`,
		}));
}

function Notifications() {
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
	const [clearedNotifications, setClearedNotifications] = useState<string[]>([]);
	const [smartTrainerStatus] = useGlobalState('smart_trainer');
	const batteryLevelAlerts = useBatteryLevelAlerts();
	const notifications: Notification[] = [...getSmartTrainerWarns(smartTrainerStatus), ...batteryLevelAlerts].filter(
		({ text }) => !clearedNotifications.includes(text)
	);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;

	return (
		<Box>
			<IconButton
				size="large"
				aria-label={`show ${notifications.length} new notifications`}
				color="inherit"
				onClick={handleClick}
			>
				<Badge badgeContent={notifications.length} color="error">
					<NotificationsIcon />
				</Badge>
			</IconButton>
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
					{notifications.length ? (
						notifications.map((msg, i) => (
							<Alert
								icon={msg.icon}
								severity={msg.severity}
								onClose={
									msg.permanent
										? undefined
										: () => setClearedNotifications([...clearedNotifications, msg.text])
								}
								key={`notification_${i}`}
							>
								{msg.text}
							</Alert>
						))
					) : (
						<Typography sx={{ p: 2 }}>No notifications</Typography>
					)}
				</Stack>
			</Popover>
		</Box>
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
		</Box>
	);
}
