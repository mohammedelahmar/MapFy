import React, { useState, useEffect } from 'react';

const LoadMapModal = ({ onClose, onLoad, user }) => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        
        // If user is logged in, fetch from API
        let mapsList = [];
        
        if (user) {
          // This would typically be an API call
          // const response = await fetch('/api/maps');
          // const data = await response.json();
          // mapsList = data.maps;
          
          // For now, we'll use mock data
          mapsList = [
            { id: '1', name: 'Sample Map 1', created: new Date().toISOString(), isPublic: true },
            { id: '2', name: 'Sample Map 2', created: new Date().toISOString(), isPublic: false }
          ];
        } else {
          // Check local storage
          const localMaps = localStorage.getItem('mapfy-maps');
          if (localMaps) {
            mapsList = JSON.parse(localMaps);
          }
        }
        
        setMaps(mapsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching maps:', error);
        setLoadError(`Failed to load maps: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchMaps();
  }, [user]);
  
  const handleMapSelect = async (mapId) => {
    try {
      setLoadError(null);
      
      // This would typically be an API call for user maps
      // or retrieval from localStorage for local maps
      let mapData;
      
      if (user) {
        // const response = await fetch(`/api/maps/${mapId}`);
        // mapData = await response.json();
        
        // Mock data for now
        mapData = {
          geojson: { type: 'FeatureCollection', features: [] },
          mapSettings: {
            center: [-70.9, 42.35],
            zoom: 9,
            style: 'mapbox://styles/mapbox/streets-v11'
          }
        };
      } else {
        // Get from local storage
        const localMaps = JSON.parse(localStorage.getItem('mapfy-maps') || '[]');
        mapData = localMaps.find(m => m.id === mapId);
      }
      
      if (mapData) {
        onLoad(mapData);
      } else {
        throw new Error('Map not found');
      }
    } catch (error) {
      console.error('Error loading map:', error);
      setLoadError(`Failed to load map: ${error.message}`);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Load Map</h3>
        
        {!user && (
          <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-bold">You are not logged in</p>
            <p>Only locally saved maps are available. Log in to access your account maps.</p>
          </div>
        )}
        
        {loadError && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{loadError}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="spinner"></div>
            <p className="ml-3 text-gray-600">Loading maps...</p>
          </div>
        ) : maps.length === 0 ? (
          <div className="text-center p-8 text-gray-600">
            <p>No saved maps found</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md mb-6">
            <ul>
              {maps.map((map) => (
                <li key={map.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => handleMapSelect(map.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition"
                  >
                    <div className="font-medium text-gray-800">{map.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(map.created).toLocaleDateString()}
                      {map.isPublic && <span className="ml-2 text-green-600">(Public)</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadMapModal;