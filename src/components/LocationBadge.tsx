import React from 'react';
import { Location } from 'api';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import BootstrapBadge from './BootstrapBadge';

export default function LocationBadge({ locations }: { locations: Location[] }) {
    const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);

    return (
        <>
            <span onClick={(e) => {
                e.stopPropagation();
            }}>
                <Dialog
                    open={locationDialogOpen}
                    onClose={() => setLocationDialogOpen(false)}
                    maxWidth="md"
                    fullWidth={true}
                >
                    <DialogTitle>Location Data</DialogTitle>
                    <DialogContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '60%' }}>
                                        Address
                                    </TableCell>
                                    <TableCell sx={{ width: '40%' }}>
                                        Preview
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {locations.map((location, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ width: '60%' }}>
                                            {location.address}
                                        </TableCell>
                                        <TableCell sx={{ width: '40%' }}>
                                            <img src={`https://api.radar.io/maps/static?width=150&height=100&center=${location.coordinate}&zoom=13&style=radar-default-v1&scale=2&markers=color:0x000257|size:small|${location.coordinate}&publishableKey=prj_live_pk_3fda39c0ae6a9799bc98693e087d98816e92f6fd`} />
                                            <br/>
                                            {location.coordinate}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="text" onClick={() => setLocationDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                {locations.length > 0 ? <BootstrapBadge onClick={(e) => { e.stopPropagation(); setLocationDialogOpen(true); }}>
                    {locations.length} {locations.length === 1 ? 'location' : 'locations'}
                </BootstrapBadge> : null}
            </span>
        </>
    )
}