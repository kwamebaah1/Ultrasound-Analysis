'use client';

import { useState } from 'react';
import { FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi';

const toolBtn =
  'inline-flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent';

const HeatmapVisualization = ({ heatmapUrl, diagnosis }) => {
  const [scale, setScale] = useState(1);

  if (!heatmapUrl) return null;

  return (
    <figure>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 1))}
            disabled={scale <= 1}
            className={toolBtn}
            aria-label="Zoom out"
          >
            <FiZoomOut size={14} />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-slate-600">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 2.5))}
            disabled={scale >= 2.5}
            className={toolBtn}
            aria-label="Zoom in"
          >
            <FiZoomIn size={14} />
          </button>
          <a
            href={heatmapUrl}
            download={`heatmap-${diagnosis.toLowerCase()}.png`}
            className="ml-auto inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <FiDownload size={13} aria-hidden /> Download
          </a>
        </div>
        <div className="flex justify-center overflow-hidden bg-slate-100">
          <img
            src={heatmapUrl}
            alt="Grad-CAM heatmap overlaid on the ultrasound image"
            className="aspect-square w-full max-w-sm origin-center object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-slate-500">
        Highlighted regions most influenced the model&apos;s decision. Warmer colours (red, yellow)
        indicate greater influence.
      </figcaption>
    </figure>
  );
};

export default HeatmapVisualization;
