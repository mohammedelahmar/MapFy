import React, { useRef, useEffect, useState } from 'react'; // Make sure we import React and all hooks
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { DOMParser } from '@xmldom/xmldom';
import * as toGeoJSON from '@tmcw/togeojson';
import tokml from 'tokml';
import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; // Assuming you have an auth hook
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { area } from '@turf/area';
import { length } from '@turf/length';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Custom styles for point markers
const markerStyles = [
  {
    id: 'default',
    name: 'Circle',
    iconUrl: null,
    color: '#3FB1CE'
  },
  {
    id: 'flag',
    name: 'Flag',
    iconUrl: 'https://img.icons8.com/color/48/000000/marker.png',
    color: '#FF0000'
  },
  {
    id: 'pin',
    name: 'Pin',
    iconUrl: 'https://img.icons8.com/color/48/000000/pin.png',
    color: '#FFC107'
  },
  {
    id: 'star',
    name: 'Star',
    iconUrl: 'https://img.icons8.com/color/48/000000/star.png',
    color: '#4CAF50'
  }
];

// Colors for styling
const colorOptions = [
  { id: 'blue', value: '#3FB1CE', name: 'Blue' },
  { id: 'red', value: '#E53E3E', name: 'Red' },
  { id: 'green', value: '#38A169', name: 'Green' },
  { id: 'purple', value: '#805AD5', name: 'Purple' },
  { id: 'orange', value: '#DD6B20', name: 'Orange' },
  { id: 'yellow', value: '#F6E05E', name: 'Yellow' }
];

