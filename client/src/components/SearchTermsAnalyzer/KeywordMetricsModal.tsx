import React from 'react';
import { X, TrendingUp, DollarSign, Activity, Users } from 'lucide-react';
import { KeywordMetrics } from '../../types'


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
  if (!isOpen) return null;

  // Helper to format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper to get competition color
  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-amber-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Helper to format competition index as percentage
  const formatCompetitionIndex = (index: number) => {
    return `${(index * 100).toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-w-[90vw] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            Search Term Metrics
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Term */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-600 mb-2">
              "{searchTerm}"
            </h4>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly Searches */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-gray-900">Monthly Searches</h5>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.avgMonthlySearches.toLocaleString()}
              </p>
            </div>

            {/* Competition */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-gray-900">Competition</h5>
              </div>
              <p className={`text-2xl font-bold ${getCompetitionColor(metrics.competition)}`}>
                {metrics.competition}
              </p>
              <p className="text-sm text-gray-600">
                Index: {formatCompetitionIndex(metrics.competitionIndex)}
              </p>
            </div>

            {/* Top of Page Bid (Low) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-gray-900">Low Top Page Bid</h5>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.lowTopPageBid)}
              </p>
            </div>

            {/* Top of Page Bid (High) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-gray-900">High Top Page Bid</h5>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.highTopPageBid)}
              </p>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Data provided by Google Ads API. Competition index ranges from 0 to 1, where higher values indicate more competition.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordMetricsModal;