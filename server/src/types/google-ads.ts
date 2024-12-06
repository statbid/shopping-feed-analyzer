// types/googleAds.ts

export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  customerAccountId: string;
}

export interface GoogleAdsClientConfig {
  client_id: string;
  client_secret: string;
  developer_token: string;
}

export interface CustomerConfig {
  customer_id: string;
  refresh_token: string;
  login_customer_id?: string;
}

export interface SearchVolumeResult {
  keyword_idea_metrics: any;
  text: string;
  avgMonthlySearches?: number;
}

export interface GoogleAdsError extends Error {
  details?: string;
  response?: {
    data?: any;
    status?: number;
    headers?: any;
  };
}

