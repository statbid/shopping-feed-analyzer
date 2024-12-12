/**
 * ProgressModal Component
 *
 * This component displays a modal to indicate the progress of various stages of file processing or analysis.
 * It is designed to provide visual feedback to the user during tasks like uploading, extracting, or analyzing files.
 *
 * Features:
 * - **Dynamic Content:** Displays different icons, messages, and animations based on the current `status`.
 * - **Progress Tracking:** Shows the number of products processed for relevant tasks.
 * - **Optional Analysis Type:** Tailors the content based on the type of analysis (`feed` or `search`).
 * - **Custom Status Message:** Allows for an additional message to be displayed below the main content.
 *
 * Props:
 * - `isOpen` (boolean): Determines whether the modal is visible.
 * - `processedProducts` (number): The number of products processed, displayed during analysis or processing.
 * - `status` (string): The current stage of the process. Can be:
 *    - `'uploading'`
 *    - `'extracting'`
 *    - `'extracted'`
 *    - `'analyzing'`
 *    - `'processing'`
 * - `analysisType` (optional string): Specifies the type of analysis, either `'feed'` or `'search'`.
 * - `statusMessage` (optional string): An additional status message displayed below the main content.
 *
 * Styling:
 * - Uses Tailwind CSS for layout and visual design.
 * - Includes animations (e.g., spinning borders) for a better user experience.
 * - Modal is centered on the screen with a semi-transparent backdrop.
 */
import React from 'react';
import { FileText, Loader, FileArchive, Upload, CheckCircle } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  processedProducts: number;
  status: 'uploading' | 'extracting' | 'extracted' | 'analyzing' | 'processing';
  analysisType: 'feed' | 'search';
  currentStage?: 'attribute' | 'description' | 'synonyms';
  progress?: number;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  processedProducts,
  status,
  analysisType,
  currentStage,
  progress
}) => {
  if (!isOpen) return null;

  const getStageText = () => {
    if (analysisType === 'search') {
      switch (currentStage) {
        case 'attribute':
          return 'Generating Search Terms...';
        case 'description':
          return `Analyzing product descriptions (${Math.round(progress || 0)}%)`;
        case 'synonyms':
          return 'Processing term variations...';
        default:
          return 'Starting search terms analysis...';
      }
    }
    return 'Processing...';
  };

  const getContent = () => {
    switch (status) {
      case 'processing':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center">
            <FileText className="w-16 h-16 text-blue-500 mb-2" />
            <h2 className="text-2xl font-bold mb-6">
              {analysisType === 'search' ? 'Search Terms Analysis' : 'Feed Quality Analysis'}
            </h2>
  
            {analysisType === 'search' && (
              <p className="text-lg mb-4">{getStageText()}</p>
            )}
  
            {analysisType === 'feed' && (
              <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">
                  {processedProducts.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Products processed</p>
              </div>
            )}
  
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-blue-500 mb-2 animate-spin" />
            <p className="text-lg mb-4">Processing...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        {getContent()}
      </div>
    </div>
  );
};

export default ProgressModal;