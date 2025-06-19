/** @jsxImportSource @emotion/react */


import React from 'react';
import { css } from '@emotion/react';
import { BacklinkFile } from 'api';
import FileTable from './FileTable';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Portal } from '@mui/material';

const badgeStyle = css`
    display: inline-block;
    padding: 0.35em 0.65em;
    font-size: .75em;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.375rem;
    background-color: RGBA(13, 110, 253, 1);
    color: white;
    margin-left: 0.5em;
`;

export function BootstrapBadge({ children, onClick = () => { } }: { children: React.ReactNode, onClick: (e: React.MouseEvent<HTMLSpanElement>) => void }) {
    return (
        <span className="badge bg-secondary" css={badgeStyle} onClick={onClick}>
            {children}
        </span>
    );
}

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