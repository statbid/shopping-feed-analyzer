import React from 'react';
import { X } from 'lucide-react';

interface ErrorResult {
  id: string;
  errorType: string;
  details: string;
  affectedField: string;
  value: string;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: string;
  errors: ErrorResult[];
}

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({ isOpen, onClose, errorType, errors }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col">
        {/* Fixed header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Detailed Errors: {errorType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-grow overflow-auto p-6">
          <div className="grid grid-cols-[1fr_2fr_1fr_2fr] gap-6">
            <div className="font-bold text-gray-700">Product ID</div>
            <div className="font-bold text-gray-700">Details</div>
            <div className="font-bold text-gray-700">Affected Field</div>
            <div className="font-bold text-gray-700">Value</div>
            
            {errors.map((error, index) => (
              <React.Fragment key={index}>
                <div className="break-all">{error.id}</div>
                <div>{error.details}</div>
                <div>{error.affectedField}</div>
                <div className="break-words">{error.value}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetailsModal;