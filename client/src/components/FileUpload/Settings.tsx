import React, { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import CheckSelector from './CheckSelector';
import { checkCategories } from '../utils/checkConfig';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChecks: string[];
  onSelectionChange: (checks: string[]) => void;
  useSearchVolumes: boolean;
  onSearchVolumeChange: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  selectedChecks,
  onSelectionChange,
  useSearchVolumes,
  onSearchVolumeChange
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-96 h-full shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Analysis Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            {/* Search Volume API Setting */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Volume API</h3>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSearchVolumes}
                    onChange={(e) => onSearchVolumeChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Enable Search Volume Estimation
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                When enabled, search terms will include estimated monthly search volumes from Google Ads API.
              </p>
            </div>

            {/* Quality Checks Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Checks</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure which quality checks to run during analysis. All checks are enabled by default.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <CheckSelector
                  categories={checkCategories}
                  onSelectionChange={onSelectionChange}
                  hideHeader={true}
                  selectedChecks={selectedChecks}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Settings are automatically saved and will be applied to future analyses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;