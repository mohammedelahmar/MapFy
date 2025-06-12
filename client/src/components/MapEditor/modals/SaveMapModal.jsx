import React, { useState } from 'react';

const SaveMapModal = ({ onClose, onSave, map, draw, user }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError('Please enter a name for your map');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Check if map is initialized
      if (!map || !map.current) {
        throw new Error('Map not initialized');
      }
      
      // Get current map settings
      const mapSettings = {
        center: map.current.getCenter(),
        zoom: map.current.getZoom(),
        bearing: map.current.getBearing(),
        pitch: map.current.getPitch(),
        style: map.current.getStyle().name
      };
      
      // Check if draw tools are initialized
      let geojson = { type: 'FeatureCollection', features: [] };
      
      if (draw?.current) {
        try {
          geojson = draw.current.getAll();
          console.log("Retrieved features:", geojson.features.length);
        } catch (err) {
          console.error("Error retrieving features:", err);
          // Continue with empty feature collection
        }
      } else {
        console.warn("Drawing tools not initialized, saving map without drawings");
      }
      
      // Save the map
      await onSave({
        name: name.trim(),
        description: description.trim(),
        isPublic,
        geojson,
        mapSettings
      });
      
      setIsSaving(false);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(`Failed to save map: ${error.message}`);
      setIsSaving(false);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Save Map</h3>
        
        {!user && (
          <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-bold">You are not logged in</p>
            <p>Your map will be saved locally. Log in to save to your account.</p>
          </div>
        )}
        
        {saveError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{saveError}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="map-name">
            Map Name
          </label>
          <input
            id="map-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a name for your map"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="map-desc">
            Description
          </label>
          <textarea
            id="map-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a description (optional)"
            rows={3}
          />
        </div>
        
        {user && (
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Make this map public</span>
            </label>
          </div>
        )}
        
        {!draw?.current && (
          <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-bold">Warning</p>
            <p>Drawing tools not initialized. Your map will be saved without any drawings.</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-500 text-white font-medium rounded transition-colors ${
              isSaving ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Map'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveMapModal;