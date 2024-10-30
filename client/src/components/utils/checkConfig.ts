// checkConfig.ts

export interface CheckConfig {
    id: string;
    name: string;
    category: string;
    enabled: boolean;
    checkerFunction: string;
}

export const checkCategories = [
  {
    name: 'Title Checks',
    order: 1,
    checks: [
      
      {
        id: 'title-size',
        name: 'Size in Title',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleSize'
      },
      {
        id: 'title-color',
        name: 'Color in Title',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleColor'
      },
      {
        id: 'title-duplicates',
        name: 'Duplicate Words',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleDuplicateWords'
      },
      {
        id: 'title-special-chars',
        name: 'Special Characters',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleSpecialCharacters'
      },
      {
        id: 'title-abbreviations',
        name: 'Bad Abbreviations',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleBadAbbreviations'
      },
      {
        id: 'title-brand',
        name: 'Brand in Title',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleBrand'
      },
      {
        id: 'title-material',
        name: 'Material in Title',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleMaterial'
      },
      {
        id: 'title-whitespace-edges',
        name: 'Whitespace at Start/End',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleWhitespace'
      },
      {
        id: 'title-repeated-whitespace',
        name: 'Repeated Whitespace',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleRepeatedWhitespace'
      },
      {
        id: 'title-repeated-dashes',
        name: 'Repeated Dashes',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleRepeatedDashes'
      },
      {
        id: 'title-repeated-commas',
        name: 'Repeated Commas',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleRepeatedCommas'
      },
      {
        id: 'title-punctuation',
        name: 'Punctuation at Edges',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitlePunctuation'
      },
      {
        id: 'title-html',
        name: 'HTML Tags',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleHtml'
      },
      {
        id: 'title-html-entities',
        name: 'HTML Entities',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleHtmlEntities'
      },
      {
        id: 'title-promotional',
        name: 'Promotional Words',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitlePromotionalWords'
      },
      {
        id: 'title-nonbreaking-spaces',
        name: 'Non-breaking Spaces',
        category: 'Title Checks',
        enabled: true,
        checkerFunction: 'checkTitleNonBreakingSpaces'
      }
    ]
  },
  {
    name: 'Description Checks',
    order: 2,
    checks: [
     
      {
        id: 'description-spaces',
        name: 'Missing Spaces After Commas',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionMissingSpaces'
      },
      {
        id: 'description-dashes',
        name: 'Repeated Dashes',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionRepeatedDashes'
      },
      {
        id: 'description-whitespace',
        name: 'Whitespace at Edges',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionWhitespace'
      },
      {
        id: 'description-repeated-whitespace',
        name: 'Repeated Whitespace',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionRepeatedWhitespace'
      },
      {
        id: 'description-repeated-commas',
        name: 'Repeated Commas',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionRepeatedCommas'
      },
      {
        id: 'description-html',
        name: 'HTML Tags',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionHtml'
      },
      {
        id: 'description-html-entities',
        name: 'HTML Entities',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionHtmlEntities'
      },
      {
        id: 'description-length',
        name: 'Description Length',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionLength'
      },
      {
        id: 'description-nonbreaking-spaces',
        name: 'Non-breaking Spaces',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionNonBreakingSpaces'
      },
      {
        id: 'description-promotional',
        name: 'Promotional Words',
        category: 'Description Checks',
        enabled: true,
        checkerFunction: 'checkDescriptionPromotionalWords'
      }
    ]
  },
  {
    name: 'Category & Type Checks',
    order: 3,
    checks: [
      {
        id: 'google-category',
        name: 'Google Product Category',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkGoogleProductCategory'
      },
      {
        id: 'apparel-attributes',
        name: 'Apparel Attributes',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkApparelAttributes'
      },
      {
        id: 'product-type',
        name: 'Product Type',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductType'
      },
      {
        id: 'product-type-promotional',
        name: 'Promotional Words in Type',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductTypePromotionalWords'
      },
      {
        id: 'product-type-commas',
        name: 'Commas in Type',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductTypeCommas'
      },
      {
        id: 'product-type-repeated-tiers',
        name: 'Repeated Tiers',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductTypeRepeatedTiers'
      },
      {
        id: 'product-type-whitespace',
        name: 'Whitespace at Start/End',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductTypeWhitespace'
      },
      {
        id: 'product-type-repeated-whitespace',
        name: 'Repeated Whitespace',
        category: 'Category & Type Checks',
        enabled: true,
        checkerFunction: 'checkProductTypeRepeatedWhitespace'
      }
    ]
  },
  {
    name: 'Required Fields',
    order: 4,
    checks: [
      {
        id: 'check-duplicate-ids',
        name: 'Duplicate IDs',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkDuplicateIds'
      },
      {
        id: 'check-id',
        name: 'Product ID',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkIdIsSet'
      },
      {
        id: 'check-id-length',
        name: 'ID Length',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkIdLength'
      },
      {
        id: 'check-link',
        name: 'Product Link',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkLinkIsSet'
      },
      {
        id: 'check-image-link',
        name: 'Image Link',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkImageLink'
      },
      {
        id: 'check-image-link-commas',
        name: 'Commas in Image Link',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkImageLinkCommas'
      },
      {
        id: 'check-availability',
        name: 'Availability',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkAvailability'
      },
      {
        id: 'check-price',
        name: 'Price',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkPrice'
      },
      {
        id: 'check-brand',
        name: 'Brand',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkBrand'
      },
      {
        id: 'check-condition',
        name: 'Condition',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkCondition'
      },
      {
        id: 'check-mpn',
        name: 'MPN',
        category: 'Required Fields',
        enabled: true,
        checkerFunction: 'checkMPN'
      }
    ]
  },
  {
    name: 'Attribute Validation',
    order: 5,
    checks: [
      {
        id: 'check-gender-mismatch',
        name: 'Gender Consistency',
        category: 'Attribute Validation',
        enabled: true,
        checkerFunction: 'checkGenderMismatch'
      },
      {
        id: 'check-age-group-mismatch',
        name: 'Age Group Consistency',
        category: 'Attribute Validation',
        enabled: true,
        checkerFunction: 'checkAgeGroupMismatch'
      },
      {
        id: 'check-gtin',
        name: 'GTIN Format',
        category: 'Attribute Validation',
        enabled: true,
        checkerFunction: 'checkGTINLength'
      },
      {
        id: 'check-shipping-weight',
        name: 'Shipping Weight',
        category: 'Attribute Validation',
        enabled: true,
        checkerFunction: 'checkShippingWeight'
      }
    ]
  },
  {
    name: 'Content Compliance',
    order: 6,
    checks: [
      {
        id: 'pharmacy-words',
        name: 'Monitored Pharmacy Words',
        category: 'Content Compliance',
        enabled: true,
        checkerFunction: 'checkMonitoredPharmacyWords'
      }
    ]
  },

  {
    name: 'Spelling & Grammar',
    order: 7,
    checks: [
      {
        id: 'spelling-check',
        name: 'Spelling Check',
        category: 'Spelling & Grammar',
        enabled: true,
        checkerFunction: 'checkSpelling'  // Changed to use the single spelling checker
      }
    ]
  }


];

export function getEnabledChecks(selectedCheckIds: string[]): string[] {
  const allChecks = checkCategories.flatMap(category => category.checks);
  const selectedChecks = selectedCheckIds
    .map(id => allChecks.find(c => c.id === id)?.checkerFunction)
    .filter((name): name is string => name !== undefined);

  console.log('Selected check functions:', selectedChecks);
  return selectedChecks;
}