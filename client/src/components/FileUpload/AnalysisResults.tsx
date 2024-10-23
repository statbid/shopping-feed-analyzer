import React, { useState, useEffect, useRef } from 'react';
import { Eye, Download } from 'lucide-react';
import ErrorDetailsModal from './ErrorDetailsModal';
import ErrorFixSuggestions from './ErrorFixSuggestions';

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
  onDownloadReport: () => void;
  isLoading: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  fileName, 
  onDownloadDetails,
  onDownloadReport,
  isLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);
  const [processedProducts, setProcessedProducts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalErrors = Object.values(results.errorCounts).reduce((a, b) => a + b, 0);
  const totalChecksFailed = Object.keys(results.errorCounts).length;

  const handleViewDetails = (errorType: string) => {
    setSelectedErrorType(errorType);
    setIsModalOpen(true);
  };

  const getFirstErrorOfType = (errorType: string): ErrorResult | undefined => {
    return results.errors.find(error => error.errorType === errorType);
  };

  useEffect(() => {
    if (isLoading) {
      setProcessedProducts(0); 
      const interval = setInterval(() => {
        setProcessedProducts((prev) => {
          if (prev < results.totalProducts) {
            return prev + Math.ceil(results.totalProducts / 50); 
          }
          clearInterval(interval);
          return results.totalProducts;
        });
      }, 200);
    }
  }, [isLoading, results.totalProducts]);

  return (
<div ref={containerRef} className="font-sans grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 h-full box-border">

{/* Left Panel (Results) - 25% width */}
<div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between h-full overflow-auto box-border">
  <div>
    <h2 className="text-2xl font-bold">Results</h2>

    <div className="border-t border-gray-300 mt-4 pt-4 box-border">
      <p className="text-4xl font-bold text-blue-600">{totalErrors}</p>
      <p className="text-gray-600">Total Errors</p>
    </div>

    <div className="border-t border-gray-300 mt-4 pt-4 box-border">
      <p className="text-xl font-semibold">{results.totalProducts}</p>
      <p className="text-gray-600">Total SKUs Checked</p>
    </div>

    <div className="border-t border-gray-300 mt-4 pt-4 box-border">
      <p className="text-xl font-semibold">{totalChecksFailed}</p>
      <p className="text-gray-600">Total Checks Failed</p>
    </div>
  </div>

  {/* "Download the report" and "Learn more" sections */}
  <div className="mt-8 border-t border-gray-300 pt-4 box-border">
    <button
      className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      onClick={onDownloadReport}
    >
      <span>Download the report</span>
      <Download className="w-5 h-5" />
    </button>

    <p className="mt-4 text-blue-600 hover:underline cursor-pointer">
      Learn more about the Shopping Feed Analyzer →
    </p>
  </div>
</div>

{/* Right Panel (Error Details) - 75% width */}
<div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full box-border">
  <div className="border-2 border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col h-full box-border">
    {/* Header */}
    <div className="grid grid-cols-[2fr_1fr_2fr] text-sm font-semibold bg-gray-100 sticky top-0 box-border" style={{ zIndex: 10 }}>
      <div className="p-3 border-r-2 border-b-2 border-gray-200">Best Practice</div>
      <div className="p-3 border-r-2 border-b-2 border-gray-200 text-center">Problem Count</div>
      <div className="p-3 border-b-2 border-gray-200">How to Fix</div>
    </div>

    {/* Scrollable content */}
    <div className="overflow-y-auto flex-grow box-border">
      {Object.entries(results.errorCounts).map(([errorType, count], index) => {
        const firstError = getFirstErrorOfType(errorType);
        return (
          <div key={errorType} className="grid grid-cols-[2fr_1fr_2fr] text-sm border-b border-gray-200 box-border">
            <div className="p-3 border-r border-gray-200 box-border">
              <p className="font-medium">{errorType}</p>
              {firstError && (
                <div className="text-xs text-gray-600 mt-1">
                  <p>Example</p>
                  <p>id: {firstError.id}</p>
                  <p>details: {firstError.details}</p>
                  <p>affected field: {firstError.affectedField}</p>
                  <p>value: {firstError.value}</p>
                </div>
              )}
            </div>
            <div className="p-3 border-r border-gray-200 flex flex-col items-center justify-center box-border">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mb-2">
                {count}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(errorType)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" /> View
                </button>
                <button
                  onClick={() => onDownloadDetails(errorType)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center text-xs"
                >
                  <Download className="w-3 h-3 mr-1" /> Download
                </button>
              </div>
            </div>
            <div className="p-3">
  <ErrorFixSuggestions errorType={errorType} />
</div>
          </div>
        );
      })}
    </div>
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
