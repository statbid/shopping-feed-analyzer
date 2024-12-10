/**
 * AnalyzerHeader Component
 *
 * This component renders the header section of the Google Shopping Feed Analyzer.
 * It provides options to interact with the application, such as uploading a file, 
 * initiating feed quality checks, analyzing search terms, and accessing settings.
 *
 * Props:
 * - `file`: The currently selected file (or null if no file is selected).
 * - `onUploadClick`: Callback function triggered when the "Upload File" button is clicked.
 * - `onCheckQualityClick`: Callback function triggered when the "Check Feed Quality" button is clicked.
 * - `onSearchTermsClick`: Callback function triggered when the "Search Terms Analysis" button is clicked.
 * - `onSettingsClick`: Callback function triggered when the settings button is clicked.
 * - `isAnalyzeDisabled`: Boolean indicating if the analysis buttons should be disabled (e.g., when no file is selected).
 * - `isLoading`: Boolean indicating if a quality check is currently in progress.
 *
 * Styling:
 * - Uses Tailwind CSS for layout and styling.
 * - Colors and fonts reference the custom Tailwind theme, such as `bg-navigationBar` and `font-sans`.
 *
 * Functionality:
 * - File dropdown: Displays the selected file or a placeholder text.
 * - Buttons:
 *    - "Upload File" uploads a new file.
 *    - "Check Feed Quality" checks for errors in the uploaded feed.
 *    - "Search Terms Analysis" analyzes the feed for keyword opportunities.
 *    - Settings icon opens additional configuration options.
 * - Dynamic states:
 *    - Disables buttons when `isAnalyzeDisabled` is true.
 *    - Displays "Checking..." on the quality check button while `isLoading` is true.
 *
 * Icons:
 * - Uses Lucide icons for visual clarity, including ChevronDown, CheckCircle, Search, and Settings.
 */

import React from 'react';
import { ChevronDown, Search, CheckCircle, Settings as SettingsIcon } from 'lucide-react';

interface AnalyzerHeaderProps {
  file: File | null;
  onUploadClick: () => void;
  onCheckQualityClick: () => void;
  onSearchTermsClick: () => void;
  onSettingsClick: () => void;
  isAnalyzeDisabled: boolean;
  isLoading: boolean;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
  file, 
  onUploadClick, 
  onCheckQualityClick,
  onSearchTermsClick,
  onSettingsClick,
  isAnalyzeDisabled, 
  isLoading
}) => {
  return (
    <div className="flex items-center mb-6">
      {/* Title */}
      <h2 className="text-3xl font-bold text-navigationBar">Google Shopping Feed Analyzer</h2>
      
      {/* Actions */}
      <div className="flex items-center ml-6">
        {/* File Dropdown */}
        <div className="relative">
          <select 
            className="appearance-none bg-cardBackground border border-gray-300 rounded-full py-4 pl-4 pr-12 text-lg leading-6 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue"
            value={file ? file.name : ''}
            onChange={() => {}}
          >
            <option value="">{file ? file.name : 'Select a file'}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="ml-3 px-6 py-4 bg-navigationBar text-white rounded-full hover:bg-[#23394E] text-lg"
        >
          Upload File
        </button>

        {/* Check Feed Quality Button */}
        <button
          onClick={onCheckQualityClick}
          disabled={isAnalyzeDisabled}
          className={`ml-3 px-6 py-4 flex items-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {isLoading ? 'Checking...' : 'Check Feed Quality'}
        </button>

        {/* Search Terms Analysis Button */}
        <button
          onClick={onSearchTermsClick}
          disabled={isAnalyzeDisabled}
          className={`ml-3 px-6 py-4 flex items-center bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg`}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Terms Analysis
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="ml-3 p-4 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
          title="Analysis Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default AnalyzerHeader;
