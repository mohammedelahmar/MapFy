import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { addTerrain } from '../utils/mapUtils';

const useMapbox = (initialConfig = {}) => {
  const {
    initialLng = -70.9,
    initialLat = 42.35,
    initialZoom = 9,
    initialStyle = 'mapbox://styles/mapbox/streets-v11'
  } = initialConfig;
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);
  const [mapStyle, setMapStyle] = useState(initialStyle);
  const [loading, setLoading] = useState(true);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map when component mounts - REMOVE lng, lat, zoom from deps
  useEffect(() => {
    // Don't recreate the map if it already exists and is loaded
    if (map.current && map.current.loaded()) {
      console.log("Map already exists and loaded, skipping recreation");
      return;
    }

    if (!mapContainer.current) {
      console.error("Map container not available");
      setError("Map container not found");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Only create the map if it doesn't exist
      if (!map.current) {
        console.log("Creating new map instance");
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [initialLng, initialLat],
          zoom: initialZoom,
          pitch: 45,
          bearing: 0,
          attributionControl: true,
          preserveDrawingBuffer: true
        });
      }
      
      // Setup event handlers
      const setupMapEvents = () => {
        // Wait for the map to load before adding controls
        console.log("Map fully loaded!");
        setLoading(false);
        setStyleLoaded(true);
        
        // Add basic controls if not already added
        if (!map.current._controlsAdded) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          map.current.addControl(new mapboxgl.ScaleControl({
            maxWidth: 120,
            unit: 'metric'
          }), 'bottom-left');
          
          const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            placeholder: 'Search for a place or coordinates'
          });
          
          map.current.addControl(geocoder, 'top-left');
          map.current.addControl(new mapboxgl.FullscreenControl());
          
          map.current.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true,
              showUserHeading: true
            })
          );

          map.current._controlsAdded = true;
        }
        
        // Add 3D terrain
        addTerrain(map.current);
      };

      // Handle style loaded event
      const handleStyleLoad = () => {
        console.log("Map style loaded");
        setStyleLoaded(true);
      };

      // Only add listeners if they haven't been added before
      if (!map.current._eventsAdded) {
        map.current.on('load', setupMapEvents);
        map.current.on('style.load', handleStyleLoad);
        map.current.on('move', () => {
          if (map.current) {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
          }
        });
        
        // Handle errors
        map.current.on('error', (e) => {
          console.error("Mapbox error:", e);
          setError("An error occurred with the map");
        });

        map.current._eventsAdded = true;
      }
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map: " + err.message);
      setLoading(false);
    }
    
    return () => {
      // Don't remove map instance on every effect cleanup
      // Only remove when component unmounts completely
    };
  }, [mapStyle]); // Remove dependencies that could cause map recreation

  // Update map style when mapStyle state changes
  useEffect(() => {
    if (!map.current || !styleLoaded) return;
    
    try {
      map.current.setStyle(mapStyle);
      // Reset styleLoaded flag until new style loads
      setStyleLoaded(false);
      
      // After style loads, restore the terrain
      map.current.once('style.load', () => {
        console.log("Style changed and loaded");
        setStyleLoaded(true);
        
        // Re-add terrain
        addTerrain(map.current);
      });
    } catch (error) {
      console.error("Error changing map style:", error);
    }
  }, [mapStyle]);

  return {
    mapContainer,
    map,
    lng,
    lat,
    zoom,
    mapStyle,
    loading,
    styleLoaded,
    error,
    setMapStyle
  };
};

export default useMapbox;