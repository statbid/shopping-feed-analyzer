/**
 * **Server Initialization and API Routes**
 *
 * This script defines the main Express server for the application, including:
 * - **Setup:** Middleware for handling JSON requests, CORS, and large payloads.
 * - **File Uploads:** Handles uploaded files and ensures clean directory management.
 * - **Feed Analysis:** Provides endpoints to analyze product feed files, extract search terms, and perform quality checks.
 * - **Google Ads API Integration:** Handles requests for search volume data and keyword suggestions using the Google Ads API.
 * - **Quota Management:** Exposes quota usage and ensures API request limits are respected.
 *
 * **Key Features:**
 * - **File Handling and Analysis:**
 *   - `POST /api/upload`: Processes and stores uploaded files (ZIP, CSV, or TSV).
 *   - `POST /api/analyze`: Streams and analyzes product feed files for errors and inconsistencies.
 *   - `POST /api/search-terms`: Extracts search terms from product feed files with progress tracking.
 * - **Google Ads API Support:**
 *   - `POST /api/search-volumes`: Fetches search volume metrics for a list of search terms.
 *   - `POST /api/keyword-suggestions`: Retrieves related keyword suggestions for a given keyword.
 * - **Quota Status:**
 *   - `GET /api/quota-status`: Retrieves current quota usage and available limits.
 * - **Streaming Responses:** Uses Server-Sent Events (SSE) to provide real-time updates for long-running tasks.
 *
 * **Usage Notes:**
 * - The server automatically cleans up the uploads directory on startup to prevent stale files.
 * - JSON payload size and URL encoding limits are configured to handle large datasets.
 * - The Google Ads API integration requires valid credentials and adheres to usage limits managed by the `QuotaService`.
 * - Progress updates are streamed to the client during file analysis and search term extraction, ensuring responsive feedback.
 *
 * **Environment Variables:**
 * - `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`: Google Ads API credentials.
 * - `GOOGLE_ADS_REFRESH_TOKEN`: Token for Google Ads API access.
 * - `GOOGLE_ADS_CUSTOMER_ACCOUNT_ID`: Customer account identifier for API requests.
 * - `GOOGLE_ADS_DAILY_QUOTA`: Daily quota limit for API requests (default: 15,000).
 * - `SERVER_PORT`: Port on which the server listens (default: 3001).
 * - `UPLOADS_DIR`: Directory for handling file uploads.
 *
 * **Dependencies:**
 * - `express`: HTTP server framework.
 * - `multer`: Middleware for handling multipart/form-data for file uploads.
 * - `fs`, `path`: File system utilities for directory and file management.
 * - `csv-parse`: Parser for processing CSV and TSV files.
 * - `GoogleAdsService`, `QuotaService`: Custom services for Google Ads API integration and quota management.
 * - `FeedAnalyzer`, `SearchTermsAnalyzer`: Core modules for feed quality checks and search term analysis.
 */



import express from 'express';
import cors from 'cors';
import multer from 'multer';
import './worker';
import fs from 'fs';
import { FeedItem, KeywordMetrics } from '@shopping-feed/types';
import { parse } from 'csv-parse';
import { FeedAnalyzer } from './FeedAnalyzer';
import { SearchTermsAnalyzer } from './searchTerms/SearchTermsAnalyzer';
import { FileHandler } from './utils/FileHandler';
import environment from './config/environment';
import { GoogleAdsService } from './services/GoogleAdsService'
import { QuotaService } from './services/QuotaService';

const CHUNK_SIZE = 5000; 
const app = express();
const port = environment.server.port;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use(express.json());

FileHandler.cleanupUploadsDirectory();

const upload = multer({ dest: 'uploads/' });

const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
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
    const result = await FileHandler.handleUploadedFile(req.file);
    
    res.json({ 
      success: true, 
      message: 'File processed successfully',
      filePath: result.filePath,
      fileName: result.originalName // Send back the original file name
    });
  } catch (error: unknown) {
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

  const filePath = FileHandler.getProcessedFilePath(fileName);
  console.log('Retrieved file path:', filePath);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendUpdate = (data: any) => {
    res.write(`data: ${safeStringify(data)}\n\n`);
  };

  try {
    console.log('Starting analysis for file:', fileName, 'at path:', filePath);
    const fileStream = fs.createReadStream(filePath);
    const analyzer = new FeedAnalyzer();

    const results = await analyzer.analyzeStream(fileStream, (processed: number) => {
      sendUpdate({ processed });
    }, enabledChecks); // Pass enabledChecks here

    sendUpdate({ results, completed: true });
    res.end();
  } catch (error: unknown) {
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
  const { searchTerms, useSearchVolumes } = req.body;
  
  if (!Array.isArray(searchTerms)) {
    return res.status(400).json({ error: 'searchTerms must be an array' });
  }
  if (!useSearchVolumes) {
    return res.json({
      metrics: {},
      stats: {
        requested: searchTerms.length,
        processed: 0,
        found: 0,
        errorBatches: 0,
        reason: 'feature_disabled'
      }
    });
  }

  try {
    const service = new GoogleAdsService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID!
    });

    const batches = service.batchKeywords(searchTerms);
    const metrics = new Map<string, KeywordMetrics>();
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const batchResults = await service.getSearchVolumes(batch);
        for (const [term, result] of batchResults.entries()) {
          if (result.status === 'success' && result.metrics) {
            metrics.set(term, result.metrics);
          }
        }
        processedCount += batch.length;
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        errorCount++;
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
  } catch (error) {
    console.error('Error fetching search volumes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch search volumes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});






app.post('/api/keyword-suggestions', async (req, res) => {
  const { keyword } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const service = new GoogleAdsService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID!
    });

    // Get related keywords using the GoogleAdsService
    const suggestions = await service.getKeywordSuggestions(keyword);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting keyword suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch keyword suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

















app.post('/api/search-terms', async (req, res) => {
  const { fileName } = req.body;
  const filePath = FileHandler.getProcessedFilePath(fileName);

  if (!filePath) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendUpdate = (data: any) => {
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
      } else if (data.status === 'analyzing') {
        // Forward progress updates
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.error('Error sending update:', error);
      res.write(`data: ${JSON.stringify({
        status: 'error',
        error: 'Error sending data',
      })}\n\n`);
    }
  };

  try {
    const items: FeedItem[] = [];
    
    // First phase: Read the file
    const parser = parse({
      columns: true,
      delimiter: '\t',
      skip_empty_lines: true,
    });

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parser)
        .on('data', (item: FeedItem) => {
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
 
    const analyzer = new SearchTermsAnalyzer((stage: 'attribute' | 'description', current: number, total: number) => {
      const progress = (current / total) * 100;
      sendUpdate({
        status: 'analyzing',
        stage: stage,
        progress: progress,
        current: current,
        total: total
      });
    });
    const searchTerms = await analyzer.analyzeSearchTerms(items);

    // Send final results
    sendUpdate({ results: searchTerms });

    res.end();
  } catch (error) {
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
  const quotaService = QuotaService.getInstance();
  const status = quotaService.getStatus();
  const limit = Number(process.env.GOOGLE_ADS_DAILY_QUOTA) || 15000;
  
  res.json({
    ...status,
    limit
  });
});