const MapEditor = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const popup = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [loading, setLoading] = useState(true);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [measurements, setMeasurements] = useState({ area: null, distance: null });
  const [error, setError] = useState(null);
  const [currentMarkerStyle, setCurrentMarkerStyle] = useState('default');
  const [currentColor, setCurrentColor] = useState('#3FB1CE');
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  const [exportProgress, setExportProgress] = useState(null);
  const [savedMaps, setSavedMaps] = useState([]);
  const [loadMapModalOpen, setLoadMapModalOpen] = useState(false);
  const [saveMapModalOpen, setSaveMapModalOpen] = useState(false);
  const [mapName, setMapName] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentMapId, setCurrentMapId] = useState(null);
  const fileInputRef = useRef(null);
  const drawFeatures = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  const { user } = useAuth(); // Access user information for saving maps
  const [elevationData, setElevationData] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    // First, ensure we're not initializing multiple times
    if (map.current) return;
    
    // Set up an observer to wait for the container to be in DOM
    const observer = new MutationObserver((mutations, obs) => {
      if (mapContainer.current) {
        obs.disconnect(); // Stop observing once we found it
        initializeMap();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also try with a delay as backup
    const timer = setTimeout(() => {
      if (mapContainer.current && !map.current) {
        console.log("Initializing map after delay");
        initializeMap();
      } else if (!mapContainer.current) {
        console.error("Map container reference is still null after delay");
        setError("Could not initialize map: container not found");
        setLoading(false);
      }
    }, 1000);
    
    // Function to initialize the map
    function initializeMap() {
      try {
        console.log("Initializing map with container:", mapContainer.current);
        
        setLoading(true);
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [lng, lat],
          zoom: zoom,
          pitch: 45,
          bearing: 0,
          attributionControl: true,
          preserveDrawingBuffer: true
        });
        
        // Create popup but don't add it to the map yet
        popup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'measurement-popup'
        });
        
        // Add fullscreen change event listener to the document
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        
        // Wait for the map to load before adding controls
        map.current.on('load', () => {
          console.log("Map loaded");
          setLoading(false);
          setStyleLoaded(true);
          
          initializeMapControls();
        });
    
        // Handle style loaded event
        map.current.on('style.load', () => {
          console.log("Style loaded");
          setStyleLoaded(true);
          
          // Re-add terrain and stored features if any
          if (drawFeatures.current && draw.current) {
            restoreTerrainAndFeatures();
          }
        });
    
        // Update state when map moves
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
        
      } catch (err) {
        console.error("Failed to initialize map:", err);
        setError("Failed to initialize map: " + err.message);
        setLoading(false);
      }
    }
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      
      // Cleanup on unmount
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, []); 

  // Function to handle fullscreen change
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = 
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    
    setIsFullscreen(!!isCurrentlyFullscreen);
    
    if (map.current) {
      // Save the current state regardless of which direction we're going
      if (draw.current) {
        drawFeatures.current = draw.current.getAll();
        console.log("Saving features:", drawFeatures.current);
      }
      
      // We need to force a resize after a short delay to ensure the map updates correctly
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          
          // Only handle the drawing tools, leave other controls alone
          if (draw.current && map.current.hasControl(draw.current)) {
            map.current.removeControl(draw.current);
          }
          
          // Create and add the draw control with previous styles
          draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              point: false,
              line_string: false,
              polygon: false,
              trash: false,
            },
            styles: createDrawStyles(currentColor)
          });
          
          map.current.addControl(draw.current, 'top-left');
          
          // Re-add event listeners
          map.current.on('draw.create', updateMeasurements);
          map.current.on('draw.update', updateMeasurements);
          map.current.on('draw.delete', updateMeasurements);
          map.current.on('draw.selectionchange', updateMeasurements);
          
          // Restore saved features if we have any
          if (drawFeatures.current && drawFeatures.current.features?.length > 0) {
            draw.current.add(drawFeatures.current);
            console.log("Restored features after fullscreen change");
          }
          
          // Restore active tool if any
          if (activeTool && activeTool !== 'style' && activeTool !== 'color') {
            const mode = activeTool === 'point' ? 'draw_point' : 
                       activeTool === 'line' ? 'draw_line_string' : 
                       activeTool === 'polygon' ? 'draw_polygon' : 'simple_select';
            draw.current.changeMode(mode);
          }
        }
      }, 300);
    }
  };
  
  // New function to initialize map controls
  const initializeMapControls = () => {
    try {
      if (!map.current) return;
      
      // Define an object to track which controls have been added
      const controlsAdded = {
        draw: false,
        nav: false,
        scale: false,
        geocoder: false,
        fullscreen: false,
        geolocate: false
      };
      
      // Check for existing controls and track them
      map.current._controls.forEach(control => {
        if (control instanceof MapboxDraw) controlsAdded.draw = true;
        if (control instanceof mapboxgl.NavigationControl) controlsAdded.nav = true;
        if (control instanceof mapboxgl.ScaleControl) controlsAdded.scale = true;
        if (control instanceof MapboxGeocoder) controlsAdded.geocoder = true;
        if (control instanceof mapboxgl.FullscreenControl) controlsAdded.fullscreen = true;
        if (control instanceof mapboxgl.GeolocateControl) controlsAdded.geolocate = true;
      });
      
      // Initialize Draw with enhanced styling (only if not already added)
      if (!controlsAdded.draw) {
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point: false,
            line_string: false,
            polygon: false,
            trash: false,
          },
          styles: createDrawStyles(currentColor)
        });
        
        // Add drawing tools
        map.current.addControl(draw.current, 'top-left');
        
        // Add event listeners for measuring
        map.current.on('draw.create', updateMeasurements);
        map.current.on('draw.update', updateMeasurements);
        map.current.on('draw.delete', updateMeasurements);
        map.current.on('draw.selectionchange', updateMeasurements);
        
        // Restore features if we have them saved
        if (drawFeatures.current) {
          draw.current.add(drawFeatures.current);
        }
      }
      
      // Add navigation control (zoom buttons) if not already added
      if (!controlsAdded.nav) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }
      
      // Add scale control if not already added
      if (!controlsAdded.scale) {
        map.current.addControl(new mapboxgl.ScaleControl({
          maxWidth: 120,
          unit: 'metric'
        }), 'bottom-left');
      }
      
      // Add geocoder control (search) if not already added
      if (!controlsAdded.geocoder) {
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: {
            color: currentColor
          },
          placeholder: 'Search for a place or coordinates'
        });
        map.current.addControl(geocoder, 'top-left');
      }
      
      // Add fullscreen control if not already added
      if (!controlsAdded.fullscreen) {
        const fullscreenControl = new mapboxgl.FullscreenControl({
          container: mapContainer.current.parentNode || document.body
        });
        map.current.addControl(fullscreenControl);
      }

      // Add geolocate control if not already added
      if (!controlsAdded.geolocate) {
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
          })
        );
      }
      
      // Add hover listeners for measurements
      map.current.on('mousemove', (e) => handleHover(e));
      map.current.on('mouseleave', 'gl-draw-polygon-fill-active.cold', () => {
        if (popup.current) popup.current.remove();
      });
      
      // Add 3D terrain
      addTerrain();
      
    } catch (controlError) {
      console.error("Error adding controls:", controlError);
      setError("Failed to initialize map controls");
    }
  };
  
  // Function to add terrain to the map
  const addTerrain = () => {
    try {
      if (!map.current) return;
      
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      }
    } catch (error) {
      console.warn("Could not add terrain:", error.message);
    }
  };
  
  // Function to restore terrain and features after style changes
  const restoreTerrainAndFeatures = () => {
    try {
      // Add terrain
      addTerrain();
      
      // Restore draw features if we have them
      if (drawFeatures.current && drawFeatures.current.features.length > 0) {
        setTimeout(() => {
          if (draw.current) {
            draw.current.add(drawFeatures.current);
          }
        }, 100);
      }
    } catch (error) {
      console.warn("Error restoring terrain or features:", error);
    }
  };

  // Update map style when mapStyle state changes
  useEffect(() => {
    if (!map.current || !styleLoaded) return;
    
    // Store current draw features before changing style
    if (draw.current) {
      drawFeatures.current = draw.current.getAll();
    }
    
    // Make sure style changes happen only after the previous style is loaded
    try {
      // Store references to all controls before changing style
      const existingControls = map.current._controls ? [...map.current._controls] : [];
      
      map.current.setStyle(mapStyle);
      // Reset styleLoaded flag until new style loads
      setStyleLoaded(false);
      
      // After style loads, restore the draw features and controls
      map.current.once('style.load', () => {
        setStyleLoaded(true);
        
        // Re-add terrain
        addTerrain();
        
        // Only re-initialize draw control, leave other controls alone
        if (draw.current && !map.current.hasControl(draw.current)) {
          draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              point: false,
              line_string: false,
              polygon: false,
              trash: false,
            },
            styles: createDrawStyles(currentColor)
          });
          
          map.current.addControl(draw.current, 'top-left');
          
          // Re-add event listeners
          map.current.on('draw.create', updateMeasurements);
          map.current.on('draw.update', updateMeasurements);
          map.current.on('draw.delete', updateMeasurements);
          map.current.on('draw.selectionchange', updateMeasurements);
        }
        
        // Restore draw features if we have them
        if (drawFeatures.current && drawFeatures.current.features?.length > 0) {
          setTimeout(() => {
            if (draw.current) {
              draw.current.add(drawFeatures.current);
            }
          }, 100);
        }
      });
    } catch (error) {
      console.error("Error changing map style:", error);
    }
  }, [mapStyle]);

  // Update draw styles when color changes
  useEffect(() => {
    if (!draw.current || !map.current) return;
    
    // Store current features
    const currentFeatures = draw.current.getAll();
    drawFeatures.current = currentFeatures;
    
    // Remove and re-add draw with new styles
    if (map.current.hasControl(draw.current)) {
      map.current.removeControl(draw.current);
    }
    
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
      },
      styles: createDrawStyles(currentColor)
    });
    
    map.current.addControl(draw.current, 'top-left');
    
    // Re-add event listeners
    map.current.on('draw.create', updateMeasurements);
    map.current.on('draw.update', updateMeasurements);
    map.current.on('draw.delete', updateMeasurements);
    map.current.on('draw.selectionchange', updateMeasurements);
    
    // Restore features
    if (currentFeatures.features.length > 0) {
      draw.current.add(currentFeatures);
    }
    
    // Restore active tool if any
    if (activeTool) {
      handleToolClick(activeTool);
    }
  }, [currentColor]);

  // Helper function to generate draw styles
  const createDrawStyles = (color) => {
    return [
      {
        'id': 'gl-draw-polygon-fill-inactive',
        'type': 'fill',
        'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        'paint': {
          'fill-color': color,
          'fill-outline-color': color,
          'fill-opacity': 0.1
        }
      },
      {
        'id': 'gl-draw-polygon-fill-active',
        'type': 'fill',
        'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
        'paint': {
          'fill-color': color,
          'fill-outline-color': color,
          'fill-opacity': 0.3
        }
      },
      {
        'id': 'gl-draw-polygon-stroke-inactive',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': color,
          'line-width': 2
        }
      },
      {
        'id': 'gl-draw-polygon-stroke-active',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': color,
          'line-dasharray': [0.2, 2],
          'line-width': 2
        }
      },
      {
        'id': 'gl-draw-line-inactive',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': color,
          'line-width': 2
        }
      },
      {
        'id': 'gl-draw-line-active',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': color,
          'line-dasharray': [0.2, 2],
          'line-width': 2
        }
      },
      {
        'id': 'gl-draw-point-inactive',
        'type': 'circle',
        'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
        'paint': {
          'circle-radius': 5,
          'circle-color': color
        }
      },
      {
        'id': 'gl-draw-point-active',
        'type': 'circle',
        'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
        'paint': {
          'circle-radius': 6,
          'circle-color': color
        }
      },
      {
        'id': 'gl-draw-vertex-inactive',
        'type': 'circle',
        'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
        'paint': {
          'circle-radius': 5,
          'circle-color': '#fff',
          'circle-stroke-color': color,
          'circle-stroke-width': 2
        }
      },
      {
        'id': 'gl-draw-vertex-active',
        'type': 'circle',
        'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
        'paint': {
          'circle-radius': 6,
          'circle-color': '#fff',
          'circle-stroke-color': color,
          'circle-stroke-width': 2
        }
      }
    ];
  };

  const handleHover = (e) => {
    if (!map.current) return;
    
    // Get elevation at the hovered point
    if (map.current.getTerrain()) {
      const elevation = map.current.queryTerrainElevation(e.lngLat);
      if (elevation !== null) {
        // Round to 1 decimal place and convert to meters
        const elevationInMeters = Math.round(elevation * 10) / 10;
        setElevationData(elevationInMeters);
        
        // If no features are hovered but we have elevation, show a popup
        if ((!draw.current || draw.current.getFeatureIdsAt(e.point).length === 0) && elevationInMeters) {
          popup.current
            .setLngLat(e.lngLat)
            .setHTML(`<div class="measurement-hover">Elevation: ${elevationInMeters} m</div>`)
            .addTo(map.current);
        }
      }
    }
    
    // Continue with existing feature hover logic
    if (draw.current) {
      const features = draw.current.getFeatureIdsAt(e.point);
      
      if (features.length > 0) {
        const featureId = features[0];
        const feature = draw.current.get(featureId);
        
        if (!feature) return;
        
        let measurementText = '';
        
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          const areaValue = area(feature);
          measurementText = areaValue < 10000 
            ? `Area: ${areaValue.toFixed(2)} m²` 
            : `Area: ${(areaValue / 1000000).toFixed(4)} km²`;
        } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          const distanceValue = length(feature) * 1000;
          measurementText = distanceValue < 1000 
            ? `Distance: ${distanceValue.toFixed(2)} m` 
            : `Distance: ${(distanceValue / 1000).toFixed(3)} km`;
        }
        
        if (measurementText) {
          // Add elevation to the popup if available
          if (elevationData) {
            measurementText += `<br>Elevation: ${elevationData} m`;
          }
          
          popup.current
            .setLngLat(e.lngLat)
            .setHTML(`<div class="measurement-hover">${measurementText}</div>`)
            .addTo(map.current);
        }
      } else {
        // Remove popup if not hovering over a feature and we're not showing elevation
        if (!elevationData) {
          popup.current.remove();
        }
      }
    }
  };

  const changeMapStyle = (newStyle) => {
    if (newStyle !== mapStyle && styleLoaded) {
      setMapStyle(newStyle);
    }
  };
  
  // Calculate measurements for selected feature
  const updateMeasurements = () => {
    if (!draw.current) return;
    
    try {
      const selection = draw.current.getSelected();
      let areaValue = null;
      let distanceValue = null;
      
      if (selection.features.length > 0) {
        const feature = selection.features[0];
        
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          // Calculate area
          const areaInSquareMeters = area(feature);
          
          // Convert to appropriate unit based on size
          if (areaInSquareMeters < 10000) {
            areaValue = `${areaInSquareMeters.toFixed(2)} m²`;
          } else {
            const areaInSquareKilometers = areaInSquareMeters / 1000000;
            areaValue = `${areaInSquareKilometers.toFixed(4)} km²`;
          }
        }
        
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          // Calculate length
          const distanceInMeters = length(feature) * 1000;
          
          // Convert to appropriate unit based on size
          if (distanceInMeters < 1000) {
            distanceValue = `${distanceInMeters.toFixed(2)} m`;
          } else {
            const distanceInKilometers = distanceInMeters / 1000;
            distanceValue = `${distanceInKilometers.toFixed(3)} km`;
          }
        }
      }
      
      setMeasurements({ area: areaValue, distance: distanceValue });
    } catch (err) {
      console.error("Error updating measurements:", err);
    }
  };
  
  // Handle drawing tool selection
  const handleToolClick = (tool) => {
    if (!draw.current) return;
    
    try {
      // If clicking the active tool, deactivate it
      if (tool === activeTool && tool !== 'style' && tool !== 'color') {
        draw.current.changeMode('simple_select');
        setActiveTool(null);
        return;
      }
      
      // Special handling for style and color buttons
      if (tool === 'style') {
        setIsToolbarExpanded(prev => !prev);
        return;
      }
      
      // Handle all other tools
      setActiveTool(tool);
      
      // Activate the appropriate drawing mode
      switch (tool) {
        case 'point':
          draw.current.changeMode('draw_point');
          break;
        case 'line':
          draw.current.changeMode('draw_line_string');
          break;
        case 'polygon':
          draw.current.changeMode('draw_polygon');
          break;
        case 'trash':
          draw.current.trash();
          draw.current.changeMode('simple_select');
          setActiveTool(null);
          setMeasurements({ area: null, distance: null });
          break;
        default:
          draw.current.changeMode('simple_select');
      }
    } catch (err) {
      console.error("Error changing drawing mode:", err);
    }
  };

  // Handle marker style change
  const handleMarkerStyleChange = (styleId) => {
    setCurrentMarkerStyle(styleId);
    // In a real implementation, we would change how new points are drawn
  };

  // Handle color change
  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  // Add/update this useEffect after other useEffects in the component
  useEffect(() => {
    // When fullscreen status changes, force a recalculation of the map size
    if (map.current) {
      const timer = setTimeout(() => {
        map.current.resize();
        
        // Re-add terrain if needed
        try {
          if (!map.current.getSource('mapbox-dem')) {
            addTerrain();
          }
        } catch (e) {
          console.warn("Could not restore terrain:", e);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);
  
  // New function for handling file imports
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportError(null);
    
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileContent = await readFileAsText(file);
      let geoJSON;
      
      switch (fileExtension) {
        case 'kml':
          const kmlDom = new DOMParser().parseFromString(fileContent, 'text/xml');
          geoJSON = toGeoJSON.kml(kmlDom);
          break;
          
        case 'gpx':
          const gpxDom = new DOMParser().parseFromString(fileContent, 'text/xml');
          geoJSON = toGeoJSON.gpx(gpxDom);
          break;
          
        case 'json':
        case 'geojson':
          geoJSON = JSON.parse(fileContent);
          break;
          
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
      
      if (geoJSON && draw.current) {
        // Store the current features
        const currentFeatures = draw.current.getAll();
        
        // Add new features from the imported file
        if (geoJSON.type === 'FeatureCollection') {
          geoJSON.features.forEach(feature => {
            draw.current.add(feature);
          });
        } else if (geoJSON.type === 'Feature') {
          draw.current.add(geoJSON);
        }
        
        // Save all features including the new ones
        drawFeatures.current = draw.current.getAll();
        
        // Fit the map to show all features
        fitMapToFeatures(geoJSON);
        
        // Close the modal
        setImportModalOpen(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError(`Failed to import file: ${error.message}`);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Helper function to read file content
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  // Function to fit the map to show all features
  const fitMapToFeatures = (geoJSON) => {
    if (!map.current) return;
    
    try {
      // Create a new bounds object
      const bounds = new mapboxgl.LngLatBounds();
      
      // Process the features to extend the bounds
      const processFeature = (feature) => {
        if (feature.geometry) {
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates);
          } else if (feature.geometry.coordinates && feature.geometry.coordinates.length) {
            if (feature.geometry.type === 'LineString') {
              feature.geometry.coordinates.forEach(coord => {
                bounds.extend(coord);
              });
            } else if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach(coord => {
                bounds.extend(coord);
              });
            } else if (['MultiPoint', 'MultiLineString'].includes(feature.geometry.type)) {
              feature.geometry.coordinates.forEach(coords => {
                if (Array.isArray(coords[0])) {
                  coords.forEach(coord => bounds.extend(coord));
                } else {
                  bounds.extend(coords);
                }
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach(polygon => {
                polygon[0].forEach(coord => bounds.extend(coord));
              });
            }
          }
        }
      };
      
      // Process all features
      if (geoJSON.type === 'FeatureCollection') {
        geoJSON.features.forEach(processFeature);
      } else if (geoJSON.type === 'Feature') {
        processFeature(geoJSON);
      }
      
      // If bounds are valid (not empty), fit the map to these bounds
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    } catch (error) {
      console.error('Error fitting map to features:', error);
    }
  };
  
  // Function to handle exporting the map
  const handleExport = async (format) => {
    if (!draw.current || !map.current) return;
    
    try {
      setExportProgress('Preparing export...');
      
      // Get all features as GeoJSON
      const featureCollection = draw.current.getAll();
      
      switch (format) {
        case 'geojson':
          // Export as GeoJSON
          const geoJSONString = JSON.stringify(featureCollection, null, 2);
          const geoJSONBlob = new Blob([geoJSONString], { type: 'application/json' });
          FileSaver.saveAs(geoJSONBlob, 'mapfy-export.geojson');
          break;
          
        case 'kml':
          // Convert GeoJSON to KML and export
          const kml = tokml(featureCollection);
          const kmlBlob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
          FileSaver.saveAs(kmlBlob, 'mapfy-export.kml');
          break;
          
        case 'image':
          // Export as high-quality image
          setExportProgress('Generating image...');
          
          // Get the map container
          const mapContainer = document.querySelector('.mapboxgl-map');
          
          if (mapContainer) {
            // Remove UI elements temporarily for clean export
            const uiElements = mapContainer.querySelectorAll('.mapboxgl-ctrl-top-left, .mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right');
            const uiVisibility = Array.from(uiElements).map(el => el.style.display);
            uiElements.forEach(el => el.style.display = 'none');
            
            // Generate the image
            const canvas = await html2canvas(mapContainer, {
              useCORS: true,
              allowTaint: true,
              scale: 2 // Higher quality
            });
            
            // Restore UI elements
            uiElements.forEach((el, i) => el.style.display = uiVisibility[i]);
            
            // Convert canvas to blob and save
            canvas.toBlob((blob) => {
              FileSaver.saveAs(blob, 'mapfy-export.png');
              setExportProgress(null);
              setExportModalOpen(false);
            }, 'image/png');
          }
          break;
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      // Close modal and reset progress for non-image exports
      if (format !== 'image') {
        setExportProgress(null);
        setExportModalOpen(false);
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportProgress(`Export failed: ${error.message}`);
      setTimeout(() => setExportProgress(null), 3000);
    }
  };

  // Function to fetch user's saved maps
  const fetchSavedMaps = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get('/api/maps');
      setSavedMaps(response.data);
    } catch (error) {
      console.error('Error fetching saved maps:', error);
      toast.error('Failed to load your saved maps');
    } finally {
      setIsLoading(false);
    }
  };
  
const handleSaveMap = async () => {
  // Check if user is logged in
  if (!user) {
    console.error('Auth state when attempting to save:', { 
      user, 
      token: localStorage.getItem('token'),
      headers: axios.defaults.headers.common 
    });
    toast.error('You must be logged in to save maps');
    return;
  }

  // Check if drawing tools are initialized
  if (!draw.current) {
    toast.error('Map editor not fully loaded. Please try again.');
    return;
  }
  
  if (!mapName.trim()) {
    toast.warning('Please enter a map name');
    return;
  }
  
  try {
    setIsSaving(true);
    
    const geoJSON = draw.current.getAll();
    const mapData = {
      name: mapName,
      description: mapDescription,
      geojson: geoJSON,
      style: mapStyle,
      center: map.current ? map.current.getCenter() : { lng, lat },
      zoom: map.current ? map.current.getZoom() : zoom,
      createdAt: new Date(),
    };
    
    console.log('Saving map data:', mapData);
    
    // If we're updating an existing map
    if (currentMapId) {
      await axios.put(`/api/maps/${currentMapId}`, mapData);
      toast.success('Map updated successfully');
    } else {
      // Creating a new map
      const response = await axios.post('/api/maps', mapData);
      setCurrentMapId(response.data._id);
      toast.success('Map saved successfully');
    }
    
    // Update last saved timestamp
    setLastSaved(new Date());
    
    // Refresh the saved maps list
    fetchSavedMaps();
    
    // Close the modal
    setSaveMapModalOpen(false);
  } catch (error) {
    console.error('Error saving map:', error);
    toast.error(`Failed to save map: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSaving(false);
  }
};
  
  // Function for auto-saving the current map
  const handleAutoSave = async () => {
    if (!user || !draw.current) return;
    
    try {
      const geoJSON = draw.current.getAll();
      
      // Only save if there are features to save
      if (geoJSON.features.length === 0) return;
      
      const mapData = {
        name: currentMapId ? mapName : `Draft - ${new Date().toLocaleString()}`,
        description: mapDescription || 'Auto-saved draft',
        geojson: geoJSON,
        style: mapStyle,
        center: map.current ? map.current.getCenter() : { lng, lat },
        zoom: map.current ? map.current.getZoom() : zoom,
        isDraft: true,
        updatedAt: new Date(),
      };
      
      if (currentMapId) {
        // Update existing draft
        await axios.put(`/api/maps/${currentMapId}`, mapData);
      } else {
        // Create new draft
        const response = await axios.post('/api/maps', mapData);
        setCurrentMapId(response.data._id);
      }
      
      // Update last saved timestamp
      setLastSaved(new Date());
      console.log('Auto-saved map draft', new Date().toLocaleString());
      
    } catch (error) {
      console.error('Error auto-saving map:', error);
    }
  };
  
  // Function to load a saved map
  const handleLoadMap = async (mapId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/maps/${mapId}`);
      const savedMap = response.data;
      
      // Clear current map
      if (draw.current) {
        draw.current.deleteAll();
      }
      
      // Set current map ID
      setCurrentMapId(savedMap._id);
      setMapName(savedMap.name);
      setMapDescription(savedMap.description || '');
      
      // Apply saved style and position
      if (savedMap.style && map.current) {
        setMapStyle(savedMap.style);
      }
      
      // Add features from saved map
      if (savedMap.geojson && savedMap.geojson.features && draw.current) {
        setTimeout(() => {
          draw.current.add(savedMap.geojson);
          drawFeatures.current = savedMap.geojson;
          
          // Update current view if center and zoom are available
          if (savedMap.center && savedMap.zoom && map.current) {
            map.current.jumpTo({
              center: [savedMap.center.lng, savedMap.center.lat],
              zoom: savedMap.zoom
            });
          } else if (savedMap.geojson.features.length > 0) {
            // Otherwise fit to features
            fitMapToFeatures(savedMap.geojson);
          }
        }, 300); // Small delay to ensure map style has loaded
      }
      
      toast.success(`Loaded map: ${savedMap.name}`);
      setLoadMapModalOpen(false);
      
    } catch (error) {
      console.error('Error loading map:', error);
      toast.error('Failed to load map');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to delete a saved map
  const handleDeleteMap = async (mapId, event) => {
    // Stop event propagation to prevent opening the map
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('Are you sure you want to delete this map?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/maps/${mapId}`);
      
      // If we're deleting the current map, reset current map ID
      if (mapId === currentMapId) {
        setCurrentMapId(null);
        setMapName('');
        setMapDescription('');
      }
      
      // Update saved maps list
      fetchSavedMaps();
      toast.success('Map deleted');
    } catch (error) {
      console.error('Error deleting map:', error);
      toast.error('Failed to delete map');
    }
  };
  
  // Function to create a new map
  const handleNewMap = () => {
    if (!confirm('Start a new map? Any unsaved changes will be lost.')) {
      return;
    }
    
    // Clear current map
    if (draw.current) {
      draw.current.deleteAll();
    }
    
    // Reset map state
    setCurrentMapId(null);
    setMapName('');
    setMapDescription('');
    
    // Reset view to default
    if (map.current) {
      map.current.flyTo({
        center: [-70.9, 42.35],
        zoom: 9
      });
    }
    
    toast.info('Started new map');
  };

  // Render function - Add UI elements for save/load functionality
  return (
    <div className="relative h-full w-full">
      {/* IMPORTANT: Always render the map container first, before any overlays */}
      <div 
        ref={mapContainer} 
        className="w-full h-full" 
        style={{ 
          minHeight: '400px'
        }} 
        id="mapbox-container"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="loading-spinner"></div>
          <p className="ml-3 text-gray-700">Loading map...</p>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded w-full max-w-md">
            <h3 className="font-bold">Error Loading Map</h3>
            <p>{error}</p>
            <p className="mt-2">Please check your Mapbox API key and internet connection.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      )}
      
      {/* UI Elements - only show when map is loaded and no error */}
      {!loading && !error && (
        <>
          {/* Coordinate display - MOVED to bottom right */}
          <div className="absolute bottom-2 right-2 bg-white p-2 z-10 rounded-md shadow-md">
            <p className="text-xs font-medium text-gray-700">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </p>
          </div>
          
          {/* Drawing Tools Bar - unchanged */}
          <div className="absolute left-2 top-12 bg-white rounded-md shadow-md z-20 p-1">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => handleToolClick('point')}
                className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'point' ? 'bg-blue-100 text-blue-600' : ''}`}
                title="Draw Point"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button 
                onClick={() => handleToolClick('line')}
                className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'line' ? 'bg-blue-100 text-blue-600' : ''}`}
                title="Draw Line"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
              <button 
                onClick={() => handleToolClick('polygon')}
                className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'polygon' ? 'bg-blue-100 text-blue-600' : ''}`}
                title="Draw Polygon"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
              </button>
              
              {/* Style and Color button */}
              <button 
                onClick={() => handleToolClick('style')}
                className={`p-2 rounded hover:bg-gray-100 transition-all ${isToolbarExpanded ? 'bg-gray-100 text-blue-600' : ''}`}
                title="Style Options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              <button 
                onClick={() => handleToolClick('trash')}
                className="p-2 rounded hover:bg-red-100 hover:text-red-600 transition-all"
                title="Delete Selected"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Import/Export Toolbar - MOVED closer to other tools */}
          <div className="absolute left-[50px] top-12 bg-white rounded-md shadow-md z-20 p-1">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => setImportModalOpen(true)}
                className="p-2 rounded hover:bg-gray-100 transition-all"
                title="Import Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button 
                onClick={() => setExportModalOpen(true)}
                className="p-2 rounded hover:bg-gray-100 transition-all"
                title="Export Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Expanded Style Toolbar */}
          {isToolbarExpanded && (
            <div className="absolute left-16 top-12 bg-white rounded-md shadow-md z-20 p-3 w-64">
              <h3 className="font-medium text-gray-700 mb-2">Style Options</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Marker Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {markerStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleMarkerStyleChange(style.id)}
                      className={`p-2 border rounded flex items-center justify-center ${currentMarkerStyle === style.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                      title={style.name}
                    >
                      {style.iconUrl ? (
                        <img src={style.iconUrl} alt={style.name} className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full" style={{backgroundColor: style.color}}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color.value)}
                      className={`w-6 h-6 rounded-full border ${currentColor === color.value ? 'border-gray-700 ring-2 ring-blue-500' : 'border-gray-300'}`}
                      style={{backgroundColor: color.value}}
                      title={color.name}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Measurements Display */}
          {(measurements.area || measurements.distance) && (
            <div className="absolute left-2 bottom-12 bg-white p-3 rounded-md shadow-md z-10 text-sm">
              <h3 className="font-bold mb-1 text-gray-700">Measurements</h3>
              {measurements.area && (
                <div className="mb-1">
                  <span className="font-medium text-gray-600">Area:</span> {measurements.area}
                </div>
              )}
              {measurements.distance && (
                <div>
                  <span className="font-medium text-gray-600">Distance:</span> {measurements.distance}
                </div>
              )}
            </div>
          )}
          
          {/* Map Style Selector */}
          <div className="absolute top-2 right-16 z-10 flex gap-2">
            <div className="bg-white p-2 rounded-md shadow-md">
              <select 
                value={mapStyle} 
                onChange={(e) => changeMapStyle(e.target.value)}
                className="text-sm text-gray-700 outline-none"
                disabled={!styleLoaded}
              >
                <option value="mapbox://styles/mapbox/streets-v11">Street</option>
                <option value="mapbox://styles/mapbox/outdoors-v11">Outdoors</option>
                <option value="mapbox://styles/mapbox/light-v10">Light</option>
                <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
                <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
                <option value="mapbox://styles/mapbox/satellite-streets-v11">Satellite Streets</option>
                <option value="mapbox://styles/mapbox/navigation-day-v1">Navigation Day</option>
                <option value="mapbox://styles/mapbox/navigation-night-v1">Navigation Night</option>
              </select>
            </div>
          </div>
          
          {/* Import Modal */}
          {importModalOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Import Data</h3>
                <p className="text-gray-600 mb-4">
                  Select a KML, GPX, or GeoJSON file to import.
                </p>
                
                {importError && (
                  <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-bold">Error</p>
                    <p>{importError}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center cursor-pointer transition-colors">
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".kml,.gpx,.json,.geojson" 
                      onChange={handleFileImport}
                      className="hidden" 
                    />
                    Choose File
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setImportModalOpen(false)}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Export Modal */}
          {exportModalOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Export Map</h3>
                
                {exportProgress ? (
                  <div className="mb-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <p>{exportProgress}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Choose a format to export your map data:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      <button
                        onClick={() => handleExport('geojson')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export as GeoJSON
                      </button>
                      
                      <button
                        onClick={() => handleExport('kml')}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export as KML
                      </button>
                      
                      <button
                        onClick={() => handleExport('image')}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Export as Image
                      </button>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setExportModalOpen(false)}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    disabled={!!exportProgress}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Save/Load Toolbar - Add this */}
          <div className="absolute right-2 top-12 bg-white rounded-md shadow-md z-20 p-1">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={handleNewMap}
                className="p-2 rounded hover:bg-gray-100 transition-all"
                title="New Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button 
                onClick={() => setSaveMapModalOpen(true)}
                className="p-2 rounded hover:bg-gray-100 transition-all"
                title="Save Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
              <button 
                onClick={() => setLoadMapModalOpen(true)}
                className="p-2 rounded hover:bg-gray-100 transition-all"
                title="Load Map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button 
                onClick={() => setAutoSave(prev => !prev)}
                className={`p-2 rounded hover:bg-gray-100 transition-all ${autoSave ? 'bg-blue-100 text-blue-600' : ''}`}
                title={autoSave ? "Auto-Save On" : "Auto-Save Off"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Status indicator - show when a map is loaded or last saved */}
          {(currentMapId || lastSaved) && (
            <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow-md z-10">
              <div className="flex items-center text-xs text-gray-600">
                {currentMapId && (
                  <span className="font-medium mr-2">
                    Map: {mapName || 'Unnamed Map'}
                  </span>
                )}
                {lastSaved && (
                  <span>
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Save Map Modal */}
          {saveMapModalOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  {currentMapId ? 'Update Map' : 'Save Map'}
                </h3>
                
                <div className="mb-4">
                  <label htmlFor="mapName" className="block text-sm font-medium text-gray-700 mb-1">
                    Map Name
                  </label>
                  <input
                    type="text"
                    id="mapName"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a name for your map"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="mapDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="mapDescription"
                    value={mapDescription}
                    onChange={(e) => setMapDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add a description for your map"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSaveMapModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMap}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving && (
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {currentMapId ? 'Update Map' : 'Save Map'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Load Map Modal */}
          {loadMapModalOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Saved Maps</h3>
                  <button
                    onClick={() => fetchSavedMaps()}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Refresh"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading your maps...</p>
                  </div>
                ) : savedMaps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You don't have any saved maps yet.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid gap-3">
                      {savedMaps.map((savedMap) => (
                        <div
                          key={savedMap._id}
                          onClick={() => handleLoadMap(savedMap._id)}
                          className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium">
                              {savedMap.name}
                              {savedMap.isDraft && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded">Draft</span>
                              )}
                            </h4>
                            {savedMap.description && (
                              <p className="text-sm text-gray-600 mt-1">{savedMap.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(savedMap.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex">
                            <button
                              onClick={(e) => handleDeleteMap(savedMap._id, e)}
                              className="p-1 rounded hover:bg-red-100 hover:text-red-500"
                              title="Delete Map"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setLoadMapModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Continue rendering