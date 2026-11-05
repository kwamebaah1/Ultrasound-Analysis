'use client';

import { useState } from 'react';
import { FiImage, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi';

const formatSize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

const UploadArea = ({ preview, image, onSelect, onFile, onRemove, disabled }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) onFile(e.dataTransfer.files?.[0]);
  };

  if (preview) {
    return (
      <div>
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-950">
          <img src={preview} alt="Selected ultrasound" className="h-full w-full object-contain" />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <FiImage className="shrink-0 text-slate-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{image?.name}</p>
            {image && <p className="text-xs text-slate-500">{formatSize(image.size)}</p>}
          </div>
          <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw size={12} aria-hidden /> Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove image"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <FiTrash2 size={14} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex aspect-square w-full flex-col items-center justify-center rounded-md border border-dashed px-6 text-center transition-colors ${
        dragging ? 'border-brand-600 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60'
      }`}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
        <FiUploadCloud aria-hidden />
      </span>
      <span className="text-sm font-medium text-slate-900">
        Drop an image here, or <span className="text-brand-600 underline underline-offset-2">browse</span>
      </span>
      <span className="mt-1 text-xs text-slate-500">PNG or JPG, up to 5 MB</span>
    </button>
  );
};

export default UploadArea;
