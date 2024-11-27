import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter as FilterIcon, X, Eye, ChevronDown, Loader } from 'lucide-react';
import { CSVExporter } from '../utils/CSVExporter';
import ProductsModal from './SearchTermsDetailsModal';
import { SearchTerm, SearchTermsResultsProps } from '../../types';
import FilterModal, { Filter, columnDisplayNames, filterTypeDisplayNames } from './FilterModal';
import environment from '../../config/environment';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SearchTermsResults: React.FC<SearchTermsResultsProps> = ({ 
  results, 
  fileName, 
  useSearchVolumes 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<SearchTerm | null>(null);
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(false);
  const [searchTerms, setSearchTerms] = useState(results);

  // Fetch search volumes when results or useSearchVolumes change
  useEffect(() => {
    const fetchSearchVolumes = async () => {
      if (!useSearchVolumes || results.length === 0) return;

      setIsLoadingVolumes(true);
      try {
        const response = await fetch(`${environment.api.baseUrl}/api/search-volumes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchTerms: results.map(r => r.searchTerm),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search volumes');
        }

        const data = await response.json();
        const volumes = data.volumes;

        // Update search terms with volumes
        const updatedTerms = results.map(term => ({
          ...term,
          estimatedVolume: volumes[term.searchTerm.toLowerCase()] || 1,
        }));

        setSearchTerms(updatedTerms);
      } catch (error) {
        console.error('Error fetching search volumes:', error);
      } finally {
        setIsLoadingVolumes(false);
      }
    };

    fetchSearchVolumes();
  }, [results, useSearchVolumes]);

  const filteredResults = useMemo(() => {
    return searchTerms.filter(term => {
      return filters.every(filter => {
        const value = term[filter.column];

        switch (filter.type) {
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'notContains':
            return !String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'greaterThan':
            return filter.column === 'estimatedVolume' && Number(value) > Number(filter.value);
          case 'lessThan':
            return filter.column === 'estimatedVolume' && Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
  }, [searchTerms, filters]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredResults.length);
  const currentPageData = filteredResults.slice(startIndex, endIndex);

  const handleDownloadReport = () => {
    const csvContent = filteredResults.map(term => [
      term.id,
      term.productName,
      term.searchTerm,
      term.pattern,
      term.estimatedVolume,
    ]);

    const headers = ['Product ID', 'Product Name', 'Search Term', 'Pattern', 'Est. Monthly Volume'];
    const csv = [headers, ...csvContent].map(row => row.join(',')).join('\n');

    CSVExporter.downloadCSV(csv, `${fileName.split('.')[0]}_search_terms_filtered.csv`);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left panel */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="bg-gray-200 p-4 border-b border-[#E6EAEE]">
          <h2 className="text-2xl font-bold text-[#232323]">Results</h2>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="p-3 rounded-lg">
              <p className="text-4xl font-bold text-[#17235E]">{filteredResults.length}</p>
              <p className="font-bold text-xl mt-2">Total Search Terms</p>
            </div>

            {isLoadingVolumes && (
              <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                <span>Fetching search volumes...</span>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-lg">Breakdown:</p>
              <p>Attribute-based: {searchTerms.filter(r => r.pattern.includes('Attribute-based')).length}</p>
              <p>Description-based: {searchTerms.filter(r => r.pattern.includes('Description-based')).length}</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <button
                onClick={() => setShowFilterModal(true)}
                className="w-full flex items-center justify-between bg-transparent rounded-lg font-bold text-xl"
              >
                <span>Add Filter</span>
                <FilterIcon className="w-5 h-5" />
              </button>
            </div>

            {filters.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold text-lg mb-2">Active Filters:</p>
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-sm">
                        {columnDisplayNames[filter.column]} {filterTypeDisplayNames[filter.type]} "{filter.value}"
                      </span>
                      <button
                        onClick={() => setFilters(filters.filter((_, i) => i !== index))}
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-8 bg-gray-200">
          <div className="text-sm text-[#17235E] text-center">
            {filteredResults.length} terms found
          </div>
        </div>
      </div>

      {/* Right panel */}
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
                  {isLoadingVolumes ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    term.estimatedVolume.toLocaleString()
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-[#17235E]">
                <span>Showing {startIndex + 1}-{endIndex} of {filteredResults.length} terms</span>
                <span className="mx-2">•</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>

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

      {/* Modals */}
      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onAddFilter={(newFilter: Filter) => {
            setFilters([...filters, newFilter]);
            setShowFilterModal(false);
          }}
          currentFilters={filters}
        />
      )}

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
