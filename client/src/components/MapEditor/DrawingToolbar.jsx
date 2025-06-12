import React from 'react';

const DrawingToolbar = ({ activeTool, handleToolClick, onStyleButtonClick, disabled = false }) => {
  return (
    <div className="absolute drawing-toolbar bg-white rounded-md shadow-md p-1">
      <div className="flex flex-col space-y-1">
        <button 
          onClick={() => handleToolClick('point')}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'point' ? 'bg-blue-100 text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Draw Point"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button 
          onClick={() => handleToolClick('line')}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'line' ? 'bg-blue-100 text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Draw Line"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
        <button 
          onClick={() => handleToolClick('polygon')}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'polygon' ? 'bg-blue-100 text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Draw Polygon"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          </svg>
        </button>
        
        {/* Style and Color button */}
        <button 
          onClick={onStyleButtonClick}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${activeTool === 'style' ? 'bg-gray-100 text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Style Options"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
        
        <div className="border-t border-gray-200 my-1"></div>
        <button 
          onClick={() => handleToolClick('trash')}
          className="p-2 rounded hover:bg-red-100 hover:text-red-600 transition-all"
          title="Delete Selected"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DrawingToolbar;