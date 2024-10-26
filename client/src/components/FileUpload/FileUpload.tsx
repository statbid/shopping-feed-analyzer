import React, { useState, useEffect } from 'react';
import AnalyzerHeader from './AnalyzerHeader';
import FileUploadModal from './FileUploadModal';
import AnalysisResults from './AnalysisResults';
import ProgressModal from './ProgressModal';
import Toast from './Toast';

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
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [processedProducts, setProcessedProducts] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && (
      selectedFile.type === 'text/csv' || 
      selectedFile.name.endsWith('.tsv') || 
      selectedFile.type === 'text/tab-separated-values'
    )) {
      setFile(selectedFile);
      setUploadStatus({ 
        type: 'success', 
        message: `${selectedFile.name.split('.').pop()?.toUpperCase()} file selected successfully!` 
      });
      setIsModalOpen(false);
    } else {
      setFile(null);
      setUploadStatus({ type: 'error', message: 'Please select a valid CSV or TSV file.' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProcessedProducts(0);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        body: formData,
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
              console.log('Received data:', data);
  
              if (data.error) {
                console.error('Server error:', data.error, data.details);
                setUploadStatus({ type: 'error', message: `Error analyzing file: ${data.details || data.error}` });
                return;
              }
  
              if (data.processed) {
                setProcessedProducts(data.processed);
              }
              if (data.completed) {
                setAnalysisResults(data.results);
                setUploadStatus({ type: 'success', message: 'File analyzed successfully!' });
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
              setUploadStatus({ type: 'error', message: 'Error parsing server response' });
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
      setUploadStatus({ type: 'error', message: `Error analyzing file: ${errorMessage}` });
    } finally {
      setIsLoading(false);
      setIsProgressModalOpen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <AnalyzerHeader 
        file={file}
        onUploadClick={() => setIsModalOpen(true)}
        onAnalyzeClick={handleUpload}
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

      {analysisResults && (
        <div className="mt-6 flex-grow overflow-hidden">
          <AnalysisResults 
            results={analysisResults}
            fileName={file?.name || ''}
            isLoading={isLoading}
          />
        </div>
      )}

      <FileUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onFileSelect={handleFileSelect} 
      />

      <ProgressModal 
        isOpen={isProgressModalOpen}
        processedProducts={processedProducts}
      />
    </div>
  );
}