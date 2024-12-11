/**
 * AnalysisResults Component
 *
 * This component displays the results of the analysis, including error summaries, suggestions for fixing errors, 
 * and detailed views for individual error types. It also provides functionality for exporting reports and managing 
 * false positives.
 *
 * Features:
 * - **Error Summary Panel:** Displays the total errors, SKUs checked, and failed checks.
 * - **Error List:** Categorizes and lists errors, allowing users to view details and download reports.
 * - **Error Details Modal:** Displays detailed error information and allows marking errors as false positives.
 * - **Pagination:** Handles paginated display of error categories.
 * - **Export Reports:** Allows downloading both error-specific and summary CSV reports.
 *
 * Props:
 * - `results`: Object containing analysis results (`totalProducts`, `errorCounts`, `errors`).
 * - `fileName`: Name of the uploaded file, used for report generation.
 * - `isLoading`: Indicates whether analysis is in progress.
 */



import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import ErrorDetailsModal from './ErrorDetailsModal';
import ErrorFixSuggestions from './ErrorFixSuggestions';
import InfoModal from './InfoModal';
import { CSVExporter } from '../utils/CSVExporter';

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
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 10;

const errorCategories = {
  title: {
    name: 'Title Errors',
    pattern: /^(Title|Product Title)/i,
    order: 1
  },
  description: {
    name: 'Description Errors',
    pattern: /^(Description|Product Description)/i,
    order: 2
  },
  productType: {
    name: 'Product Type Errors',
    pattern: /^Product Type/i,
    order: 3
  },
  category: {
    name: 'Category Errors',
    pattern: /^(Google Product Category|Category)/i,
    order: 4
  },
  attributes: {
    name: 'Attribute Errors',
    pattern: /^(Color|Size|Brand|Gender|Age|GTIN|Material)/i,
    order: 5
  },
  required: {
    name: 'Required Field Errors',
    pattern: /^.*(isn't set|not set|missing)$/i,
    order: 6
  },
  pharmacy: {
    name: 'Pharmacy/Prohibited Content',
    pattern: /^(Monitored|Prohibited)/i,
    order: 7
  },
  other: {
    name: 'Other Errors',
    pattern: /.*/,
    order: 8
  }
};


const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  fileName,
  isLoading,
}) => {


  // State Management
// - `isModalOpen`: Tracks whether the Error Details modal is open.
// - `selectedErrorType`: Stores the currently selected error type for detailed view.
// - `currentPage`: Tracks the current page in the paginated error list.
// - `processedProducts`: Simulates progress updates while the analysis is loading.
// - `isInfoModalOpen`: Tracks whether the informational modal is open.
// - `falsePositives`: Stores IDs of errors marked as false positives.


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedProducts, setProcessedProducts] = useState(0);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [previousLoadingState, setPreviousLoadingState] = useState(isLoading);
  const [falsePositives, setFalsePositives] = useState<Set<string>>(new Set());


  // Reset page when analysis completes
  useEffect(() => {
    if (previousLoadingState && !isLoading) {
      setCurrentPage(1);
    }
    setPreviousLoadingState(isLoading);
  }, [isLoading, previousLoadingState]);

  const totalErrors = Object.values(results.errorCounts).reduce((a, b) => a + b, 0);
  const totalChecksFailed = Object.keys(results.errorCounts).length;

  // Group Errors by Category
