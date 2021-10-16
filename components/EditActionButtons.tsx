import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import IconCancel from '@mui/icons-material/Cancel';
import IconSave from '@mui/icons-material/Save';
import IconTimeLine from '@mui/icons-material/Timeline';

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		actions: {
			'& > *': {
				boxShadow: 'none',
				margin: theme.spacing(1),
			},
			marginRight: '-2em',
			marginTop: '-3.8em',
			marginBottom: '1em',
			textAlign: 'right',
		},
	})
);

export default function EditActionButtons({
	style,
	onClickSave,
	onClickDiscard,
	onClickPreview,
}: {
	style?: any;
	onClickSave?: (e: any) => void;
	onClickDiscard?: (e: any) => void;
	onClickPreview?: (e: any) => void;
}) {
	const classes = useStyles();

	return (
		<Container style={style || {}} className={classes.actions}>
			{onClickSave ? (
				<Fab size="small" color="primary" aria-label="save" onClick={onClickSave}>
					<IconSave />
				</Fab>
			) : (
				''
			)}
			{onClickDiscard ? (
				<Fab size="small" color="secondary" aria-label="discard" onClick={onClickDiscard}>
					<IconCancel />
				</Fab>
			) : (
				''
			)}
			{onClickPreview ? (
				<Fab size="small" variant="extended" aria-label="preview" onClick={onClickPreview}>
					<IconTimeLine />
					Preview
				</Fab>
			) : (
				''
			)}
		</Container>
	);
}
