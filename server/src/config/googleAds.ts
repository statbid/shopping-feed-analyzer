/**
 * Google Ads API Configuration and Validation
 *
 * This module defines types and configurations for interacting with the Google Ads API.
 * It ensures all required environment variables are provided and valid before usage.
 *
 * Features:
 * - Centralizes Google Ads API configuration for easy access and maintenance.
 * - Validates required fields and throws informative errors for missing configuration.
 *
 * Types:
 * - `GoogleAdsConfig`: Defines the structure for Google Ads API configurations, including service account details, tokens, and credentials.
 *
 * Usage:
 * - Import `googleAdsConfig` for ready-to-use API configuration.
 * - Call `validateGoogleAdsConfig` during initialization to ensure required configurations are set.
 *
 * Environment Variables:
 * - `GOOGLE_ADS_SERVICE_ACCOUNT_SECRETS_PATH`: Path to the Google Ads service account secrets.
 * - `GOOGLE_ADS_SERVICE_ACCOUNT_USER`: Email of the service account user.
 * - `GOOGLE_ADS_DEVELOPER_TOKEN`: Developer token for Google Ads API.
 * - `GOOGLE_ADS_CLIENT_ID`: OAuth 2.0 client ID.
 * - `GOOGLE_ADS_CLIENT_SECRET`: OAuth 2.0 client secret.
 * - `GOOGLE_ADS_REFRESH_TOKEN`: Refresh token for OAuth 2.0.
 * - `GOOGLE_ADS_LOGIN_CUSTOMER_ID`: Customer ID used for authentication and billing.
 */

interface GoogleAdsConfig {
  serviceAccountSecretsPath: string; // Path to service account secrets JSON file
  serviceAccountUser: string;       // Email address of the service account user
  developerToken: string;           // Google Ads API developer token
  clientId: string;                 // OAuth 2.0 client ID
  clientSecret: string;             // OAuth 2.0 client secret
  refreshToken: string;             // OAuth 2.0 refresh token
  loginCustomerId: string;          // Login customer ID for billing and authentication
}

// Define the Google Ads configuration object
const googleAdsConfig: GoogleAdsConfig = {
  serviceAccountSecretsPath: process.env.GOOGLE_ADS_SERVICE_ACCOUNT_SECRETS_PATH || '',
  serviceAccountUser: process.env.GOOGLE_ADS_SERVICE_ACCOUNT_USER || '',
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
  loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || ''
};

/**
 * Validates the Google Ads API configuration.
 *
 * Ensures all required fields are set in the configuration. If any required fields are missing,
 * it throws an error with the list of missing fields.
 *
 * @throws {Error} If required fields are missing.
 * @returns {GoogleAdsConfig} The validated Google Ads configuration.
 */
export const validateGoogleAdsConfig = (): GoogleAdsConfig => {
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
