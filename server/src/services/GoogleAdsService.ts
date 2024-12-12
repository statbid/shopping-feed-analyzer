/**
 * GoogleAdsService Class
 *
 * A service class to interact with the Google Ads API for generating keyword suggestions and retrieving search volume metrics.
 * It provides utility functions for batching requests, retrying failed requests, and handling API quotas.
 *
 * Key Features:
 * - **Keyword Suggestions:**
 *   - Fetch keyword suggestions based on a seed keyword.
 *   - Returns keyword metrics such as average monthly searches, competition level, and bid estimates.
 * - **Search Volumes:**
 *   - Retrieve search volume metrics for a list of keywords.
 *   - Handles batching and retry logic for API requests.
 * - **Quota Management:**
 *   - Integrates with the `QuotaService` to track and enforce API usage limits.
 * - **Retry Logic:**
 *   - Implements exponential backoff for retrying failed requests.
 * - **Batching:**
 *   - Supports batch processing of keywords to optimize API calls.
 *
 * Dependencies:
 * - `google-ads-api` for interfacing with the Google Ads API.
 * - `QuotaService` for managing API quota usage.
 * - Custom types for configuration (`GoogleAdsConfig`, `KeywordMetrics`).
 *
 * Usage:
 * ```typescript
 * const googleAdsService = new GoogleAdsService(googleAdsConfig);
 * const suggestions = await googleAdsService.getKeywordSuggestions('shoes');
 * const searchVolumes = await googleAdsService.getSearchVolumes(['shoes', 'sneakers']);
 * ```
 */


import { GoogleAdsApi, enums } from 'google-ads-api';
import { 
  GoogleAdsConfig,
  GoogleAdsClientConfig, 
  CustomerConfig
} from '../types/google-ads';
import { google } from 'google-ads-node/build/protos/protos';
import { QuotaService } from './QuotaService';
import { KeywordMetrics } from '@shopping-feed/types';

export interface KeywordMetricsResult {
  metrics: KeywordMetrics | null;
  status: 'success' | 'quota_exceeded' | 'error';
  error?: string;
}

export class GoogleAdsService {
  private client: GoogleAdsApi;
  private refreshToken: string;
  private customerId: string;
  private readonly BATCH_SIZE = 20;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;
  private quotaService: QuotaService;

  constructor(config: GoogleAdsConfig) {
    this.refreshToken = config.refreshToken;
    this.customerId = config.customerAccountId;
    this.quotaService = QuotaService.getInstance();
    
    const clientConfig: GoogleAdsClientConfig = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken
    };
    
