import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import CheckSelector from './CheckSelector';
import { checkCategories } from '../utils/checkConfig';
import QuotaTracker from '../SearchTermsAnalyzer/QuotaTracker';  // Import the new component

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

        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            {/* Replace the old search volume toggle with QuotaTracker */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Volume API</h3>
              <QuotaTracker 
                isEnabled={useSearchVolumes} 
                onToggle={onSearchVolumeChange}
              />
            </div>

            {/* Quality Checks Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Checks</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure which quality checks to run during analysis.
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