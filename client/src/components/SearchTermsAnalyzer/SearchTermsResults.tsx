/**
 * SearchTermsResults Component
 *
 * This component provides an interface to view, filter, and analyze search terms extracted from a file.
 * It features a responsive layout with a left panel for statistics and filters and a right panel for 
 * paginated results. The component supports advanced features such as:
 *
 * Features:
 * - **Pagination:** Navigate through search terms with customizable page sizes.
 * - **Filtering:** Apply multiple filters dynamically to refine results.
 * - **Search Volume Fetching:** Fetch and display search volume metrics from an API.
 * - **Detailed Modals:**
 *   - Products Modal: Displays all products matching a search term.
 *   - Keyword Metrics Modal: Displays detailed metrics for a selected search term.
 * - **Export Reports:** Download filtered results or full analysis reports as CSV files.
 *
 * Props:
 * - `results`: Array of `SearchTerm` objects representing the search terms to display.
 * - `fileName`: Name of the file being analyzed, used for export naming.
 *
 * Types:
 * - `SearchTerm`: Includes fields such as `id`, `productName`, `searchTerm`, `pattern`, and `estimatedVolume`.
 * - `KeywordMetrics`: Includes metrics such as `avgMonthlySearches`, `competition`, etc.
 */


import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter as FilterIcon, X, Eye, ChevronDown, Loader, Activity } from 'lucide-react';
import { CSVExporter } from '../utils/CSVExporter';
import ProductsModal from './SearchTermsDetailsModal';
import KeywordMetricsModal from './KeywordMetricsModal';
import { KeywordMetricsResult } from '../../../../server/src/services/GoogleAdsService';
import { SearchTerm, SearchTermsResultsProps, KeywordMetrics } from '@shopping-feed/types';
import FilterModal, { Filter, columnDisplayNames, filterTypeDisplayNames } from './FilterModal';
import environment from '../../config/environment';

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500];


