import express from 'express';
import cors from 'cors';
import multer from 'multer';
import './worker';
import fs from 'fs';
import { FeedAnalyzer } from './FeedAnalyzer';

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

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('Starting analysis for file:', req.file.originalname);
    const fileStream = fs.createReadStream(req.file.path);
    const analyzer = new FeedAnalyzer();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const sendUpdate = (data: any) => {
      console.log('Sending update:', data);
      res.write(`data: ${safeStringify(data)}\n\n`);
    };

    // Analyze the stream and send progress updates
    const results = await analyzer.analyzeStream(fileStream, (processed: number) => {
      console.log(`Progress: ${processed} SKUs processed`);
      sendUpdate({ processed });
    });

    // Send final results
   // console.log('Analysis complete, sending final results');
    sendUpdate({ results, completed: true });
    res.end();
  } catch (error: unknown) {
    console.error('Error analyzing file:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.write(`data: ${safeStringify({ error: 'Error analyzing file', details: errorMessage })}\n\n`);
    res.end();
  } finally {
    // Clean up uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
      console.log('Cleaned up uploaded file:', req.file.path);
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
