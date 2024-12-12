/**
 * SearchTermsProgress Component
 *
 * This component provides a visual indication that a process is in progress for search term analysis,
 * particularly during attribute combinations and product description analysis.
 *
 * Props:
 * - `isOpen` (boolean): Determines whether the modal is visible.
 * - `stage` ('attribute' | 'description'): Indicates the current stage of the process.
 * - `progress` (number): Overall progress percentage (not currently displayed).
 * - `message` (string, optional): Custom message to display during the process.
 * - `attributeProgress` (number): Progress of attribute combinations analysis (not currently displayed).
 * - `descriptionProgress` (number): Progress of description analysis (not currently displayed).
 *
 * Key Features:
 * - **Modal Display**: Shows a centered modal when `isOpen` is true.
 * - **Process Indicators**: Displays animated spinners and status messages for:
 *   - Attribute combinations analysis.
 *   - Description analysis.
 * - **Dynamic Messaging**: Adjusts the status message based on the current stage.
 * - **Customizable Message**: Allows overriding the default message with a custom one via the `message` prop.
 *
 * Dependencies:
 * - `lucide-react`: Provides icons for visual feedback.
 *
 * Notes:
 * - This component does not display the progress percentages (`progress`, `attributeProgress`, `descriptionProgress`)
 *   but could be extended to do so in future iterations.
 * - Animations are managed using CSS classes such as `animate-spin`.
 */


import React from 'react';
import { FileText, Loader } from 'lucide-react';

interface SearchTermsProgressProps {
  isOpen: boolean;
  stage: 'attribute' | 'description';
  progress: number;
  message?: string;
  attributeProgress: number;
  descriptionProgress: number;
}

const SearchTermsProgress: React.FC<SearchTermsProgressProps> = ({
  isOpen,
  stage,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[32rem] text-center">
        <h2 className="text-2xl font-bold mb-6">Search Terms Analysis</h2>
        
        <div className="flex items-center justify-center mb-8">
          <FileText className="w-16 h-16 text-blue-500 mb-2" />
        </div>

        {/* Attribute Analysis Status */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Attribute Combinations</span>
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-600">Processing product attributes...</p>
        </div>

        {/* Description Analysis Status */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Description Analysis</span>
            <Loader className="w-5 h-5 text-green-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-600">Analyzing product descriptions...</p>
        </div>

        <p className="text-lg mb-6">
          {message || (stage === 'description' 
            ? 'Analyzing product descriptions...' 
            : 'Generating Search Terms...')}
        </p>

        <div className="mt-4 text-sm text-gray-500">
          {stage === 'description' && (
            <p>Description analysis may take several minutes for large catalogs</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchTermsProgress;