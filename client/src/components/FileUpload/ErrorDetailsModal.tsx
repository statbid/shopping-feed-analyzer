import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

const ITEMS_PER_PAGE = 100;
const VIRTUAL_WINDOW_SIZE = 20;

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({ isOpen, onClose, errorType, errors }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [virtualStart, setVirtualStart] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setVirtualStart(0);
    }
  }, [isOpen, errorType]);

  const totalPages = Math.ceil(errors.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return errors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, errors]);

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

  const virtualizedData = useMemo(() => {
    return currentPageData.slice(virtualStart, virtualStart + VIRTUAL_WINDOW_SIZE);
  }, [currentPageData, virtualStart]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, errors.length);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">Detailed Errors: {errorType}</h2>
            <p className="text-sm text-gray-600">
              Showing {errors.length > 0 ? startIndex : 0}-{endIndex} of {errors.length} errors
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_2fr_1fr_2fr] gap-4 p-4 font-bold border-b bg-gray-100">
          <div>Product ID</div>
          <div>Details</div>
          <div>Affected Field</div>
          <div>Value</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {virtualizedData.map((error, index) => (
            <div 
              key={`${error.id}-${index}`}
              className="grid grid-cols-[1fr_2fr_1fr_2fr] gap-4 p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="break-all">{error.id}</div>
              <div className="break-words whitespace-pre-wrap">{error.details}</div>
              <div className="break-words">{error.affectedField}</div>
              <div className="break-words whitespace-pre-wrap">
                {formatValue(error.value)}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-white">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDetailsModal;