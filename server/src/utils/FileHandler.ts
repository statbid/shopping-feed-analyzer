import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

interface FileHandlerResult {
  filePath: string;
  fileName: string;
  originalName: string;
  error?: string;
}

export class FileHandler {
  private static readonly ALLOWED_EXTENSIONS = new Set(['.csv', '.tsv']);
  private static readonly UPLOADS_DIR = 'uploads';
  private static fileRegistry = new Map<string, string>();  // Map original file names to processed paths

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
        // For non-ZIP files, store the mapping and return
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