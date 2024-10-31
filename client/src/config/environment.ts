// src/config/environment.ts

interface Environment {
    api: {
      baseUrl: string;
      endpoints: {
        upload: string;
        analyze: string;
      };
    };
  }
  
  const environment: Environment = {
    api: {
      baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      endpoints: {
        upload: '/api/upload',
        analyze: '/api/analyze'
      }
    }
  };
  
  export default environment;