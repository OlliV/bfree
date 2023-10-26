import InputLabel from '@mui/material/InputLabel';
import { OverridableStringUnion } from '@mui/types';
import Button, { ButtonPropsColorOverrides } from '@mui/material/Button';
import { ChangeEvent, ReactNode, useRef } from 'react';

export default function ImportFileButton({
	children,
	onFile,
	color,
}: {
	children?: ReactNode | ReactNode[];
	onFile: (file: File) => void;
	color?: OverridableStringUnion<
		'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
		ButtonPropsColorOverrides
	>;
}) {
	const uploadInputRef = useRef<HTMLInputElement | null>(null);

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		onFile(e.target.files[0]);
	};

	return (
		<InputLabel htmlFor="import-file" hidden>
			<input ref={uploadInputRef} id="import-file" name="import-file" type="file" onChange={onChange} hidden />
			<Button color={color || 'secondary'} variant="contained" component="span">
				{children}
			</Button>
		</InputLabel>
	);
}
