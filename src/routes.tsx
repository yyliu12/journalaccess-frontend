import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route } from "react-router";
import App from "App";
import Search from "pages/Search"
import ByDate from "pages/ByDate";
import ViewFile from "pages/ViewFile";
import Home from "pages/Home";
import Map from "pages/Map";
import OnThisDay from "pages/OnThisDay";
import OnlineEditor from "pages/OnlineEditor";
import Tags from "pages/Tags";

export type NavBarConfig = {
    name: string;
    url: string;
    component: React.FC;
}[];

export const links: NavBarConfig = [
    {name: "Home", url: "/home", component: Home},
    {name: "Search", url: "/search", component: Search},
    {name: "Map", url: "/map", component: Map},
    {name: "Access by Date", url: "/bydate", component: ByDate},
    {name: "On This Day", url: "/otd", component: OnThisDay},
    {name: "Tags", url: "/tags", component: Tags}
];


export function JARoutes() {
    return (
        <Routes>
            {links.map((link) => (
                <Route
                    key={link.name}
                    path={link.url}
                    element={<link.component />}
                />
            ))}
            <Route path="/file/:id" element={<ViewFile />}></Route>
            <Route path="/file/:id/:tab" element={<ViewFile />}></Route>
            <Route path="/bydate/:date" element={<ByDate />}></Route>
            <Route path="/otd/:date" element={<OnThisDay />}></Route>

        </Routes>
    );
}
