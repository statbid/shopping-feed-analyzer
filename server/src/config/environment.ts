/**
 * Server Environment Configuration
 *
 * This script initializes and provides environment-specific configurations for the server. 
 * It loads variables from a `.env` file and defines default values for key configurations.
 *
 * Key Functionalities:
 * - **Environment Variables:** Loads variables using `dotenv` for centralized management of configurations.
 * - **Dynamic Paths:** Resolves directories like `dictionaries`, `uploads`, and `.cache` dynamically 
 *   based on the environment (`development` or `production`).
 * - **Google Ads API Configurations:** Centralizes API credentials for Google Ads integration.
 *
 * Features:
 * - Differentiates between development and production environments.
 * - Provides default values for missing environment variables.
 * - Ensures consistent paths and API configurations across the server.
 *
 * Usage:
 * - Import `environment` wherever configuration values are needed.
 * - Modify `.env` to set or override default values for your project.
 *
 * Environment Variables:
 * - `NODE_ENV`: Specifies the environment (`production` or `development`).
 * - `SERVER_PORT`: Port for the server (default: 3001).
 * - `HOST`: Host for the server (default: `localhost`).
 * - `API_BASE_URL`: Base URL for the API (default: `http://localhost:3001`).
 * - `UPLOADS_DIR`: Directory for uploaded files (default: `uploads`).
 * - `GOOGLE_ADS_CLIENT_ID`: Google Ads client ID.
 * - `GOOGLE_ADS_CLIENT_SECRET`: Google Ads client secret.
 * - `GOOGLE_ADS_DEVELOPER_TOKEN`: Google Ads developer token.
 * - `GOOGLE_ADS_REFRESH_TOKEN`: Google Ads refresh token.
 * - `GOOGLE_ADS_CUSTOMER_ACCOUNT_ID`: Google Ads customer account ID.
 * - `MAX_WORKERS`: Number of workers for parallel processing (`auto` by default).
 */

import dotenv from 'dotenv';
import path from 'path';
import { Environment } from '../types/environment';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Determine if the environment is development
const isDevelopment = process.env.NODE_ENV !== 'production';

// Define the environment object
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
