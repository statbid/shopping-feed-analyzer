import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Eye, Download } from 'lucide-react';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
  
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
  
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };
  
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length) {
        onFileSelect(files[0]);
      }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white p-8 rounded-xl w-[600px] max-w-[90vw]">
          <h2 className="text-2xl font-bold mb-6 text-[#17235E]">Upload File</h2>
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors min-h-[300px] flex flex-col justify-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-16 w-16 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <input
              type="file"
              accept=".csv,.tsv"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  onFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer text-blue-600 hover:text-blue-800 text-lg font-semibold"
            >
              Click to upload
            </label>
            <p className="text-base text-gray-500 mt-2">or drag and drop</p>
            <p className="text-sm text-gray-400 mt-4">Supported formats: CSV, TSV</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
};

export default FileUploadModal;