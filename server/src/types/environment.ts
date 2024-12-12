/**
 * Environment Interface
 *
 * Defines the structure for the application's environment configuration. 
 * This interface ensures type safety for accessing and managing environment variables
 * across the server-side application.
 *
 * Properties:
 * - **Server Configuration:**
 *   - `server.port`: Specifies the port on which the server runs. Can be a string or number.
 *   - `server.host`: Defines the hostname or IP address of the server.
 * 
 * - **API Configuration:**
 *   - `api.baseUrl`: The base URL for API endpoints.
 * 
 * - **Storage Configuration:**
 *   - `storage.uploadsDir`: Directory path for uploaded files.
 *   - `storage.dictionariesDir`: Directory path for dictionary files.
 *   - `storage.cacheDir`: Directory path for cache files.
 * 
 * - **Worker Configuration:**
 *   - `worker.maxWorkers`: Specifies the number of workers allowed. Can be a specific number or 'auto' for dynamic calculation.
 * 
 * - **Google Ads API Configuration:**
 *   - `googleAds.clientId`: Client ID for Google Ads API authentication.
 *   - `googleAds.clientSecret`: Client secret for Google Ads API authentication.
 *   - `googleAds.developerToken`: Developer token for accessing the Google Ads API.
 *   - `googleAds.refreshToken`: Refresh token for generating access tokens for the Google Ads API.
 *   - `googleAds.customerAccountId`: Google Ads customer account ID.
 */


export interface Environment {
    server: {
      port: string | number;
      host: string;
    };
    api: {
      baseUrl: string;
    };
    storage: {
      uploadsDir: string;
      dictionariesDir: string;
      cacheDir: string;
    };
    worker: {
      maxWorkers: string;
    };
    googleAds: {
      clientId: string;
      clientSecret: string;
      developerToken: string;
      refreshToken: string;
      customerAccountId: string;
    
    };
  }