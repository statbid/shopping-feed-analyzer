import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AnalyzerHeaderProps {
  file: File | null;
  onUploadClick: () => void;
  onAnalyzeClick: () => void;
  isAnalyzeDisabled: boolean;
  isLoading: boolean;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
  file, onUploadClick, onAnalyzeClick, isAnalyzeDisabled, isLoading
}) => {
  return (
    <div className="flex items-center mb-6">
      <h2 className="text-3xl font-bold text-[#17235E]">Google Shopping Feed Analyzer</h2>
      
      <div className="flex items-center ml-6">
        <div className="relative">
          <select 
            className="appearance-none bg-[#FCFCFC] border border-gray-300 rounded-full py-4 pl-4 pr-12 text-lg leading-6 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue"
            value={file ? file.name : ''}
            onChange={() => {}}
          >
            <option value="">{file ? file.name : 'Select a file'}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <button
          onClick={onUploadClick}
          className="ml-3 px-6 py-4 bg-[#17235E] text-white rounded-full hover:bg-[#23394E] text-lg"
        >
          Upload File
        </button>

        <button
          onClick={onAnalyzeClick}
          disabled={isAnalyzeDisabled}
          className={`ml-3 px-6 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg`}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
};

export default AnalyzerHeader;