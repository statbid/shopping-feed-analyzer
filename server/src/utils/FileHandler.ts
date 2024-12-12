/**
 * FileHandler Utility for File Uploads and Processing
 *
 * This module provides functionality to handle uploaded files, specifically for the use case of 
 * validating, extracting, and managing file uploads in a structured and secure manner. It supports 
 * CSV, TSV, and ZIP files and includes mechanisms for sanitization, cleanup, and directory management.
 *
 * **Key Features:**
 * - **Allowed File Types**: Supports `.csv`, `.tsv`, and `.zip` file extensions.
 * - **Uploads Directory Management**:
 *   - Ensures the uploads directory exists.
 *   - Cleans up uploaded files and maintains a registry of processed files.
 * - **File Sanitization**: Ensures uploaded file names are safe for use in the file system by replacing 
 *   or removing invalid characters.
 * - **ZIP File Extraction**:
 *   - Extracts and processes the first valid CSV/TSV file found in a ZIP archive.
 *   - Automatically cleans up the original ZIP file after extraction.
 * - **Error Handling**:
 *   - Handles unsupported file types and invalid ZIP files gracefully.
 *   - Logs and manages errors during file operations.
 * - **File Registry**: Tracks original and processed file paths for retrieval during analysis.
 *
 * **Methods:**
 * - `cleanupUploadsDirectory`: Cleans up the uploads directory by removing all files and clearing the registry.
 * - `sanitizeFileName`: Returns a sanitized version of the provided file name, replacing invalid characters.
 * - `getProcessedFilePath`: Retrieves the path of a previously processed file using its original file name.
 * - `handleUploadedFile`: Processes an uploaded file based on its extension and extracts content if it's a ZIP file.
 * - `handleZipFile`: Extracts the first valid CSV/TSV file from a ZIP archive.
 * - `cleanupFile`: Removes a file from the file system and the internal registry.
 *
 * **Usage Scenarios:**
 * - Handling and validating file uploads in a web application.
 * - Extracting and processing product feed data from user-uploaded files.
 * - Cleaning up outdated or unnecessary files in the uploads directory.
 */


import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import environment from '../config/environment';


interface FileHandlerResult {
  filePath: string;
  fileName: string;
  originalName: string;
  error?: string;
}

export class FileHandler {
  private static readonly ALLOWED_EXTENSIONS = new Set(['.csv', '.tsv', '.zip']);
  private static readonly UPLOADS_DIR = environment.storage.uploadsDir;
  private static fileRegistry = new Map<string, string>();

  
  public static cleanupUploadsDirectory(): void {
    const uploadsPath = FileHandler.UPLOADS_DIR;
    
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      return;
    }

    try {
      const files = fs.readdirSync(uploadsPath);
      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up file: ${filePath}`);
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      }
      FileHandler.fileRegistry.clear();
      console.log('Upload directory cleaned');
    } catch (error) {
      console.error('Error cleaning upload directory:', error);
    }
  }

  private static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/\.\./g, '_')
      .replace(/[^\x00-\x7F]/g, '');
  }

  static getProcessedFilePath(originalFileName: string): string | undefined {
    return FileHandler.fileRegistry.get(originalFileName);
  }

  static async handleUploadedFile(file: Express.Multer.File): Promise<FileHandlerResult> {
    try {
      if (!fs.existsSync(FileHandler.UPLOADS_DIR)) {
        fs.mkdirSync(FileHandler.UPLOADS_DIR, { recursive: true });
      }

      const fileExt = path.extname(file.originalname).toLowerCase();

          if (fileExt === '.zip') {
        const result = await FileHandler.handleZipFile(file);
        FileHandler.fileRegistry.set(file.originalname, result.filePath);
        return result;
      }

      if (FileHandler.ALLOWED_EXTENSIONS.has(fileExt)) {
        FileHandler.fileRegistry.set(file.originalname, file.path);
        return {
          filePath: file.path,
          fileName: file.originalname,
          originalName: file.originalname
        };
      }

      FileHandler.cleanupFile(file.path);
      throw new Error('Unsupported file type. Please upload a ZIP, CSV, or TSV file.');
    } catch (error) {
      FileHandler.cleanupFile(file.path);
      throw error;
    }
  }

  private static async handleZipFile(file: Express.Multer.File): Promise<FileHandlerResult> {
    try {
      const zip = new AdmZip(file.path);
      const zipEntries = zip.getEntries();

      const targetEntry = zipEntries.find(entry => {
        const ext = path.extname(entry.name).toLowerCase();
        return FileHandler.ALLOWED_EXTENSIONS.has(ext);
      });

      if (!targetEntry) {
        throw new Error('No CSV or TSV file found in the ZIP archive');
      }

      const timestamp = Date.now();
      const sanitizedBaseName = this.sanitizeFileName(path.parse(targetEntry.entryName).name);
      const fileExtension = path.extname(targetEntry.entryName).toLowerCase();
      const extractedFileName = `${sanitizedBaseName}_${timestamp}${fileExtension}`;
      const extractedFilePath = path.join(this.UPLOADS_DIR, extractedFileName);

      const content = zip.readFile(targetEntry);
      if (!content) {
        throw new Error('Failed to read file content from ZIP');
      }

      // Write the file directly
      fs.writeFileSync(extractedFilePath, content);

      // Clean up the ZIP file
      FileHandler.cleanupFile(file.path);

      return {
        filePath: extractedFilePath,
        fileName: extractedFileName,
        originalName: file.originalname
      };
    } catch (error) {
      const files = fs.readdirSync(this.UPLOADS_DIR);
      files.forEach(file => {
        if (file.includes('_' + Date.now())) {
          FileHandler.cleanupFile(path.join(this.UPLOADS_DIR, file));
        }
      });

      throw new Error(`Error extracting ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static cleanupFile(filePath: string): void {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        // Remove from registry if exists
        for (const [key, value] of FileHandler.fileRegistry.entries()) {
          if (value === filePath) {
            FileHandler.fileRegistry.delete(key);
          }
        }
      } catch (error) {
        console.error('Error cleaning up file:', error);
      }
    }
  }
}