/**
 * **Index Module for Server Exports**
 *
 * This module serves as a central entry point for exporting key server modules and types.
 *
 * **Purpose:**
 * - Simplifies the import process by consolidating exports from multiple modules into a single file.
 * - Facilitates better module organization and reusability.
 *
 * **Exports:**
 * - `FeedAnalyzer`: A module responsible for analyzing product feed files, identifying errors, and ensuring data quality.
 * - All types from the `@shopping-feed/types` package, including:
 *   - `FeedItem`: Represents individual items in a product feed.
 *   - `KeywordMetrics`: Structures for storing keyword metrics.
 *   - Any additional types used across the server for consistency and type safety.
 *
 * **Usage:**
 * - Instead of importing individual modules or types, consumers can import directly from this file:
 *   ```typescript
 *   import { FeedAnalyzer, FeedItem, KeywordMetrics } from './index';
 *   ```
 *
 * **Related Files:**
 * - `FeedAnalyzer.ts`: Implements logic for feed file analysis.
 * - `@shopping-feed/types`: Provides type definitions for feed processing and Google Ads integration.
 */


export { FeedAnalyzer } from './FeedAnalyzer';
export * from '@shopping-feed/types';