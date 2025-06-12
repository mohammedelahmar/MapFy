import { useState, useEffect, useRef, useCallback } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { createDrawStyles } from '../utils/styleUtils';
import { calculateMeasurements } from '../utils/measurementUtils';
import mapboxgl from 'mapbox-gl';

const useDrawTools = (map, initialColor = '#3FB1CE') => {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [activeTool, setActiveTool] = useState(null);
  const [measurements, setMeasurements] = useState({ area: null, distance: null });
  const [showElevationProfile, setShowElevationProfile] = useState(false);
  const [drawReady, setDrawReady] = useState(false);
  const [elevationData, setElevationData] = useState(null);
  const draw = useRef(null);
  const drawFeatures = useRef(null);
  const popup = useRef(null);
  const drawInitialized = useRef(false);
  const hoverHandlerAttached = useRef(false);
  const initializeAttempts = useRef(0);
  
  // For debugging
  const logMapState = () => {
    console.log("MAP STATE CHECK:", {
      "Map exists": !!map?.current,
      "Map loaded": map?.current?.loaded(),
      "Has style": map?.current?.isStyleLoaded && map?.current?.isStyleLoaded() || false,
      "Draw initialized": drawInitialized.current,
      "Draw instance exists": !!draw.current
    });
  };

  const updateMeasurements = useCallback(() => {
    if (!draw.current) return;

    try {
      const data = draw.current.getAll();
      drawFeatures.current = data;

      const measurements = calculateMeasurements(data, map?.current);
      setMeasurements(measurements);
    } catch (err) {
      console.error("Error calculating measurements:", err);
    }
  }, [map]);

  const handleHover = useCallback((e) => {
    // Basic hover handler implementation
    if (!map?.current || !popup?.current) return;
    try {
      // Simple implementation to avoid causing issues
      if (map.current.getTerrain()) {
        const elevation = map.current.queryTerrainElevation(e.lngLat);
        if (elevation !== null) {
          setElevationData(Math.round(elevation * 10) / 10);
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }, [map]);

  const cleanUpDrawTools = useCallback(() => {
    console.log("Cleaning up draw tools");
    
    if (!map?.current) {
      console.log("Map not available for cleanup");
      return;
    }

    try {
      // Only remove event handlers if we're sure they were added
      if (hoverHandlerAttached.current) {
        map.current.off('mousemove', handleHover);
        hoverHandlerAttached.current = false;
      }
      
      map.current.off('draw.create', updateMeasurements);
      map.current.off('draw.update', updateMeasurements);
      map.current.off('draw.delete', updateMeasurements);
      map.current.off('draw.selectionchange', updateMeasurements);

      if (draw.current) {
        try {
          if (map.current.hasControl(draw.current)) {
            map.current.removeControl(draw.current);
          }
        } catch (err) {
          console.error("Error removing draw control:", err);
        }
      }

      draw.current = null;
      drawInitialized.current = false;
      setDrawReady(false);
    } catch (err) {
      console.error("Error cleaning up draw tools:", err);
    }
  }, [map, handleHover, updateMeasurements]);

  const addTerrain = useCallback(() => {
    if (!map?.current) return;
    
    try {
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        
        map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        console.log("Terrain added successfully");
      }
    } catch (error) {
      console.warn("Could not add terrain:", error.message);
    }
  }, [map]);

  const setupDrawTools = useCallback(() => {
    console.log("ATTEMPTING TO SETUP DRAW TOOLS, attempt #", initializeAttempts.current);
    initializeAttempts.current++;
    
    // Check if map exists and is properly loaded
    if (!map?.current) {
      console.log("Map not available, can't set up draw tools");
      return false;
    }
    
    // Add a more robust check for map readiness
    if (!map.current.loaded() || !map.current.getCanvas()) {
      console.log("Map not fully loaded yet, can't set up draw tools");
      return false;
    }
    
    try {
      // Safer check for style loaded state
      if (typeof map.current.isStyleLoaded !== 'function' || !map.current.isStyleLoaded()) {
        console.log("Map style not fully loaded, can't set up draw tools");
        return false;
      }
      
      // If draw is already initialized, don't reinitialize
      if (drawInitialized.current && draw.current) {
        console.log("Draw already initialized, skipping setup");
        return true;
      }
      
      console.log("Setting up draw tools NOW");
      
      try {
        // Clean up any existing draw tools first
        cleanUpDrawTools();

        // Create popup if needed
        if (!popup.current) {
          popup.current = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'measurement-popup'
          });
        }

        // Create new draw instance with explicit mode
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point: false,
            line_string: false,
            polygon: false,
            trash: false,
          },
          styles: createDrawStyles(currentColor),
          defaultMode: 'simple_select'
        });

        // Add draw control to map
        map.current.addControl(draw.current, 'top-left');
        console.log("Draw control added to map");

        // Add event listeners
        map.current.on('draw.create', updateMeasurements);
        map.current.on('draw.update', updateMeasurements);
        map.current.on('draw.delete', updateMeasurements);
        map.current.on('draw.selectionchange', updateMeasurements);

        if (!hoverHandlerAttached.current) {
          map.current.on('mousemove', handleHover);
          hoverHandlerAttached.current = true;
        }

        // Mark as initialized
        drawInitialized.current = true;
        console.log("Draw tools initialized successfully!");

        // Set ready state after a short delay
        setTimeout(() => {
          setDrawReady(true);
          console.log("Draw tools marked as ready");
        }, 200);

        return true;
      } catch (error) {
        console.error("Error setting up draw tools:", error);
        cleanUpDrawTools();
        return false;
      }
    } catch (error) {
      console.error("Error checking map state:", error);
      return false;
    }
  }, [map, currentColor, handleHover, updateMeasurements, cleanUpDrawTools]);

  // Add to useDrawTools.js
  const updateDrawStyles = useCallback((color, markerStyle) => {
    if (!draw.current || !map?.current) return;
    
    try {
      // Create new styles with updated color
      const newStyles = createDrawStyles(color, markerStyle);
      
      // Update the draw instance styles
      // This requires a bit of a hack since MapboxDraw doesn't expose a direct way to update styles
      if (map.current.hasControl(draw.current)) {
        // First store the current features
        const currentFeatures = draw.current.getAll();
        
        // Remove and re-add the control with new styles
        map.current.removeControl(draw.current);
        
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            point: false,
            line_string: false,
            polygon: false,
            trash: false,
          },
          styles: newStyles,
          defaultMode: 'simple_select'
        });
        
        map.current.addControl(draw.current, 'top-left');
        
        // Restore the features
        currentFeatures.features.forEach(feature => {
          draw.current.add(feature);
        });
        
        console.log("Draw styles updated successfully");
      }
    } catch (err) {
      console.error("Error updating draw styles:", err);
    }
  }, [map, draw]);

  // Don't use useEffect for initialization - we'll control this from the parent

  return {
    currentColor,
    setCurrentColor,
    activeTool,
    setActiveTool,
    measurements,
    showElevationProfile, 
    setShowElevationProfile,
    drawReady,
    elevationData,
    draw,
    drawFeatures: drawFeatures.current,
    setupDrawTools,
    cleanUpDrawTools,
    addTerrain,
    updateDrawStyles,
    handleToolClick: (tool) => {
      if (!drawReady || !draw.current || !map.current) {
        console.log("Can't handle tool click - draw not ready");
        return;
      }

      try {
        if (tool === activeTool && tool !== 'style' && tool !== 'color') {
          draw.current.changeMode('simple_select');
          setActiveTool(null);
          return;
        }

        setActiveTool(tool);

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
    },
    logMapState, // Export for debugging
    isInitialized: drawInitialized.current
  };
};

export default useDrawTools;