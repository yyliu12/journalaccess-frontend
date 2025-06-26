/* global $ */


import { Button, Dialog, DialogActions, DialogContent, FormControl, FormGroup, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Select, MenuItem } from '@mui/material';
import { SearchQuery, apiUrl, staticUrl } from 'api';
import React, { useEffect, useCallback } from 'react';
import { produce } from 'immer';



export default function SearchCreator({ onSearch, showSort = false }) {
    const [searchQuery, setSearchQuery] = React.useState(
        {
            query: '',
            sort: "score desc",
            tags: {
                tags: [],
                includeFolders: false,
                recursivelySearch: false,
                combiningTerm: 'AND',
            }
        }
    );


    const [tagDialogOpen, setTagDialogOpen] = React.useState(false);
    const hasJsTreeInitialized = React.useRef(false);
    const jsTree = React.useRef(null);
    const jsTreeInit = useCallback((jsTreeRef) => {
        console.log(jsTreeRef, hasJsTreeInitialized.current);
        if (hasJsTreeInitialized.current || !jsTreeRef) return;
        hasJsTreeInitialized.current = true;
        jsTree.current = jsTreeRef;
        initJsTree();
    }, []);

    function closeTagDialog() {
        hasJsTreeInitialized.current = false;
        setTagDialogOpen(false);
    }

    function triggerSearch() {
        onSearch(searchQuery);
    }

    function initJsTree() {
        $(jsTree.current).jstree({
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
            "plugins": ["wholerow", "types", "checkbox"],
            "checkbox": {
                "cascade": "",
                "three_state": false,
            },
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
    }




    return (
        <div>
            <Dialog
                open={tagDialogOpen}
                onClose={closeTagDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <div ref={jsTreeInit}></div>
                    <FormControl>
                        <FormLabel>Include Folders</FormLabel>
                        <RadioGroup row>
                            <FormControlLabel
                                control={<Radio />}
                                label="Yes"
                                checked={searchQuery.tags.includeFolders}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.includeFolders = true;
                                    }));
                                }}
                            />
                            <FormControlLabel
                                control={<Radio />}
                                label="No"
                                checked={!searchQuery.tags.includeFolders}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.includeFolders = false;
                                    }));
                                }}
                            />
                        </RadioGroup>
                        <FormLabel>Recursively Search</FormLabel>
                        <RadioGroup row>
                            <FormControlLabel
                                control={<Radio />}
                                label="Yes"
                                checked={searchQuery.tags.recursivelySearch}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.recursivelySearch = true;
                                    }));
                                }}
                            />
                            <FormControlLabel
                                control={<Radio />}
                                label="No"
                                checked={!searchQuery.tags.recursivelySearch}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.recursivelySearch = false;
                                    }));
                                }}
                            />
                        </RadioGroup>
                        <FormLabel>Combining Term</FormLabel>
                        <RadioGroup row>
                            <FormControlLabel
                                control={<Radio />}
                                label="AND"
                                checked={searchQuery.tags.combiningTerm === 'AND'}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.combiningTerm = 'AND';
                                    }));
                                }}
                            />
                            <FormControlLabel
                                control={<Radio />}
                                label="OR"
                                checked={searchQuery.tags.combiningTerm === 'OR'}
                                onChange={() => {
                                    setSearchQuery(produce(searchQuery, (draft) => {
                                        draft.tags.combiningTerm = 'OR';
                                    }));
                                }}
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => {
                        const selectedTags = $(jsTree.current).jstree(true).get_selected();
                        setSearchQuery(produce(searchQuery, (draft) => {
                            draft.tags.tags = selectedTags;
                        }));
                        closeTagDialog();
                    }}>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>

            <TextField
                variant="outlined"
                size="small"
                fullWidth
                label="Search query"
                value={searchQuery.query}
                onChange={(e) => {
                    setSearchQuery(produce(searchQuery, (draft) => {
                        draft.query = e.target.value;
                    }));
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        triggerSearch();
                    }
                }}
                sx={{ mb: 2 }}
            />

            <Button variant="text" onClick={() => setTagDialogOpen(true)}>
                Edit Tags
            </Button>
            {showSort ? <FormControl size="small">
                <Select value={searchQuery.sort} onChange={(e) => {
                    setSearchQuery(produce(searchQuery, (draft) => {
                        draft.sort = e.target.value;
                    }));
                }}>
                    <MenuItem value="score desc">Relevance</MenuItem>
                    <MenuItem value="date desc">Date Descending</MenuItem>
                    <MenuItem value="date asc">Date Ascending</MenuItem>
                </Select>
            </FormControl> : null}



            <Button variant="contained" onClick={triggerSearch}>
                Search
            </Button>
        </div>
    );
}