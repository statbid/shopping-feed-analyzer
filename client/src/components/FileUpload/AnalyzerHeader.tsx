import React from 'react';
import { ChevronDown, Search, CheckCircle } from 'lucide-react';

interface AnalyzerHeaderProps {
  file: File | null;
  onUploadClick: () => void;
  onCheckQualityClick: () => void;
  onSearchTermsClick: () => void;
  isAnalyzeDisabled: boolean;
  isLoading: boolean;
}

const AnalyzerHeader: React.FC<AnalyzerHeaderProps> = ({
  file, 
  onUploadClick, 
  onCheckQualityClick,
  onSearchTermsClick,
  isAnalyzeDisabled, 
  isLoading
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
          onClick={onCheckQualityClick}
          disabled={isAnalyzeDisabled}
          className={`ml-3 px-6 py-4 flex items-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {isLoading ? 'Checking...' : 'Check Feed Quality'}
        </button>

        <button
          onClick={onSearchTermsClick}
          disabled={isAnalyzeDisabled}
          className={`ml-3 px-6 py-4 flex items-center bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg`}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Terms Analysis
        </button>
      </div>
    </div>
  );
};

export default AnalyzerHeader;