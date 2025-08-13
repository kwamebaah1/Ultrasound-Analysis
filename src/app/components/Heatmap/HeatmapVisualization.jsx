'use client';

import { useState } from 'react';
import { FiZoomIn, FiZoomOut, FiDownload, FiInfo } from 'react-icons/fi';

const HeatmapVisualization = ({ heatmapUrl, diagnosis }) => {
  const [scale, setScale] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  if (!heatmapUrl) return null;

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        <img
          src={heatmapUrl}
          alt="Heatmap visualization"
          className="w-full h-auto transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
        />
        
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setScale(Math.min(scale + 0.1, 2))}
            className="p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100"
            title="Zoom in"
          >
            <FiZoomIn />
          </button>
          <button
            onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
            className="p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100"
            title="Zoom out"
          >
            <FiZoomOut />
          </button>
          <a
            href={heatmapUrl}
            download={`heatmap-${diagnosis.toLowerCase()}.png`}
            className="p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100"
            title="Download"
          >
            <FiDownload />
          </a>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100"
            title="Info"
          >
            <FiInfo />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
          <p>
            This heatmap shows the areas of the image that most influenced the AI's diagnosis.
            Warmer colors indicate regions with higher importance in the decision-making process.
          </p>
        </div>
      )}
    </div>
  );
};

export default HeatmapVisualization;