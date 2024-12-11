/**
 * Shared Types
 * Common type definitions for both client and server components.
 */
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
export interface ErrorResult {
    id: string;
    errorType: string;
    details: string;
    affectedField: string;
    value: string;
}
export interface AnalysisResult {
    totalProducts: number;
    errorCounts: {
        [key: string]: number;
    };
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
    estimatedVolume: number | null | undefined;
    keywordMetrics: KeywordMetrics | null | undefined;
    matchingProducts: Product[];
}
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
}
export type ProgressCallback = (stage: AnalysisStage, progress: number) => void;
export type DescriptionProgressCallback = (status: string, count: number, total: number) => void;
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
