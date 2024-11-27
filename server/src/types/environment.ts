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