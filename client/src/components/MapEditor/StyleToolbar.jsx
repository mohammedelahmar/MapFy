import React from 'react';
import { markerStyles } from '../../constants/markerStyles';
import { colorOptions } from '../../constants/colorOptions';

const StyleToolbar = ({ 
  isExpanded,
  currentMarkerStyle,
  currentColor,
  onMarkerStyleChange,
  onColorChange
}) => {
  if (!isExpanded) return null;
  
  return (
    <div className="absolute style-toolbar bg-white rounded-md shadow-md z-20 p-3 w-64">
      <h3 className="font-medium text-gray-700 mb-2">Style Options</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-600 mb-1">Marker Style</label>
        <div className="grid grid-cols-4 gap-2">
          {markerStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onMarkerStyleChange(style.id)}
              className={`p-2 border rounded flex items-center justify-center ${currentMarkerStyle === style.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              title={style.name}
            >
              {style.iconUrl ? (
                <img src={style.iconUrl} alt={style.name} className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 rounded-full" style={{backgroundColor: style.color}}></div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
        <div className="grid grid-cols-6 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorChange(color.value)}
              className={`w-6 h-6 rounded-full border ${currentColor === color.value ? 'border-gray-700 ring-2 ring-blue-500' : 'border-gray-300'}`}
              style={{backgroundColor: color.value}}
              title={color.name}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleToolbar;