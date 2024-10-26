"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
require("./worker");
const fs_1 = __importDefault(require("fs"));
const FeedAnalyzer_1 = require("./FeedAnalyzer");
const FileHandler_1 = require("./utils/FileHandler");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj);
    }
    catch (error) {
        console.error('Error stringifying object:', error);
        return JSON.stringify({ error: 'Error stringifying response' });
    }
};
// In app.ts
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        console.log('Processing uploaded file:', req.file.originalname);
        const result = await FileHandler_1.FileHandler.handleUploadedFile(req.file);
        res.json({
            success: true,
            message: 'File processed successfully',
            filePath: result.filePath,
            fileName: result.originalName // Send back the original file name
        });
    }
    catch (error) {
        console.error('Error processing file:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({
            error: 'Error processing file',
            details: errorMessage
        });
    }
});
app.post('/api/analyze', async (req, res) => {
    const { fileName } = req.body;
    console.log('Analyze request received for file:', fileName); // Added logging
    if (!fileName) {
        console.log('No filename provided in request body:', req.body); // Added logging
        return res.status(400).json({ error: 'No file name provided' });
    }
    const filePath = FileHandler_1.FileHandler.getProcessedFilePath(fileName);
    console.log('Retrieved file path:', filePath); // Added logging
    if (!filePath || !fs_1.default.existsSync(filePath)) {
        console.log('File not found at path:', filePath); // Added logging
        return res.status(404).json({ error: 'File not found' });
    }
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    const sendUpdate = (data) => {
        res.write(`data: ${safeStringify(data)}\n\n`);
    };
    try {
        console.log('Starting analysis for file:', fileName, 'at path:', filePath);
        const fileStream = fs_1.default.createReadStream(filePath);
        const analyzer = new FeedAnalyzer_1.FeedAnalyzer();
        const results = await analyzer.analyzeStream(fileStream, (processed) => {
            sendUpdate({ processed });
        });
        sendUpdate({ results, completed: true });
        res.end();
    }
    catch (error) {
        console.error('Error analyzing file:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        sendUpdate({ error: 'Error analyzing file', details: errorMessage });
        res.end();
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
