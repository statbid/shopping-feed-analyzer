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
import { FileArchive, FileText, Loader, Upload, CheckCircle } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean; // Determines whether the modal is visible
  processedProducts: number; // Number of products processed
  status: 'uploading' | 'extracting' | 'extracted' | 'analyzing' | 'processing'; // Current processing status
  analysisType?: 'feed' | 'search'; // Type of analysis being performed (optional)
  statusMessage?: string; // Optional additional status message
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  processedProducts,
  status,
  analysisType,
  statusMessage
}) => {
  // If the modal is not open, do not render it
  if (!isOpen) return null;

  /**
   * Generates the content to display based on the current status.
   */
  const getContent = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center">
            <Upload className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">Uploading File...</p>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        );

      case 'extracting':
        return (
          <div className="flex flex-col items-center">
            <FileArchive className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">Extracting ZIP File...</p>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        );

      case 'extracted':
        return (
          <div className="flex flex-col items-center">
            <FileText className="w-16 h-16 text-green-500 mb-2" />
            <p className="text-lg mb-4">File Extracted Successfully!</p>
          </div>
        );

      case 'processing':
      case 'analyzing':
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-lg mb-4">
              {analysisType === 'search' ? 'Generating Search Terms' : 'Checking Feed Quality'}
            </p>
            <div className="mb-4">
              <p className="text-3xl font-bold text-blue-600">
                {processedProducts.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Products processed</p>
            </div>
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

  /**
   * Determines the title of the modal based on the current status.
   */
  const getTitle = () => {
    switch (status) {
      case 'uploading':
        return 'Processing Feed File';
      case 'extracting':
        return 'Extracting ZIP File';
      case 'extracted':
        return 'File Ready';
      case 'analyzing':
      case 'processing':
        return analysisType === 'search' ? 'Search Terms Analysis' : 'Feed Quality Analysis';
      default:
        return 'Processing Feed File';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
        {getContent()}
        {statusMessage && (
          <p className="text-sm text-gray-600 mt-4">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;
