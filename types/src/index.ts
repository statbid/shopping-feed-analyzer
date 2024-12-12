/**
 * Shared Types
 * Common type definitions for both client and server components.
 */

// Base Types
export interface Product {
    id: string;
    productName: string;
  }
  
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
  
  // Analysis Types
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
  
  // Search Term Types
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
    estimatedVolume: number | null | undefined;  
    keywordMetrics: KeywordMetrics | null | undefined;  
    matchingProducts: Product[];
  }


  
  // Component Props
  export interface SearchTermsResultsProps {
    results: SearchTerm[];
    fileName: string;
    useSearchVolumes: boolean; 
  }
  
  export interface ProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    products: Product[];
  }
  
  // Progress and Status Types
  export type AnalysisStage = 'attribute' | 'description';
  
  export interface ProgressUpdate {
    status: 'analyzing' | 'chunking' | 'chunk' | 'complete' | 'error';
    stage?: AnalysisStage;
    progress?: number;
    message?: string;
    phase?: string;
    processed?: number;
    chunk?: SearchTerm[];
    chunkIndex?: number;
    totalChunks?: number;
    totalTerms?: number;
    error?: string;
    details?: string;
    current?: number;  
    total?: number;   
  }
  export type ProgressCallback = (stage: 'attribute' | 'description', current: number, total: number) => void;

  export type DescriptionProgressCallback = (status: string, count: number, total: number) => void;
  
  // API Types
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