import { useCallback, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { v4 } from 'uuid';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2lvYnJzMzMiLCJhIjoiY2t1eTdxczU2NTRxcDJub2Z2MXpiNXozbyJ9.yVlkX2W61pZXW8ilbmPpxA';

export const useMapbox = ( puntoInicial ) => {

    const mapDiv = useRef();
    const mapa = useRef();
    const marcadores = useRef({});

    // Obsevables de Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );

    const [coords, setCoords] = useState(puntoInicial);

    const setRef = useCallback((node) => {
        mapDiv.current = node;
    }, []);

    // Funcion para agregar marcador
    const agregarMarcador = useCallback((event, id) => {

        //Para comprobar si el elemento tiene lnglat
        const {lng, lat} = event.lngLat || event;

        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        //Propiedades del Marcador
        marker
            .setLngLat([lng, lat])
            .addTo( mapa.current )
            .setDraggable( true );

        // Agregando item a la Lista de Marcadores
        marcadores.current[marker.id] = marker;

        // Si el marcador no tiene ID
        if( !id ){
            nuevoMarcador.current.next({
                id: marker.id,
                lng,
                lat,
            });
        }

        // Obteniendo coordenadas del marcador seleccionado
        marker.on('drag', ( event ) => {
            const { id } = event.target;
            const { lng, lat } = event.target.getLngLat();
            
            // Emitir el movimiento del Marcador
            movimientoMarcador.current.next({
                id,
                lng,
                lat,
            });
        });

    }, []);

    //Funcion para actualizar la ubicacion del Marcador
    const actualizacionPosicion = useCallback(({ id, lng, lat }) => {
        marcadores.current[id].setLngLat([ lng, lat ]);
    }, []);

    // Efecto para inicializar el MAPA y guardarlo en memoria
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom,
        });

        mapa.current = map;
    }, [puntoInicial]);

    // Efecto cuando el usuario se mueve por el MAPA
    useEffect(() => {
        mapa.current?.on('move',  () => {
            const {lng, lat} = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2),
            })
        });

    }, []);

    // Efecto para agregar Marcador
    useEffect(() => {
        mapa.current?.on('click', agregarMarcador);
    }, [agregarMarcador]);

    return {
        coords,
        agregarMarcador,
        setRef,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        actualizacionPosicion,
    }
}
