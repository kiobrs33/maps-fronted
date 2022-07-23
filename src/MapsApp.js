import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { MapaPage } from './pages/MapaPage';

export const MapsApp = () => {
    return (
        <SocketProvider>
            <MapaPage/>
        </SocketProvider>
    )
}
