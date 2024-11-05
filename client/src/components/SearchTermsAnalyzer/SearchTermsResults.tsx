import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { CSVExporter } from '../utils/CSVExporter';

interface SearchTerm {
  id: string;
  productName: string;
  searchTerm: string;
  pattern: string;
  estimatedVolume: number;
}

interface SearchTermsResultsProps {
  results: SearchTerm[];
  fileName: string;
}

const ITEMS_PER_PAGE = 10;

const SearchTermsResults: React.FC<SearchTermsResultsProps> = ({ results, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, results.length);
  const currentPageData = results.slice(startIndex, endIndex);

  const handleDownloadReport = () => {
    const csvContent = results.map(term => [
      term.id,
      term.productName,
      term.searchTerm,
      term.pattern,
      term.estimatedVolume
    ]);
    
    const headers = ['Product ID', 'Product Name', 'Search Term', 'Pattern', 'Est. Monthly Volume'];
    const csv = [headers, ...csvContent].map(row => row.join(',')).join('\n');
    
    CSVExporter.downloadCSV(csv, `${fileName.split('.')[0]}_search_terms.csv`);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left Panel - Stats */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 space-y-6">
          <div className="p-3 rounded-lg">
            <p className="text-4xl font-bold text-[#17235E]">{results.length}</p>
            <p className="font-bold text-xl mt-2">Total Search Terms</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-gray-200">
            <button 
              className="w-full flex items-center justify-between bg-transparent rounded-lg font-bold text-xl"
              onClick={handleDownloadReport}
            >
              <span>Download report</span>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Search Terms Table */}
      <div className="col-span-9 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="grid grid-cols-[15%,25%,25%,20%,15%] text-[#232323] text-lg font-bold bg-gray-200 border-b border-[#E6EAEE]">
          <div className="p-4">Product ID</div>
          <div className="p-4">Product Name</div>
          <div className="p-4">Search Term</div>
          <div className="p-4">Pattern</div>
          <div className="p-4">Est. Volume</div>
        </div>

        <div className="overflow-y-auto flex-grow">
  {currentPageData.map((term) => (
    <div
      key={`${term.id}-${term.searchTerm}`}
      className="grid grid-cols-[15%,25%,25%,20%,15%] text-[#232323] text-base bg-[#FCFCFC] hover:bg-gray-100 transition-colors border-b border-gray-200"
    >
      <div className="p-4 break-words whitespace-normal">{term.id}</div>
      <div className="p-4 break-words whitespace-normal">{term.productName}</div>
      <div className="p-4 break-words whitespace-normal">{term.searchTerm}</div>
      <div className="p-4 break-words whitespace-normal">{term.pattern}</div>
      <div className="p-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {term.estimatedVolume}
        </span>
      </div>
    </div>
  ))}
</div>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            <div className="text-sm text-[#17235E]">
              <span>Showing {startIndex + 1}-{endIndex} of {results.length} terms</span>
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
    </div>
  );
};

export default SearchTermsResults;