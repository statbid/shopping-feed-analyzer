import React from 'react';

interface ProgressModalProps {
  isOpen: boolean;
  processedProducts: number;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, processedProducts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Analysis in Progress</h2>
        <p>{processedProducts} SKUs checked</p>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mt-4 mx-auto"></div>
      </div>
    </div>
  );
};

export default ProgressModal;
