/**
 * KeywordMetricsModal Component
 *
 * This component displays detailed keyword metrics for a given search term. 
 * The metrics are presented in a modal with a clean grid layout, providing insights 
 * such as average monthly searches, competition level, and top-of-page bid estimates.
 *
 * Features:
 * - **Dynamic Formatting:**
 *   - Formats currency values for bids.
 *   - Colors competition levels based on their severity.
 *   - Formats competition index as a percentage.
 * - **Responsive Design:** Adapts to various screen sizes with a modal overlay.
 * - **Clear Layout:** Uses a grid layout for organizing metrics into sections.
 *
 * Props:
 * - `isOpen` (boolean): Determines whether the modal is visible.
 * - `onClose` (function): Callback triggered when the modal is closed.
 * - `searchTerm` (string): The search term for which metrics are being displayed.
 * - `metrics` (object): An object containing the following properties:
 *   - `avgMonthlySearches` (number): Average monthly search volume.
 *   - `competition` (string): Competition level (`HIGH`, `MEDIUM`, `LOW`).
 *   - `competitionIndex` (number): Numerical index for competition (0–1).
 *   - `lowTopPageBid` (number): Lowest bid for the top-of-page position.
 *   - `highTopPageBid` (number): Highest bid for the top-of-page position.
 */

import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Activity, Users, Search, Loader } from 'lucide-react';
import { KeywordMetrics } from '@shopping-feed/types';
import environment from '../../config/environment';

interface KeywordSuggestion {
  keyword: string;
  metrics: KeywordMetrics;
}

interface KeywordMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  metrics: KeywordMetrics;
}

const KeywordMetricsModal: React.FC<KeywordMetricsModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  metrics
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'suggestions'>('metrics');
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleGetSuggestions = async () => {
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
      setActiveTab('suggestions');
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              {activeTab === 'metrics' ? 'Keyword Metrics' : 'Related Keywords'}
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
                      <h4 className="text-lg font-semibold text-blue-600 mb-4">
                        "{suggestion.keyword}"
                      </h4>
                      {renderMetricsGrid(suggestion.metrics)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Data provided by Google Ads API. Competition index ranges from 0 to 1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordMetricsModal;
