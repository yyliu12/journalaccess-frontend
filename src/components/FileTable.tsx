import { Button, Dialog, DialogActions, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BacklinkFile, ByDateApiResponse } from 'api';
import ViewFile from 'pages/ViewFile';
import React from 'react';
import { useNavigate } from 'react-router';
import { BacklinkBadge } from './BacklinkBadge';

export default function FileTable({ files, openInDialog = false, showBacklinks = false }: { files: ByDateApiResponse | BacklinkFile[] | null, openInDialog?: boolean, showBacklinks?: boolean }) {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = React.useState(-1);

    return (<>{files != null ?
        <>
            <Dialog
                fullScreen
                open={dialogOpen !== -1}
                onClose={() => setDialogOpen(-1)}
            >
                <DialogContent>
                    <ViewFile idProp={dialogOpen} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(-1)}>Close</Button>
                </DialogActions>
            </Dialog>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: "10%" }}>
                                <b>Id</b>
                            </TableCell>
                            <TableCell sx={{ width: "80%" }}>
                                <b>Path</b>
                            </TableCell>
                            <TableCell sx={{ width: "10%" }}>
                                {/* for actions buttons */}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((file) => (
                            <TableRow
                                key={file.id}
                                hover={true}
                                sx={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (openInDialog) {
                                        setDialogOpen(file.id);
                                        console.log("opening file in dialog", file.id);
                                        return;
                                    }
                                    navigate(`/file/${file.id}`);
                                }}
                            >
                                <TableCell sx={{ width: "10%" }}>{file.id}</TableCell>
                                <TableCell sx={{ width: "80%" }}>
                                    {file.path}
                                    {showBacklinks && file.hasOwnProperty('backlinks') ? <BacklinkBadge backlinks={(file as any).backlinks}/> : null}
                                </TableCell>
                                <TableCell sx={{ width: "10%" }}>
                                    {/* for actions buttons */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
        : <></>}</>
    );
}