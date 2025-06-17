/** @jsxImportSource @emotion/react */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router";
import NavBar from "components/NavBar";
import { JARoutes } from "routes";
import { css } from "@emotion/react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en';
import { SnackbarProvider } from 'notistack';
import '@progress/kendo-theme-default/dist/all.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    }
});

var mtCSS = css`
    margin-top:64px;
`;

declare module "react" {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string;
        mozdirectory?: string;
    }
}



const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <SnackbarProvider autoHideDuration={1500}>
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                <NavBar />
                <div css={mtCSS}>
                    <JARoutes />
                </div>
            </LocalizationProvider>
        </BrowserRouter>
    </SnackbarProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
