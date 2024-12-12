/**
 * QuotaService Class
 *
 * Manages API quota usage and enforces request limits for the Google Ads API. 
 * Ensures that requests stay within the daily quota limit, tracks usage, and provides utilities 
 * for checking the remaining quota and managing expired requests.
 *
 * Key Features:
 * - **Quota Management:**
 *   - Tracks daily usage of the Google Ads API quota.
 *   - Enforces request limits based on a defined quota.
 * - **Request Tracking:**
 *   - Records individual requests with timestamps and counts.
 *   - Automatically removes expired requests after their lifetime (default: 24 hours).
 * - **Persistence:**
 *   - Saves quota usage to disk to maintain state across application restarts.
 * - **Quota Status:**
 *   - Provides details about used quota, remaining quota, and time until the oldest request expires.
 * - **Singleton Pattern:**
 *   - Ensures a single instance of the service is used throughout the application.
 *
 * Configuration:
 * - Quota limit is configurable via the `GOOGLE_ADS_DAILY_QUOTA` environment variable.
 * - Storage path for quota data is configured in the `environment` module.
 *
 * Usage:
 * ```typescript
 * const quotaService = QuotaService.getInstance();
 * const canRequest = quotaService.canMakeRequest(5);
 * if (canRequest) {
 *   quotaService.incrementUsage(5);
 *   // Proceed with API calls
 * }
 * const status = quotaService.getStatus();
 * console.log('Quota status:', status);
 * ```
 */


import fs from 'fs';
import path from 'path';
import environment from '../config/environment';

interface QuotaRequest {
  timestamp: number;
  count: number;
}

interface QuotaStatus {
  used: number;
  requests: QuotaRequest[];
  lastUpdated: Date;
}

export class QuotaService {
  private static instance: QuotaService;
  private status: QuotaStatus;
  private readonly QUOTA_LIMIT: number;
  private readonly STORAGE_PATH: string;
  private readonly REQUEST_LIFETIME: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  
  private constructor() {
    this.QUOTA_LIMIT = Number(process.env.GOOGLE_ADS_DAILY_QUOTA) || 15000;
    this.STORAGE_PATH = path.join(environment.storage.cacheDir, 'google_ads_quota.json');
    
    const stored = this.loadFromStorage();
    this.status = stored || {
      used: 0,
      requests: [],
      lastUpdated: new Date()
    };
    this.cleanExpiredRequests();
  }

  public static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }



  private loadFromStorage(): QuotaStatus | null {
    try {
      if (fs.existsSync(this.STORAGE_PATH)) {
        const stored = fs.readFileSync(this.STORAGE_PATH, 'utf8');
        const parsed = JSON.parse(stored);
        
        // Add safety checks and default values
        return {
          used: parsed.used || 0,
          requests: Array.isArray(parsed.requests) 
            ? parsed.requests.map((req: any) => ({
                timestamp: req.timestamp || Date.now(),
                count: req.count || 0
              }))
            : [], // Default to empty array if requests is not present or not an array
          lastUpdated: new Date(parsed.lastUpdated || Date.now())
        };
      }
    } catch (error) {
      console.error('Error loading quota from storage:', error);
    }
    
    // Return default state if file doesn't exist or there's an error
    return {
      used: 0,
      requests: [],
      lastUpdated: new Date()
    };
  }






  private saveToStorage(): void {
    try {
      fs.writeFileSync(this.STORAGE_PATH, JSON.stringify(this.status));
    } catch (error) {
      console.error('Error saving quota to storage:', error);
    }
  }

  private cleanExpiredRequests(): void {
    const now = Date.now();
    const validRequests = this.status.requests.filter(req => 
      now - req.timestamp < this.REQUEST_LIFETIME
    );
    
    if (validRequests.length !== this.status.requests.length) {
      this.status.requests = validRequests;
      this.status.used = this.calculateUsedQuota();
      this.status.lastUpdated = new Date();
      this.saveToStorage();
    }
  }

  private calculateUsedQuota(): number {
    return this.status.requests.reduce((total, req) => total + req.count, 0);
  }

  public incrementUsage(count: number): void {
    this.cleanExpiredRequests();
    
    const newRequest: QuotaRequest = {
      timestamp: Date.now(),
      count: count
    };
    
    this.status.requests.push(newRequest);
    this.status.used = this.calculateUsedQuota();
    this.status.lastUpdated = new Date();
    this.saveToStorage();
  }

  public canMakeRequest(requestCount: number): boolean {
    this.cleanExpiredRequests();
    return (this.status.used + requestCount) <= this.QUOTA_LIMIT;
  }

  public getStatus(): {
    used: number;
    limit: number;
    lastUpdated: Date;
    remainingTime?: string;
  } {
    this.cleanExpiredRequests();
    
    let remainingTime;
    if (this.status.requests.length > 0) {
      const oldestRequest = Math.min(...this.status.requests.map(r => r.timestamp));
      const timeToExpire = Math.max(0, this.REQUEST_LIFETIME - (Date.now() - oldestRequest));
      const minutes = Math.floor(timeToExpire / 60000);
      const seconds = Math.floor((timeToExpire % 60000) / 1000);
      remainingTime = `${minutes}m ${seconds}s`;
    }

    return {
      used: this.status.used,
      limit: this.QUOTA_LIMIT,
      lastUpdated: this.status.lastUpdated,
      remainingTime
    };
  }

  public getRemainingQuota(): number {
    this.cleanExpiredRequests();
    return Math.max(0, this.QUOTA_LIMIT - this.status.used);
  }
}