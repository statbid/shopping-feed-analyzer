import express from 'express';
import cors from 'cors';
import multer from 'multer';
import './worker';
import fs from 'fs';
import { FeedItem } from './types';
import { parse } from 'csv-parse';
import { FeedAnalyzer } from './FeedAnalyzer';
import { SearchTermsAnalyzer } from './searchTerms/SearchTermsAnalyzer';
import { FileHandler } from './utils/FileHandler';
import environment from './config/environment';
import { GoogleAdsService } from './services/GoogleAdsService'

const app = express();
const port = environment.server.port;

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


/*
app.get('/api/debug-ads', async (req, res) => {
  console.log('=== Starting Google Ads Debug Test ===');

  try {
    // Log environment variables (masked)
    console.log('Environment check:', {
      hasClientId: !!process.env.GOOGLE_ADS_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_ADS_CLIENT_SECRET,
      hasDeveloperToken: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      hasRefreshToken: !!process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID
    });

    const service = new GoogleAdsService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID!
    });

    await service.testConnection();

    res.json({ 
      status: 'success',
      message: 'Debug test completed, check server logs for details'
    });
  } catch (error) {
    console.error('Debug test failed:', error);
    res.status(500).json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

*/

app.post('/api/search-volumes', async (req, res) => {
  const { searchTerms } = req.body;
  
  if (!Array.isArray(searchTerms)) {
    return res.status(400).json({ 
      error: 'searchTerms must be an array' 
    });
  }

  try {
    console.log(`Processing ${searchTerms.length} search terms`);

    const service = new GoogleAdsService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID!
    });

    // Process in batches of 20 terms
    const batches = service.batchKeywords(searchTerms);
    const volumes = new Map<string, number>();
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

        const batchVolumes = await service.getSearchVolumes(batch);
        for (const [term, volume] of batchVolumes.entries()) {
          volumes.set(term, volume);
        }
        processedCount += batch.length;
        
        console.log(`Completed batch ${i + 1}, processed ${processedCount}/${searchTerms.length} terms`);
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error');
        errorCount++;
        // Continue with next batch
      }
    }
    
    res.json({ 
      volumes: Object.fromEntries(volumes),
      stats: {
        requested: searchTerms.length,
        processed: processedCount,
        found: volumes.size,
        errorBatches: errorCount
      }
    });
  } catch (error) {
    console.error('Error fetching search volumes:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Failed to fetch search volumes',
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

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const items: FeedItem[] = [];
    let processedCount = 0;
    
    const parser = parse({
      columns: true,
      delimiter: '\t',
      skip_empty_lines: true
    });

    const fileStream = fs.createReadStream(filePath);
    
    await new Promise((resolve, reject) => {
      fileStream
        .pipe(parser)
        .on('data', (item: FeedItem) => {
          items.push(item);
          processedCount++;
          if (processedCount % 1000 === 0) {
            sendUpdate({ 
              status: 'processing', 
              processed: processedCount,
              message: 'Reading feed data...'
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    sendUpdate({ 
      status: 'analyzing', 
      processed: processedCount,
      message: 'Generating search terms...'
    });
    
    const analyzer = new SearchTermsAnalyzer();
    const searchTerms = await analyzer.analyzeSearchTerms(items);
    
    // Log the results for debugging
    console.log(`Generated search terms breakdown:
      Total terms: ${searchTerms.length}
      Attribute-based: ${searchTerms.filter(t => t.pattern.includes('Attribute-based')).length}
      Description-based: ${searchTerms.filter(t => t.pattern.includes('Description-based')).length}
    `);

    sendUpdate({ 
      status: 'complete',
      results: searchTerms,
      totalProcessed: processedCount,
      totalTerms: searchTerms.length
    });
    
    res.end();
  } catch (error) {
    console.error('Error analyzing search terms:', error);
    sendUpdate({ 
      status: 'error', 
      error: 'Error analyzing search terms',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    res.end();
  }
});



