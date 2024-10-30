import React from 'react';
import { X } from 'lucide-react';
import CheckSelector from './CheckSelector';
import { checkCategories } from '../utils/checkConfig';

interface CheckSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  onSelectionChange: (selectedChecks: string[]) => void;
  isAnalyzing: boolean;
}
const CheckSelectorModal: React.FC<CheckSelectorModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  onSelectionChange,
  isAnalyzing
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-[80vw] max-w-4xl h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-[#17235E]">Select Quality Checks</h2>
            <p className="text-gray-600 mt-1">Choose which quality checks to run on your feed</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content with Sticky Controls */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <CheckSelector
              categories={checkCategories}
              onSelectionChange={onSelectionChange}
              hideHeader={true}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              flex items-center"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                Analyzing...
              </>
            ) : (
              'Run Analysis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CheckSelectorModal;