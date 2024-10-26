"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipProcessor = void 0;
const fs_1 = require("fs");
const unzip_stream_1 = require("unzip-stream");
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const FeedAnalyzer_1 = require("../FeedAnalyzer");
class ZipProcessor {
    constructor() {
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads');
        this.initializeDir();
    }
    async initializeDir() {
        await (0, promises_1.mkdir)(this.uploadDir, { recursive: true });
    }
    sanitizeFileName(fileName) {
        return fileName.replace(/[:<>:"/\\|?*]/g, '_');
    }
    isFileSupported(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        return ['.csv', '.tsv'].includes(ext);
    }
    async processZipFile(zipPath, progressCallback) {
        const results = [];
        const extractDir = path_1.default.dirname(zipPath);
        try {
            console.log('Processing ZIP file:', zipPath);
            console.log('Extracting to:', extractDir);
            const extractedFiles = await this.extractFiles(zipPath, extractDir);
            console.log('Extracted files:', extractedFiles);
            const feedAnalyzer = new FeedAnalyzer_1.FeedAnalyzer();
            // Process each supported file
            for (const file of extractedFiles) {
                if (this.isFileSupported(file.path)) {
                    console.log('Processing file:', file.path);
                    try {
                        const fileStats = await (0, promises_1.stat)(file.path);
                        if (fileStats.size > 0) {
                            const fileStream = (0, fs_1.createReadStream)(file.path);
                            const result = await feedAnalyzer.analyzeStream(fileStream, (processed) => {
                                if (progressCallback) {
                                    progressCallback({ file: path_1.default.basename(file.path), processed });
                                }
                            });
                            results.push({
                                fileName: path_1.default.basename(file.path),
                                ...result
                            });
                            // Clean up the extracted file after processing
                            await (0, promises_1.rm)(file.path, { force: true });
                        }
                    }
                    catch (fileError) {
                        console.error(`Error processing file ${file.path}:`, fileError);
                    }
                }
            }
            if (results.length === 0) {
                throw new Error('No valid CSV or TSV files found in the ZIP archive');
            }
            return results;
        }
        catch (error) {
            console.error('Error processing ZIP file:', error);
            throw error;
        }
    }
    async extractFiles(zipPath, extractDir) {
        return new Promise((resolve, reject) => {
            const extractedFiles = [];
            (0, fs_1.createReadStream)(zipPath)
                .pipe((0, unzip_stream_1.Extract)({ path: extractDir }))
                .on('entry', async (entry) => {
                try {
                    if (entry.type === 'File') {
                        const sanitizedName = this.sanitizeFileName(entry.path);
                        const fullPath = path_1.default.join(extractDir, sanitizedName);
                        console.log('Extracting file:', fullPath);
                        // Create write stream for the file
                        const writeStream = (0, fs_1.createWriteStream)(fullPath);
                        entry.pipe(writeStream);
                        await new Promise((resolveWrite, rejectWrite) => {
                            writeStream.on('finish', resolveWrite);
                            writeStream.on('error', rejectWrite);
                        });
                        extractedFiles.push({ path: fullPath });
                    }
                    else {
                        entry.autodrain();
                    }
                }
                catch (err) {
                    console.error('Error processing entry:', err);
                    entry.autodrain();
                }
            })
                .on('error', (err) => {
                console.error('Extraction error:', err);
                reject(err);
            })
                .on('finish', () => {
                console.log('Extraction complete');
                resolve(extractedFiles);
            });
        });
    }
}
exports.ZipProcessor = ZipProcessor;
