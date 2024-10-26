import express from 'express';
import cors from 'cors';
import multer from 'multer';
import './worker';
import fs from 'fs';
import { FeedAnalyzer } from './FeedAnalyzer';
import { FileHandler } from './utils/FileHandler';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
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
  const { fileName } = req.body;
  console.log('Analyze request received for file:', fileName); // Added logging

  if (!fileName) {
    console.log('No filename provided in request body:', req.body); // Added logging
    return res.status(400).json({ error: 'No file name provided' });
  }

  const filePath = FileHandler.getProcessedFilePath(fileName);
  console.log('Retrieved file path:', filePath); // Added logging

  if (!filePath || !fs.existsSync(filePath)) {
    console.log('File not found at path:', filePath); // Added logging
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
    });

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
