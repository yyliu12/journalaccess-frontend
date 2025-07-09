/** @jsxImportSource @emotion/react */


import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Paper,
    Radio,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiUrl, Backlink, dateFormat, FileApiResponse, SearchApiResponseFile, Tag } from 'api';
import { getUrlForFile, jsonToFormData } from 'utils';
import { css } from '@emotion/react';
import { produce } from 'immer';
import { enqueueSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Location } from 'api';
import AsyncSelect from 'react-select/async';
import { MultiSelect, MultiSelectChangeEvent, MultiSelectFilterChangeEvent } from '@progress/kendo-react-dropdowns';
import BackButton from 'components/BackButton';
import SaveButton from 'components/SaveButton';
import OnlineEditor from './OnlineEditor';
import JournalDatePicker from 'components/JournalDatePicker';

const iframeStyle = css`
    width: 100%;
    height: 80vh;
    border: none;
`;

const textareaStyle = css`
    width: 60%;
    height: 40vh;
    margin-left: auto;
    margin-right: auto;
    display: block;
`;

const drawerWidth = 240;



function ViewPane({ file }: { file: FileApiResponse }) {
    return (
        <iframe css={iframeStyle} src={getUrlForFile(file)} />
    );
}
// for PDFs only
function AnnotatorPane({ file }: { file: FileApiResponse }) {
    return (
        <iframe css={iframeStyle} src={`${apiUrl}/annotation/getEditor/byId/${file.id}`} />
    );
}


function EditTextPane({ file, setFile, editsPending }: { file: FileApiResponse, setFile: (file: FileApiResponse | null) => void, editsPending: React.RefObject<boolean> }) {
    const [localContent, setLocalContent] = React.useState(file.content);

    const handleSave = () => {
        setFile(produce(file, draft => {
            draft.content = localContent;
        }));
    };
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(event.target.value);
        editsPending.current = true;
    };
    return (
        <Box>
            <textarea css={textareaStyle} value={localContent} onChange={handleChange} />
            <SaveButton onClick={handleSave} />
        </Box>
    );
}

function EditDatePane({ file, setFile, editsPending }: { file: FileApiResponse, setFile: (file: FileApiResponse | null) => void, editsPending: React.RefObject<boolean> }) {
    const [localDate, setLocalDate] = React.useState<Dayjs>(dayjs(file.date));

    const handleSave = () => {
        setFile(produce(file, draft => {
            draft.date = localDate.format(dateFormat);
        }));
    };
    const handleChange = (date: Dayjs | null) => {
        if (date == null) { return; }
        setLocalDate(date);
        editsPending.current = true;
    };
    return (
        <Box>
            <DatePicker onChange={handleChange} value={localDate} />
            <SaveButton onClick={handleSave} />
        </Box>
    );
}

