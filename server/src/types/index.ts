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


  export interface SearchTerm {
    id: string;
    productName: string;
    searchTerm: string;
    pattern: string;
    estimatedVolume: number;
  }
  
  export interface KeywordScore {
    term: string;
    score: number;
  }
  
  export interface SearchTermMatch {
    items: FeedItem[];
    pattern: string;
  }