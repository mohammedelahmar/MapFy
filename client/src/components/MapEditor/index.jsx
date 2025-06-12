import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import useMapbox from '../../hooks/useMapbox';
import useDrawTools from '../../hooks/useDrawTools';
import { useAuth } from "../../hooks/useAuth";
// Import all the sub-components
import CoordinateDisplay from './CoordinateDisplay';
import DrawingToolbar from './DrawingToolbar';
import ImportExportToolbar from './ImportExportToolbar';
import StyleToolbar from './StyleToolbar';
import MapStyleSelector from './MapStyleSelector';
import MeasurementsDisplay from './MeasurementsDisplay';
import SaveLoadToolbar from './SaveLoadToolbar';
import ImportModal from './modals/ImportModal';
import ExportModal from './modals/ExportModal';
import SaveMapModal from './modals/SaveMapModal';
import LoadMapModal from './modals/LoadMapModal';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapEditor = () => {
  // State for modals
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [saveMapModalOpen, setSaveMapModalOpen] = useState(false);
  const [loadMapModalOpen, setLoadMapModalOpen] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [currentMarkerStyle, setCurrentMarkerStyle] = useState('default');
  
  // Create debugging state
  const [debugInfo, setDebugInfo] = useState({});
  const [initializationTimer, setInitializationTimer] = useState(null);
  const [loadingOperation, setLoadingOperation] = useState(null);
  
  // Get user from auth hook
  const { user } = useAuth();

  // Initialize map using custom hook
  const { 
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
  } = useMapbox();

  // Store features before style changes
  const [savedFeatures, setSavedFeatures] = useState(null);

  // Initialize drawing tools
  const {
    currentColor,
    setCurrentColor,
    activeTool,
    measurements,
    drawReady,
    handleToolClick,
    addTerrain,
    draw,
    setupDrawTools,
    cleanUpDrawTools,
    logMapState,
    isInitialized,
    updateDrawStyles
  } = useDrawTools(map, '#3FB1CE');

  // We'll use this to force initialization manually
  const forceInitialize = useCallback(() => {
    if (!map?.current) return;
    
    console.log("Forcing draw tools initialization...");
    clearTimeout(initializationTimer);
    
    // Create a better initialization sequence with backoff
    let attempts = 0;
    const maxAttempts = 10;
    let delay = 500;
    
    const attemptInitialization = () => {
      attempts++;
      console.log(`Attempt ${attempts} to initialize draw tools`);
      
      if (!map.current || !map.current.loaded()) {
        console.log("Map not ready yet");
        if (attempts < maxAttempts) {
          const nextTimer = setTimeout(attemptInitialization, delay);
          setInitializationTimer(nextTimer);
          delay = Math.min(delay * 1.5, 3000); // Exponential backoff up to 3s
        }
        return;
      }
      
      const success = setupDrawTools();
      if (success) {
        console.log("Draw tools successfully initialized!");
        
        // Restore saved features if they exist
        if (savedFeatures && draw.current) {
          try {
            // Add each feature from savedFeatures
            savedFeatures.features.forEach(feature => {
              draw.current.add(feature);
            });
            setSavedFeatures(null); // Clear saved features
          } catch (err) {
            console.error("Failed to restore features:", err);
          }
        }
        
        // Try to add terrain
        setTimeout(() => {
          addTerrain();
          console.log("Map and draw tools ready, adding terrain");
        }, 500);
      } else if (attempts < maxAttempts) {
        console.log(`Initialization failed, will retry in ${delay}ms`);
        const nextTimer = setTimeout(attemptInitialization, delay);
        setInitializationTimer(nextTimer);
        delay = Math.min(delay * 1.5, 3000); // Exponential backoff up to 3s
      }
    };
    
    // Start the attempt sequence
    attemptInitialization();
  }, [map, setupDrawTools, addTerrain, initializationTimer, savedFeatures, draw]);

  // Debug effect to track state
  useEffect(() => {
    if (!map?.current) return;
    
    const updateDebugInfo = () => {
      const drawFeaturesText = draw?.current ? 'Available' : 'N/A';
      
      try {
        // Only update debug info if values have actually changed
        const newDebugInfo = {
          'Map ref exists': !!map?.current,
          'Map loaded': !!map?.current?.loaded(),
          'Map style loaded': styleLoaded,
          'Draw tools initialized': isInitialized,
          'Draw ready state': drawReady,
          'Draw features': drawFeaturesText,
          'Current color': currentColor,
          'Current marker style': currentMarkerStyle
        };
        
        // Compare with previous state to prevent unnecessary updates
        setDebugInfo(prevInfo => {
          // Only update if something changed
          if (JSON.stringify(prevInfo) !== JSON.stringify(newDebugInfo)) {
            return newDebugInfo;
          }
          return prevInfo;
        });
        
        // Only call logMapState if map is loaded AND styleLoaded is true
        // And only do this on manual triggers, not in the interval
      } catch (err) {
        console.error("Error updating debug info:", err);
      }
    };
    
    // Update debug info less frequently - once every 3 seconds is enough
    const debugInterval = setInterval(updateDebugInfo, 3000);
    
    // Do initial update
    setTimeout(updateDebugInfo, 500);
    
    return () => clearInterval(debugInterval);
  }, [map, styleLoaded, drawReady, isInitialized, currentColor, currentMarkerStyle]);

  // Effect to initialize draw tools when map and style are loaded
  useEffect(() => {
    if (map?.current && styleLoaded) {
      console.log("Map and style loaded, attempting to initialize draw tools");
      forceInitialize();
    }
    
    return () => {
      clearTimeout(initializationTimer);
    };
  }, [map, styleLoaded, forceInitialize, initializationTimer]);

  // Effect to handle map style changes
  useEffect(() => {
    if (map?.current) {
      const handleStyleLoad = () => {
        console.log("Map style loaded, re-initializing draw tools");
        
        // Clean up first
        cleanUpDrawTools();
        
        // Add a delay to ensure map is actually ready
        setTimeout(() => {
          if (map.current && map.current.loaded() && map.current.isStyleLoaded()) {
            forceInitialize();
          }
        }, 1000); 
      };
      
      map.current.on('style.load', handleStyleLoad);
      
      return () => {
        if (map.current) {
          map.current.off('style.load', handleStyleLoad);
        }
      };
    }
  }, [map, cleanUpDrawTools, forceInitialize]);

  // Effect to update draw styles when color or marker style changes
  useEffect(() => {
    if (drawReady && draw?.current) {
      updateDrawStyles(currentColor, currentMarkerStyle);
    }
  }, [currentColor, currentMarkerStyle, drawReady, draw, updateDrawStyles]);

  // Handle style button click
  const handleStyleButtonClick = () => {
    setIsToolbarExpanded(!isToolbarExpanded);
  };

  // Handle marker style change
  const handleMarkerStyleChange = (styleId) => {
    setCurrentMarkerStyle(styleId);
  };

  // Create manual re-initialization button for debugging
  const handleManualInitialize = () => {
    cleanUpDrawTools();
    setTimeout(forceInitialize, 500);
  };

  // New map handler
  const handleNewMap = () => {
    if (!draw?.current || !drawReady) return;
    
    try {
      // Delete all features
      const allFeatures = draw.current.getAll();
      allFeatures.features.forEach(feature => {
        draw.current.delete(feature.id);
      });
    } catch (err) {
      console.error("Error clearing map:", err);
    }
  };

  // Import handler
  const handleImport = (geojsonData) => {
    if (!draw?.current || !drawReady) {
      console.log("Draw not ready for import");
      return;
    }
    
    setLoadingOperation("import");
    
    try {
      // Add each feature from the imported GeoJSON
      if (geojsonData && geojsonData.features) {
        geojsonData.features.forEach(feature => {
          draw.current.add(feature);
        });
        console.log("Import successful!");
      }
    } catch (err) {
      console.error("Error importing data:", err);
    } finally {
      setLoadingOperation(null);
    }
  };

  // Export handler
  const handleExport = (format) => {
    if (!draw?.current) return null;
    
    setLoadingOperation("export");
    
    try {
      // Get all features
      const data = draw.current.getAll();
      
      if (format === 'geojson') {
        // Return GeoJSON directly
        setLoadingOperation(null);
        return data;
      } else if (format === 'json') {
        // Convert to string for JSON format
        setLoadingOperation(null);
        return JSON.stringify(data);
      }
    } catch (err) {
      console.error("Error exporting data:", err);
    }
    
    setLoadingOperation(null);
    return null;
  };

  // Save map handler
  const handleSaveMap = async (mapName, description) => {
    if (!draw?.current || !user) return;
    
    setLoadingOperation("save");
    
    try {
      // Get map data
      const mapData = {
        name: mapName,
        description: description,
        userId: user.id,
        geojson: draw.current.getAll(),
        mapStyle: mapStyle,
        center: [lng, lat],
        zoom: zoom
      };
      
      // Here you would typically send this to your API
      console.log("Map saved:", mapData);
      
      // Return success
      return { success: true };
    } catch (err) {
      console.error("Error saving map:", err);
      return { success: false, error: err.message };
    } finally {
      setLoadingOperation(null);
    }
  };

  // Load map handler
  const handleLoadMap = async (mapId) => {
    if (!draw?.current) return;
    
    setLoadingOperation("load");
    
    try {
      // Here you would typically fetch from your API
      // For now we'll simulate with a placeholder
      const mapData = {
        geojson: { type: "FeatureCollection", features: [] },
        mapStyle: "mapbox://styles/mapbox/streets-v11",
        center: [-74.5, 40],
        zoom: 9
      };
      
      // Clear existing features
      handleNewMap();
      
      // Set map style and position
      setMapStyle(mapData.mapStyle);
      
      // Add features (after map style change completes)
      setTimeout(() => {
        if (draw.current && mapData.geojson && mapData.geojson.features) {
          mapData.geojson.features.forEach(feature => {
            draw.current.add(feature);
          });
        }
      }, 1000);
      
      return { success: true };
    } catch (err) {
      console.error("Error loading map:", err);
      return { success: false, error: err.message };
    } finally {
      setLoadingOperation(null);
    }
  };

  // Return the component JSX
  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainer} className="map-container w-full h-full">
        {loading && <div className="loading-overlay">Loading map...</div>}
        {error && <div className="error-overlay">{error}</div>}
        {loadingOperation && (
          <div className="loading-overlay">
            {`${loadingOperation.charAt(0).toUpperCase() + loadingOperation.slice(1)}ing...`}
          </div>
        )}
      </div>

      {/* Toolbars */}
      <DrawingToolbar 
        activeTool={activeTool} 
        handleToolClick={handleToolClick} 
        onStyleButtonClick={handleStyleButtonClick}
        disabled={!drawReady}
      />
      
      {/* Coordinate display */}
      <CoordinateDisplay lng={lng} lat={lat} zoom={zoom} />
      
      {/* Import/Export Toolbar */}
      <div className="absolute left-2 top-72 z-20">
        <ImportExportToolbar 
          onImportClick={() => setImportModalOpen(true)}
          onExportClick={() => setExportModalOpen(true)}
        />
      </div>
      
      {/* Style Toolbar */}
      {isToolbarExpanded && (
        <div className="absolute left-14 top-12 z-25">
          <StyleToolbar 
            isExpanded={isToolbarExpanded}
            currentMarkerStyle={currentMarkerStyle}
            currentColor={currentColor}
            onMarkerStyleChange={handleMarkerStyleChange}
            onColorChange={setCurrentColor}
          />
        </div>
      )}
      
      {/* Map Style Selector */}
      <div className="absolute top-2 left-2 z-20">
        <MapStyleSelector currentStyle={mapStyle} onChange={(newStyle) => {
          // Save current features before changing style
          if (draw?.current) {
            setSavedFeatures(draw.current.getAll());
          }
          setMapStyle(newStyle);
        }} />
      </div>
      
      {/* Save/Load Toolbar */}
      <div className="absolute top-2 right-2 z-20">
        <SaveLoadToolbar
          onNewMap={handleNewMap}
          onSaveMap={() => setSaveMapModalOpen(true)}
          onLoadMap={() => setLoadMapModalOpen(true)}
        />
      </div>
      
      {/* Measurements Display */}
      <MeasurementsDisplay measurements={measurements} />
      
      {/* Modals - higher z-index */}
      {importModalOpen && (
        <ImportModal 
          onClose={() => setImportModalOpen(false)}
          onImport={handleImport}
        />
      )}
      
      {exportModalOpen && (
        <ExportModal
          onClose={() => setExportModalOpen(false)}
          onExport={handleExport}
          map={map}
          draw={draw}
        />
      )}
      
      {saveMapModalOpen && (
        <SaveMapModal
          onClose={() => setSaveMapModalOpen(false)}
          onSave={handleSaveMap}
          map={map}
          draw={draw}
          user={user}
        />
      )}
      
      {loadMapModalOpen && (
        <LoadMapModal
          onClose={() => setLoadMapModalOpen(false)}
          onLoad={handleLoadMap}
          user={user}
        />
      )}
    </div>
  );
};

export default MapEditor;