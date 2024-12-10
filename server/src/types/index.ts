/**
 * Server Types
 *
 * This module defines the types and interfaces used throughout the server-side application,
 * ensuring consistent data structures for product feed analysis, error reporting, search term metrics, 
 * and progress tracking. These types facilitate the development and maintenance of the server's core functionality.
 *
 * Interfaces:
 * - `FeedItem`: Represents an item in the product feed, including metadata fields for validation and error checking.
 * - `Product`: Represents a basic product with an ID and name.
 * - `ErrorResult`: Encapsulates details about validation errors detected during analysis.
 * - `AnalysisResult`: Aggregates the overall analysis results, including error counts and detected errors.
 * - `KeywordMetrics`: Contains metrics for search terms, such as average monthly searches and competition level.
 * - `SearchTerm`: Extends search term details with matching products and keyword metrics.
 * - `SearchTermResult`: Simplified result structure for a search term, used in analysis outputs.
 * - `SearchTermsResultsProps`: Props for handling search term results in frontend components.
 * - `ProductsModalProps`: Props for displaying product details in a modal.
 * - `GoogleAdsConfig`: Configuration for accessing the Google Ads API, including credentials and account details.
 * - `SearchVolumeResult`: Represents search volume data for a given keyword.
 * 
 * Type Aliases:
 * - `AnalysisStage`: Enum-like type representing different stages of the analysis process.
 * - `ProgressCallback`: Callback type for tracking analysis progress.
 * - `DescriptionProgressCallback`: Callback type specifically for description-related progress.
 *
 * Usage:
 * These types are essential for maintaining type safety and ensuring proper communication between the server, 
 * its APIs, and other components. They provide a clear contract for data shapes and usage within the application.
 */


export interface FeedItem {
    id: string;
    title?: string;
    brand?: string;
    description?: string;
    size?: string;
    color?: string;
    google_product_category?: string;
    product_type?: string;
    gender?: string;
    age_group?: string;
    image_link?: string;
    availability?: string;
    price?: string;
    condition?: string;
    mpn?: string;
    shipping_weight?: string;
    [key: string]: string | undefined;
  }

  
  export interface Product {
    id: string;
    productName: string;
  }

  
  export interface ErrorResult {
    id: string;
    errorType: string;
    details: string;
    affectedField: string;
    value: string;
  }
  
  export interface AnalysisResult {
    totalProducts: number;
    errorCounts: { [key: string]: number };
    errors: ErrorResult[];
  }

  export interface KeywordMetrics {
    avgMonthlySearches: number;
    competition: 'HIGH' | 'MEDIUM' | 'LOW';
    competitionIndex: number;
    lowTopPageBid?: number;
    highTopPageBid?: number;
  }

  
export interface SearchTerm {
  id: string;
  productName: string;
  searchTerm: string;
  pattern: string;
  estimatedVolume: number;
  matchingProducts: Product[];
  keywordMetrics?: KeywordMetrics;  // Add this
}
  
export interface SearchTermResult {
  searchTerm: string;
  pattern: string;
  estimatedVolume: number;
  matchingProducts: Array<{
    id: string;
    productName: string;
  }>;
}

  

  export interface SearchTermsResultsProps {
    results: SearchTerm[];
    fileName: string;
  }

  export interface ProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    products: Product[];
  }


  export type AnalysisStage = 'attribute' | 'description';

export interface ProgressCallback {
  (stage: AnalysisStage, progress: number): void;
}

export interface DescriptionProgressCallback {
  (status: string, count: number, total: number): void;
}



export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  customerAccountId: string;
}

export interface SearchVolumeResult {
  keyword: string;
  avgMonthlySearches: number;
  competition?: string;
  lowTopPageBid?: number;
  highTopPageBid?: number;
}