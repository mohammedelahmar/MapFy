import React, { useRef, useEffect, useState } from 'react';

const MapEditorDebug = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  
  useEffect(() => {
    const checkDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ 
          width: clientWidth,
          height: clientHeight 
        });
        console.log("Container dimensions:", clientWidth, clientHeight);
      } else {
        console.error("Container ref is null");
      }
    };
    
    // Check immediately and then after a delay
    checkDimensions();
    const timer = setTimeout(checkDimensions, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-4 bg-yellow-100 w-full h-full" style={{ minHeight: '400px' }}>
      <h3>Map Editor Debug</h3>
      <p>This is a test component to verify container rendering.</p>
      <div 
        ref={containerRef}
        className="bg-blue-100 w-full" 
        style={{ 
          height: 'calc(100% - 60px)',
          minHeight: '300px',
          border: '2px solid blue',
          position: 'relative'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-blue-800">
            Container: {dimensions.width}x{dimensions.height}px
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapEditorDebug;