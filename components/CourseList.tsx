import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import IconDelete from '@mui/icons-material/Delete';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

function renderRow(props: ListChildComponentProps) {
	const { index, style } = props;

	return (
		<ListItem
			style={style}
			key={index}
			component="div"
			disablePadding
			secondaryAction={
				<IconButton edge="end" aria-label="delete">
					<IconDelete />
				</IconButton>
			}
		>
			<ListItemButton>
				<ListItemText primary={`Item ${index + 1}`} />
			</ListItemButton>
		</ListItem>
	);
}

export default function CourseList({ height }: { height: string }) {
	return (
		<Box sx={{ width: '100%', height, maxWidth: 360, bgcolor: 'background.paper' }}>
			<AutoSizer>
				{(size: Size) => (
					<FixedSizeList
						height={size.height}
						width={size.width}
						itemSize={46}
						itemCount={200}
						overscanCount={5}
					>
						{renderRow}
					</FixedSizeList>
				)}
			</AutoSizer>
		</Box>
	);
}
