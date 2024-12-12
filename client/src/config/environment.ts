/**
 * Environment Configuration File
 *
 * This file manages the environment-specific configuration for the client, 
 * including API base URL and endpoint paths. It dynamically resolves environment variables 
 * and provides default fallback values for development and local testing.
 *
 * Key Functionalities:
 * - **Dynamic Base URL:** Resolves `REACT_APP_API_BASE_URL` from environment variables and ensures proper formatting.
 * - **API Endpoints Configuration:** Defines structured API endpoints for upload, analyze, and search terms operations.
 * - **Development Logging:** Outputs environment variables and API configuration details to the console during development mode.
 *
 * Types:
 * - `Environment`: Interface that describes the structure of the environment configuration, including the API base URL and endpoints.
 *
 * Default Behavior:
 * - If `REACT_APP_API_BASE_URL` is not defined, it defaults to `http://localhost:3001`.
 * - Ensures no trailing slashes in the base URL.
 * - Logs the environment and API configuration details to aid development and debugging.
 *
 * Export:
 * - The `environment` object, which provides a structured configuration for API interactions.
 */

interface Environment {
  api: {
    baseUrl: string;
    endpoints: {
      upload: string;
      analyze: string;
      searchTerms: string;
      searchVolumes: string; 
    };
  };
}

// Resolves the base URL dynamically or uses a default for local development
const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3001';

// Log environment variables in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

// Defines the environment configuration object
const environment: Environment = {
  api: {
    baseUrl,
    endpoints: {
      upload: '/api/upload',
      analyze: '/api/analyze',
      searchTerms: '/api/search-terms',
      searchVolumes: '/api/search-volumes', 
    },
  },
};

// Log API configuration details during development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    baseUrl: environment.api.baseUrl,
    uploadEndpoint: `${environment.api.baseUrl}${environment.api.endpoints.upload}`,
    analyzeEndpoint: `${environment.api.baseUrl}${environment.api.endpoints.analyze}`,
  });
}

export default environment;
