'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    LayersControl,
    Marker,
    Popup,
    useMapEvents,
} from 'react-leaflet';

function MapRefSetter({
    mapRef,
}: {
    mapRef: any;
}) {
    const map = useMapEvents({});

    useEffect(() => {
        mapRef.current = map;
    }, [map, mapRef]);

    return null;
}

function ZoomTracker({
    onZoomChange,
}: {
    onZoomChange: (zoom: number) => void;
}) {
    useMapEvents({
        zoomend: (e) => {
            onZoomChange(e.target.getZoom());
        },
    });

    return null;
}

function FlyToMyLocation({
    currentLocation,
}: {
    currentLocation: [number, number] | null;
}) {
    const map = useMap();

    if (!currentLocation) return null;

    return (
        <button
            onClick={() => {
                map.flyTo(currentLocation, 15, {
                    duration: 1.5,
                });
            }}
            style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                zIndex: 9999,

                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',

                width: '56px',
                height: '56px',

                cursor: 'pointer',
                fontSize: '24px',

                boxShadow:
                    '0 2px 10px rgba(0,0,0,0.3)',
            }}
        >
            📍
        </button>
    );
}

export default function LeafletMap() {
    const mapRef = useRef<any>(null);

    const [wards, setWards] = useState<any>(null);
    const [roads, setRoads] = useState<any>(null);
    const [rivers, setRivers] = useState<any>(null);

    const [zoom, setZoom] = useState(11);

    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [currentWard, setCurrentWard] = useState('');

    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const [selectedWardId, setSelectedWardId] =
        useState<number | null>(null);

    const wardLayersRef = useRef<Record<string, any>>({});

    useEffect(() => {
        Promise.all([
            fetch(api.wards).then((r) => r.json()),
            fetch(api.roads).then((r) => r.json()),
            fetch(api.rivers).then((r) => r.json()),
        ]).then(([wardsData, roadsData, riversData]) => {
            setWards(wardsData);
            setRoads(roadsData);
            setRivers(riversData);
        });
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setCurrentLocation([lat, lng]);

                try {
                    const res = await fetch(
                        api.currentWard(lat, lng)
                    );

                    const data = await res.json();

                    setCurrentWard(data?.name || 'Không xác định');
                } catch (error) {
                    console.error(error);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }, []);

    useEffect(() => {
        if (!wards || !searchText.trim()) {
            setSuggestions([]);
            return;
        }

        const keyword = searchText.toLowerCase();

        const results = wards.features
            .filter((feature: any) =>
                feature.properties.name
                    ?.toLowerCase()
                    .includes(keyword)
            )
            .slice(0, 10);

        setSuggestions(results);
    }, [searchText, wards]);

    const zoomToWard = (feature: any) => {

        const layer = wardLayersRef.current[
            feature.properties.name
        ];

        if (!layer) return;

        setSelectedWardId(
            feature.properties.osm_id
        );

        setSearchText('');
        setSuggestions([]);

        mapRef.current?.fitBounds(
            layer.getBounds(),
            {
                padding: [80, 80],
                animate: true,
                duration: 1.5,
                maxZoom: 14,
            }
        );

        setTimeout(() => {
            layer.openPopup();
        }, 1200);

        setTimeout(() => {
            setSelectedWardId(null);
        }, 15000);
    };

    const getRoadStyle = (feature: any) => {
        const highway = feature?.properties?.highway;

        let weight = 0.3;
        let opacity = 0.15;

        if (zoom >= 13) {
            weight = 2;
            opacity = 0.9;
        } else if (zoom >= 11) {
            weight = 1;
            opacity = 0.5;
        } else if (zoom >= 9) {
            weight = 0.6;
            opacity = 0.3;
        }

        if (
            highway === 'motorway' ||
            highway === 'trunk'
        ) {
            weight += 2;
        } else if (
            highway === 'primary'
        ) {
            weight += 1;
        }

        return {
            color: '#d32f2f',
            weight,
            opacity,
        };
    };

    const getRiverStyle = (feature: any) => {
        const waterway = feature?.properties?.waterway;

        let weight = 0.4;
        let opacity = 0.15;

        if (zoom >= 13) {
            weight = 3;
            opacity = 0.9;
        } else if (zoom >= 11) {
            weight = 2;
            opacity = 0.6;
        } else if (zoom >= 9) {
            weight = 1;
            opacity = 0.35;
        }

        if (waterway === 'river') {
            weight += 1;
        }

        return {
            color: '#1976d2',
            weight,
            opacity,
        };
    };

    const currentLocationIcon = L.divIcon({
        className: '',
        html: `
        <div
            style="
                width:18px;
                height:18px;
                border-radius:50%;
                background:#2196f3;
                border:3px solid white;
                box-shadow:0 0 12px #2196f3;
            "
        ></div>
    `,
        iconSize: [18, 18],
    });
    

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 60,
                    zIndex: 9999,
                    width: 320,
                }}
            >
                <input
                    type="text"
                    placeholder="Tìm kiếm phường..."
                    value={searchText}
                    onChange={(e) =>
                        setSearchText(e.target.value)
                    }
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        background: '#fff',
                    }}
                />

                {suggestions.length > 0 && (
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #ccc',
                            maxHeight: '250px',
                            overflowY: 'auto',
                        }}
                    >
                        {suggestions.map(
                            (feature: any) => (
                                <div
                                    key={
                                        feature.properties
                                            .osm_id
                                    }
                                    style={{
                                        padding: '10px',
                                        cursor: 'pointer',
                                        borderBottom:
                                            '1px solid #eee',
                                    }}
                                    onClick={() =>
                                        zoomToWard(
                                            feature
                                        )
                                    }
                                >
                                    {
                                        feature.properties
                                            .name
                                    }
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <MapContainer
                center={[10.045, 105.746]}
                zoom={11}
                style={{
                    width: '100vw',
                    height: '100vh',
                }}
            >
                <MapRefSetter mapRef={mapRef} />
                <FlyToMyLocation
                    currentLocation={currentLocation}
                />
                <ZoomTracker
                    onZoomChange={setZoom}
                />

                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {currentLocation && (
                    <Marker
                        position={currentLocation}
                        icon={currentLocationIcon}
                    >
                        <Popup>
                            <b>📍 Vị trí của tôi</b>

                            <br />

                            Bạn đang ở:

                            <br />

                            {currentWard}

                            <br />

                            Thành phố Cần Thơ
                        </Popup>
                    </Marker>
                )}

                <LayersControl position="topright">

                    <LayersControl.Overlay
                        checked
                        name="Wards"
                    >
                        <>
                            {wards && (
                                <GeoJSON
                                    data={wards}
                                    style={(feature: any) => ({
                                        color:
                                            feature.properties.osm_id ===
                                                selectedWardId
                                                ? '#ff9800'
                                                : '#2e7d32',

                                        weight:
                                            feature.properties.osm_id ===
                                                selectedWardId
                                                ? 5
                                                : 2,

                                        fillColor:
                                            feature.properties.osm_id ===
                                                selectedWardId
                                                ? '#ffc107'
                                                : '#4caf50',

                                        fillOpacity:
                                            feature.properties.osm_id ===
                                                selectedWardId
                                                ? 0.5
                                                : 0.08,
                                    })}
                                    onEachFeature={(feature, layer) => {

                                        const wardName = feature.properties.name;

                                        wardLayersRef.current[wardName] = layer;

                                        layer.bindPopup(`
        <b>${wardName}</b>
    `);

                                        layer.on({
                                            mouseover: () => {
                                                layer.setStyle({
                                                    fillOpacity: 0.25,
                                                    weight: 3,
                                                });
                                            },
                                            mouseout: () => {
                                                if (
                                                    feature.properties.osm_id !==
                                                    selectedWardId
                                                ) {
                                                    layer.setStyle({
                                                        fillOpacity: 0.08,
                                                        weight: 2,
                                                    });
                                                }
                                            },
                                        });
                                    }}
                                />
                            )}
                        </>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                        checked
                        name="Roads"
                    >
                        <>
                            {roads && (
                                <GeoJSON
                                    data={roads}
                                    style={
                                        getRoadStyle
                                    }
                                    onEachFeature={(
                                        feature,
                                        layer
                                    ) => {
                                        layer.bindPopup(`
                                            <b>${feature.properties.name || 'Không có tên'}</b>
                                        `);
                                    }}
                                />
                            )}
                        </>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay
                        checked
                        name="Rivers"
                    >
                        <>
                            {rivers && (
                                <GeoJSON
                                    data={rivers}
                                    style={
                                        getRiverStyle
                                    }
                                    onEachFeature={(
                                        feature,
                                        layer
                                    ) => {
                                        layer.bindPopup(`
                                            <b>${feature.properties.name || 'Không có tên'}</b>
                                        `);
                                    }}
                                />
                            )}
                        </>
                    </LayersControl.Overlay>

                </LayersControl>
            </MapContainer>
        </>
    );
}