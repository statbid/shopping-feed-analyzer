import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { FeedAnalyzer } from './services/feedAnalyzer';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileStream = fs.createReadStream(req.file.path);
    const analyzer = new FeedAnalyzer();
    const results = await analyzer.analyzeStream(fileStream);
    
    res.json(results);
  } catch (error) {
    console.error('Error analyzing file:', error);
    res.status(500).json({ error: 'Error analyzing file' });
  } finally {
    // Clean up uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});