import { DOMParser } from '@xmldom/xmldom';
import * as toGeoJSON from '@mapbox/togeojson';
import tokml from 'tokml';
import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

/**
 * Parse an imported file into GeoJSON format
 * 
 * @param {File} file - The file to parse
 * @returns {Promise<Object>} GeoJSON data
 */
export const parseImportedFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!['kml', 'gpx', 'json', 'geojson'].includes(fileExtension)) {
    throw new Error('Unsupported file format');
  }
  
  try {
    // Parse GeoJSON or JSON files
    if (fileExtension === 'json' || fileExtension === 'geojson') {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate that it's GeoJSON
      if (!json.type || !['FeatureCollection', 'Feature'].includes(json.type)) {
        throw new Error('Invalid GeoJSON format');
      }
      
      return json;
    }
    
    // Parse KML files
    if (fileExtension === 'kml') {
      const text = await file.text();
      const dom = new DOMParser().parseFromString(text, 'text/xml');
      return toGeoJSON.kml(dom);
    }
    
    // Parse GPX files
    if (fileExtension === 'gpx') {
      const text = await file.text();
      const dom = new DOMParser().parseFromString(text, 'text/xml');
      return toGeoJSON.gpx(dom);
    }
  } catch (error) {
    throw new Error(`Error parsing file: ${error.message}`);
  }
};

/**
 * Export features to a specified format
 * 
 * @param {Object} options - Export options
 * @param {string} options.format - Export format (geojson, kml, gpx)
 * @param {Object} options.features - GeoJSON FeatureCollection
 * @param {boolean} options.includeStyle - Whether to include style information
 * @param {Object} options.includeMap - Mapbox map instance for screenshot
 * @returns {Promise<void>} Triggers download of the exported file
 */
export const exportToFormat = async ({ format, features, includeStyle, includeMap }) => {
  if (!features || !features.features) {
    throw new Error('No features to export');
  }
  
  try {
    const fileName = `mapfy-export-${new Date().toISOString().slice(0, 10)}`;
    
    // Export as GeoJSON
    if (format === 'geojson') {
      // Clone features to avoid modifying the original
      const geojson = JSON.parse(JSON.stringify(features));
      
      // Add style information if requested
      if (includeStyle) {
        // Add MapFy style metadata
        geojson.metadata = {
          mapfy: {
            version: '1.0.0',
            styleInfo: true
          }
        };
      }
      
      const blob = new Blob([JSON.stringify(geojson, null, 2)], {
        type: 'application/json'
      });
      
      // Download the file
      downloadFile(`${fileName}.geojson`, blob);
    } 
    // Export as KML or GPX formats would be implemented here
    else {
      throw new Error(`Export format ${format} not yet implemented`);
    }
    
    // Add map screenshot if requested
    if (includeMap) {
      const mapCanvas = includeMap.getCanvas();
      const screenshot = mapCanvas.toDataURL('image/png');
      
      // Download screenshot
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `${fileName}-map.png`;
      link.click();
    }
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
};

/**
 * Utility function to download a file
 * 
 * @param {string} filename - The file name
 * @param {Blob} blob - The file content as a Blob
 */
const downloadFile = (filename, blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToGeoJSON = (featureCollection) => {
  const geoJSONString = JSON.stringify(featureCollection, null, 2);
  const geoJSONBlob = new Blob([geoJSONString], { type: 'application/json' });
  FileSaver.saveAs(geoJSONBlob, 'mapfy-export.geojson');
};

export const exportToKML = (featureCollection) => {
  const kml = tokml(featureCollection);
  const kmlBlob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  FileSaver.saveAs(kmlBlob, 'mapfy-export.kml');
};

export const exportToImage = async (mapContainer) => {
  if (!mapContainer) return null;
  
  // Remove UI elements temporarily for clean export
  const uiElements = mapContainer.querySelectorAll('.mapboxgl-ctrl-top-left, .mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right');
  const uiVisibility = Array.from(uiElements).map(el => el.style.display);
  uiElements.forEach(el => el.style.display = 'none');
  
  // Generate the image
  const canvas = await html2canvas(mapContainer, {
    useCORS: true,
    allowTaint: true,
    scale: 2 // Higher quality
  });
  
  // Restore UI elements
  uiElements.forEach((el, i) => el.style.display = uiVisibility[i]);
  
  // Convert canvas to blob and save
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      FileSaver.saveAs(blob, 'mapfy-export.png');
      resolve(blob);
    }, 'image/png');
  });
};