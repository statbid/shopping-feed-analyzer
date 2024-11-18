import React from 'react';
import { FileArchive, FileText, Loader, Upload, CheckCircle } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  processedProducts: number;
  status: 'uploading' | 'extracting' | 'extracted' | 'analyzing' | 'processing';
  analysisType?: 'feed' | 'search';
  statusMessage?: string;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  processedProducts,
  status,
  analysisType,
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

      case 'processing':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">
              {analysisType === 'search' ? 'Generating Search Terms' : 'Checking Feed Quality'}
            </p>
            <div className="mb-4">
              <p className="text-3xl font-bold text-blue-600">
                {processedProducts.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Products processed</p>
            </div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

  const getTitle = () => {
    switch (status) {
      case 'uploading':
        return 'Processing Feed File';
      case 'extracting':
        return 'Extracting ZIP File';
      case 'extracted':
        return 'File Ready';
      case 'analyzing':
      case 'processing':
        return analysisType === 'search' ? 'Search Terms Analysis' : 'Feed Quality Analysis';
      default:
        return 'Processing Feed File';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
        {getContent()}
        {statusMessage && (
          <p className="text-sm text-gray-600 mt-4">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;