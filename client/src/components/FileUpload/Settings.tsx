/**
 * Settings Component
 *
 * This component renders the analysis settings in a modal with a vertical navigation bar.
 * It allows users to toggle settings like API usage for search volumes, configure quality checks, 
 * and navigate through different settings sections.
 *
 * Features:
 * - **Vertical Navigation Bar**: Allows switching between "General" and "Quality Checks" sections.
 * - **Settings Content**:
 *   - Search Volume API toggle using `QuotaTracker`.
 *   - Quality checks selection using `CheckSelector`.
 * - Automatically saves settings for future analyses.
 * - Responsive layout for smaller screens.
 *
 * Props:
 * - `isOpen`: A boolean indicating whether the modal is open.
 * - `onClose`: A callback function triggered when the modal is closed.
 * - `selectedChecks`: An array of selected quality checks.
 * - `onSelectionChange`: A callback function triggered when the selected checks change.
 * - `useSearchVolumes`: A boolean indicating whether the Search Volume API is enabled.
 * - `onSearchVolumeChange`: A callback function triggered when toggling the Search Volume API.
 */

import React, { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import CheckSelector from './CheckSelector';
import { checkCategories } from '../utils/checkConfig';
import QuotaTracker from '../SearchTermsAnalyzer/QuotaTracker';

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
  const [activeSection, setActiveSection] = useState<'general' | 'qualityChecks'>('general');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-[80%] h-[90%] shadow-lg flex">
        {/* Vertical Navigation Bar */}
        <div className="bg-gray-100 w-64 flex flex-col border-r">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            </div>
          </div>
          <div className="flex-1 p-4">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'general'
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => setActiveSection('general')}
            >
              General Settings
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg mt-2 ${
                activeSection === 'qualityChecks'
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => setActiveSection('qualityChecks')}
            >
              Quality Checks
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-4 text-gray-500 hover:text-gray-700 border-t"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === 'general' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Volume API</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <QuotaTracker
                  isEnabled={useSearchVolumes}
                  onToggle={onSearchVolumeChange}
                />
              </div>
              <p className="text-sm text-gray-600">
                Enable or disable the Search Volume API for additional analysis features.
              </p>
            </div>
          )}

          {activeSection === 'qualityChecks' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Checks</h3>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