function LocationPane({ file, setFile, editsPending }: { file: FileApiResponse, setFile: (file: FileApiResponse | null) => void, editsPending: React.RefObject<boolean> }) {
    const [localLocation, setLocalLocation] = React.useState<Location[]>(file.locations);
    const [locationSearchQuery, setLocationSearchQuery] = React.useState<string>("");
    const [locationSearchResults, setLocationSearchResults] = React.useState<Location[]>([]);
    const [selectedLocationIndex, setSelectedLocationIndex] = React.useState<number>(-1);
    const [finalLocationCoordinates, setFinalLocationCoordinates] = React.useState<string>("");
    const [finalLocationAddress, setFinalLocationAddress] = React.useState<string>("");
    const [manuallyEnteringLocation, setManuallyEnteringLocation] = React.useState<boolean>(false);

    const [currentlyEditingLocation, setCurrentlyEditingLocation] = React.useState<number>(-1);

    const handleSave = () => {
        setFile(produce(file, draft => {
            draft.locations = localLocation;
        }));
    };

    function removeLocation(index: number) {
        setLocalLocation(produce(localLocation, draft => {
            draft.splice(index, 1);
        }));
        editsPending.current = true;
    }

    function searchForLocations() {
        fetch(`${apiUrl}/mapping/search`, {
            method: 'POST',
            body: jsonToFormData({
                "query": locationSearchQuery
            })
        })
            .then((response) => response.json())
            .then((data) => {
                setLocationSearchResults(data);
                setSelectedLocationIndex(-1);
            });
    }

    function selectLocation(index: number) {
        setFinalLocationAddress(locationSearchResults[index].address);
        setFinalLocationCoordinates(locationSearchResults[index].coordinate);
        setSelectedLocationIndex(index);
    }

    function addLocation() {
        if (!finalLocationCoordinates.includes(", ")) {
            enqueueSnackbar("Coordinates must be in the format 'latitude, longitude,' with a space and comma in between.", { variant: "error" });
            return;
        }

        setLocalLocation(produce(localLocation, draft => {
            draft.push({
                coordinate: finalLocationCoordinates,
                address: finalLocationAddress
            });
        }));

        setManuallyEnteringLocation(false);
        setFinalLocationCoordinates("");
        setFinalLocationAddress("");
        setSelectedLocationIndex(-1);
        setLocationSearchQuery("");
        setLocationSearchResults([]);
        editsPending.current = true;
    }

    function handleEditLocationAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
        setLocalLocation(produce(localLocation, draft => {
            draft[currentlyEditingLocation].address = event.target.value;
        }));
        editsPending.current = true;
    }

    function handleEditLocationCoordinatesChange(event: React.ChangeEvent<HTMLInputElement>) {
        setLocalLocation(produce(localLocation, draft => {
            draft[currentlyEditingLocation].coordinate = event.target.value;
        }));
        editsPending.current = true;
    }

    return (
        <Box>
            <Dialog open={currentlyEditingLocation != -1}>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Address"
                        value={localLocation[currentlyEditingLocation]?.address || ""}
                        onChange={handleEditLocationAddressChange}
                        sx={{mt: 2}}
                    />
                    <TextField
                        fullWidth
                        label="Coordinates"
                        value={localLocation[currentlyEditingLocation]?.coordinate || ""}
                        onChange={handleEditLocationCoordinatesChange}
                        sx={{mt: 2}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCurrentlyEditingLocation(-1)}>Close</Button>
                </DialogActions>
            </Dialog>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: "20%" }}><b>Coordinates</b></TableCell>
                            <TableCell sx={{ width: "65%" }}><b>Address</b></TableCell>
                            <TableCell sx={{ width: "15%" }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localLocation.map((location, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ width: "20%" }}>{location.coordinate}</TableCell>
                                <TableCell sx={{ width: "65%" }}>{location.address}</TableCell>
                                <TableCell sx={{ width: "15%" }}>
                                    <IconButton
                                        color="error"
                                        onClick={() => { removeLocation(index) }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setCurrentlyEditingLocation(index);
                                        }}
                                    >
                                        <CreateIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography sx={{ mt: 2, mb: 2 }} variant="body1" component="div">
                Add a location by searching for an address below.
            </Typography>
            <TextField
                value={locationSearchQuery}
                fullWidth
                id="outlined-basic"
                label="Search for locations..."
                variant="outlined"
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { searchForLocations(); } }}
            />

            <Box>
                <CssBaseline />
                <Button sx={{ mt: 1 }} onClick={searchForLocations} variant="contained">
                    Search
                </Button>
                <Button variant="text" sx={{ ml: 1, mt: 1 }} onClick={() => { setManuallyEnteringLocation(!manuallyEnteringLocation) }}>
                    Manually Enter Location
                </Button>
            </Box>


            <List sx={{ mt: 1 }}>
                {locationSearchResults.map((location, index) => (
                    <ListItem key={index}>
                        <ListItemButton onClick={() => { selectLocation(index) }}>
                            <ListItemIcon>
                                <Radio
                                    checked={selectedLocationIndex === index}
                                    onChange={() => selectLocation(index)}
                                />
                            </ListItemIcon>
                            <Box>
                                <Typography variant="body1">{location.coordinate}</Typography>
                                <Typography variant="body2">{location.address}</Typography>
                            </Box>
                        </ListItemButton>

                    </ListItem>
                ))}
            </List>

            {locationSearchResults.length > 0 || manuallyEnteringLocation ? (
                <>
                    <TextField fullWidth label="Address" value={finalLocationAddress} onChange={(e) => setFinalLocationAddress(e.target.value)} />
                    <TextField sx={{ mt: 1 }} fullWidth label="Coordinates" value={finalLocationCoordinates} onChange={(e) => setFinalLocationCoordinates(e.target.value)} />
                    <Button sx={{ mt: 1 }} variant="contained" onClick={addLocation}>
                        Add Location
                    </Button>
                </>
            ) : null}





            <Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ display: "block", marginLeft: "auto", mt: 3 }}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
}

