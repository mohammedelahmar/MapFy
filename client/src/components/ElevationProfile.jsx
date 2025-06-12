import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ElevationProfile = ({ elevationData, distanceData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!elevationData || !distanceData || elevationData.length === 0) return;

    // Create or update chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: distanceData.map(d => `${d.toFixed(1)} km`),
        datasets: [{
          label: 'Elevation',
          data: elevationData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Elevation (m)'
            },
            beginAtZero: false,
          },
          x: {
            title: {
              display: true,
              text: 'Distance (km)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Elevation: ${context.parsed.y}m`;
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [elevationData, distanceData]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-2">Elevation Profile</h3>
      <div style={{ height: '200px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ElevationProfile;