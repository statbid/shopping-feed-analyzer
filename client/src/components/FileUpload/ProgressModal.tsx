import React from 'react';
import { FileArchive, FileText, Loader, Upload } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  processedProducts: number;
  status?: 'uploading' | 'extracting' | 'extracted' | 'analyzing';
  statusMessage?: string;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ 
  isOpen, 
  processedProducts, 
  status = 'uploading',
  statusMessage 
}) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center">
            <Upload className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">Uploading File...</p>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        );

      case 'extracting':
        return (
          <div className="flex flex-col items-center">
            <FileArchive className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">Extracting ZIP File...</p>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        );

      case 'extracted':
        return (
          <div className="flex flex-col items-center">
            <FileText className="w-16 h-16 text-green-500 mb-2" />
            <p className="text-lg mb-4">File Extracted Successfully!</p>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-blue-500 mb-2 animate-spin" />
            <p className="text-lg mb-4">Analyzing Feed File</p>
            <p className="text-lg">{processedProducts.toLocaleString()} SKUs checked</p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-blue-500 mb-2 animate-spin" />
            <p className="text-lg mb-4">Processing...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Feed File</h2>
        {getContent()}
        {statusMessage && (
          <p className="text-sm text-gray-600 mt-2">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;