// This groups errors into predefined categories (e.g., Title Errors, Attribute Errors) based on regex patterns.
// The results are sorted by the category order defined in `errorCategories`.

  const groupedErrors = useMemo(() => {
    const grouped = Object.entries(results.errorCounts).reduce((acc, [errorType, count]) => {
      let matchedCategory = 'other';
      for (const [categoryKey, category] of Object.entries(errorCategories)) {
        if (category.pattern.test(errorType)) {
          matchedCategory = categoryKey;
          break;
        }
      }

      if (!acc[matchedCategory]) {
        acc[matchedCategory] = [];
      }
      acc[matchedCategory].push([errorType, count]);
      return acc;
    }, {} as Record<string, Array<[string, number]>>);

    return Object.entries(grouped)
      .sort((a, b) => (errorCategories[a[0] as keyof typeof errorCategories].order - 
                       errorCategories[b[0] as keyof typeof errorCategories].order))
      .flatMap(([_, errors]) => errors);
  }, [results.errorCounts]);

  const totalPages = Math.ceil(groupedErrors.length / ITEMS_PER_PAGE);
  
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return groupedErrors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, groupedErrors]);

  const handleViewDetails = (errorType: string) => {
    setSelectedErrorType(errorType);
    setIsModalOpen(true);
  };

  const getFirstErrorOfType = (errorType: string): ErrorResult | undefined => {
    return results.errors.find((error) => error.errorType === errorType);
  };

  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  const handleFalsePositiveChange = (errorId: string, isFalsePositive: boolean) => {
    setFalsePositives(prev => {
      const newSet = new Set(prev);
      if (isFalsePositive) {
        newSet.add(errorId);
      } else {
        newSet.delete(errorId);
      }
      return newSet;
    });
  };


  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };










  

  const handleDownloadDetails = (errorType: string) => {
  const filteredErrors = results.errors
    .filter(error => error.errorType === errorType && !falsePositives.has(error.id));
  const csvContent = CSVExporter.exportErrors(filteredErrors);
  CSVExporter.downloadCSV(
    csvContent,
    `${fileName.split('.')[0]}_${errorType.replace(/[^\w\s-]/g, '_')}_errors.csv`
  );
};

const handleDownloadReport = () => {
  const filteredErrors = results.errors.filter(error => !falsePositives.has(error.id));
  const errorCounts = filteredErrors.reduce((acc, error) => {
    acc[error.errorType] = (acc[error.errorType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const csvContent = CSVExporter.exportSummaryReport(
    fileName,
    results.totalProducts,
    errorCounts,
    filteredErrors
  );
  CSVExporter.downloadCSV(
    csvContent,
    `${fileName.split('.')[0]}_analysis_report.csv`
  );
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
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, groupedErrors.length);

  return (
    <div className="font-sans grid grid-cols-12 gap-6 h-full">
      {/* Left Panel - Stats */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="bg-gray-200 p-4 border-b border-[#E6EAEE]">
          <h2 className="text-2xl font-bold text-[#232323]">Results</h2>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
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

            <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-gray-200">
              <button 
                className="w-full flex items-center justify-between bg-transparent rounded-lg font-bold text-xl"
                onClick={handleDownloadReport}
              >
                <span>Download the report</span>
                <Download className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <p
                className="mt-4 text-[#17235E] hover:underline cursor-pointer font-bold text-xl"
                onClick={handleOpenInfoModal}
              >
                Learn more about the Shopping Feed Analyzer →
              </p>
            </div>
          </div>
        </div>

        {/* Footer - matches right panel height */}
        <div className="border-t border-gray-200 p-8 bg-gray-200">
          <div className="text-sm text-[#17235E] text-center">
           
          </div>
        </div>
      </div>

      {/* Right Panel - Error List */}
      <div className="col-span-9 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        <div className="grid grid-cols-[40%,20%,40%] text-[#232323] text-2xl font-bold bg-gray-200 border-b border-[#E6EAEE]">
          <div className="p-4">Best Practice</div>
          <div className="p-4 text-center">Problem Count</div>
          <div className="p-4 text-[#17235E]">How to Fix</div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {currentPageData.map(([errorType, count]) => {
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
                      <p><span className="font-bold">id:</span> {firstError.id}</p>
                      <p><span className="font-bold">details:</span> {firstError.details}</p>
                      <p><span className="font-bold">affected field:</span> {firstError.affectedField}</p>
                      <p><span className="font-bold">value:</span> {firstError.value}</p>
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
                      onClick={() => handleDownloadDetails(errorType)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-[16px]"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                  </div>
                </div>

                <div className="p-4">
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
              <span>Showing {startIndex}-{endIndex} of {groupedErrors.length} errors</span>
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
          onFalsePositiveChange={handleFalsePositiveChange}
          falsePositives={falsePositives}
        />




      <InfoModal isOpen={isInfoModalOpen} onClose={handleCloseInfoModal} />
    </div>
  );
};

export default AnalysisResults;