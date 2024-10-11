import React from 'react';

interface ProgressModalProps {
  isOpen: boolean;
  totalProducts: number;
  processedProducts: number;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, totalProducts, processedProducts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Analysis in Progress</h2>
        <p>{processedProducts}/{totalProducts} SKUs checked</p>
        <div className="w-full h-4 bg-gray-200 rounded-full mt-4">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(processedProducts / totalProducts) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
