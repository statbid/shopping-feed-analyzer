import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const isDevelopment = process.env.NODE_ENV !== 'production';

const environment = {
  server: {
    port: process.env.SERVER_PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  },
  
  storage: {
    uploadsDir: process.env.UPLOADS_DIR || 'uploads',
    dictionariesDir: path.resolve(__dirname, isDevelopment ? '../dictionaries' : '../dictionaries'),
    cacheDir: path.resolve(__dirname, isDevelopment ? '../.cache' : '../.cache')
  },
  
  worker: {
    maxWorkers: process.env.MAX_WORKERS || 'auto',
  }
};

export default environment;