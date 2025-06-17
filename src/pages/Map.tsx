/** @jsxImportSource @emotion/react */

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';
import { css } from '@emotion/react';
import { apiUrl, defaultSearchQuery, SearchApiResponse, SearchQuery, staticUrl } from 'api';
import { debounce, jsonToFormData } from 'utils';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ViewFile from './ViewFile';
import { BacklinkBadge } from 'components/BacklinkBadge';
import SearchCreator from 'components/SearchCreator';

const mapContainerStyle = css`
    width: 100%;
    height: 80vh;
`;

function get_tolerance(map: mapboxgl.Map): [number, number] {
    if (!map.getBounds()) { return [0, 0]; }
    var mapBounds: mapboxgl.LngLatBounds = map.getBounds() as mapboxgl.LngLatBounds;
    var toler_x = Math.abs(mapBounds.getNorthEast().lng - mapBounds.getSouthWest().lng) * 0.02;
    var toler_y = Math.abs(mapBounds.getNorthEast().lat - mapBounds.getSouthWest().lat) * 0.02;

    return [toler_x, toler_y];
}

function convertApiResponseToGeoJSON(data: SearchApiResponse): GeoJSON.FeatureCollection {
    var featureCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: []
    };

    for (var file of data.files) {
        for (var location of file.locations) {

            var feature: GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: location.coordinate.split(",").map(Number).reverse().concat([0])
                },
                properties: {
                    address: location.address,
                    date: file.date,
                    url: file.path,
                    id: file.id,
                    backlinks: file.backlinks
                }
            };
            featureCollection.features.push(feature);
        }


    }
    return featureCollection;
}

export default function Map() {
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapData = useRef<GeoJSON.FeatureCollection | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number[] | null>(null);
    const [resultsDialogOpen, setResultsDialogOpen] = useState<boolean>(false);
    const [filePageOpen, setFilePageOpen] = useState<number>(-1);
    const searchQuery = useRef<SearchQuery>(defaultSearchQuery);

    function get_data() {

        var sw = mapRef.current?.getBounds()?.getSouthWest();
        var ne = mapRef.current?.getBounds()?.getNorthEast();

        if (!sw || !ne) { return; }

        fetch(`${apiUrl}/files/search`, {
            method: 'POST',
            body: jsonToFormData({
                bounds: JSON.stringify({
                    boundsSwLat: sw.lat,
                    boundsSwLng: Math.max(-180, sw.lng),
                    boundsNeLat: ne.lat,
                    boundsNeLng: Math.min(180, ne.lng)
                }),
                query: JSON.stringify(searchQuery.current),
            })
        }).then((response) => response.json())
            .then((data: SearchApiResponse) => {
                var geojson: GeoJSON.FeatureCollection = convertApiResponseToGeoJSON(data);
                mapData.current = geojson;
                if (!mapRef.current || !mapRef.current.getSource('entries')) return;
                console.log(geojson);
                (mapRef.current.getSource('entries') as GeoJSONSource).setData(geojson);
            })
    }


    useEffect(() => {
        mapboxgl.accessToken = "TOKEN";
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: staticUrl + "/map_style.json",
            center: [-73.49246, 40.81545], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 9, // starting zoom
            hash: true
        });

        let map = mapRef.current;

        map.on('load', async () => {


            map.addSource('entries', {
                type: 'geojson',
                data: {
                    "features": [],
                    "type": "FeatureCollection"
                },
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
            });

            get_data();

            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'entries',
                filter: ['has', 'point_count'],
                paint: {
                    // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                    // with three steps to implement three types of circles:
                    //   * Blue, 20px circles when point count is less than 100
                    //   * Yellow, 30px circles when point count is between 100 and 750
                    //   * Pink, 40px circles when point count is greater than or equal to 750
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        100,
                        '#f1f075',
                        750,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'entries',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['Noto-Regular'],
                    'text-size': 12
                }
            });

            map.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'entries',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 4,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            //map.getSource('trace').setData(data);

        });
        // inspect a cluster on click
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            if (!features[0].properties) return;

            const clusterId = features[0].properties.cluster_id;
            if (!map.getSource('entries') || !map) return;

            (map.getSource('entries') as GeoJSONSource).getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: (features[0].geometry as any).coordinates,
                        zoom: (zoom as number)
                    });
                }
            );
        });

        map.on('click', 'unclustered-point', (e) => {
            if (!e.features || e.features.length === 0) return;

            setSelectedPosition(e.lngLat.toArray());
            setResultsDialogOpen(true);

        });



        map.on('moveend', debounce(async () => {
            get_data();
        }, 1000));


        map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });


    }, []);
    var ejs_data = [];
    if (selectedPosition != null && mapRef.current && mapData.current) {
        var coordinates = selectedPosition;
        var points: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>[] = []
        var tolerance = get_tolerance(mapRef.current as mapboxgl.Map);

        for (var point of mapData.current.features) {
            var pointGeometry = point.geometry as GeoJSON.Point;
            if (Math.abs(pointGeometry.coordinates[0] - coordinates[0]) < tolerance[0] &&
                Math.abs(pointGeometry.coordinates[1] - coordinates[1]) < tolerance[1]) {
                points.push(point);
            }

            console.log(Math.abs(pointGeometry.coordinates[0] - coordinates[0]), Math.abs(pointGeometry.coordinates[1] - coordinates[1]));
        }

        if (['mercator', 'equirectangular'].includes(mapRef.current.getProjection().name)) {
            while (Math.abs(selectedPosition[0] - coordinates[0]) > 180) {
                coordinates[0] += selectedPosition[0] > coordinates[0] ? 360 : -360;
            }
        }

        var ejs_data = [];

        for (var point of points) {
            ejs_data.push({
                coord: (point.geometry as GeoJSON.Point).coordinates,
                addr: point.properties?.address,
                path: point.properties?.url,
                date: point.properties?.date,
                id: point.properties?.id,
                backlinks: point.properties?.backlinks || []
            });
        }


    }


    return (<>
        {resultsDialogOpen && selectedPosition != null ? (
            <Dialog
                open={resultsDialogOpen}
                onClose={() => setResultsDialogOpen(false)}
                fullWidth={true}
                maxWidth="md"
            >
                <DialogTitle>Search Results</DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Coordinates</b></TableCell>
                                <TableCell><b>Address</b></TableCell>
                                <TableCell><b>Path</b></TableCell>
                                <TableCell><b>Date</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ejs_data.map((item, index) => (
                                <TableRow key={index} hover={true} sx={{ cursor: 'pointer' }} onClick={() => {
                                    setFilePageOpen(item.id);
                                }
                                }>
                                    <TableCell>{item.coord.join(", ")}</TableCell>
                                    <TableCell>{item.addr}</TableCell>
                                    <TableCell>
                                        {item.path}
                                        <BacklinkBadge backlinks={item.backlinks} />
                                    </TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResultsDialogOpen(false)}>Close</Button>
                </DialogActions>

                <Dialog fullScreen={true} open={filePageOpen !== -1} onClose={() => setFilePageOpen(-1)}>
                    <DialogContent>
                        <ViewFile idProp={filePageOpen} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setFilePageOpen(-1)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        ) : null}
        <Container>
            <SearchCreator onSearch={(query: SearchQuery) => {
                searchQuery.current = query;
                get_data();
            }} />
        </Container>

        <div css={mapContainerStyle} id="map" ref={mapContainerRef}></div>


    </>);
}