import dotenv from 'dotenv';
import path from 'path';
import { Environment } from '../types/environment';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const isDevelopment = process.env.NODE_ENV !== 'production';

const environment: Environment = {
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
  },

  googleAds: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    customerAccountId: process.env.GOOGLE_ADS_CUSTOMER_ACCOUNT_ID || ''
  }
};

export default environment;