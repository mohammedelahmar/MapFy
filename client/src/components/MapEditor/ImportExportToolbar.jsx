import React from 'react';

const ImportExportToolbar = ({ onImportClick, onExportClick }) => {
  return (
    <div className="absolute import-export-toolbar bg-white rounded-md shadow-md p-1">
      <div className="flex flex-col space-y-1">
        <button 
          onClick={onImportClick}
          className="p-2 rounded hover:bg-gray-100 transition-all"
          title="Import Data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        <button 
          onClick={onExportClick}
          className="p-2 rounded hover:bg-gray-100 transition-all"
          title="Export Data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImportExportToolbar;