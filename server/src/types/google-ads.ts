/**
 * Google Ads Types
 *
 * Provides type definitions for configuring and interacting with the Google Ads API.
 * These interfaces ensure type safety for managing Google Ads configurations, API requests, and responses.
 *
 * **Interfaces:**
 * - **GoogleAdsConfig**: Configuration for authenticating with the Google Ads API.
 *   - `clientId`: Client ID for Google Ads API authentication.
 *   - `clientSecret`: Client secret for Google Ads API authentication.
 *   - `developerToken`: Developer token for API access.
 *   - `refreshToken`: Token to refresh authentication.
 *   - `customerAccountId`: Google Ads customer account ID.
 *
 * - **GoogleAdsClientConfig**: Minimal configuration required for initializing a Google Ads API client.
 *   - `client_id`: Client ID for API authentication.
 *   - `client_secret`: Client secret for API authentication.
 *   - `developer_token`: Developer token for API access.
 *
 * - **CustomerConfig**: Configuration for making API requests on behalf of a customer.
 *   - `customer_id`: Customer account ID.
 *   - `refresh_token`: Token to refresh authentication.
 *   - `login_customer_id`: Optional login customer ID for MCC accounts.
 *
 * - **SearchVolumeResult**: Represents a keyword's search volume result.
 *   - `keyword_idea_metrics`: Detailed metrics for the keyword.
 *   - `text`: Keyword text.
 *   - `avgMonthlySearches`: Average monthly search volume for the keyword.
 *
 * - **GoogleAdsError**: Custom error interface for handling Google Ads API errors.
 *   - `details`: Additional details about the error.
 *   - `response`: The API response object, including data, status, and headers.
 *
 * - **KeywordIdeaMetrics**: Metrics associated with a keyword idea.
 *   - `avg_monthly_searches`: Average monthly search volume.
 *   - `competition`: Competition level (`HIGH`, `MEDIUM`, or `LOW`).
 *   - `competition_index`: Numeric competition index (0 to 1).
 *   - `low_top_of_page_bid_micros`: Minimum bid for the top of the page, in micros.
 *   - `high_top_of_page_bid_micros`: Maximum bid for the top of the page, in micros.
 *
 * - **KeywordIdea**: Represents a single keyword idea.
 *   - `text`: The keyword text.
 *   - `keyword_idea_metrics`: Associated metrics for the keyword.
 *
 * - **GenerateKeywordIdeaResponse**: Response format for generating keyword ideas.
 *   - `results`: Array of `KeywordIdea` objects.
 *
 * - **GoogleAdsKeywordResponse**: Detailed response for a keyword idea request.
 *   - `results`: Array of objects containing keyword text and metrics.
 */


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
