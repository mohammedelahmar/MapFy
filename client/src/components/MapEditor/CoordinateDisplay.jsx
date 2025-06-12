import React from 'react';

/**
 * Component that displays the current map coordinates and zoom level
 * 
 * @param {Object} props
 * @param {string|number} props.lng - Longitude value
 * @param {string|number} props.lat - Latitude value
 * @param {string|number} props.zoom - Current zoom level
 */
const CoordinateDisplay = ({ lng, lat, zoom }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-white p-2 z-10 rounded-md shadow-md">
      <p className="text-xs font-medium text-gray-700">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </p>
    </div>
  );
};

export default CoordinateDisplay;