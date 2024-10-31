"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const environment_1 = __importDefault(require("../config/environment"));
class FileHandler {
    static cleanupUploadsDirectory() {
        const uploadsPath = FileHandler.UPLOADS_DIR;
        if (!fs_1.default.existsSync(uploadsPath)) {
            fs_1.default.mkdirSync(uploadsPath, { recursive: true });
            return;
        }
        try {
            const files = fs_1.default.readdirSync(uploadsPath);
            for (const file of files) {
                const filePath = path_1.default.join(uploadsPath, file);
                try {
                    fs_1.default.unlinkSync(filePath);
                    console.log(`Cleaned up file: ${filePath}`);
                }
                catch (error) {
                    console.error(`Error deleting file ${filePath}:`, error);
                }
            }
            FileHandler.fileRegistry.clear();
            console.log('Upload directory cleaned');
        }
        catch (error) {
            console.error('Error cleaning upload directory:', error);
        }
    }
    static sanitizeFileName(fileName) {
        return fileName
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .replace(/\.\./g, '_')
            .replace(/[^\x00-\x7F]/g, '');
    }
    static getProcessedFilePath(originalFileName) {
        return FileHandler.fileRegistry.get(originalFileName);
    }
    static async handleUploadedFile(file) {
        try {
            if (!fs_1.default.existsSync(FileHandler.UPLOADS_DIR)) {
                fs_1.default.mkdirSync(FileHandler.UPLOADS_DIR, { recursive: true });
            }
            const fileExt = path_1.default.extname(file.originalname).toLowerCase();
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
        }
        catch (error) {
            FileHandler.cleanupFile(file.path);
            throw error;
        }
    }
    static async handleZipFile(file) {
        try {
            const zip = new adm_zip_1.default(file.path);
            const zipEntries = zip.getEntries();
            const targetEntry = zipEntries.find(entry => {
                const ext = path_1.default.extname(entry.name).toLowerCase();
                return FileHandler.ALLOWED_EXTENSIONS.has(ext);
            });
            if (!targetEntry) {
                throw new Error('No CSV or TSV file found in the ZIP archive');
            }
            const timestamp = Date.now();
            const sanitizedBaseName = this.sanitizeFileName(path_1.default.parse(targetEntry.entryName).name);
            const fileExtension = path_1.default.extname(targetEntry.entryName).toLowerCase();
            const extractedFileName = `${sanitizedBaseName}_${timestamp}${fileExtension}`;
            const extractedFilePath = path_1.default.join(this.UPLOADS_DIR, extractedFileName);
            const content = zip.readFile(targetEntry);
            if (!content) {
                throw new Error('Failed to read file content from ZIP');
            }
            // Write the file directly
            fs_1.default.writeFileSync(extractedFilePath, content);
            // Clean up the ZIP file
            FileHandler.cleanupFile(file.path);
            return {
                filePath: extractedFilePath,
                fileName: extractedFileName,
                originalName: file.originalname
            };
        }
        catch (error) {
            const files = fs_1.default.readdirSync(this.UPLOADS_DIR);
            files.forEach(file => {
                if (file.includes('_' + Date.now())) {
                    FileHandler.cleanupFile(path_1.default.join(this.UPLOADS_DIR, file));
                }
            });
            throw new Error(`Error extracting ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static cleanupFile(filePath) {
        if (filePath && fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
                // Remove from registry if exists
                for (const [key, value] of FileHandler.fileRegistry.entries()) {
                    if (value === filePath) {
                        FileHandler.fileRegistry.delete(key);
                    }
                }
            }
            catch (error) {
                console.error('Error cleaning up file:', error);
            }
        }
    }
}
exports.FileHandler = FileHandler;
FileHandler.ALLOWED_EXTENSIONS = new Set(['.csv', '.tsv', '.zip']);
FileHandler.UPLOADS_DIR = environment_1.default.storage.uploadsDir;
FileHandler.fileRegistry = new Map();
