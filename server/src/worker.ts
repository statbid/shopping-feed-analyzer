import { parentPort, workerData } from 'worker_threads';
import { FeedItem, ErrorResult } from './types';
import * as errorCheckers from './errorCheckers';

console.log('Worker started');
console.log('Worker process started');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Imported modules:', Object.keys(require.cache));

const allChecks = [
  errorCheckers.checkTitleSize,
  errorCheckers.checkTitleColor,
  errorCheckers.checkTitleDuplicateWords,
  errorCheckers.checkTitleSpecialCharacters,
  errorCheckers.checkTitleBadAbbreviations,
  errorCheckers.checkTitleBrand,
  errorCheckers.checkDescriptionMissingSpaces,
  errorCheckers.checkDescriptionRepeatedDashes,
  errorCheckers.checkGoogleProductCategory,
  errorCheckers.checkApparelAttributes,
  errorCheckers.checkProductType,
  errorCheckers.checkTitleMaterial,
  errorCheckers.checkTitleWhitespace,
  errorCheckers.checkTitleRepeatedWhitespace,
  errorCheckers.checkTitleRepeatedDashes,
  errorCheckers.checkTitleRepeatedCommas,
  errorCheckers.checkTitlePunctuation,
  errorCheckers.checkTitleHtml,
  errorCheckers.checkTitleHtmlEntities,
  errorCheckers.checkTitlePromotionalWords,
  errorCheckers.checkTitleMissingSpaces,
  errorCheckers.checkTitleNonBreakingSpaces,
  errorCheckers.checkDescriptionWhitespace,
  errorCheckers.checkDescriptionRepeatedWhitespace,
  errorCheckers.checkDescriptionRepeatedCommas,
  errorCheckers.checkDescriptionHtml,
  errorCheckers.checkDescriptionHtmlEntities
];


function processItem(item: FeedItem): ErrorResult[] {
  const errors: ErrorResult[] = [];
  for (const check of allChecks) {
    const error = check(item);
    if (error) {
      errors.push(error);
    }
  }
  return errors;
}

if (parentPort) {
  const { batch } = workerData as { batch: FeedItem[] };
  const errors: ErrorResult[] = [];
  for (const item of batch) {
    errors.push(...processItem(item));
  }
  parentPort.postMessage({ errors, processedCount: batch.length });
}