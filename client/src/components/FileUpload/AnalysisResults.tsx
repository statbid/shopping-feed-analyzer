import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Download, ChevronLeft, ChevronRight, BadgeAlert } from 'lucide-react';
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

const ITEMS_PER_PAGE = 10;

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  fileName,
  onDownloadDetails,
  onDownloadReport,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedProducts, setProcessedProducts] = useState(0);

  const totalErrors = Object.values(results.errorCounts).reduce((a, b) => a + b, 0);
  const totalChecksFailed = Object.keys(results.errorCounts).length;

  // Calculate pagination
  const errorEntries = Object.entries(results.errorCounts);
  const totalPages = Math.ceil(errorEntries.length / ITEMS_PER_PAGE);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return errorEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, errorEntries]);

  const handleViewDetails = (errorType: string) => {
    setSelectedErrorType(errorType);
    setIsModalOpen(true);
  };

  const getFirstErrorOfType = (errorType: string): ErrorResult | undefined => {
    return results.errors.find((error) => error.errorType === errorType);
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, errorEntries.length);

  return (
    <div className="font-sans grid grid-cols-12 gap-6 h-full">
      {/* Left Panel - 20% width (3 columns) */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        <div className="grid grid-cols-1 text-2xl font-bold bg-gray-200 border-b order-[#E6EAEE]">
          <div className="p-4 text-center text-[#232323]">Results</div>
        </div>

        <div className="overflow-y-auto flex-grow p-6 space-y-6">
          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="p-3 rounded-lg">
              <p className="text-4xl font-bold text-[#17235E]">{totalErrors}</p>
              <p className="font-bold text-xl mt-2">Total Errors</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-4xl font-bold">{results.totalProducts}</p>
              <p className="text-xl mt-2">Total SKUs Checked</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-4xl font-bold">{totalChecksFailed}</p>
              <p className="text-xl mt-2">Failed Checks</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-gray-200" onClick={onDownloadReport}>
              <button className="w-full flex items-center bg-transparent rounded-lg font-bold text-xl">
                <span>Download the report</span>
                <Download className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="mt-4 text-[#17235E] hover:underline cursor-pointer font-bold text-xl">
                Learn more about the Shopping Feed Analyzer →
              </p>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 p-4 flex justify-between items-center bg-gray-200 flex-shrink-0">
          <p className="min-h-[30px]"></p>
        </div>
      </div>
      
      
      
  {/* Right Panel - 80% width (9 columns) */}
<div className="col-span-9 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
  <div className="grid grid-cols-[40%,20%,40%] text-[#232323] text-2xl font-bold bg-gray-200 border-b border-[#E6EAEE]">
    <div className="p-4">Best Practise</div>
    <div className="p-4 text-center">Problem Count</div>
    <div className="p-4 text-[#17235E]">How to Fix</div>
  </div>

  <div className="overflow-y-auto flex-grow">
    {currentPageData.map(([errorType, count], index) => {
      const firstError = getFirstErrorOfType(errorType);
      return (
        <div
          key={errorType}
          className="grid grid-cols-[40%,20%,40%] text-[#232323] text-lg bg-[#FCFCFC] hover:bg-gray-100 transition-colors divide-x divide-[#E6EAEE] border-b border-gray-200"
        >
          <div className="p-4">
            <p className="font-bold">{errorType}</p>
            {firstError && (
              <div className="mt-2 text-[16px] leading-tight">
                <p className="font-bold">Example:</p>
                <p>
                  <span className="font-bold">id:</span> {firstError.id}
                </p>
                <p>
                  <span className="font-bold">details:</span> {firstError.details}
                </p>
                <p>
                  <span className="font-bold">affected field:</span> {firstError.affectedField}
                </p>
                <p>
                  <span className="font-bold">value:</span> {firstError.value}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-red-100 font-bold text-red-800 px-3 py-1 rounded-full text-[16px]">
                {count}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(errorType)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-[16px]"
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </button>
              <button
                onClick={() => onDownloadDetails(errorType)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-[16px]"
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </button>
            </div>
          </div>

          <div className="mt-2 text-[16px] leading-tight">
            <div className="font-bold text-[#17235E]">
              <ErrorFixSuggestions errorType={errorType} />
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {totalPages > 1 && (
    <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-200 flex-shrink-0">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
      </button>

      <div className="text-sm text-[#17235E]">
        <span>
          Showing {startIndex}-{endIndex} of {errorEntries.length} errors
        </span>
        <span className="mx-2">•</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      <button
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 flex items-center"
      >
        Next <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  )}
</div>

      <ErrorDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        errorType={selectedErrorType || ''}
        errors={selectedErrorType ? results.errors.filter((error) => error.errorType === selectedErrorType) : []}
      />
    </div>
  );
};

export default AnalysisResults;
