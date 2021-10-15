import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconCancel from '@material-ui/icons/Cancel';
import IconSave from '@material-ui/icons/Save';
import IconTimeLine from '@material-ui/icons/Timeline';

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
