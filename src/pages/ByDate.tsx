/** @jsxImportSource @emotion/react */


import { Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiUrl, ByDateApiResponse, dateFormat } from 'api';
import JournalDatePicker from 'components/JournalDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';
import { jsonToFormData } from 'utils';
import { css } from '@emotion/react';
import { useLocation, useNavigate, useParams } from 'react-router';
import FileUploadDialog from 'components/FileUploadDialog';
import FileTable from 'components/FileTable';

export default function ByDate() {
    const params = useParams();
    const navigate = useNavigate();


    const [files, setFiles] = React.useState<ByDateApiResponse | null>(null);
    const [datesWithFiles, setDatesWithFiles] = React.useState<Dayjs[]>([]);
    const [fileUploadDialogOpen, setFileUploadDialogOpen] = React.useState<boolean>(false);
    const [writeOnlineDialogOpen, setWriteOnlineDialogOpen] = React.useState<boolean>(false);
    const [writeOnlinePath, setWriteOnlinePath] = React.useState<string>("");

    let initDate: Dayjs = dayjs();
    if (params.date) {
        initDate = dayjs(params.date);
    } else {
        navigate(`/bydate/${initDate.format(dateFormat)}`);
    }

    const [date, setDate] = React.useState<Dayjs>(initDate);
    const [viewDate, setViewDate] = React.useState<Dayjs>(initDate);

    function refreshData() {
        fetch(apiUrl + "/files/byDate", {
            method: 'POST',
            body: jsonToFormData({
                "date": date.format(dateFormat)
            }),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            setFiles(data as ByDateApiResponse);
        });
    }

    useEffect(() => {
        refreshData();
    }, [viewDate]);

    function search() {
        setViewDate(date);
    }

    // race conditions may occur here because setState is async
    function prev() {
        navigate(`/bydate/${viewDate.subtract(1, 'day').format(dateFormat)}`);
        setViewDate(viewDate.subtract(1, 'day'));
        setDate(viewDate.subtract(1, 'day'));
    }

    function next() {
        navigate(`/bydate/${viewDate.add(1, 'day').format(dateFormat)}`);
        setViewDate(viewDate.add(1, 'day'));
        setDate(viewDate.add(1, 'day'));
    }

    function today() {
        navigate(`/bydate/${dayjs().format(dateFormat)}`);
        setViewDate(dayjs());
        setDate(dayjs());
    }

    function initWriteOnline() {
        fetch(`${apiUrl}/onlineEditor/init`, {
            method: "POST",
            body: jsonToFormData({
                date: date.format(dateFormat),
                path: writeOnlinePath
            })
        }).then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    navigate(`/file/${data}/6`);
                }
            });
    }


    return (
        <Container>
            <FileUploadDialog open={fileUploadDialogOpen} onClose={() => {setFileUploadDialogOpen(false); refreshData();}} date={date} />
            <Dialog open={writeOnlineDialogOpen} onClose={() => setWriteOnlineDialogOpen(false)}>
                <DialogTitle>Write Online</DialogTitle>
                <DialogContent>
                    <Typography>
                        To get started, enter a name for the document.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Document Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={writeOnlinePath}
                        onChange={(e) => setWriteOnlinePath(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWriteOnlineDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                        initWriteOnline();
                        setWriteOnlineDialogOpen(false);
                    }}>Create</Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={2}>
                <Grid size={3}>
                    <Card>
                        <CardContent>
                            <JournalDatePicker onEnter={search} date={date} setDate={setDate} />
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button sx={{ mt: 1, mb: 3 }} onClick={search} variant="contained">Search</Button>
                            </Box>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <Button variant="outlined" size="small" onClick={prev}>Prev</Button>
                                <Button variant="outlined" size="small" onClick={today}>Today</Button>
                                <Button variant="outlined" size="small" onClick={next}>Next</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Button variant="outlined" sx={{ display: "block" }} onClick={() => {
                                setFileUploadDialogOpen(true);
                                refreshData();
                            }}>
                                Upload Files
                            </Button>
                            <Button variant="outlined" sx={{ display: "block", mt: 1 }} onClick={(() => {
                                setWriteOnlineDialogOpen(true);
                            })}>Write Online</Button>
                        </CardContent>

                    </Card>

                </Grid>
                <Grid size={9}>
                    <FileTable files={files} showBacklinks={true} openInDialog={true} />
                </Grid>
            </Grid>
        </Container>

    );
}