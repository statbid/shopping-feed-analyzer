// worker.ts
import { parentPort, workerData } from 'worker_threads';
import { FeedItem, ErrorResult } from './types';
import * as errorCheckers from './errorCheckers';
import { checkSpelling } from './errorCheckers/SpellChecker';

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