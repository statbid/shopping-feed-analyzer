import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Flag, ChevronDown } from 'lucide-react';

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
  onFalsePositiveChange?: (errorId: string, isFalsePositive: boolean) => void;
  falsePositives?: Set<string>;
}

// Available page sizes
const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  isOpen,
  onClose,
  errorType,
  errors,
  onFalsePositiveChange,
  falsePositives = new Set()
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [localFalsePositives, setLocalFalsePositives] = useState<Set<string>>(falsePositives);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSelectAll(false);
    }
  }, [isOpen, errorType]);

  // Reset selectAll when changing pages
  useEffect(() => {
    setSelectAll(false);
  }, [currentPage]);

  const totalPages = Math.ceil(errors.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, itemsPerPage]); // Added itemsPerPage dependency

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return errors.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, errors, itemsPerPage]);

  const formatValue = (value: string) => {
    if (value.includes(';')) {
      return value.split(';').map((item, index) => (
        <div key={index} className="mb-1">
          {item.trim()}
        </div>
      ));
    }
    return value;
  };

  const handleFalsePositiveToggle = (errorId: string) => {
    const newFalsePositives = new Set(localFalsePositives);
    if (newFalsePositives.has(errorId)) {
      newFalsePositives.delete(errorId);
    } else {
      newFalsePositives.add(errorId);
    }
    setLocalFalsePositives(newFalsePositives);
    onFalsePositiveChange?.(errorId, !localFalsePositives.has(errorId));
  };

  const handleSelectAllToggle = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const currentPageIds = currentPageData.map(error => error.id);
    const newFalsePositives = new Set(localFalsePositives);
    
    currentPageIds.forEach(id => {
      if (newSelectAll) {
        newFalsePositives.add(id);
      } else {
        newFalsePositives.delete(id);
      }
      onFalsePositiveChange?.(id, newSelectAll);
    });
    
    setLocalFalsePositives(newFalsePositives);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setSelectAll(false); // Reset selectAll when changing page size
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, errors.length);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <div>
            <h2 className="text-2xl font-bold">Detailed Errors: {errorType}</h2>
            <div className="text-sm text-gray-600 flex items-center mt-1">
              <span>Showing {errors.length > 0 ? startIndex : 0}-{endIndex} of {errors.length} errors</span>
              <span className="mx-2 text-gray-400">|</span>
              <div className="relative inline-block">
                <select
                  value={itemsPerPage}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded px-3 py-1 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer text-gray-600"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_2fr_1fr_2fr_80px] gap-4 p-4 font-bold bg-gray-100 border-b border-gray-300">
  <div>Product ID</div>
  <div>Details</div>
  <div>Affected Field</div>
  <div>Value</div>
  <div className="text-center flex items-center justify-center">
    <button
      onClick={handleSelectAllToggle}
      className={`p-1 rounded-lg transition-colors flex flex-col items-center gap-1 ${
        selectAll
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100  hover:bg-gray-200'
      }`}
      title={selectAll ? "Unmark all as false positive" : "Mark all as false positive"}
    >
       <span className="font-semibold">False Positive</span>
      <Flag className="w-4 h-4" />
     
      
    </button>
  </div>
</div>


        <div className="flex-1 overflow-y-auto">
          {currentPageData.map((error) => (
            <div 
              key={error.id}
              className={`grid grid-cols-[1fr_2fr_1fr_2fr_80px] gap-4 p-4 border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                localFalsePositives.has(error.id) ? 'bg-gray-200' : ''
              }`}
            >
              <div className="break-all">{error.id}</div>
              <div className="break-words whitespace-pre-wrap">{error.details}</div>
              <div className="break-words">{error.affectedField}</div>
              <div className="break-words whitespace-pre-wrap">
                {formatValue(error.value)}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => handleFalsePositiveToggle(error.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    localFalsePositives.has(error.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={localFalsePositives.has(error.id) ? "Unmark as false positive" : "Mark as false positive"}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 p-4 flex justify-between items-center bg-white">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          
          <div className="text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span>Total {errors.length} errors</span>
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 flex items-center"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetailsModal;