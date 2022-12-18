import BottomNavigation from '@mui/material/BottomNavigation';
import Box from '@mui/material/Box';
import { ReactNode } from 'react';

export default function StartButton({ children }: { children?: ReactNode }) {
	return (
		<Box>
			<BottomNavigation showLabels sx={{ position: 'fixed', left: 0, bottom: 0, width: '100vw' }}>
				{children}
			</BottomNavigation>
		</Box>
	);
}
