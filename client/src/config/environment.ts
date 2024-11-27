
interface Environment {
  api: {
    baseUrl: string;
    endpoints: {
      upload: string;
      analyze: string;
      searchTerms: string;  
    };
  };
}

const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3001';

// Log environment setup in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
  });
}

const environment = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    endpoints: {
      upload: '/api/upload',
      analyze: '/api/analyze',
      searchTerms: '/api/search-terms',
      searchVolumes: '/api/search-volumes'  
    }
  }
};


// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    baseUrl: environment.api.baseUrl,
    uploadEndpoint: `${environment.api.baseUrl}${environment.api.endpoints.upload}`,
    analyzeEndpoint: `${environment.api.baseUrl}${environment.api.endpoints.analyze}`
  });
}

export default environment;