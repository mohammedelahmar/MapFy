import React, { useState } from 'react';
import { exportToFormat } from '../../../utils/fileUtils';

const ExportModal = ({ onClose, onExport, map, draw }) => {
  const [format, setFormat] = useState('geojson');
  const [includeStyle, setIncludeStyle] = useState(true);
  const [includeMap, setIncludeMap] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  const handleExport = async () => {
    try {
      setExportError(null);
      
      if (!draw || !draw.current) {
        throw new Error('Drawing tools not initialized');
      }
      
      const features = draw.current.getAll();
      
      if (features.features.length === 0) {
        throw new Error('No features to export');
      }
      
      await exportToFormat({
        format,
        features,
        includeStyle,
        includeMap: includeMap && map.current ? map.current : null
      });
      
      onExport(format);
    } catch (error) {
      console.error('Export error:', error);
      setExportError(`Failed to export: ${error.message}`);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Export Map Data</h3>
        
        {exportError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{exportError}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="geojson">GeoJSON</option>
            <option value="kml">KML</option>
            <option value="gpx">GPX</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeStyle}
              onChange={(e) => setIncludeStyle(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Include style information</span>
          </label>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeMap}
              onChange={(e) => setIncludeMap(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Include map screenshot</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;