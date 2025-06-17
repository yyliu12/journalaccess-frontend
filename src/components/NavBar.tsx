import React from 'react';
import {AppBar, Box, Button, CssBaseline, Toolbar, Typography} from "@mui/material";
import {Link, useLocation} from "react-router";

import {links} from "../routes";



function NavBar() {
    const location = useLocation();

    return (
        <Box sx={{display: "flex"}}>

            <CssBaseline/>
            <AppBar component="nav">
                <Toolbar variant="dense">
                    <Typography variant="h6" component="div" sx={{mr: 1}}>Journal Access</Typography>

                    <Box>
                        {links.map((link => (
                            <Button
                                key={link.name}
                                component={Link}
                                to={link.url}
                                sx={{color: location.pathname.startsWith(link.url) ? '#fff' : 'grey.400'}}
                            >
                                {link.name}
                            </Button>
                        )))}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default NavBar;
