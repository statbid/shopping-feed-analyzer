/**
 * Types Definitions
 *
 * This file contains the TypeScript interfaces and types used throughout
 * the application to enforce strict typing and ensure consistency in
 * data structures and API responses.
 *
 * Key Interfaces:
 * - Product: Represents a product with its ID and name.
 * - KeywordMetrics: Metrics associated with a search term for keyword analysis.
 * - SearchTerm: Represents a search term and its related data.
 * - SearchTermsResultsProps: Props for components handling search term results.
 * - ProgressUpdate: Represents the status and progress of an analysis operation.
 * - ProductsModalProps: Props for the modal displaying matching products for a search term.
 * - ErrorResult: Represents a validation error in product feeds.
 * - AnalysisResult: Represents the results of an analysis operation.
 */


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
  keywordMetrics?: KeywordMetrics; 
}

export interface SearchTermsResultsProps {
  results: SearchTerm[];
  fileName: string;
}


export interface ProgressUpdate {
  status: 'analyzing' | 'chunking' | 'chunk' | 'complete' | 'error';
  stage?: 'attribute' | 'description';
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
  useSearchVolumes: boolean;  
}