import React from 'react';
import { X } from 'lucide-react'; // Import a close icon

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
      onClose(); // Close when clicking on the backdrop
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleBackdropClick}>
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
        {/* Modal Header with Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detailed Errors: {errorType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" /> {/* Close icon */}
          </button>
        </div>
        
        {/* Modal Content */}
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affected Field</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {errors.map((error, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{error.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.details}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.affectedField}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Close button at the bottom */}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorDetailsModal;
