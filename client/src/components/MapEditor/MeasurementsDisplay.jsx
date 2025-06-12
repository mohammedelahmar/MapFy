import React from 'react';

const MeasurementsDisplay = ({ measurements }) => {
  const { area, distance } = measurements;

  if (!area && !distance) return null;

  return (
    <div className="absolute left-2 bottom-2 bg-white p-3 rounded-md shadow-md z-10">
      <h4 className="font-medium text-gray-700 mb-1">Measurements</h4>
      {area && (
        <div className="text-sm">
          <span className="font-medium">Area:</span> {area}
        </div>
      )}
      {distance && (
        <div className="text-sm">
          <span className="font-medium">Distance:</span> {distance}
        </div>
      )}
    </div>
  );
};

export default MeasurementsDisplay;