import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  error?: string;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ label, error, previewUrl, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      
      {previewUrl ? (
        <div className="relative w-full h-[200px] rounded-xl border border-gray-200 overflow-hidden group bg-gray-50">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                onChange(null);
              }}
              className="bg-white text-red-500 rounded-full p-2 hover:scale-110 transition-transform shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            dragActive ? 'border-[#5022C3] bg-purple-50/50' : error ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
          />
          <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-[#5022C3] mb-4">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Drag and drop image here, or click add image
          </p>
          <p className="text-xs text-gray-500 max-w-[280px]">
            Supported formats: JPG, PNG, WebP. Max size: 4MB. Use high quality images for best results.
          </p>
          <div className="mt-4 px-4 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600 bg-white">
            Add Image
          </div>
        </div>
      )}
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
