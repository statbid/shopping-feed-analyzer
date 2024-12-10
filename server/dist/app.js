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
const csv_parse_1 = require("csv-parse");
const FeedAnalyzer_1 = require("./FeedAnalyzer");
const SearchTermsAnalyzer_1 = require("./searchTerms/SearchTermsAnalyzer");
const FileHandler_1 = require("./utils/FileHandler");
const environment_1 = __importDefault(require("./config/environment"));
const GoogleAdsService_1 = require("./services/GoogleAdsService");
const QuotaService_1 = require("./services/QuotaService");
const CHUNK_SIZE = 5000;
const app = (0, express_1.default)();
const port = environment_1.default.server.port;
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
FileHandler_1.FileHandler.cleanupUploadsDirectory();
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
    const { fileName, enabledChecks } = req.body;
    console.log('Analyze request received for file:', fileName, 'with checks:', enabledChecks);
    if (!fileName) {
        return res.status(400).json({ error: 'No file name provided' });
    }
    const filePath = FileHandler_1.FileHandler.getProcessedFilePath(fileName);
    console.log('Retrieved file path:', filePath);
    if (!filePath || !fs_1.default.existsSync(filePath)) {
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
        }, enabledChecks); // Pass enabledChecks here
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
app.post('/api/search-volumes', async (req, res) => {
    const { searchTerms } = req.body;
    if (!Array.isArray(searchTerms)) {
        return res.status(400).json({
            error: 'searchTerms must be an array'
        });
    }
    try {
        console.log(`Processing ${searchTerms.length} search terms`);
        const service = new GoogleAdsService_1.GoogleAdsService({
            clientId: process.env.GOOGLE_ADS_CLIENT_ID,
            clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
            refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
            customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID
        });
        // Process in batches of 20 terms
        const batches = service.batchKeywords(searchTerms);
        const metrics = new Map();
        let processedCount = 0;
        let errorCount = 0;
        console.log(`Split into ${batches.length} batches of max 20 keywords each`);
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`Processing batch ${i + 1} of ${batches.length} (${batch.length} keywords)`);
            try {
                // Add delay between batches to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                const batchMetrics = await service.getSearchVolumes(batch);
                for (const [term, keywordMetrics] of batchMetrics.entries()) {
                    metrics.set(term, keywordMetrics);
                }
                processedCount += batch.length;
                console.log(`Completed batch ${i + 1}, processed ${processedCount}/${searchTerms.length} terms`);
            }
            catch (error) {
                console.error(`Error processing batch ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error');
                errorCount++;
                // Continue with next batch
            }
        }
        res.json({
            metrics: Object.fromEntries(metrics),
            stats: {
                requested: searchTerms.length,
                processed: processedCount,
                found: metrics.size,
                errorBatches: errorCount
            }
        });
    }
    catch (error) {
        console.error('Error fetching search volumes:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            error: 'Failed to fetch search volumes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/api/search-terms', async (req, res) => {
    const { fileName } = req.body;
    const filePath = FileHandler_1.FileHandler.getProcessedFilePath(fileName);
    if (!filePath) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    const sendUpdate = (data) => {
        try {
            if (data.results && Array.isArray(data.results)) {
                // Split results into larger chunks to reduce overhead
                const CHUNK_SIZE = 10000; // Increased chunk size
                const chunks = [];
                for (let i = 0; i < data.results.length; i += CHUNK_SIZE) {
                    chunks.push(data.results.slice(i, i + CHUNK_SIZE));
                }
                // Send initial chunk info
                res.write(`data: ${JSON.stringify({
                    status: 'chunking',
                    totalChunks: chunks.length,
                    totalTerms: data.results.length,
                })}\n\n`);
                // Send chunks sequentially with minimal delay
                chunks.forEach((chunk, index) => {
                    res.write(`data: ${JSON.stringify({
                        status: 'chunk',
                        chunkIndex: index,
                        chunk: chunk,
                        progress: Math.round(((index + 1) / chunks.length) * 100),
                    })}\n\n`);
                });
                // Send completion after all chunks
                res.write(`data: ${JSON.stringify({
                    status: 'complete',
                    totalTerms: data.results.length,
                })}\n\n`);
            }
            else if (data.status === 'analyzing') {
                // Forward progress updates
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            }
        }
        catch (error) {
            console.error('Error sending update:', error);
            res.write(`data: ${JSON.stringify({
                status: 'error',
                error: 'Error sending data',
            })}\n\n`);
        }
    };
    try {
        const items = [];
        // First phase: Read the file
        const parser = (0, csv_parse_1.parse)({
            columns: true,
            delimiter: '\t',
            skip_empty_lines: true,
        });
        await new Promise((resolve, reject) => {
            fs_1.default.createReadStream(filePath)
                .pipe(parser)
                .on('data', (item) => {
                items.push(item);
                if (items.length % 1000 === 0) {
                    sendUpdate({
                        status: 'analyzing',
                        phase: 'reading',
                        processed: items.length,
                        message: `Reading feed data: ${items.length} items processed`,
                    });
                }
            })
                .on('end', resolve)
                .on('error', reject);
        });
        // Second phase: Analyze search terms
        const analyzer = new SearchTermsAnalyzer_1.SearchTermsAnalyzer((stage, progress) => {
            sendUpdate({
                status: 'analyzing',
                stage: stage,
                progress: progress,
            });
        });
        const searchTerms = await analyzer.analyzeSearchTerms(items);
        // Send final results
        sendUpdate({ results: searchTerms });
        res.end();
    }
    catch (error) {
        console.error('Error analyzing search terms:', error);
        res.write(`data: ${JSON.stringify({
            status: 'error',
            error: 'Error analyzing search terms',
            details: error instanceof Error ? error.message : 'Unknown error',
        })}\n\n`);
        res.end();
    }
});
app.get('/api/quota-status', (req, res) => {
    const quotaService = QuotaService_1.QuotaService.getInstance();
    const status = quotaService.getStatus();
    const limit = Number(process.env.GOOGLE_ADS_DAILY_QUOTA) || 15000;
    res.json({
        ...status,
        limit
    });
});
app.get('/quota-status', (req, res) => {
    const quotaService = QuotaService_1.QuotaService.getInstance();
    const status = quotaService.getStatus();
    res.json({
        ...status,
        limit: process.env.GOOGLE_ADS_DAILY_QUOTA || 15000
    });
});
