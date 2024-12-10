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