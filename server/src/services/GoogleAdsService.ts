import { GoogleAdsApi, enums } from 'google-ads-api';
import { 
  GoogleAdsConfig,
  GoogleAdsClientConfig, 
  CustomerConfig,
  GoogleAdsError
} from '../types/google-ads';

export class GoogleAdsService {
  private client: GoogleAdsApi;
  private refreshToken: string;
  private customerId: string;
  private readonly BATCH_SIZE = 20; // Google's actual limit
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds between retries

  constructor(config: GoogleAdsConfig) {
    this.refreshToken = config.refreshToken;
    this.customerId = config.customerAccountId;

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
    // Split into batches of maximum 20 keywords
    for (let i = 0; i < keywords.length; i += this.BATCH_SIZE) {
      batches.push(keywords.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getSearchVolumes(keywords: string[]): Promise<Map<string, number>> {
    if (keywords.length > this.BATCH_SIZE) {
      throw new Error(`Maximum of ${this.BATCH_SIZE} keywords allowed per request`);
    }

    console.log(`Fetching search volumes for ${keywords.length} keywords`);
    const volumes = new Map<string, number>();

    try {
      const customerConfig: CustomerConfig = {
        customer_id: this.customerId,
        login_customer_id: this.customerId,
        refresh_token: this.refreshToken
      };

      const customer = this.client.Customer(customerConfig);
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < this.MAX_RETRIES) {
        try {
          const response = await customer.keywordPlanIdeas.generateKeywordIdeas({
            customer_id: this.customerId,
            language: 'languageConstants/1000', // English
            geo_target_constants: ['geoTargetConstants/2840'], // US
            keyword_seed: {
              keywords: keywords
            },
            page_size: this.BATCH_SIZE,
            keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
            include_adult_keywords: false,
            page_token: '',
            keyword_annotation: [],
            toJSON: function (): { [k: string]: any; } {
              throw new Error('Function not implemented.');
            }
          });

          if (response && Array.isArray(response)) {
            response.forEach(idea => {
              if (idea.text && idea.keyword_idea_metrics?.avg_monthly_searches) {
                volumes.set(
                  idea.text.toLowerCase(),
                  idea.keyword_idea_metrics.avg_monthly_searches
                );
              }
            });
          }

          success = true;
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, error);
          
          if (retryCount < this.MAX_RETRIES) {
            await this.delay(this.RETRY_DELAY * retryCount);
          } else {
            throw error;
          }
        }
      }

      // Fill in missing volumes with 0
      keywords.forEach(keyword => {
        if (!volumes.has(keyword.toLowerCase())) {
          volumes.set(keyword.toLowerCase(), 0);
        }
      });

      return volumes;
    } catch (error) {
      console.error('Error fetching search volumes:', error);
      // Return map with 0 volumes on error
      return new Map(keywords.map(k => [k.toLowerCase(), 0]));
    }
  }
}