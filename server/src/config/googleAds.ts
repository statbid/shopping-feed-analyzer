// src/config/googleAds.ts

interface GoogleAdsConfig {
    serviceAccountSecretsPath: string;
    serviceAccountUser: string;
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    loginCustomerId: string;
  }
  
  const googleAdsConfig: GoogleAdsConfig = {
    serviceAccountSecretsPath: process.env.GOOGLE_ADS_SERVICE_ACCOUNT_SECRETS_PATH || '',
    serviceAccountUser: process.env.GOOGLE_ADS_SERVICE_ACCOUNT_USER || '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || ''
  };
  
  export const validateGoogleAdsConfig = () => {
    const requiredFields: (keyof GoogleAdsConfig)[] = [
      'developerToken',
      'clientId',
      'clientSecret',
      'refreshToken',
      'loginCustomerId'
    ];
  
    const missingFields = requiredFields.filter(field => !googleAdsConfig[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required Google Ads configuration: ${missingFields.join(', ')}`);
    }
  
    return googleAdsConfig;
  };
  
  export default googleAdsConfig;