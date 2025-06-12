import mapboxgl from 'mapbox-gl';

/**
 * Adds 3D terrain to a Mapbox map
 * 
 * @param {Object} map - Mapbox map instance
 */
export const addTerrain = (map) => {
  if (!map) return;

  try {
    if (!map.isStyleLoaded()) {
      console.log("Style not loaded yet for terrain");
      return;
    }

    if (!map.getSource('mapbox-dem')) {
      try {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      } catch (err) {
        console.error("Error adding terrain source:", err);
        return; // Exit if terrain source cannot be added
      }
    }

    if (!map.getTerrain()) {
      map.setTerrain({
        source: 'mapbox-dem',
        exaggeration: 1.5,
      });
    }
  } catch (err) {
    console.error("Error in addTerrain:", err);
  }
};

export const fitMapToFeatures = (map, geoJSON) => {
  if (!map) return;
  
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
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  } catch (error) {
    console.error('Error fitting map to features:', error);
  }
};