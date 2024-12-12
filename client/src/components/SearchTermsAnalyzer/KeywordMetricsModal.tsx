/**
 * KeywordMetricsModal Component
 *
 * This component displays a modal that provides keyword metrics and suggestions
 * retrieved from the Google Ads API for a given search term. Users can view detailed
 * metrics and add suggested keywords to their results.
 *
 * Props:
 * - `isOpen` (boolean): Controls whether the modal is visible.
 * - `onClose` (function): Callback function triggered to close the modal.
 * - `searchTerm` (string): The primary search term being analyzed.
 * - `metrics` (KeywordMetrics): Metrics for the search term.
 * - `originalTerm` (SearchTerm): The original search term data for reference.
 * - `onAddSuggestion` (function): Callback to add a suggested search term to the results.
 * - `existingTerms` (SearchTerm[]): List of already existing search terms to avoid duplication.
 *
 * Key Features:
 * - Metrics Tab: Displays detailed keyword metrics such as search volume, competition, and bid ranges.
 * - Suggestions Tab: Retrieves and displays related keyword suggestions.
 * - State Management: Tracks added suggestions to prevent duplicate entries.
 * - Cached Suggestions: Uses a `Map` for caching fetched suggestions to reduce API calls.
 *
 * Dependencies:
 * - `react` for state and lifecycle management.
 * - `lucide-react` for icons.
 * - Tailwind CSS for styling.
 * - Google Ads API for fetching keyword suggestions.
 *
 * Notes:
 * - The component conditionally renders tabs for metrics and suggestions.
 * - Suggestions are fetched via an API and cached for reuse.
 * - Handles loading states and duplicate prevention for suggestions.
 */


import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Activity, Users, Search, Loader, Plus } from 'lucide-react';
import { KeywordMetrics, SearchTerm } from '@shopping-feed/types';
import environment from '../../config/environment';

interface KeywordSuggestion {
  keyword: string;
  metrics: KeywordMetrics;
}

const suggestionsCache = new Map<string, KeywordSuggestion[]>();

interface KeywordMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  metrics: KeywordMetrics;
  originalTerm: SearchTerm;
  onAddSuggestion: (suggestion: SearchTerm) => void;
  existingTerms: SearchTerm[];
}

const KeywordMetricsModal: React.FC<KeywordMetricsModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  metrics,
  originalTerm,
  onAddSuggestion,
  existingTerms
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'suggestions'>('metrics');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>(
    suggestionsCache.get(searchTerm) || []
  );

  // Track added suggestions globally instead of just in component state
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(
    new Set(existingTerms.map(term => term.searchTerm))
  );

  // Update addedSuggestions when existingTerms changes
  useEffect(() => {
    setAddedSuggestions(new Set(existingTerms.map(term => term.searchTerm)));
  }, [existingTerms]);

  if (!isOpen) return null;

  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-amber-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatCompetitionIndex = (index: number) => {
    return `${(index * 100).toFixed(1)}%`;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGetSuggestions = async () => {
    if (suggestionsCache.has(searchTerm)) {
      setSuggestions(suggestionsCache.get(searchTerm)!);
      setActiveTab('suggestions');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${environment.api.baseUrl}/api/keyword-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchTerm })
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      setSuggestions(data.suggestions);
      suggestionsCache.set(searchTerm, data.suggestions);
      setActiveTab('suggestions');
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: KeywordSuggestion) => {
    const newSearchTerm: SearchTerm = {
      id: originalTerm.id,
      productName: originalTerm.productName,
      searchTerm: suggestion.keyword,
      pattern: 'API Suggestion',
      estimatedVolume: suggestion.metrics.avgMonthlySearches,
      keywordMetrics: suggestion.metrics,
      matchingProducts: originalTerm.matchingProducts
    };

    onAddSuggestion(newSearchTerm);
    setAddedSuggestions(prev => new Set(prev).add(suggestion.keyword));
  };

  const renderMetricsGrid = (metricsData: KeywordMetrics, showTitle = false) => (
    <div className="space-y-4">
      {showTitle && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-600">"{searchTerm}"</h4>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h5 className="font-semibold text-gray-900">Monthly Searches</h5>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metricsData.avgMonthlySearches.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h5 className="font-semibold text-gray-900">Competition</h5>
          </div>
          <p className={`text-2xl font-bold ${getCompetitionColor(metricsData.competition)}`}>
            {metricsData.competition}
          </p>
          <p className="text-sm text-gray-600">
            Index: {formatCompetitionIndex(metricsData.competitionIndex)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h5 className="font-semibold text-gray-900">Low Top Page Bid</h5>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metricsData.lowTopPageBid)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h5 className="font-semibold text-gray-900">High Top Page Bid</h5>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metricsData.highTopPageBid)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg w-[800px] max-w-[90vw] shadow-xl flex h-[600px]">
        <div className="w-48 bg-gray-100 p-4 flex flex-col border-r">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Keyword Analysis</h3>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === 'metrics' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === 'suggestions' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
              }`}
            >
              Suggestions
            </button>
          </nav>
          <button
            onClick={handleGetSuggestions}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Get Suggestions
              </>
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              {activeTab === 'metrics' ? 'Keyword Metrics' : `Related Keywords for "${searchTerm}"`}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'metrics' ? (
              renderMetricsGrid(metrics, true)
            ) : (
              <div className="space-y-8">
                {suggestions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading suggestions...</span>
                      </div>
                    ) : (
                      <p>Click "Get Suggestions" to see related keywords</p>
                    )}
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div key={index} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-blue-600">
                          "{suggestion.keyword}"
                        </h4>
                        {suggestion.keyword !== searchTerm && (
                          <button
                            onClick={() => handleAddSuggestion(suggestion)}
                            disabled={addedSuggestions.has(suggestion.keyword)}
                            className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                              addedSuggestions.has(suggestion.keyword)
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {addedSuggestions.has(suggestion.keyword) ? 'Added' : 'Add to Results'}
                          </button>
                        )}
                      </div>
                      {renderMetricsGrid(suggestion.metrics)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordMetricsModal;
