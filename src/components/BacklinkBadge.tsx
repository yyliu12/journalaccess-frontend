import React from 'react';
import { BacklinkFile } from 'api';
import FileTable from './FileTable';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Portal } from '@mui/material';
import BootstrapBadge from './BootstrapBadge';


export function BacklinkBadge({ backlinks }: { backlinks: BacklinkFile[] }) {
    const [backlinkDialogOpen, setBacklinkDialogOpen] = React.useState(false);

    return (
        <>
            <span onClick={(e) => {
                e.stopPropagation();
            }}>
                <Dialog
                    open={backlinkDialogOpen}
                    onClose={() => setBacklinkDialogOpen(false)}
                    maxWidth="md"
                    fullWidth={true}
                >
                    <DialogTitle>Backlinks</DialogTitle>
                    <DialogContent>
                        <FileTable files={backlinks} openInDialog={true} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="text" onClick={() => setBacklinkDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                {backlinks.length > 0 ? <BootstrapBadge onClick={(e) => { e.stopPropagation(); setBacklinkDialogOpen(true); }}>
                    {backlinks.length} {backlinks.length === 1 ? 'backlink' : 'backlinks'}
                </BootstrapBadge> : null}
            </span>
        </>
    )
}