const debounce = (callback: any, wait: number) => {
    let timeoutId: number | undefined = undefined;
    return (...args: any) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}

type Option = {
    value: number;
    label: string;
}

function convertTagsToOptions(tags: Tag[]) {
    return tags.map(tag => ({
        value: tag.id,
        label: tag.text
    }));
}

function TagsPane({ file, setFile, editsPending }: { file: FileApiResponse, setFile: (file: FileApiResponse | null) => void, editsPending: React.RefObject<boolean> }) {
    const [optionsAvailable, setOptionsAvailable] = React.useState<Option[]>([]);
    const [optionsSelected, setOptionsSelected] = React.useState<Option[]>([]);

    useEffect(() => {
        if (file.tags.length === 0) {
            return;
        }
        fetch(`${apiUrl}/tags/getByIds`, {
            method: "POST",
            body: jsonToFormData({
                tags: JSON.stringify(file.tags)
            })
        })
            .then((response) => response.json())
            .then((data) => {
                setOptionsSelected(convertTagsToOptions(data));
            });
    }, []);

    function filter(e: MultiSelectFilterChangeEvent) {
        console.log("filtering!!!");
        if (e.filter.value === "") {
            setOptionsAvailable([]);
            return;
        }
        fetch(`${apiUrl}/tags/search`, {
            method: 'POST',
            body: jsonToFormData({
                "query": e.filter.value
            })
        })
            .then((response) => response.json())
            .then((data) => {
                setOptionsAvailable(convertTagsToOptions(data));
                console.log("options available", convertTagsToOptions(data));
            });
    }

    function save() {
        setFile(produce(file, draft => {
            draft.tags = optionsSelected.map(option => option.value);
        }));
    }

    return (
        <>
            <MultiSelect
                data={optionsAvailable}
                value={optionsSelected}
                onChange={(event: MultiSelectChangeEvent) => {
                    setOptionsSelected(event.target.value);
                }}
                onFilterChange={debounce(filter, 250)}
                textField="label"
                dataItemKey="value"
                filterable={true}
            />
            <SaveButton onClick={save} />
        </>
    );

}

function DeletePane({ file, setFile, editsPending }: { file: FileApiResponse, setFile: (file: FileApiResponse | null) => void, editsPending: React.RefObject<boolean> }) {
    const navigate = useNavigate();
    const handleDelete = () => {
        fetch(`${apiUrl}/files/delete`, {
            method: 'POST',
            body: jsonToFormData({
                "id": file.id
            })
        }).then((response) => {
            if (response.ok) {
                navigate(`/bydate/${file.date}`);
            } else {
            }
        });
    }

    return (
        <Button variant="contained" color="error" onClick={(handleDelete)}>
            Delete File
        </Button>
    );
}


