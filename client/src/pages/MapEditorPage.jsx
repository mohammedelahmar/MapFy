import React, { useState } from 'react';
import MapEditor from '../components/MapEditor';
import MapEditorDebug from '../components/MapEditorDebug';

const MapEditorPage = () => {
  const [useDebug, setUseDebug] = useState(false);
  
  return (
    <div className="p-4 h-[calc(100vh-80px)] min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Map Editor</h2>
        <button 
          onClick={() => setUseDebug(prev => !prev)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
        >
          {useDebug ? "Show Real Map" : "Show Debug View"}
        </button>
      </div>
      
      {/* Map container with explicit dimensions */}
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
        style={{ 
          height: 'calc(100vh - 220px)', 
          minHeight: '500px'
        }}
      >
        {useDebug ? <MapEditorDebug /> : <MapEditor />}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Controls</h3>
          <p className="text-gray-600 text-sm">
            • Use the mouse to pan and scroll to zoom<br />
            • Click the drawing tools on the left to create shapes<br />
            • Select shapes to see measurements<br />
            • Use the trash icon to delete selected shapes
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Drawing & Import/Export</h3>
          <p className="text-gray-600 text-sm">
            • Point, Line, Polygon: Create different map elements<br />
            • Import: Load KML, GPX or GeoJSON files<br />
            • Export: Save as GeoJSON, KML or high-quality image<br />
            • Style: Customize colors and marker types
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Tip</h3>
          <p className="text-gray-600 text-sm">
            Export your map as an image to share with others or save as 
            GeoJSON/KML to continue editing in other mapping tools.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapEditorPage;