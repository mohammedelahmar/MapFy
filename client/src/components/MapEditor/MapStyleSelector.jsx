import React from 'react';

const MapStyleSelector = ({ currentStyle, onChange }) => {
  const mapStyles = [
    {
      id: 'streets',
      name: 'Streets',
      url: 'mapbox://styles/mapbox/streets-v11'
    },
    {
      id: 'outdoors',
      name: 'Outdoors',
      url: 'mapbox://styles/mapbox/outdoors-v11'
    },
    {
      id: 'satellite',
      name: 'Satellite',
      url: 'mapbox://styles/mapbox/satellite-v9'
    },
    {
      id: 'satellite-streets',
      name: 'Satellite Streets',
      url: 'mapbox://styles/mapbox/satellite-streets-v11'
    },
    {
      id: 'light',
      name: 'Light',
      url: 'mapbox://styles/mapbox/light-v10'
    },
    {
      id: 'dark',
      name: 'Dark',
      url: 'mapbox://styles/mapbox/dark-v10'
    }
  ];

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="absolute map-style-selector z-10">
      <select
        value={currentStyle}
        onChange={handleChange}
        className="bg-white px-3 py-2 text-sm shadow-md rounded-md cursor-pointer border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {mapStyles.map(style => (
          <option key={style.id} value={style.url}>
            {style.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MapStyleSelector;