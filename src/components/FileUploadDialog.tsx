import React from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ButtonGroup, Box } from '@mui/material';
import { apiUrl, dateFormat } from 'api';
import dayjs, { Dayjs } from 'dayjs';
import { enqueueSnackbar } from 'notistack';

export default function FileUploadDialog({ open, onClose, date }: { open: boolean, onClose: () => void, date: Dayjs }) {
    const [files, setFiles] = React.useState<File[]>([]);
    const [fileUploadMode, setFileUploadMode] = React.useState<'files' | 'folder'>('files');

    function upload() {
        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        formData.append("date", date.format(dateFormat));
		formData.append("type", fileUploadMode);
        fetch(apiUrl + "/files/upload", {
            method: "POST",
            body: formData
        }).then(response => response.text())
        .then(response => {
            if (response == "OK") {
                onClose();
            } else {
                enqueueSnackbar("The file upload operation was cancelled because of conflicting file names.", { variant: "error" });
            }
        });
    }
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogContent>
                <Box>
                    <ButtonGroup>
                        <Button variant={fileUploadMode === 'files' ? 'contained' : 'outlined'} onClick={() => setFileUploadMode('files')}>Files</Button>
                        <Button variant={fileUploadMode === 'folder' ? 'contained' : 'outlined'} onClick={() => setFileUploadMode('folder')}>Folder</Button>
                    </ButtonGroup>
                </Box>
                {fileUploadMode === 'files' ? (
                    <input style={{ marginTop: "10px" }} type="file" multiple onChange={handleChange}></input>
                ) : <input style={{ marginTop: "10px" }} type="file" webkitdirectory="" mozdirectory="" onChange={handleChange}></input>}
                
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => upload()}>Upload</Button>
            </DialogActions>
        </Dialog>
    )
}
