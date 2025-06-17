/* global $ */

import React, { useState } from 'react';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { Button, Checkbox, Container, Dialog, DialogTitle, DialogContent, Grid, TextField, DialogActions, FormGroup, FormControl, FormControlLabel } from '@mui/material';
import { apiUrl, FileApiResponse, staticUrl, Tag } from 'api';
import { jsonToFormData } from 'utils';
import { useTree } from "@headless-tree/react";
import { asyncDataLoaderFeature, selectionFeature, TreeState } from "@headless-tree/core";
import { useEffect } from 'react';



export default function Tags() {
    const jsTreeRef = React.useRef(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [action, setAction] = useState("");

    const [tagName, setTagName] = useState("");
    const [tagFullName, setTagFullName] = useState("");
    const [tagFolder, setTagFolder] = useState(false);



    useEffect(() => {
        $(jsTreeRef.current).jstree({
            'core': {
                'data': {
                    'url': `${apiUrl}/tags/getByFolder`,
                    'data': function (node) {
                        return { 'id': node.id };
                    }
                },
                'themes': {
                    'responsive': false
                },
                'check_callback': true
            },
            "plugins": ["wholerow", "types", "dnd"],
            "types": {
                "#": {},
                "tag": {
                    "icon": staticUrl + "/images/tag.png",
                },
                "folder": {
                    "icon": staticUrl + "/images/folder.png",
                }
            }
        });

        $(jsTreeRef.current).bind("move_node.jstree", function (e, data) {
            fetch(`${apiUrl}/tags/move`, {
                method: 'POST',
                body: new jsonToFormData({
                    'id': data.node.id,
                    'parent': data.parent
                }),
            });
        });



    });

    async function fetchData(parentId) {
        return fetch(`${apiUrl}/tags/getByFolder`, {
            method: 'POST',
            body: jsonToFormData({
                "folder": parentId ? parentId : -1
            })
        }).then((response) => {
            return response.json();
        }).then((data) => {
        })
    }

    function handleSaveTag() {
        if (action === "create") {
            fetch(`${apiUrl}/tags/create`, {
                method: 'POST',
                body: jsonToFormData({
                    tag: JSON.stringify({
                        'name': tagName,
                        'fullName': tagFullName,
                        'container': tagFolder ? 1 : 0,
                        'folder': $(jsTreeRef.current).jstree(true).get_selected()[0] || -1,
                    })
                }),
            }).then(() => {
                $(jsTreeRef.current).jstree(true).refresh();
                setEditModalOpen(false);
            });
        }
        if (action === "edit") {
            fetch(`${apiUrl}/tags/save`, {
                method: 'POST',
                body: jsonToFormData({
                    tag: JSON.stringify({
                        'id': $(jsTreeRef.current).jstree(true).get_selected()[0],
                        'name': tagName,
                        'fullName': tagFullName,
                        'container': tagFolder ? 1 : 0
                    })
                }),
            }).then(() => {
                $(jsTreeRef.current).jstree(true).refresh();
                setEditModalOpen(false);
            });
        }
    }

    function handleDeleteTag() {
        const selectedId = $(jsTreeRef.current).jstree(true).get_selected()[0];
        if (selectedId) {
            fetch(`${apiUrl}/tags/delete`, {
                method: 'POST',
                body: jsonToFormData({ 'id': selectedId }),
            }).then(() => {
                $(jsTreeRef.current).jstree(true).refresh();
                setDeleteModalOpen(false);
            });
        }
    }


    function loadEditingData() {
        const selectedId = $(jsTreeRef.current).jstree(true).get_selected()[0];
        if (selectedId) {
            fetch(`${apiUrl}/tags/get`, {
                method: 'POST',
                body: jsonToFormData({ 'id': selectedId }),
            }).then((response) => response.json())
                .then((data) => {
                    setTagName(data.name);
                    setTagFullName(data.fullName);
                    setTagFolder(data.container === 1);
                });
        }
    }

    return (
        <Container>
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <DialogTitle>Tag Editor</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Full Name"
                        value={tagFullName}
                        onChange={(e) => setTagFullName(e.target.value)}
                        fullWidth
                        sx={{ mt: 1, mb: 1 }}
                    />
                    <FormGroup>
                        <FormControlLabel control={<Checkbox
                            checked={tagFolder}
                            onChange={(e) => setTagFolder(e.target.checked)}
                        />}
                            label="Folder"
                        />
                    </FormGroup>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTag}>Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle>Delete Tag</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this tag?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteTag}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={2}>
                <Grid size={3}>
                    <Button sx={{ ml: 2 }} variant="contained" color="primary" onClick={() => {
                        setAction("create");
                        setEditModalOpen(true);
                    }}>New</Button>
                    <Button sx={{ ml: 2 }} variant="contained" color="primary" onClick={() => {
                        setAction("edit");
                        setEditModalOpen(true);
                        loadEditingData();
                    }}>Edit</Button>
                    <Button sx={{ ml: 2 }} variant="contained" color="error" onClick={() => {
                        setDeleteModalOpen(true);
                    }}>Delete</Button>
                </Grid>
                <Grid size={9}>
                    <div ref={jsTreeRef}></div>
                </Grid>


            </Grid>
        </Container>
    );
}

