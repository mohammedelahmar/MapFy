import React from 'react';

const MapPlaceholder = () => {
  return (
    <div className="w-full h-full max-h-[400px] min-h-[250px] bg-gray-200 rounded-xl shadow-lg flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-blue-500 opacity-10 z-0"></div>
      <div className="grid grid-cols-8 grid-rows-6 gap-1 w-full h-full p-4 z-10">
        {Array.from({ length: 48 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-blue-500 opacity-20 rounded-sm"
            style={{ 
              opacity: Math.random() * 0.3 + 0.1,
              height: `${Math.random() * 50 + 50}%`,
              marginTop: `${Math.random() * 50}%`
            }}
          ></div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="bg-white bg-opacity-70 px-6 py-3 rounded-lg shadow text-center">
          <h3 className="text-blue-800 font-bold text-xl">Topography Mapping</h3>
          <p className="text-gray-700">Interactive 3D terrain visualization</p>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;