function BacklinksPane({ file }: { file: FileApiResponse }) {
    const [backlinkData, setBacklinkData] = React.useState<Backlink[]>([]);
    const [journalSearchDate, setJournalSearchDate] = React.useState<Dayjs>(dayjs());
    const [filesSearchResults, setFilesSearchResults] = React.useState<SearchApiResponseFile[]>([]);


    function get_data() {
        if (file.id) {
            fetch(`${apiUrl}/backlinks/get`, {
                method: 'POST',
                body: jsonToFormData({
                    "id": file.id
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    setBacklinkData(data);
                });
        }
    }

    useEffect(() => {
        get_data();
    }, []);



    function handleDelete(id: number) {
        fetch(`${apiUrl}/backlinks/delete`, {
            method: 'POST',
            body: jsonToFormData({
                "id": id
            })
        }).then((response) => {
            if (response.ok) {
                setBacklinkData(backlinkData.filter(backlink => backlink.id !== id));
                enqueueSnackbar("Backlink deleted successfully.", { variant: "success" });
            }
        });
    }

    function search() {
        fetch(`${apiUrl}/files/byDate`, {
            method: 'POST',
            body: jsonToFormData({
                "date": journalSearchDate.format(dateFormat)
            })
        })
            .then((response) => response.json())
            .then((data) => {
                setFilesSearchResults(data);
            });

    }

    function addBacklink(toId: number) {
        fetch(`${apiUrl}/backlinks/create`, {
            method: 'POST',
            body: jsonToFormData({
                "from": file.id,
                "to": toId
            })
        }).then((response) => {
            if (response.ok) {
                get_data();
            }
        });

        setFilesSearchResults([]);
    }


    return (
        <>

            <Table component={Paper}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: "10%" }}><b>To Id</b></TableCell>
                        <TableCell sx={{ width: "35%" }}><b>To Date</b></TableCell>
                        <TableCell sx={{ width: "35%" }}><b>To Path</b></TableCell>
                        <TableCell sx={{ width: "20%" }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {backlinkData.map((backlink, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ width: "10%" }}>{backlink.to}</TableCell>
                            <TableCell sx={{ width: "35%" }}>{backlink.toFile.date}</TableCell>
                            <TableCell sx={{ width: "35%" }}>{backlink.toFile.path}</TableCell>
                            <TableCell sx={{ width: "20%" }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        handleDelete(backlink.id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h6">Add Backlink</Typography>

                    <JournalDatePicker date={journalSearchDate} setDate={setJournalSearchDate} />
                    <Box sx={{mt: 2}}><Button variant="contained" onClick={search}>Search</Button></Box>

                    {filesSearchResults.length > 0 ? (
                        <TableContainer sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "10%" }}><b>Id</b></TableCell>
                                        <TableCell sx={{ width: "70%" }}><b>Path</b></TableCell>
                                        <TableCell sx={{ width: "20%" }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filesSearchResults.map((fileSearch, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ width: "10%" }}>{fileSearch.id}</TableCell>
                                            <TableCell sx={{ width: "70%" }}>{fileSearch.path}</TableCell>
                                            <TableCell sx={{ width: "20%" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        addBacklink(fileSearch.id);
                                                        enqueueSnackbar("Backlink added successfully.", { variant: "success" });
                                                    }}
                                                >
                                                    Add Backlink
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : null}
                </CardContent>
            </Card>



        </>
    )
}


export default function ViewFile({ idProp = -1 }: { idProp?: number }) {
    var params = useParams();
    const navigate = useNavigate();

    var tab = 0;

    /*if (idProp != -1) {
        if (!params.tab) {
            tab = 0;
            navigate(tab.toString());
        } else {
            tab = parseInt(params.tab as any);
        }
    }*/


    var id = 1;
    var renderedAsComponent = false;

    if (params.id) {
        var id = parseInt(params.id);
    } else if (idProp != -1) {
        var id = idProp;
        renderedAsComponent = true;
    }




    const [tabPane, setTabPane] = React.useState(tab);
    const [file, setFile] = React.useState<FileApiResponse | null>(null);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        if (editsPending.current) {
            attemptedNavigation.current = newValue;
            setEditConfirmationModalOpen(true);
            return;
        }
        setTabPane(newValue);
    };
    const editsPending = React.useRef<boolean>(false);
    const attemptedNavigation = React.useRef<number>(0);
    const loaded = React.useRef<boolean>(false);
    const [editConfirmationModalOpen, setEditConfirmationModalOpen] = React.useState<boolean>(false);

    useEffect(() => {
        if (id && (params.id || idProp != -1)) {
            fetch(`${apiUrl}/files/byId`, {
                method: 'POST',
                body: jsonToFormData({
                    "id": id
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    setFile(data);
                });
        }
    }, [id]);
    /*useEffect(() => {
        if (idProp != -1) return;
        navigate("./../" + tabPane.toString());
    }, [tabPane]);
    useEffect(() => {
        if (!params.tab || idProp != -1) return;
        setTabPane(parseInt(params.tab));
    }, [params.tab]);*/
    function setFileAndSave(newFile: FileApiResponse | null) {
        if (newFile?.id) {
            fetch(`${apiUrl}/files/save`, {
                method: 'POST',
                body: jsonToFormData({
                    file: JSON.stringify(newFile)
                })
            }).then((response) => {
                enqueueSnackbar("Saved!");
            });
        }
        setFile(newFile);
        editsPending.current = false;

    }
    const handleEditConfirmationModalClose = () => {
        setEditConfirmationModalOpen(false);
    };

    return (
        <div>
            <Dialog
                open={editConfirmationModalOpen}
                onClose={handleEditConfirmationModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <DialogTitle>Unsaved Changes</DialogTitle>
                <DialogContent>
                    <Typography>
                        You have pending edits; leaving this tab will discard them.
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => {
                        setEditConfirmationModalOpen(false);
                        setTabPane(attemptedNavigation.current);
                        editsPending.current = false;
                    }}>
                        Leave
                    </Button>
                    <Button variant="text" onClick={handleEditConfirmationModalClose}>Stay</Button>

                </DialogActions>
            </Dialog>
            <Container>
                <Grid container style={{ minHeight: "80vh" }}>
                    <Grid size={2}>
                        <Tabs
                            orientation="vertical"
                            value={tabPane}
                            onChange={handleChange}
                        >
                            <Tab label="View File" />
                            <Tab label="Edit Text" />
                            <Tab label="Edit Date" />
                            <Tab label="Location" />
                            <Tab label="Tags" />
                            <Tab label="Backlinks" />
                            <Tab label="Delete" />
                            {file?.path.endsWith(".html") ? (
                                <Tab label="Online Editor" />
                            ) : null}
                            {file?.path.endsWith(".pdf") ? (
                                <Tab label="Annotator" />
                            ) : null}


                        </Tabs>
                    </Grid>
                    <Grid size={10}>
                        <Box sx={{ p: 2 }}>
                            {file ? (
                                <>
                                    {tabPane === 0 ? <ViewPane file={file} /> : null}
                                    {tabPane === 1 ? <EditTextPane file={file} setFile={setFileAndSave} editsPending={editsPending} /> : null}
                                    {tabPane === 2 ? <EditDatePane file={file} setFile={setFileAndSave} editsPending={editsPending} /> : null}
                                    {tabPane === 3 ? <LocationPane file={file} setFile={setFileAndSave} editsPending={editsPending} /> : null}
                                    {tabPane === 4 ? <TagsPane file={file} setFile={setFileAndSave} editsPending={editsPending} /> : null}
                                    {tabPane === 5 ? <BacklinksPane file={file} /> : null}
                                    {tabPane === 6 ? <DeletePane file={file} setFile={setFileAndSave} editsPending={editsPending} /> : null}
                                    {tabPane === 7 && file?.path.endsWith(".html") ? <OnlineEditor id={file.id} /> : null}
                                    {tabPane === 7 && file?.path.endsWith(".pdf") ? <AnnotatorPane file={file} /> : null}

                                </>
                            ) : <>Loading...</>}

                        </Box>
                    </Grid>

                </Grid>


            </Container>
        </div>
    );
}