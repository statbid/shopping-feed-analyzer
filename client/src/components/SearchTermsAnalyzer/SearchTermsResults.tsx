import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, X, Eye } from 'lucide-react'
import { CSVExporter } from '../utils/CSVExporter';
import ProductsModal from './SearchTermsDetailsModal'
import { SearchTerm, SearchTermsResultsProps } from '../../types';


interface Filter {
  column: keyof SearchTerm;
  type: 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  value: string;
}

const ITEMS_PER_PAGE = 10;

const SearchTermsResults: React.FC<SearchTermsResultsProps> = ({ results, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SearchTerm | null>(null);
  


  const filteredResults = useMemo(() => {
    console.log('Filtering results:', results.length);
    return results.filter(term => {
      return filters.every(filter => {
        const value = term[filter.column];
        
        switch (filter.type) {
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'notContains':
            return !String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'greaterThan':
            return filter.column === 'estimatedVolume' && 
                   Number(value) > Number(filter.value);
          case 'lessThan':
            return filter.column === 'estimatedVolume' && 
                   Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
  }, [results, filters]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredResults.length);
  const currentPageData = filteredResults.slice(startIndex, endIndex);

  const handleDownloadReport = () => {
    const csvContent = filteredResults.map(term => [
      term.id,
      term.productName,
      term.searchTerm,
      term.pattern,
      term.estimatedVolume
    ]);
    
    const headers = ['Product ID', 'Product Name', 'Search Term', 'Pattern', 'Est. Monthly Volume'];
    const csv = [headers, ...csvContent].map(row => row.join(',')).join('\n');
    
    CSVExporter.downloadCSV(csv, `${fileName.split('.')[0]}_search_terms_filtered.csv`);
  };

  const addFilter = () => {
    if (activeFilter) {
      setFilters([...filters, activeFilter]);
      setActiveFilter(null);
      setShowFilterModal(false);
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-xl font-bold mb-4">Add Filter</h3>
        <div className="space-y-4">
          <select 
            className="w-full p-2 border rounded"
            value={activeFilter?.column || ''}
            onChange={(e) => setActiveFilter({
              ...activeFilter as Filter,
              column: e.target.value as keyof SearchTerm
            })}
          >
            <option value="">Select Column</option>
            <option value="id">Product ID</option>
            <option value="productName">Product Name</option>
            <option value="searchTerm">Search Term</option>
            <option value="pattern">Pattern</option>
            <option value="estimatedVolume">Est. Volume</option>
          </select>

          <select 
            className="w-full p-2 border rounded"
            value={activeFilter?.type || ''}
            onChange={(e) => setActiveFilter({
              ...activeFilter as Filter,
              type: e.target.value as Filter['type']
            })}
          >
            <option value="">Select Filter Type</option>
            {activeFilter?.column === 'estimatedVolume' ? (
              <>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
              </>
            ) : (
              <>
                <option value="contains">Contains</option>
                <option value="notContains">Not Contains</option>
              </>
            )}
          </select>

          <input
            type={activeFilter?.column === 'estimatedVolume' ? 'number' : 'text'}
            className="w-full p-2 border rounded"
            placeholder="Filter Value"
            value={activeFilter?.value || ''}
            onChange={(e) => setActiveFilter({
              ...activeFilter as Filter,
              value: e.target.value
            })}
          />

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowFilterModal(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={addFilter}
              disabled={!activeFilter?.column || !activeFilter?.type || !activeFilter?.value}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              Add Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left panel - keep as is */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 space-y-6">
          <div className="p-3 rounded-lg">
            <p className="text-4xl font-bold text-[#17235E]">{filteredResults.length}</p>
            <p className="font-bold text-xl mt-2">Total Search Terms</p>
          </div>
  
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-bold text-lg">Breakdown:</p>
            <p>Attribute-based: {results.filter(r => r.pattern.includes('Attribute-based')).length}</p>
            <p>Description-based: {results.filter(r => r.pattern.includes('Description-based')).length}</p>
          </div>
  
          <div className="p-3 bg-blue-50 rounded-lg">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="w-full flex items-center justify-between bg-transparent rounded-lg font-bold text-xl"
            >
              <span>Add Filter</span>
              <Filter className="w-5 h-5" />
            </button>
          </div>
  
          {filters.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-lg mb-2">Active Filters:</p>
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="text-sm">
                      {filter.column} {filter.type} "{filter.value}"
                    </span>
                    <button
                      onClick={() => removeFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
  
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
  
       {/* Right panel with updated term display */}
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
              key={term.searchTerm}
              className="grid grid-cols-[15%,25%,25%,20%,15%] text-[#232323] text-base bg-[#FCFCFC] hover:bg-gray-100 transition-colors border-b border-gray-200"
            >
              <div className="p-4 break-words whitespace-normal">{term.id}</div>
              <div className="p-4 break-words whitespace-normal">{term.productName}</div>
              <div className="p-4 break-words whitespace-normal">{term.searchTerm}</div>
              <div className="p-4 break-words whitespace-normal flex items-center">
                <span>{term.pattern}</span>
                {term.matchingProducts?.length > 1 && (
                  <button
                    onClick={() => setSelectedTerm(term)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    title={`View all ${term.matchingProducts.length} products`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {term.estimatedVolume}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination section stays the same */}
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
              <span>Showing {startIndex + 1}-{endIndex} of {filteredResults.length} terms</span>
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
  
      {/* Modals - add at bottom of component */}
      {showFilterModal && <FilterModal />}
      {selectedTerm && (
  <ProductsModal
    isOpen={!!selectedTerm}
    onClose={() => setSelectedTerm(null)}
    searchTerm={selectedTerm.searchTerm}
    products={selectedTerm.matchingProducts}
  />
)}

    </div>
  );
};

export default SearchTermsResults;