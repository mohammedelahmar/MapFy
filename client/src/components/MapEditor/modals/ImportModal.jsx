import React, { useRef, useState } from 'react';
import { parseImportedFile } from '../../../utils/fileUtils';

const ImportModal = ({ onClose, onImport }) => {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);
  
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportError(null);
    
    try {
      const geoJSON = await parseImportedFile(file);
      
      if (geoJSON) {
        onImport(geoJSON);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError(`Failed to import file: ${error.message}`);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Import Data</h3>
        <p className="text-gray-600 mb-4">
          Select a KML, GPX, or GeoJSON file to import.
        </p>
        
        {importError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{importError}</p>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center cursor-pointer transition-colors">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".kml,.gpx,.json,.geojson" 
              onChange={handleFileImport}
              className="hidden" 
            />
            Choose File
          </label>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;