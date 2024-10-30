import React, { useState, useEffect } from 'react';
import AnalyzerHeader from './AnalyzerHeader';
import FileUploadModal from './FileUploadModal';
import AnalysisResults from './AnalysisResults';
import ProgressModal from './ProgressModal';
import Toast from './Toast';
import CheckSelectorModal from './CheckSelectorModal';
import { checkCategories, getEnabledChecks } from '../utils/checkConfig';

interface UploadStatus {
  type: 'success' | 'error' | '';
  message: string;
}

interface ErrorResult {
  id: string;
  errorType: string;
  details: string;
  affectedField: string;
  value: string;
}

interface AnalysisResults {
  totalProducts: number;
  errorCounts: { [key: string]: number };
  errors: ErrorResult[];
}

export default function FileUpload() {
  // State Management
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [processedProducts, setProcessedProducts] = useState(0);
  const [isCheckSelectorModalOpen, setIsCheckSelectorModalOpen] = useState(false);
  const [selectedChecks, setSelectedChecks] = useState<string[]>(
    checkCategories.flatMap(cat => cat.checks.map(check => check.id))
  );
  const [progressStatus, setProgressStatus] = useState<'uploading' | 'extracting' | 'extracted' | 'analyzing'>('uploading');

  // File Upload Handler
  const handleFileSelect = async (selectedFile: File) => {
    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProgressStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setFile(selectedFile);
      setUploadStatus({ 
        type: 'success', 
        message: `File processed successfully!` 
      });
      setIsModalOpen(false);
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setUploadStatus({ 
        type: 'error', 
        message: `Error processing file: ${errorMessage}` 
      });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  // Analysis Handler
  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProcessedProducts(0);
    setProgressStatus('analyzing');
    setIsCheckSelectorModalOpen(false);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileName: file.name,
          enabledChecks: getEnabledChecks(selectedChecks)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                console.error('Server error:', data.error, data.details);
                setUploadStatus({ 
                  type: 'error', 
                  message: `Error analyzing file: ${data.details || data.error}` 
                });
                return;
              }

              if (data.processed) {
                setProcessedProducts(data.processed);
              }

              if (data.completed) {
                setAnalysisResults(data.results);
                setUploadStatus({ 
                  type: 'success', 
                  message: 'File analyzed successfully!' 
                });
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
              setUploadStatus({ 
                type: 'error', 
                message: 'Error parsing server response' 
              });
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setUploadStatus({ 
        type: 'error', 
        message: `Error analyzing file: ${errorMessage}` 
      });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  // Modal Handlers
  const handleCheckQualityClick = () => {
    setIsCheckSelectorModalOpen(true);
  };

  const handleSearchTermsClick = () => {
    console.log('Search terms analysis clicked');
    // Implement search terms analysis functionality
  };

  const handleCheckSelection = (checks: string[]) => {
    setSelectedChecks(checks);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up any resources if needed
      if (file) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    };
  }, [file]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <AnalyzerHeader 
        file={file}
        onUploadClick={() => setIsModalOpen(true)}
        onCheckQualityClick={handleCheckQualityClick}
        onSearchTermsClick={handleSearchTermsClick}
        isAnalyzeDisabled={!file || isLoading}
        isLoading={isLoading}
      />

      {/* Toast Notifications */}
      {uploadStatus.type && (
        <Toast 
          type={uploadStatus.type} 
          message={uploadStatus.message} 
          onClose={() => setUploadStatus({ type: '', message: '' })}
        />
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="flex-grow overflow-hidden">
          <AnalysisResults 
            results={analysisResults}
            fileName={file?.name || ''}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Modals */}
      <FileUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onFileSelect={handleFileSelect} 
      />

      <CheckSelectorModal 
        isOpen={isCheckSelectorModalOpen}
        onClose={() => setIsCheckSelectorModalOpen(false)}
        onAnalyze={handleAnalyze}
        onSelectionChange={handleCheckSelection}
        isAnalyzing={isLoading}
      />

      <ProgressModal 
        isOpen={isProgressModalOpen}
        processedProducts={processedProducts}
        status={progressStatus}
      />
    </div>
  );
}