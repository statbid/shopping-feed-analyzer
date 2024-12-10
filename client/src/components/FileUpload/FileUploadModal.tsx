/**
 * FileUploadModal Component
 *
 * This component provides a modal for uploading files to the application.
 * It supports drag-and-drop functionality and allows users to select files
 * via an input button. The component also includes file validation for type
 * and size restrictions.
 *
 * Props:
 * - `isOpen`: A boolean indicating whether the modal is open.
 * - `onClose`: A callback function triggered when the modal is closed.
 * - `onFileSelect`: A callback function triggered when a valid file is selected.
 *
 * Features:
 * - **Drag-and-Drop:** Users can drag and drop files into the drop zone.
 * - **File Input:** Provides an input for manual file selection.
 * - **File Validation:**
 *   - Allowed types: CSV, TSV, ZIP.
 *   - Maximum file size: 500MB.
 *   - Displays error messages for invalid files.
 * - **Error Handling:** Displays error messages for unsupported formats or oversized files.
 * - **Accessibility:**
 *   - Click-to-close on the backdrop area.
 *   - Keyboard navigation and focus management are handled implicitly.
 *
 * Styling:
 * - Tailwind CSS is used for responsive and modern styling.
 * - The modal adapts to different screen sizes with a max width of 90% of the viewport.
 * - Dynamic styles (e.g., border color) are applied during drag-and-drop actions.
 *
 * Icons:
 * - Uses Lucide icons for visual indicators (Upload, Drag State).
 */

import React, { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Validates the uploaded file based on its type and size.
     * @param file - The file to validate.
     * @returns {boolean} Whether the file is valid.
     */
    const validateFile = (file: File): boolean => {
        const allowedTypes = new Set(['text/csv', 'text/tab-separated-values', 'application/zip']);
        const allowedExtensions = new Set(['csv', 'tsv', 'zip']);
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const maxSize = 500 * 1024 * 1024; // 500MB

        if (!fileExtension || !allowedExtensions.has(fileExtension)) {
            setError('Please upload a CSV, TSV, or ZIP file');
            return false;
        }

        if (file.size > maxSize) {
            setError('File size must be less than 500MB');
            return false;
        }

        setError(null);
        return true;
    };

    /**
     * Handles the file selection from either drag-and-drop or input field.
     * @param file - The selected file.
     */
    const handleFileSelect = (file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    };

    /**
     * Handles drag-and-drop events, including drag enter, leave, and drop.
     */
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFileSelect(files[0]);
        }
    };

    /**
     * Handles file input changes from the file selector input field.
     */
    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    /**
     * Closes the modal when the backdrop is clicked.
     */
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    /**
     * Resets error messages when the modal is opened or closed.
     */
    useEffect(() => {
        setError(null);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white p-8 rounded-xl w-[600px] max-w-[90vw]">
                <h2 className="text-2xl font-bold mb-6 text-navigationBar">Upload File</h2>
                <div 
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors min-h-[300px] flex flex-col justify-center ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <Upload className={`mx-auto h-16 w-16 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                        type="file"
                        accept=".csv,.tsv,.zip"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label 
                        htmlFor="file-upload" 
                        className="cursor-pointer text-blue-600 hover:text-blue-800 text-lg font-semibold"
                    >
                        Click to upload
                    </label>
                    <p className="text-base text-gray-500 mt-2">or drag and drop</p>
                    <p className="text-sm text-gray-400 mt-4">Supported formats: CSV, TSV, ZIP</p>
                    {error && (
                        <p className="mt-4 text-red-500 text-sm">{error}</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;
