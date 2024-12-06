import fs from 'fs';
import path from 'path';
import environment from '../config/environment';

interface QuotaStatus {
  used: number;
  lastUpdated: Date;
  lastReset: Date;
}
export class QuotaService {
    private static instance: QuotaService;
    private status: QuotaStatus;
    private readonly QUOTA_LIMIT: number;
    private readonly STORAGE_PATH: string;
    


    private constructor() {
        // Get quota limit from environment or use default
        this.QUOTA_LIMIT = Number(process.env.GOOGLE_ADS_DAILY_QUOTA) || 10000;
        this.STORAGE_PATH = path.join(environment.storage.cacheDir, 'google_ads_quota.json');
        
        // Initialize with stored values or defaults
        const stored = this.loadFromStorage();
        this.status = stored || {
          used: 0,
          lastUpdated: new Date(),
          lastReset: new Date()
        };
        this.checkAndResetDaily();
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
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          lastReset: new Date(parsed.lastReset)
        };
      }
    } catch (error) {
      console.error('Error loading quota from storage:', error);
    }
    return null;
  }

  private saveToStorage(): void {
    try {
      fs.writeFileSync(this.STORAGE_PATH, JSON.stringify(this.status));
    } catch (error) {
      console.error('Error saving quota to storage:', error);
    }
  }

  private checkAndResetDaily(): void {
    const now = new Date();
    const lastReset = new Date(this.status.lastReset);
    
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      this.status.used = 0;
      this.status.lastReset = now;
      this.status.lastUpdated = now;
      this.saveToStorage();
    }
  }

  public incrementUsage(count: number): void {
    this.checkAndResetDaily();
    this.status.used += count;
    this.status.lastUpdated = new Date();
    this.saveToStorage();
  }

  public canMakeRequest(requestCount: number): boolean {
    this.checkAndResetDaily();
    return (this.status.used + requestCount) <= this.QUOTA_LIMIT;
  }

  public getStatus(): QuotaStatus {
    this.checkAndResetDaily();
    return { ...this.status };
  }

  public getRemainingQuota(): number {
    this.checkAndResetDaily();
    return Math.max(0, this.QUOTA_LIMIT - this.status.used);
  }




  
}