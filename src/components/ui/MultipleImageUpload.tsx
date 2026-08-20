import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MultipleImageUploadProps {
  label?: string;
  error?: string;
  files: File[];
  previewUrls: string[];
  onChange: (files: File[], urls: string[]) => void;
  maxFiles?: number;
}

export function MultipleImageUpload({ label, error, files, previewUrls, onChange, maxFiles = 5 }: MultipleImageUploadProps) {
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
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }
    
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const newUrls = validFiles.map(file => URL.createObjectURL(file));
    
    onChange([...files, ...validFiles], [...previewUrls, ...newUrls]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    const newUrls = [...previewUrls];
    const urlToRemove = newUrls[index];
    
    if (urlToRemove.startsWith('blob:')) {
      // The file index is relative to the new files added
      const numExisting = newUrls.length - newFiles.length;
      const fileIndex = index - numExisting;
      if (fileIndex >= 0) {
        newFiles.splice(fileIndex, 1);
      }
    }
    
    newUrls.splice(index, 1);
    onChange(newFiles, newUrls);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide flex justify-between">
          <span>{label}</span>
          <span className="text-gray-400 font-normal normal-case">{files.length} / {maxFiles}</span>
        </label>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {previewUrls.map((url, index) => (
          <div key={`${url}-${index}`} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group bg-gray-50">
            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="bg-white text-red-500 rounded-full p-2 hover:scale-110 transition-transform shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-[#5022C3] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                Main
              </div>
            )}
          </div>
        ))}

        {files.length < maxFiles && (
          <div 
            className={`relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragActive ? 'border-[#5022C3] bg-purple-50/50' : error && files.length === 0 ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'
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
              multiple
              onChange={handleChange}
            />
            <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-[#5022C3] mb-2">
              <ImagePlus className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-900 px-2">
              Add Image
            </p>
          </div>
        )}
      </div>

      {files.length === 0 && !error && (
         <p className="text-xs text-gray-500">
           Supported formats: JPG, PNG, WebP. Max size: 4MB. First image will be used as the main thumbnail.
         </p>
      )}
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
