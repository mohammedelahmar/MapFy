import * as turf from '@turf/turf';

/**
 * Calculate measurements (area and/or distance) for a GeoJSON feature
 * 
 * @param {Object} feature - GeoJSON feature
 * @returns {Object} Object containing area and distance measurements
 */
export const calculateMeasurements = (feature) => {
  if (!feature || !feature.geometry) {
    return { area: null, distance: null };
  }
  
  try {
    let area = null;
    let distance = null;
    
    // Calculate area for polygons
    if (feature.geometry.type.includes('Polygon')) {
      const areaInSquareMeters = turf.area(feature);
      
      // Format the area based on size
      if (areaInSquareMeters >= 1000000) {
        area = `${(areaInSquareMeters / 1000000).toFixed(2)} km²`;
      } else if (areaInSquareMeters >= 10000) {
        area = `${(areaInSquareMeters / 10000).toFixed(2)} ha`;
      } else {
        area = `${Math.round(areaInSquareMeters)} m²`;
      }
    }
    
    // Calculate distance for lines
    if (feature.geometry.type === 'LineString') {
      const distanceInMeters = turf.length(feature, { units: 'meters' });
      
      // Format the distance based on length
      if (distanceInMeters >= 1000) {
        distance = `${(distanceInMeters / 1000).toFixed(2)} km`;
      } else {
        distance = `${Math.round(distanceInMeters)} m`;
      }
    }
    
    return { area, distance };
  } catch (error) {
    console.error('Error calculating measurements:', error);
    return { area: null, distance: null };
  }
};

/**
 * Generate elevation profile data for a line
 * 
 * @param {Object} line - GeoJSON LineString feature
 * @param {Object} terrainSource - DEM source for elevation data
 * @returns {Object} Object containing elevation and distance arrays
 */
export const generateElevationProfile = async (line, map) => {
  if (!line || !line.geometry || line.geometry.type !== 'LineString' || !map) {
    return { elevations: [], distances: [] };
  }
  
  try {
    const coordinates = line.geometry.coordinates;
    const elevations = [];
    const distances = [];
    let cumulativeDistance = 0;
    
    // Sample points along the line
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      
      // Get elevation from DEM
      const elevation = map.queryTerrainElevation(coord);
      
      // Calculate distance from start
      if (i > 0) {
        const from = turf.point(coordinates[i-1]);
        const to = turf.point(coord);
        const distance = turf.distance(from, to, { units: 'kilometers' });
        cumulativeDistance += distance;
      }
      
      elevations.push(elevation !== null ? Math.round(elevation) : 0);
      distances.push(parseFloat(cumulativeDistance.toFixed(2)));
    }
    
    return { elevations, distances };
  } catch (error) {
    console.error('Error generating elevation profile:', error);
    return { elevations: [], distances: [] };
  }
};