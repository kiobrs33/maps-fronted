import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -71.5331,
    lat: -16.4307,
    zoom: 15.00,
}

export const MapaPage = () => {
    const { 
        coords, 
        setRef, 
        nuevoMarcador$, 
        movimientoMarcador$, 
        agregarMarcador, 
        actualizacionPosicion 
    } = useMapbox(puntoInicial);

    const { socket } = useContext( SocketContext );

    // Marcadores Existentes
    useEffect(() => {
        socket.on('marcadores-activos', (marcadores) => {
            for( const key of Object.keys( marcadores ) ){
                agregarMarcador( marcadores[key], key );
            }
        });
    }, [socket, agregarMarcador]);

    //Movimiento del Marcador
    useEffect(() => {
        movimientoMarcador$.subscribe( marcador => {
            socket.emit('marcador-actualizado', marcador);
        })
    }, [movimientoMarcador$, socket]);

    //Mover marcador mediante SOCKETS
    useEffect(() => {
        socket.on('marcador-actualizado', (marcador) => {
            actualizacionPosicion(marcador);
        });
    }, [socket, actualizacionPosicion])

    //Nuevo Marcador - EMIT  - EMISOR
    useEffect(() => {
        nuevoMarcador$.subscribe( marcador => {
            socket.emit('marcador-nuevo', marcador);
        });
    }, [nuevoMarcador$, socket]);

    //Nuevo Marcador - ON - RECEPTOR
    useEffect(() => {
        socket.on('marcador-nuevo', ( marcador ) => {
            agregarMarcador( marcador, marcador.id )
        });
    }, [socket, agregarMarcador]);

    return (
        <>
            
            <div className="mapContainer">
                <div className="coords">
                    lat: {coords.lat} | lng: {coords.lng} | zoom: {coords.zoom}
                </div>
                <div className="info">
                    Mapa en tiempo Real - Rene Lozano
                </div>
                <div 
                    className="mapbox"
                    ref={ setRef }
                />
            </div>
        </>   
    )
}
