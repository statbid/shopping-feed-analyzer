import React, { useState, useEffect } from 'react';
import AnalyzerHeader from './AnalyzerHeader';
import FileUploadModal from './FileUploadModal';
import AnalysisResults from './AnalysisResults';
import ProgressModal from './ProgressModal';

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
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (uploadStatus.type === 'success') {
      timer = setTimeout(() => {
        setUploadStatus({ type: '', message: '' });
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [uploadStatus]);

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

    // Reset progress and analysis state before starting a new analysis
    setIsLoading(true);
    setProgress(0);
    setAnalysisResults(null);
    setTotalProducts(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: AnalysisResults = await response.json();
      setAnalysisResults(data);
      setTotalProducts(data.totalProducts);
      setUploadStatus({ 
        type: 'success', 
        message: 'File analyzed successfully!' 
      });

      // Set progress to complete when analysis finishes
      setProgress(data.totalProducts);
    } catch (error: unknown) {
      let errorMessage = 'Error analyzing file. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    
      setUploadStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDetails = (errorType: string) => {
    if (!analysisResults) return;

    const errors = analysisResults.errors.filter(error => error.errorType === errorType);
    const csvContent = [
      ['Product ID', 'Error Type', 'Details', 'Affected Field', 'Value'],
      ...errors.map(error => [error.id, error.errorType, error.details, error.affectedField, error.value])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${errorType.replace(/\s+/g, '_')}_errors.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        setIsLoading={setIsLoading}
      />

      {isLoading && (
        <ProgressModal
          isOpen={isLoading}
          totalProducts={totalProducts}
          processedProducts={progress}
        />
      )}

      {uploadStatus.message && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-bold">
            {uploadStatus.type === 'error' ? 'Error' : 'Success'}
          </p>
          <p>{uploadStatus.message}</p>
        </div>
      )}

      {analysisResults && (
        <div className="mt-6 flex-grow overflow-hidden">
          <AnalysisResults 
            results={analysisResults}
            fileName={file?.name || ''}
            onDownloadDetails={handleDownloadDetails}
            isLoading={isLoading}
          />
        </div>
      )}

      <FileUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onFileSelect={handleFileSelect} 
      />
    </div>
  );
}
