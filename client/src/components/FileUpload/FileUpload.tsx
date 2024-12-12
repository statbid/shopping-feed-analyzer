/**
 * FileUpload Component
 *
 * This component provides a interface for uploading files, analyzing data, and presenting results.
 * It manages multiple states and processes, including file handling, analysis progress tracking, error reporting, 
 * and displaying analysis results.
 *
 * Features:
 * - **File Upload and Validation:** Supports file selection and server upload with error handling.
 * - **Analysis Progress Tracking:** Displays a progress indicator for feed quality checks and search terms analysis.
 * - **Error Reporting:** Presents detailed error results categorized by type.
 * - **Search Terms Analysis:** Generates search terms.
 * - **Settings Management:** Allows users to configure analysis checks and toggle search volume usage.
 * - **Toast Notifications:** Provides success or error feedback messages.
 * - **Modal Management:** Uses various modals for progress, settings, and results.
 *
 * State Management:
 * - `file`: Tracks the uploaded file.
 * - `uploadStatus`: Stores the type and message of upload status (success or error).
 * - `isLoading`: Indicates if analysis or file upload is in progress.
 * - `analysisResults`: Stores results of the feed analysis.
 * - `searchTermsResults`: Stores results of the search terms analysis.
 * - `progressStatus`: Tracks the current stage of the analysis process (e.g., uploading, analyzing).
 * - `selectedChecks`: Keeps track of user-selected checks for feed analysis.
 * - `analysisType`: Tracks whether the current analysis is for feed quality or search terms.
 */


import React, { useState, useEffect } from 'react';
import AnalyzerHeader from './AnalyzerHeader';
import FileUploadModal from './FileUploadModal';
import { SearchTerm, AnalysisResult, ProgressUpdate} from '@shopping-feed/types';
import AnalysisResults from './AnalysisResults';
import ProgressModal from './ProgressModal';
import Settings from './Settings';
import Toast from './Toast';
import { checkCategories, getEnabledChecks } from '../utils/checkConfig';
import environment from '../../config/environment';
import SearchTermsResults from '../SearchTermsAnalyzer/SearchTermsResults';
import SearchTermsProgress from '../SearchTermsAnalyzer/SearchTermsProgressModal';

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

interface ProgressState {
  stage: 'attribute' | 'description' | 'synonyms';
  progress: number;
}


type ProgressStatus = 'uploading' | 'extracting' | 'extracted' | 'analyzing' | 'processing';
type AnalysisMode = 'none' | 'quality' | 'search';



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
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('none');
  const [useSearchVolumes, setUseSearchVolumes] = useState(true);
  const [attributeProgress, setAttributeProgress] = useState(0);
  const [descriptionProgress, setDescriptionProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<'attribute' | 'description'>('attribute');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [progressState, setProgressState] = useState<ProgressState>({
    stage: 'attribute',
    progress: 0
  });



  // Reset analysis states when switching modes
  const resetAnalysisStates = () => {
    setAnalysisResults(null);
    setSearchTermsResults(null);
    setProcessedProducts(0);
    setAttributeProgress(0);
    setDescriptionProgress(0);
    setAnalysisProgress(0);
  };


/**
 * Handles the file upload process.
 * - Uploads the selected file to the server using a `POST` request.
 * - Provides success or error feedback via toast notifications.
 * - Updates the `file` and `uploadStatus` states.
 * @param selectedFile - The file selected by the user.
 */

const handleFileSelect = async (selectedFile: File) => {
  setIsLoading(true);
  setIsProgressModalOpen(true);
  setProgressStatus('uploading');
  resetAnalysisStates();
  setAnalysisMode('none');

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const response = await fetch(`${environment.api.baseUrl}/api/upload`, {
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


/**
 * Handles the feed quality analysis process.
 * - Sends the selected file and enabled checks to the server for analysis.
 * - Updates the progress status during the analysis process.
 * - Displays the analysis results or error feedback.
 */


const handleAnalyze = async () => {
  if (!file) return;

  setIsLoading(true);
  setIsProgressModalOpen(true);
  setProcessedProducts(0);
  setProgressStatus('analyzing');
  setIsCheckSelectorModalOpen(false);
  resetAnalysisStates();
  setAnalysisMode('quality');

  try {
    const response = await fetch(`${environment.api.baseUrl}/api/analyze`, {
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



/**
 * Initiates the search terms analysis process.
 * - Sends the selected file to the server for search terms analysis.
 * - Tracks and updates progress for attributes and descriptions separately.
 * 
 */


const handleSearchTermsClick = async () => {
  if (!file) return;

  setIsLoading(true);
  setIsProgressModalOpen(true);
  resetAnalysisStates();
  setAnalysisMode('search');
  setProgressStatus('analyzing');
  setProgressState({
    stage: 'attribute',
    progress: 0
  });


  let accumulatedResults: SearchTerm[] = [];

  try {
    const response = await fetch(`${environment.api.baseUrl}/api/search-terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: file.name }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
          const data: ProgressUpdate = JSON.parse(line.slice(6));
          
          switch (data.status) {
            case 'analyzing':
              if (data.stage === 'attribute') {
                setProgressState({
                  stage: 'attribute',
                  progress: 0
                });
              } else if (data.stage === 'description') {
                // Calculate progress from the batch information
                const progress = data.progress || ((data.current || 0) / (data.total || 1)) * 100;
                setProgressState({
                  stage: 'description',
                  progress: progress
                });
              }
              break;
  
            case 'chunking':
              setProgressState({
                stage: 'synonyms',
                progress: 0
              });
              break;
  
            case 'chunk':
              if (data.chunk && Array.isArray(data.chunk)) {
                accumulatedResults = [...accumulatedResults, ...data.chunk];
                setSearchTermsResults([...accumulatedResults]);
                // Update synonym progress if available
                if (data.progress) {
                  setProgressState({
                    stage: 'synonyms',
                    progress: data.progress
                  });
                }
              }
              break;

            case 'complete':
              setSearchTermsResults(accumulatedResults);
              setUploadStatus({
                type: 'success',
                message: `Analysis complete: ${accumulatedResults.length} search terms found`
              });
              break;

            case 'error':
              throw new Error(data.error || 'Unknown error during analysis');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing search terms:', error);
    setUploadStatus({
      type: 'error',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  } finally {
    setIsLoading(false);
    setIsProgressModalOpen(false);
  }
};

/**
 * Updates the selected checks for feed quality analysis.
 * - Updates the `selectedChecks` state with the user-selected checks.
 * @param checks - Array of selected check IDs.
 */

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
        {analysisMode === 'search' && searchTermsResults ? (
          <SearchTermsResults
            results={searchTermsResults}
            fileName={file?.name || ''}
            useSearchVolumes={useSearchVolumes}
          />
        ) : analysisMode === 'quality' && analysisResults ? (
          <AnalysisResults
            results={analysisResults}
            fileName={file?.name || ''}
            isLoading={isLoading}
          />
        ) : null}
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelect={handleFileSelect}
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
  analysisType={analysisMode === 'search' ? 'search' : 'feed'}
  currentStage={progressState.stage}
  progress={progressState.progress}
/>

    </div>
  );
}