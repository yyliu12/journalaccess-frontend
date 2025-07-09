/** @jsxImportSource @emotion/react */

import React, { useEffect } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Grid, TextField, Typography } from '@mui/material';
import { jsonToFormData, getUrlForFile } from 'utils';
import { apiUrl, SearchQuery } from 'api';
import { css } from '@emotion/react';
import { blue } from '@mui/material/colors';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SearchApiResponse } from 'api';
import { Link } from 'react-router';
import dayjs from 'dayjs';
import { grey } from '@mui/material/colors';
import { BacklinkBadge } from 'components/BacklinkBadge';
import SearchCreator from 'components/SearchCreator';

const iframeStyle = css`
    width: 100%;
    height: 90vh;
    border: none;
`;

const sidebarStyle = css`
    height: 90vh;
    overflow: scroll;
`


function Search() {
    const [results, setResults] = React.useState<SearchApiResponse | null>(null);
    const [selected, setSelected] = React.useState<number | null>(null);
    const [page, setPage] = React.useState<number>(0);
    const currentSearchQuery = React.useRef<SearchQuery | null>(null);
    const resultDiv = React.useRef<HTMLDivElement>(null);

    function handleSearch(e: SearchQuery) {
        currentSearchQuery.current = e;

        setSelected(null);
        setPage(0);
        resultDiv.current?.scrollTo(0, 0);

        fetch(apiUrl + "/files/search", {
            method: 'POST',
            body: jsonToFormData({
                "query": JSON.stringify(e),
                "page": page
            }),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            setResults(data as SearchApiResponse);
        });

        
    }

    useEffect(() => {
        if (currentSearchQuery.current != null) {handleSearch(currentSearchQuery.current);}
    }, [page]);

    function isIframe() {
        return selected != null && results?.files[selected].path.endsWith('.pdf');
    }



    return (
        <Container>
            <SearchCreator onSearch={handleSearch} showSort={true}/>
            <Grid container spacing={2}>
                {results?.error != null ? (
                    <Alert sx={{ mt: 3 }} severity="error">{results?.error}</Alert>
                ) : null}

                <Grid size={3}>
                    {results ? <>
                        <div css={sidebarStyle} ref={resultDiv}>
                            <Box sx={{ padding: 2, backgroundColor: grey[200], position: "sticky", top: 0, textAlign: "center", mb: 2 }}>
                                (Number of results: {results.numFound || 0})
                                <Box>
                                    Page: {page + 1}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setPage(page - 1);
                                        }}
                                        disabled={page <= 0}
                                        sx={{ ml: 1 }}
                                    >
                                        Prev
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setPage(page + 1);
                                        }}
                                        disabled={results?.files.length < 10}
                                        sx={{ ml: 1 }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                            {results?.files.map((result, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    onClick={() => setSelected(index)}
                                    sx={{
                                        mt: '16px',
                                        cursor: 'pointer',
                                        bgcolor: selected == index ? blue[50] : 'white'
                                    }}
                                >
                                    <CardContent>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            <Link to={"/bydate/" + result.date}>{result.date}</Link> <BacklinkBadge backlinks={result.backlinks} />
                                        </Typography>
                                        <Typography variant="body2" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                                    </CardContent>

                                </Card>
                            ))}
                        </div>
                    </> : null}

                </Grid>
                <Grid size={9}>

                    {results != null && selected != null ? (<iframe css={iframeStyle} src={getUrlForFile(results.files[selected])} />) : null}


                </Grid>
            </Grid>
        </Container>
    );
}

export default Search;