import { parentPort, workerData } from 'worker_threads';
import { FeedItem, ErrorResult } from './types';
import * as errorCheckers from './errorCheckers';
import { error } from 'console';


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
 // errorCheckers.checkTitleSpacing, 
  errorCheckers.checkTitleNonBreakingSpaces,
  errorCheckers.checkDescriptionWhitespace,
  errorCheckers.checkDescriptionRepeatedWhitespace,
  errorCheckers.checkDescriptionRepeatedCommas,
  errorCheckers.checkDescriptionHtml,
  errorCheckers.checkDescriptionHtmlEntities,
  errorCheckers.checkDescriptionLength,
  errorCheckers.checkDescriptionNonBreakingSpaces,
  errorCheckers.checkIdLength,
  errorCheckers.checkIdIsSet,
  errorCheckers.checkImageLink,
  errorCheckers.checkAvailability,
  errorCheckers.checkPrice,
  errorCheckers.checkLinkIsSet,
  errorCheckers.checkPrice,
  errorCheckers.checkMPN,
  errorCheckers.checkCondition,
  errorCheckers.checkBrand,
  errorCheckers.checkImageLinkCommas,
errorCheckers.checkProductTypePromotionalWords,
errorCheckers.checkProductTypeCommas,
errorCheckers.checkProductTypeRepeatedTiers,
errorCheckers.checkProductTypeWhitespace,
errorCheckers.checkProductTypeRepeatedWhitespace,
errorCheckers.checkProductTypeAngleBrackets,
errorCheckers.checkGTINLength,

errorCheckers.checkMonitoredPharmacyWords,
errorCheckers.checkGenderMismatch,
errorCheckers.checkAgeGroupMismatch,
];



function processItem(item: FeedItem): ErrorResult[] {
  const errors: ErrorResult[] = [];
  for (const check of allChecks) {
    const result = check(item);
    if (result) {
      // If result is an array, spread it; if single error, add it
      errors.push(...(Array.isArray(result) ? result : [result]));
    }
  }
  return errors;
}

if (parentPort) {
  const { batch } = workerData as { batch: FeedItem[] };
  const errors: ErrorResult[] = [];
  for (const item of batch) {
    const itemErrors = processItem(item);
    errors.push(...itemErrors);
   // console.log(`Processed item ${item.id}, found ${itemErrors.length} errors`);
  }
//  console.log(`Worker finished processing ${batch.length} items, found ${errors.length} total errors`);
  parentPort.postMessage({ errors, processedCount: batch.length });
}