import React from 'react';

const MeasurementsDisplay = ({ measurements, hoverMeasurements, position = "bottom-left" }) => {
  const { area, distance } = measurements || {};
  const { area: hoverArea, distance: hoverDistance } = hoverMeasurements || {};
  
  // If no measurements at all, don't render
  if (!area && !distance && !hoverArea && !hoverDistance) return null;
  
  // Determine positioning classes
  const positionClasses = {
    "bottom-left": "left-2 bottom-2",
    "bottom-right": "right-2 bottom-2",
    "top-left": "left-2 top-20",
    "top-right": "right-2 top-20"
  };
  
  const positionClass = positionClasses[position] || "left-2 bottom-2";
  
  return (
    <div className={`absolute ${positionClass} bg-white p-3 rounded-md shadow-md z-10 min-w-[150px]`}>
      <h4 className="font-medium text-gray-700 mb-1">Measurements</h4>
      
      {/* Selected feature measurements */}
      {(area || distance) && (
        <div className="mb-2">
          <p className="text-xs font-medium text-blue-600">Selected</p>
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
      )}
      
      {/* Hover measurements */}
      {(hoverArea || hoverDistance) && (
        <div>
          <p className="text-xs font-medium text-green-600">Hover</p>
          {hoverArea && (
            <div className="text-sm">
              <span className="font-medium">Area:</span> {hoverArea}
            </div>
          )}
          {hoverDistance && (
            <div className="text-sm">
              <span className="font-medium">Distance:</span> {hoverDistance}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementsDisplay;