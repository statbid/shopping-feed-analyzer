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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [processedProducts, setProcessedProducts] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);


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
  
    setIsLoading(true);
    setIsProgressModalOpen(true);
    setProcessedProducts(0);
    setTotalProducts(0);
  
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
              console.log('Received data:', data);  // Add this line for debugging
  
              if (data.error) {
                console.error('Server error:', data.error, data.details);
                setUploadStatus({ type: 'error', message: `Error analyzing file: ${data.details || data.error}` });
                return;
              }
  
              if (data.progress) {
                setProcessedProducts(data.progress);
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

  useEffect(() => {
    if (isLoading && analysisResults) {
      const interval = setInterval(() => {
        setProcessedProducts((prev) => {
          if (prev < analysisResults.totalProducts) {
            return prev + Math.ceil(analysisResults.totalProducts / 50);
          }
          clearInterval(interval);
          return analysisResults.totalProducts;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading, analysisResults]);

  return (
    <div className="w-full h-full flex flex-col">
      <AnalyzerHeader 
        file={file}
        onUploadClick={() => setIsModalOpen(true)}
        onAnalyzeClick={handleUpload}
        isAnalyzeDisabled={!file || isLoading}
        isLoading={isLoading}
      />

      {uploadStatus.message && (
        <div className={`p-4 mt-4 rounded ${
          uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
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

<ProgressModal 
        isOpen={isProgressModalOpen}
        totalProducts={totalProducts}
        processedProducts={processedProducts}
      />
    </div>
  );
}