const SearchTermsResults: React.FC<SearchTermsResultsProps> = ({ 
  results, 
  fileName,
  useSearchVolumes 
}) => {
  // State Management
// - `currentPage`: Tracks the current page of paginated results.
// - `itemsPerPage`: Determines the number of items displayed per page.
// - `filters`: Stores active filters applied to the search terms.
// - `showFilterModal`: Tracks the visibility of the filter modal.
// - `selectedTerm`: Stores the search term selected for viewing matching products.
// - `selectedMetrics`: Stores metrics data for the selected search term.
// - `isLoadingVolumes`: Indicates whether search volume metrics are being fetched.
// - `searchTerms`: Stores the list of search terms, updated with fetched metrics.

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<SearchTerm | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<{
    term: string;
    metrics: KeywordMetrics;
  } | null>(null);
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(false);
  const [searchTerms, setSearchTerms] = useState(results);
 
  
  const handleAddSuggestion = (newTerm: SearchTerm) => {
    setSearchTerms(prev => [...prev, newTerm]);
  };



const renderVolumeStatus = (term: SearchTerm) => {
  if (isLoadingVolumes) {
    return <Loader className="w-4 h-4 animate-spin" />;
  }

  if (!term.keywordMetrics) {
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">No Data</span>;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        {term.keywordMetrics.avgMonthlySearches.toLocaleString()}
      </span>
      <button
        onClick={() => setSelectedMetrics({ 
          term: term.searchTerm, 
          metrics: term.keywordMetrics! 
        })}
        className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
        title="View detailed metrics"
      >
        <Activity className="w-4 h-4" />
      </button>
    </div>
  );
};





const getPatternCounts = () => {
  const attributeBased = searchTerms.filter(r => r.pattern.includes('Attribute-based')).length;
  const descriptionBased = searchTerms.filter(r => r.pattern.includes('Description-based')).length;
  const apiSuggestions = searchTerms.filter(r => r.pattern === 'API Suggestion').length;

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="font-bold text-lg">Pattern Breakdown:</p>
      <div className="space-y-1 mt-2">
        <div className="flex justify-between items-center">
          <span>Attribute-based:</span>
          <span className="font-medium">{attributeBased}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Description-based:</span>
          <span className="font-medium">{descriptionBased}</span>
        </div>
        {apiSuggestions > 0 && (
          <div className="flex justify-between items-center">
            <span>API Suggestions:</span>
            <span className="font-medium">{apiSuggestions}</span>
          </div>
        )}
      </div>
    </div>
  );
};


















  /**
 * Fetches search volume metrics from an API.
 * Updates the `searchTerms` state with the fetched metrics for each term.
 */


  useEffect(() => {
    let mounted = true;
    
    const setTermsWithNoMetrics = () => {
      const terms = results.map(term => ({
        ...term,
        estimatedVolume: null as number | null,
        keywordMetrics: null as KeywordMetrics | null
      }));
      setSearchTerms(terms);
    };
  
    const fetchSearchVolumes = async () => {
      if (!useSearchVolumes || results.length === 0) {
        setTermsWithNoMetrics();
        return;
      }
      
      setIsLoadingVolumes(true);
      
      try {
        const response = await fetch(`${environment.api.baseUrl}/api/search-volumes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchTerms: results.map(r => r.searchTerm),
            useSearchVolumes
          })
        });
  
        if (!response.ok) throw new Error('Failed to fetch search volumes');
  
        const data = await response.json();
        
        if (mounted) {
          const terms = results.map(term => ({
            ...term,
            estimatedVolume: data.metrics[term.searchTerm.toLowerCase()]?.avgMonthlySearches || null,
            keywordMetrics: data.metrics[term.searchTerm.toLowerCase()] || null
          }));
          setSearchTerms(terms);
        }
      } catch (error) {
        console.error('Error fetching search volumes:', error);
        setTermsWithNoMetrics();
      } finally {
        if (mounted) setIsLoadingVolumes(false);
      }
    };
  
    fetchSearchVolumes();
    
    return () => { mounted = false; };
  }, [results, useSearchVolumes]);

  /**
 * Filters the search terms based on the active filters.
 * Supports conditions such as "contains", "notContains", "greaterThan", and "lessThan".
 */

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
  }, [searchTerms, filters]);


// Pagination Logic
// - `totalPages`: The total number of pages based on the filtered results and items per page.
// - `startIndex`: The starting index of the items for the current page.
// - `endIndex`: The ending index of the items for the current page.
// - `currentPageData`: The subset of filtered results to display on the current page.

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredResults.length);
  const currentPageData = filteredResults.slice(startIndex, endIndex);




  const handleDownloadReport = () => {
    // For downloading filtered results only
    const csvContent = CSVExporter.exportSearchTerms(filteredResults);
    CSVExporter.downloadCSV(
      csvContent,
      `${fileName.split('.')[0]}_search_terms_filtered.csv`
    );
  };
  
  const handleDownloadFullReport = () => {
    // For downloading complete results with all terms
    const csvContent = CSVExporter.exportSearchTerms(searchTerms);
    CSVExporter.downloadCSV(
      csvContent,
      `${fileName.split('.')[0]}_search_terms_full_report.csv`
    );
  };







  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };


  const handleAddFilter = (newFilter: Filter) => {
    setFilters([...filters, newFilter]);
    setCurrentPage(1); // Reset to first page
    setShowFilterModal(false);
  };
  
  // When removing a filter:
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
    setCurrentPage(1); // Reset to first page
  };



  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left Stats Panel */}
      <div className="col-span-3 bg-[#FCFCFC] rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        <div className="bg-gray-200 p-4 border-b border-[#E6EAEE]">
          <h2 className="text-2xl font-bold text-[#232323]">Results</h2>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="p-3 rounded-lg">
              <p className="text-4xl font-bold text-[#17235E]">{filteredResults.length}</p>
              <p className="font-bold text-xl mt-2">Total Search Terms</p>
            </div>

            {isLoadingVolumes && (
              <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                <span>Fetching keyword metrics...</span>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
             
              {getPatternCounts()}
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
            onClick={() => {
              setFilters(filters.filter((_, i) => i !== index));
              setCurrentPage(1); // Reset to first page
            }}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
)}

<div className="p-3 bg-blue-50 rounded-lg relative group">
  <div className="relative">
    <button 
      className="w-full flex items-center justify-between bg-transparent rounded-lg font-bold text-xl p-2 hover:bg-blue-100"
      onClick={() => {}} // Empty onClick as we'll use the dropdown
    >
      <span>Download Report</span>
      <div className="flex items-center">
        <Download className="w-5 h-5 mr-1" />
        <ChevronDown className="w-4 h-4" />
      </div>
    </button>
    
    {/* Dropdown Menu */}
    <div className="hidden group-hover:block absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-20">
      <button
        onClick={handleDownloadReport}
        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        <div>
          <div className="font-medium">Export Filtered Results</div>
          <div className="text-sm text-gray-500">Current view with applied filters</div>
        </div>
      </button>
      
      <button
        onClick={handleDownloadFullReport}
        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        <div>
          <div className="font-medium">Export Full Report</div>
          <div className="text-sm text-gray-500">Complete analysis with statistics</div>
        </div>
      </button>
    </div>
  </div>
</div>






          </div>
        </div>

        <div className="border-t border-gray-200 p-8 bg-gray-200">
          <div className="text-sm text-[#17235E] text-center">
            {filteredResults.length} terms found
          </div>
        </div>
      </div>

      {/* Right Results Panel */}
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
  {renderVolumeStatus(term)}
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

      {selectedMetrics && (


<KeywordMetricsModal
isOpen={!!selectedMetrics}
onClose={() => setSelectedMetrics(null)}
searchTerm={selectedMetrics.term}
metrics={selectedMetrics.metrics}
originalTerm={searchTerms.find(term => term.searchTerm === selectedMetrics.term)!}
onAddSuggestion={handleAddSuggestion}
existingTerms={searchTerms} // Add this line
/>



      )}


      
    </div>
  );
};

export default SearchTermsResults;