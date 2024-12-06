import { GoogleAdsApi, enums } from 'google-ads-api';
import { 
  GoogleAdsConfig,
  GoogleAdsClientConfig, 
  CustomerConfig,
  GoogleAdsError,
  SearchVolumeResult
} from '../types/google-ads';
import { QuotaService } from './QuotaService';

import { KeywordMetrics } from '../types';

export class GoogleAdsService {
  private client: GoogleAdsApi;
  private refreshToken: string;
  private customerId: string;
  private readonly BATCH_SIZE = 20; // Google's batch limit
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds
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

    try {
      this.client = new GoogleAdsApi(clientConfig);
    } catch (error) {
      console.error('Failed to create Google Ads client:', error);
      throw error;
    }
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










  
  public async getSearchVolumes(keywords: string[]): Promise<Map<string, KeywordMetrics>> {
    // Validate input
    if (!keywords.length) {
      return new Map();
    }
  
    // Check quota before processing
    if (!this.quotaService.canMakeRequest(keywords.length)) {
      console.warn('API quota limit would be exceeded. Returning zero metrics.');
      return new Map(keywords.map(k => [k.toLowerCase(), {
        avgMonthlySearches: 0,
        competition: 'LOW',
        competitionIndex: 0,
        lowTopPageBid: undefined,
        highTopPageBid: undefined
      }]));
    }
  
    const metrics = new Map<string, KeywordMetrics>();
    const batches = this.batchKeywords(keywords);
    let totalProcessed = 0;
  
    try {
      const customerConfig: CustomerConfig = {
        customer_id: this.customerId,
        refresh_token: this.refreshToken,
        login_customer_id: this.customerId
      };
  
      const customer = this.client.Customer(customerConfig);
  
      for (const batch of batches) {
        // Check remaining quota before each batch
        const remainingQuota = this.quotaService.getRemainingQuota();
        if (remainingQuota < batch.length) {
          console.warn('Insufficient quota remaining. Stopping batch processing.');
          break;
        }
  
        try {
          const response = await this.makeRequestWithRetry(customer, {
            customer_id: this.customerId,
            language: 'languageConstants/1000', // English
            geo_target_constants: ['geoTargetConstants/2840'], // US
            keyword_seed: {
              keywords: batch
            },
            page_size: this.BATCH_SIZE,
            keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
            include_adult_keywords: false
          });
  
          if (response && Array.isArray(response)) {
            response.forEach(idea => {
              if (idea.text && idea.keyword_idea_metrics) {
                const { keyword_idea_metrics } = idea;
                
                metrics.set(idea.text.toLowerCase(), {
                  avgMonthlySearches: keyword_idea_metrics.avg_monthly_searches || 0,
                  competition: this.mapCompetitionLevel(keyword_idea_metrics.competition),
                  competitionIndex: keyword_idea_metrics.competition_index || 0,
                  lowTopPageBid: keyword_idea_metrics.low_top_of_page_bid_micros 
                    ? Number((keyword_idea_metrics.low_top_of_page_bid_micros / 1_000_000).toFixed(2))
                    : undefined,
                  highTopPageBid: keyword_idea_metrics.high_top_of_page_bid_micros
                    ? Number((keyword_idea_metrics.high_top_of_page_bid_micros / 1_000_000).toFixed(2))
                    : undefined
                });
              }
            });
          }
  
          // Increment quota usage for successful batch
          this.quotaService.incrementUsage(batch.length);
          totalProcessed += batch.length;
  
          // Add delay between batches to avoid rate limiting
          if (batches.length > 1) {
            await this.delay(1000);
          }
  
        } catch (error) {
          console.error('Error processing batch:', error);
          // Fill failed batch with zero metrics
          batch.forEach(keyword => {
            if (!metrics.has(keyword.toLowerCase())) {
              metrics.set(keyword.toLowerCase(), {
                avgMonthlySearches: 0,
                competition: 'LOW',
                competitionIndex: 0,
                lowTopPageBid: undefined,
                highTopPageBid: undefined
              });
            }
          });
        }
      }
  
      // Fill any remaining keywords with zero metrics
      keywords.forEach(keyword => {
        if (!metrics.has(keyword.toLowerCase())) {
          metrics.set(keyword.toLowerCase(), {
            avgMonthlySearches: 0,
            competition: 'LOW',
            competitionIndex: 0,
            lowTopPageBid: undefined,
            highTopPageBid: undefined
          });
        }
      });
  
      console.log(`Processed ${totalProcessed} keywords successfully`);
      return metrics;
  
    } catch (error) {
      console.error('Error in getSearchVolumes:', error);
      // Return map with zero metrics on error
      return new Map(keywords.map(k => [k.toLowerCase(), {
        avgMonthlySearches: 0,
        competition: 'LOW',
        competitionIndex: 0,
        lowTopPageBid: undefined,
        highTopPageBid: undefined
      }]));
    }
  }
  






  private mapCompetitionLevel(competition: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Google Ads API returns competition level in different formats
    // This ensures consistent output
    if (!competition) return 'LOW';
    
    const competitionStr = String(competition).toUpperCase();
    switch (competitionStr) {
      case 'HIGH':
      case 'COMPETITION_HIGH':
        return 'HIGH';
      case 'MEDIUM':
      case 'COMPETITION_MEDIUM':
        return 'MEDIUM';
      case 'LOW':
      case 'COMPETITION_LOW':
      default:
        return 'LOW';
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
        console.log(`Attempt ${retryCount + 1} failed, retrying...`);
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.makeRequestWithRetry(customer, requestParams, retryCount + 1);
      }
      throw error;
    }
  }






  public async validateCredentials(): Promise<boolean> {
    try {
      const customerConfig: CustomerConfig = {
        customer_id: this.customerId,
        refresh_token: this.refreshToken,
        login_customer_id: this.customerId
      };

      const customer = this.client.Customer(customerConfig);
      
      // Make a minimal request to verify credentials
      await customer.keywordPlanIdeas.generateKeywordIdeas({
        customer_id: this.customerId,
        language: 'languageConstants/1000',
        geo_target_constants: ['geoTargetConstants/2840'],
        keyword_seed: {
          keywords: ['test']
        },
        page_size: 1,
        keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
        include_adult_keywords: false,
        page_token: '',
        keyword_annotation: [],
        toJSON: function (): { [k: string]: any; } {
          throw new Error('Function not implemented.');
        }
      });

      return true;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  public getQuotaStatus() {
    return this.quotaService.getStatus();
  }
}