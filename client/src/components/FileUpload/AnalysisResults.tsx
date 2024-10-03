import React, { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import ErrorDetailsModal from './ErrorDetailsModal';

interface ErrorResult {
  id: string;
  errorType: string;
  details: string;
  affectedField: string;
  value: string;
}

interface AnalysisResultsProps {
  results: {
    totalProducts: number;
    errorCounts: { [key: string]: number };
    errors: ErrorResult[];
  };
  fileName: string;
  onDownloadDetails: (errorType: string) => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  fileName, 
  onDownloadDetails
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);

  const totalErrors = Object.values(results.errorCounts).reduce((a, b) => a + b, 0);
  const totalChecksFailed = Object.keys(results.errorCounts).length;

  const handleViewDetails = (errorType: string) => {
    setSelectedErrorType(errorType);
    setIsModalOpen(true);
  };

  const getFirstErrorOfType = (errorType: string): ErrorResult | undefined => {
    return results.errors.find(error => error.errorType === errorType);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] gap-6 p-6">
      {/* Left Panel (Results) - 20% width */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results</h2>

          <div className="border-t border-gray-300 mt-4 pt-4">
            <p className="text-4xl font-bold text-blue-600">{totalErrors}</p>
            <p className="text-gray-600">Total Errors</p>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-4">
            <p className="text-xl font-semibold">{results.totalProducts}</p>
            <p className="text-gray-600">Total SKUs Checked</p>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-4">
            <p className="text-xl font-semibold">{totalChecksFailed}</p>
            <p className="text-gray-600">Total Checks Failed</p>
          </div>
        </div>

        {/* "Download the report" and "Learn more" sections */}
        <div className="mt-8 border-t border-gray-300 pt-4">
          <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <span>Download the report</span>
            <Download className="w-5 h-5" />
          </button>

          <p className="mt-4 text-blue-600 hover:underline cursor-pointer">
            Learn more about the Shopping Feed Analyzer →
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[3fr_1fr_3fr] bg-gray-100 font-semibold">
            <div className="p-3 border-r border-gray-200">Best Practice</div>
            <div className="p-3 border-r border-gray-200">Problem Count</div>
            <div className="p-3">How to Fix</div>
          </div>

          {/* Rows */}
          {Object.entries(results.errorCounts).map(([errorType, count]) => {
            const firstError = getFirstErrorOfType(errorType);
            return (
              <div key={errorType} className="grid grid-cols-[3fr_1fr_3fr] border-t border-gray-200">
                <div className="p-3 border-r border-gray-200">
                  <p className="font-medium">{errorType}</p>
                  {firstError && (
                    <div className="text-sm text-gray-600 mt-1">
                      <p>id: {firstError.id}</p>
                      <p>details: {firstError.details}</p>
                      <p>affected field: {firstError.affectedField}</p>
                      <p>value: {firstError.value}</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-r border-gray-200 flex flex-col items-center justify-center">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mb-2">
                    {count}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(errorType)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => onDownloadDetails(errorType)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                  </div>
                </div>
                <div className="p-3 text-blue-600">
                  Suggestion to fix {errorType}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ErrorDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        errorType={selectedErrorType || ''}
        errors={selectedErrorType ? results.errors.filter(error => error.errorType === selectedErrorType) : []}
      />
    </div>
  );
};

export default AnalysisResults;