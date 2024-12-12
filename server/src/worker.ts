
/**
 * **Worker Module for Error Checking**
 *
 * This module leverages the `worker_threads` API to process batches of feed items in parallel,
 * executing enabled error-checking functions for each item. It is designed to optimize performance
 * by offloading heavy computations to worker threads.
 *
 * **Purpose:**
 * - Perform error checks on batches of feed items in parallel.
 * - Supports dynamic enabling/disabling of specific error-checking functions.
 * - Reports results back to the main thread for aggregation and further processing.
 *
 * **Key Features:**
 * - **Dynamic Error Checker Mapping:**
 *   - Error checkers are dynamically mapped to functions, including special cases like duplicate ID checks and spell checking.
 * - **Batch Processing:**
 *   - Processes each feed item in a batch with the specified error-checking functions.
 * - **Error Handling:**
 *   - Logs and continues processing even if individual checkers throw errors.
 * - **Duplicate ID Tracking:**
 *   - Maintains a `Map` to track duplicate IDs across the batch.
 *
 * **Worker Thread Communication:**
 * - **Input:**
 *   - `workerData` contains:
 *     - `batch`: Array of `FeedItem` objects to process.
 *     - `enabledChecks`: Array of error checker names to execute.
 * - **Output:**
 *   - Posts back an object containing:
 *     - `errors`: Array of `ErrorResult` objects found during processing.
 *     - `processedCount`: Number of items successfully processed.
 *
 * **Dependencies:**
 * - `errorCheckers`: Collection of error-checking functions.
 * - `checkSpelling`: Special-case spell-checking function.
 * - `environment`: Configuration for application settings.
 * - `@shopping-feed/types`: Type definitions for `FeedItem` and `ErrorResult`.
 *
 * **Error Checkers:**
 * - Checkers are dynamically resolved using their names, enabling modular addition/removal of checkers.
 * - Supports direct functions, arrays of functions, and custom cases like `checkDuplicateIds`.
 *
 * **Usage:**
 * This module is invoked internally by the server's main thread, typically through `worker_threads` API.
 *
 */



import { parentPort, workerData } from 'worker_threads';
import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from './errorCheckers';
import { checkSpelling } from './errorCheckers/SpellChecker';
import environment from './config/environment';


interface WorkerData {
  batch: FeedItem[];
  enabledChecks: string[];
}

// Map to track duplicate IDs across the batch
const idCountsMap = new Map<string, number>();

function findCheckerFunction(name: string): Function | undefined {
  // Handle special cases first
  if (name === 'checkDuplicateIds') {
    return (item: FeedItem) => errorCheckers.checkDuplicateIds?.(item, idCountsMap);
  }

  // Handle spell checking
  if (name === 'checkSpelling') {
    return checkSpelling;
  }

  // Check for direct function export
  if (typeof errorCheckers[name as keyof typeof errorCheckers] === 'function') {
    return errorCheckers[name as keyof typeof errorCheckers] as Function;
  }

  // Search in checker arrays
  for (const [key, value] of Object.entries(errorCheckers)) {
    if (Array.isArray(value)) {
      const checker = value.find(fn => fn.name === name);
      if (checker) {
        return checker;
      }
    }
  }

  // If checker not found, log warning and return undefined
  console.warn(`Checker function "${name}" not found`);
  return undefined;
}

if (parentPort) {
  try {
    const { batch, enabledChecks } = workerData as WorkerData;
    const errors: ErrorResult[] = [];

    // Get all checker functions up front
    const checkerFunctions = enabledChecks
      .map(name => ({
        name,
        fn: findCheckerFunction(name)
      }))
      .filter((checker): checker is { name: string; fn: Function } => {
        if (!checker.fn) {
          console.warn(`Skipping missing checker: ${checker.name}`);
          return false;
        }
        return true;
      });

    // Process each item in the batch
    for (const item of batch) {
      // Run each enabled checker
      for (const checker of checkerFunctions) {
        try {
          const result = checker.fn(item);
          if (result) {
            // Handle both single results and arrays of results
            if (Array.isArray(result)) {
              errors.push(...result);
            } else {
              errors.push(result);
            }
          }
        } catch (error) {
          console.error(`Error in checker ${checker.name}:`, error);
          // Continue with other checks even if one fails
        }
      }
    }

    // Send results back to main thread
    parentPort.postMessage({
      errors,
      processedCount: batch.length
    });
  } catch (error) {
    console.error('Worker error:', error);
    parentPort.postMessage({
      error: String(error),
      processedCount: 0
    });
  }
}

export {};