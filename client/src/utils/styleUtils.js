/**
 * Create styles for the MapboxDraw component
 * 
 * @param {string} color - Base color for the styles
 * @returns {Array} Array of style objects
 */
export const createDrawStyles = (color = '#3B82F6') => {
  return [
    // Point styles
    {
      'id': 'gl-draw-point',
      'type': 'circle',
      'filter': ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      'paint': {
        'circle-radius': 7,
        'circle-color': color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF'
      }
    },
    {
      'id': 'gl-draw-point-static',
      'type': 'circle',
      'filter': ['all', ['==', '$type', 'Point'], ['==', 'mode', 'static']],
      'paint': {
        'circle-radius': 7,
        'circle-color': color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF'
      }
    },
    
    // Line styles
    {
      'id': 'gl-draw-line',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': color,
        'line-width': 4,
        'line-opacity': 0.7
      }
    },
    {
      'id': 'gl-draw-line-static',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': color,
        'line-width': 4,
        'line-opacity': 0.7
      }
    },
    
    // Polygon styles
    {
      'id': 'gl-draw-polygon-fill',
      'type': 'fill',
      'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'paint': {
        'fill-color': color,
        'fill-outline-color': color,
        'fill-opacity': 0.3
      }
    },
    {
      'id': 'gl-draw-polygon-stroke',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': color,
        'line-width': 3,
        'line-opacity': 0.7
      }
    },
    
    // Vertex styles
    {
      'id': 'gl-draw-polygon-and-line-vertex-active',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      'paint': {
        'circle-radius': 6,
        'circle-color': '#FFFFFF',
        'circle-stroke-width': 2,
        'circle-stroke-color': color
      }
    }
  ];
};