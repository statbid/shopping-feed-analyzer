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


export interface KeywordIdeaMetrics {
  avg_monthly_searches: number;
  competition: string;
  competition_index: number;
  low_top_of_page_bid_micros?: number;
  high_top_of_page_bid_micros?: number;
}

export interface KeywordIdea {
  text: string | null | undefined; 
  keyword_idea_metrics: KeywordIdeaMetrics;
}


export interface GenerateKeywordIdeaResponse {
  results: KeywordIdea[];
}

export interface GoogleAdsKeywordResponse {
  results: Array<{
    text: string | null | undefined;
    keyword_idea_metrics: {
      avg_monthly_searches: number | null;
      competition: string | null;
      competition_index: number | null;
      low_top_of_page_bid_micros: number | null;
      high_top_of_page_bid_micros: number | null;
    };
  }>;
}
