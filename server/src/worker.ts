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
  errorCheckers.checkTitleMissingSpaces,
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
errorCheckers.checkGTINValidity,
errorCheckers.checkMonitoredPharmacyWords,
errorCheckers.checkGenderMismatch,
errorCheckers.checkAgeGroupMismatch,
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
    const itemErrors = processItem(item);
    errors.push(...itemErrors);
   // console.log(`Processed item ${item.id}, found ${itemErrors.length} errors`);
  }
//  console.log(`Worker finished processing ${batch.length} items, found ${errors.length} total errors`);
  parentPort.postMessage({ errors, processedCount: batch.length });
}