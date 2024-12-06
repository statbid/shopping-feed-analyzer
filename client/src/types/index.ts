export interface Product {
  id: string;
  productName: string;
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


export interface SearchTermsResultsProps {
  results: SearchTerm[];
  fileName: string;
  useSearchVolumes: boolean;  // Added this line
}