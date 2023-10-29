import { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';

export default function CreateCourseDialog({ newCourse }: { newCourse: (name: string, file: File) => void}) {
	const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleCreate = () => {
    newCourse("", uploadInputRef.current?.files[0] || null);
	setOpen(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
		New Course
      </Button>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>New Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
			To create a new course, please complete this form.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Course Name"
            fullWidth
            variant="standard"
          />
		<InputLabel htmlFor="import-file" hidden>
			<input
				ref={uploadInputRef}
				id="import-file"
				name="import-file"
				type="file"
			/>
			GPX
		</InputLabel>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