    this.client = new GoogleAdsApi(clientConfig);
  }

  public batchKeywords(keywords: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < keywords.length; i += this.BATCH_SIZE) {
      batches.push(keywords.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getKeywordSuggestions(keyword: string): Promise<Array<{ keyword: string; metrics: KeywordMetrics }>> {
    const customer = this.client.Customer({
      customer_id: this.customerId,
      refresh_token: this.refreshToken
    });

    try {
      console.log("API Request Parameters:", {
        customer_id: this.customerId,
        language: 'languageConstants/1000',
        geo_target_constants: ['geoTargetConstants/2840'],
        keyword_seed: { keywords: [keyword] },
        page_size: 5,
        keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
        include_adult_keywords: false
      });

      const response: google.ads.googleads.v17.services.GenerateKeywordIdeaResponse = 
        await customer.keywordPlanIdeas.generateKeywordIdeas({
          customer_id: this.customerId,
          language: 'languageConstants/1000',
          geo_target_constants: ['geoTargetConstants/2840'],
          keyword_seed: { keywords: [keyword] },
          page_size: 5,
          keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
          include_adult_keywords: false,
          page_token: '',
          keyword_annotation: [],
          toJSON: function (): { [k: string]: any; } {
            throw new Error('Function not implemented.');
          }
        });

      console.log("Full API Response:", response);

      if (!response || !Array.isArray(response) || response.length === 0) {
        console.error('No results returned by the API');
        return [];
      }

      return response.map(idea => ({
        keyword: idea.text || '',
        metrics: {
          avgMonthlySearches: parseInt(idea.keyword_idea_metrics?.avg_monthly_searches?.toString() || '0', 10),
          competition: this.mapCompetitionLevel(idea.keyword_idea_metrics?.competition),
          competitionIndex: parseFloat(idea.keyword_idea_metrics?.competition_index?.toString() || '0') / 100,
          lowTopPageBid: idea.keyword_idea_metrics?.low_top_of_page_bid_micros
            ? Number((idea.keyword_idea_metrics.low_top_of_page_bid_micros / 1_000_000).toFixed(2))
            : undefined,
          highTopPageBid: idea.keyword_idea_metrics?.high_top_of_page_bid_micros
            ? Number((idea.keyword_idea_metrics.high_top_of_page_bid_micros / 1_000_000).toFixed(2))
            : undefined,
        },
      }));
    } catch (error) {
      console.error('Error getting keyword suggestions:', error);
      throw error;
    }
  }

  private mapCompetitionLevel(competition: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (!competition) return 'LOW';
    
    const competitionStr = String(competition).toUpperCase();
    switch (competitionStr) {
      case 'HIGH':
      case 'COMPETITION_HIGH':
        return 'HIGH';
      case 'MEDIUM':
      case 'COMPETITION_MEDIUM':
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  public async getSearchVolumes(keywords: string[]): Promise<Map<string, KeywordMetricsResult>> {
    if (!keywords.length) return new Map();

    const results = new Map<string, KeywordMetricsResult>();
    const batches = this.batchKeywords(keywords);
    
    const customerConfig: CustomerConfig = {
      customer_id: this.customerId,
      refresh_token: this.refreshToken,
      login_customer_id: this.customerId
    };

    try {
      const customer = this.client.Customer(customerConfig);
      
      for (const batch of batches) {
        const remainingQuota = this.quotaService.getRemainingQuota();
        
        if (remainingQuota < batch.length) {
          batch.forEach(keyword => {
            results.set(keyword.toLowerCase(), {
              metrics: null,
              status: 'quota_exceeded'
            });
          });
          continue;
        }

        try {
          const response = await this.makeRequestWithRetry(customer, {
            customer_id: this.customerId,
            language: 'languageConstants/1000',
            geo_target_constants: ['geoTargetConstants/2840'],
            keyword_seed: { keywords: batch },
            page_size: this.BATCH_SIZE,
            keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
            include_adult_keywords: false
          });

          if (response && Array.isArray(response)) {
            response.forEach(idea => {
              if (idea.text && idea.keyword_idea_metrics) {
                const { keyword_idea_metrics: kim } = idea;
                
                results.set(idea.text.toLowerCase(), {
                  metrics: {
                    avgMonthlySearches: kim.avg_monthly_searches || 0,
                    competition: this.mapCompetitionLevel(kim.competition),
                    competitionIndex: kim.competition_index || 0,
                    lowTopPageBid: kim.low_top_of_page_bid_micros ? 
                      Number((kim.low_top_of_page_bid_micros / 1_000_000).toFixed(2)) : 
                      undefined,
                    highTopPageBid: kim.high_top_of_page_bid_micros ?
                      Number((kim.high_top_of_page_bid_micros / 1_000_000).toFixed(2)) :
                      undefined
                  },
                  status: 'success'
                });
              }
            });
          }

          this.quotaService.incrementUsage(batch.length);

          if (batches.length > 1) {
            await this.delay(1000);
          }

        } catch (error) {
          batch.forEach(keyword => {
            results.set(keyword.toLowerCase(), {
              metrics: null,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          });
        }
      }

      keywords.forEach(keyword => {
        if (!results.has(keyword.toLowerCase())) {
          results.set(keyword.toLowerCase(), {
            metrics: null,
            status: 'error',
            error: 'No data received'
          });
        }
      });

      return results;

    } catch (error) {
      keywords.forEach(keyword => {
        results.set(keyword.toLowerCase(), {
          metrics: null,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
      return results;
    }
  }

  private async makeRequestWithRetry(
    customer: any,
    requestParams: any,
    retryCount = 0
  ): Promise<any[]> {
    try {
      const response = await customer.keywordPlanIdeas.generateKeywordIdeas(requestParams);
      return response || [];
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.makeRequestWithRetry(customer, requestParams, retryCount + 1);
      }
      throw error;
    }
  }

  public getQuotaStatus() {
    return this.quotaService.getStatus();
  }
}
