import React from 'react';

const ElevationDisplay = ({ elevation }) => {
  if (elevation === null) return null;
  
  return (
    <div className="absolute right-36 bottom-2 bg-white p-2 z-10 rounded-md shadow-md">
      <p className="text-xs font-medium text-gray-700">
        Elevation: {elevation} m
      </p>
    </div>
  );
};

export default ElevationDisplay;