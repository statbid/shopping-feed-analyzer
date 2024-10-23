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
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        console.log('Starting analysis for file:', req.file.originalname);
        const fileStream = fs_1.default.createReadStream(req.file.path);
        const analyzer = new FeedAnalyzer_1.FeedAnalyzer();
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        const sendUpdate = (data) => {
            console.log('Sending update:', data);
            res.write(`data: ${safeStringify(data)}\n\n`);
        };
        // Analyze the stream and send progress updates
        const results = await analyzer.analyzeStream(fileStream, (processed) => {
            console.log(`Progress: ${processed} SKUs processed`);
            sendUpdate({ processed });
        });
        // Send final results
        // console.log('Analysis complete, sending final results');
        sendUpdate({ results, completed: true });
        res.end();
    }
    catch (error) {
        console.error('Error analyzing file:', error);
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.write(`data: ${safeStringify({ error: 'Error analyzing file', details: errorMessage })}\n\n`);
        res.end();
    }
    finally {
        // Clean up uploaded file
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
            console.log('Cleaned up uploaded file:', req.file.path);
        }
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
