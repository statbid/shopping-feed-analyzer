import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Eye, Download } from 'lucide-react';

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

const CustomProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div 
      className="bg-blue-600 h-2.5 rounded-full" 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
    const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const resultsRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (uploadStatus.type === 'success') {
        timer = setTimeout(() => {
          setUploadStatus({ type: '', message: '' });
        }, 2000);
      }
      return () => clearTimeout(timer);
    }, [uploadStatus]);

    useEffect(() => {
      if (analysisResults && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [analysisResults]);

    const handleFileChange = (selectedFile: File | null) => {
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
      } else {
        setFile(null);
        setUploadStatus({ type: 'error', message: 'Please select a valid CSV or TSV file.' });
      }
    };
  
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] || null;
      handleFileChange(selectedFile);
    };
  
    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    };
  
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
  
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      
      const droppedFile = event.dataTransfer.files[0];
      handleFileChange(droppedFile);
    };
  
    const handleUpload = async () => {
      if (!file) return;

      setIsLoading(true);
      setProgress(0);
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

        const data = await response.json();
        setAnalysisResults(data);
        setUploadStatus({ 
          type: 'success', 
          message: 'File analyzed successfully!' 
        });
      } catch (error) {
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
        setProgress(100);
      }
    };

    const handleViewDetails = (errorType: string) => {
      setSelectedErrorType(errorType);
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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Google Shopping Feed Analyzer</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload CSV/TSV Feed File</label>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <input
              type="file"
              accept=".csv,.tsv"
              onChange={handleInputChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Click to upload
            </label>
            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            {file && <p className="mt-2 text-sm">{file.name}</p>}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>

        {isLoading && (
          <div className="mt-4">
            <CustomProgressBar progress={progress} />
          </div>
        )}

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
          <div className="mt-6" ref={resultsRef}>
            <h2 className="text-lg font-semibold mb-2">
              Analysis Results of "{file?.name}"
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p><strong>Total Products:</strong> {analysisResults.totalProducts}</p>
            </div>
            
            <h3 className="text-md font-semibold mb-2">Error Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysisResults.errorCounts).map(([errorType, count]) => (
                <div key={errorType} className="bg-red-50 p-4 rounded-lg">
                  <p className="font-medium text-red-700">{errorType}</p>
                  <p className="text-red-600">Count: {count}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(errorType)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleDownloadDetails(errorType)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedErrorType && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Detailed Errors: {selectedErrorType}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Product ID</th>
                        <th className="px-4 py-2 border">Details</th>
                        <th className="px-4 py-2 border">Affected Field</th>
                        <th className="px-4 py-2 border">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.errors
                        .filter(error => error.errorType === selectedErrorType)
                        .map((error, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 border">{error.id}</td>
                            <td className="px-4 py-2 border">{error.details}</td>
                            <td className="px-4 py-2 border">{error.affectedField}</td>
                            <td className="px-4 py-2 border">{error.value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
}