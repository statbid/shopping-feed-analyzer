import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AnalyzerHeaderProps {
  file: File | null;
  onUploadClick: () => void;
  onAnalyzeClick: () => void;
  isAnalyzeDisabled: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
  file, onUploadClick, onAnalyzeClick, isAnalyzeDisabled, isLoading, setIsLoading
}) => {
  
  const handleAnalyzeClick = () => {
    setIsLoading(true);
    onAnalyzeClick();
  };

  return (
    <div className="flex items-center mb-6">
      <h2 className="text-2xl font-bold text-blue-900">Google Shopping Feed Analyzer</h2>
      
      <div className="flex items-center ml-4">
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue"
            value={file ? file.name : ''}
            onChange={() => {}}
          >
            <option value="">{file ? file.name : 'Select a file'}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <button
          onClick={onUploadClick}
          className="ml-2 px-4 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-700"
        >
          Upload File
        </button>

        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzeDisabled}
          className={`ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
};

export default AnalyzerHeader;
