import React, { useState, useEffect } from 'react';
import AnalyzerHeader from './AnalyzerHeader';
import FileUploadModal from './FileUploadModal';
import { SearchTerm, AnalysisResult } from '../../types';
import AnalysisResults from './AnalysisResults';
import ProgressModal from './ProgressModal';
import Settings from './Settings';
import Toast from './Toast';
import CheckSelectorModal from './CheckSelectorModal';
import { checkCategories, getEnabledChecks } from '../utils/checkConfig';
import environment from '../../config/environment';
import SearchTermsResults from '../SearchTermsAnalyzer/SearchTermsResults';

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

type ProgressStatus = 'uploading' | 'extracting' | 'extracted' | 'analyzing' | 'processing';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [processedProducts, setProcessedProducts] = useState(0);
  const [isCheckSelectorModalOpen, setIsCheckSelectorModalOpen] = useState(false);
  const [selectedChecks, setSelectedChecks] = useState<string[]>(
    checkCategories.flatMap(cat => cat.checks.map(check => check.id))
  );
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('uploading');
  const [searchTermsResults, setSearchTermsResults] = useState<SearchTerm[] | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<'feed' | 'search'>('feed');
  const [useSearchVolumes, setUseSearchVolumes] = useState(true);

  const handleFileSelect = async (selectedFile: File) => {
    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProgressStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${environment.api.baseUrl}${environment.api.endpoints.upload}`, {
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
        message: `File processed successfully!`,
      });
      setIsModalOpen(false);
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setUploadStatus({
        type: 'error',
        message: `Error processing file: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProcessedProducts(0);
    setProgressStatus('analyzing');
    setIsCheckSelectorModalOpen(false);

    try {
      const response = await fetch(`${environment.api.baseUrl}${environment.api.endpoints.analyze}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          enabledChecks: getEnabledChecks(selectedChecks),
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
                  message: `Error analyzing file: ${data.details || data.error}`,
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
                  message: 'File analyzed successfully!',
                });
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
              setUploadStatus({
                type: 'error',
                message: 'Error parsing server response',
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
        message: `Error analyzing file: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  const handleSearchTermsClick = async () => {
    if (!file) return;

    setAnalysisResults(null);
    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProcessedProducts(0);
    setProgressStatus('analyzing');
    setAnalysisType('search');

    try {
      const response = await fetch(`${environment.api.baseUrl}${environment.api.endpoints.searchTerms}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: file.name }),
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
                  message: `Error analyzing search terms: ${data.details || data.error}`,
                });
                return;
              }

              if (data.status === 'processing' || data.status === 'analyzing') {
                setProcessedProducts(data.processed);
                setProgressStatus(data.status);
              }

              if (data.status === 'complete') {
                setSearchTermsResults(data.results as SearchTerm[]);
                setUploadStatus({
                  type: 'success',
                  message: 'Search terms analysis completed successfully!',
                });
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
              setUploadStatus({
                type: 'error',
                message: 'Error parsing server response',
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing search terms:', error);
      setUploadStatus({
        type: 'error',
        message: `Error analyzing search terms: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  const handleCheckSelection = (checks: string[]) => {
    setSelectedChecks(checks);
  };

  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    };
  }, [file]);

  return (
    <div className="w-full h-full flex flex-col">
      <AnalyzerHeader
        file={file}
        onUploadClick={() => setIsModalOpen(true)}
        onCheckQualityClick={handleAnalyze}
        onSearchTermsClick={handleSearchTermsClick}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isAnalyzeDisabled={!file || isLoading}
        isLoading={isLoading}
      />

      {uploadStatus.type && (
        <Toast
          type={uploadStatus.type}
          message={uploadStatus.message}
          onClose={() => setUploadStatus({ type: '', message: '' })}
        />
      )}

      <div className="flex-grow overflow-hidden">
        {searchTermsResults && searchTermsResults.length > 0 ? (
          <SearchTermsResults
            results={searchTermsResults}
            fileName={file?.name || ''}
            useSearchVolumes={useSearchVolumes}
          />
        ) : analysisResults ? (
          <AnalysisResults
            results={analysisResults}
            fileName={file?.name || ''}
            isLoading={isLoading}
          />
        ) : null}
      </div>

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
        selectedChecks={selectedChecks}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedChecks={selectedChecks}
        onSelectionChange={setSelectedChecks}
        useSearchVolumes={useSearchVolumes}
        onSearchVolumeChange={setUseSearchVolumes}
      />

      <ProgressModal
        isOpen={isProgressModalOpen}
        processedProducts={processedProducts}
        status={progressStatus}
        analysisType={analysisType}
      />
    </div>
  );
}
