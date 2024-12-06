// types/index.ts

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