/**
 * QuotaTracker Component
 *
 * This component tracks and displays the usage of the API quota for the Shopping Feed Analyzer.
 * It provides a toggle to enable or disable periodic quota updates and visual indicators for the current
 * API usage status.
 *
 * Props:
 * - `isEnabled` (boolean): Whether the quota tracker is enabled for periodic updates.
 * - `onToggle` (function): Callback function triggered when the tracker is toggled on or off.
 *
 * State:
 * - `used` (number): Number of API requests used.
 * - `limit` (number): Maximum number of API requests allowed as defined in the `.env` file.
 * - `lastUpdated` (Date): Timestamp of the last quota update.
 * - `remainingTime` (string): Time remaining for the first request to expire.
 * - `isLoading` (boolean): Whether the quota status is currently being fetched.
 *
 * Key Features:
 * - **Dynamic Progress Bar**: Displays the API quota usage visually as a percentage of the total.
 * - **Color-Coded Indicators**:
 *   - Green: Quota usage is below 80%.
 *   - Amber: Quota usage is between 80% and 95%.
 *   - Red: Quota usage is above 95%.
 * - **Real-Time Updates**: Periodically fetches quota status if enabled, with updates every 10 seconds.
 * - **Warning System**: Alerts users when the API quota is low or critical to prevent overuse.
 * - **Toggle Control**: Allows enabling or disabling quota tracking.
 *
 * Dependencies:
 * - `useQuotaStore`: A custom state management hook for tracking quota-related data.
 * - `lucide-react`: Icons for visual feedback.
 * - `environment`: Configuration for API endpoints and environment variables.
 *
 * Notes:
 * - The progress bar dynamically adjusts to reflect current API usage.
 * - Prevents toggling the tracker on if the quota is critically low.
 * - Each request expires 24 hours after it is made, and this expiration is displayed in the UI.
 */


import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useQuotaStore } from '../utils/quotaStore';
import environment from '../../config/environment';

interface QuotaTrackerProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const QuotaTracker: React.FC<QuotaTrackerProps> = ({ isEnabled, onToggle }) => {
  const { used, limit, lastUpdated, remainingTime, isLoading, setQuota, setLoading } = useQuotaStore();

  const fetchQuotaStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${environment.api.baseUrl}/api/quota-status`);
      if (response.ok) {
        const data = await response.json();
        setQuota(
          data.used, 
          Number(data.limit), 
          new Date(data.lastUpdated),
          data.remainingTime
        );
      }
    } catch (error) {
      console.error('Failed to fetch quota status:', error);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
    const interval = isEnabled ? setInterval(fetchQuotaStatus, 10000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEnabled]);

  const quotaPercentage = (used / limit) * 100;
  const isQuotaWarning = quotaPercentage >= 80;
  const isQuotaCritical = quotaPercentage >= 95;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="relative inline-flex items-center cursor-pointer">
       
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => {
              if (isQuotaCritical && e.target.checked) {
                alert('API quota is nearly exhausted. Please wait for requests to expire.');
                return;
              }
              onToggle(e.target.checked);
            }}
            className="sr-only peer"
            disabled={isQuotaCritical}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            Enable Search Volume Estimation
          </span>
        </label>
      </div>

      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">API Quota Usage</span>
          {isLoading ? (
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          ) : isQuotaWarning ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isQuotaCritical 
                ? 'bg-red-600' 
                : isQuotaWarning 
                  ? 'bg-amber-500' 
                  : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          ></div>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-600">
            {used.toLocaleString()} / {limit.toLocaleString()} requests
          </span>
          <span className="text-gray-500">
            {quotaPercentage.toFixed(1)}%
          </span>
        </div>

        {remainingTime && (
          <div className="mt-2 text-xs text-gray-600">
            First request expires in: {remainingTime}
          </div>
        )}

        {lastUpdated && (
          <div className="mt-1 text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {isQuotaWarning && (
          <div className={`mt-3 text-sm ${isQuotaCritical ? 'text-red-600' : 'text-amber-600'} flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4" />
            {isQuotaCritical 
              ? 'API quota nearly exhausted. Please wait for requests to expire.'
              : 'API quota running low. Large analyses may be restricted.'}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
      <p>Note: Each request expires 24 hours after it was made.</p>
      </div>
    </div>
  );
};

export default QuotaTracker;