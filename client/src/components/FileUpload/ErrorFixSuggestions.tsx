import React from 'react';

interface ErrorFixSuggestionsProps {
  errorType: string;
}

const ErrorFixSuggestions: React.FC<ErrorFixSuggestionsProps> = ({ errorType }) => {
  const getSuggestion = (type: string): string => {
    const suggestions: { [key: string]: string } = {
      'Size Mismatch': 'Include the product size in the title when the size attribute is set. Use the exact size value or standard size abbreviations (XS, S, M, L, XL) that match your size attribute.',
      
      'Missing Spaces After Commas': 'Add a space after each comma in your descriptions. Example: Change "red,blue,green" to "red, blue, green".',
      
      'Color Mismatch': 'Ensure the color mentioned in the color attribute appears in the product title. Use the exact same color term from your attribute.',
      
      'Duplicate Words in Title': 'Remove redundant words from your title. Example: Change "Nike Air Jordan Jordan Shoes" to "Nike Air Jordan Shoes".',
      
      'Unspecific Google Product Category': 'Use more specific Google Product Categories with at least three levels. Example: Change "Apparel" to "Apparel > Women\'s Clothing > Dresses".',
      
      'Missing Product Type': 'Add a product type that describes your item\'s category hierarchy. Use the format "Main Category > Subcategory > Product Type".',
      
      'Missing Google Product Category': 'Add a valid Google Product Category from the official Google Product Taxonomy. Ensure it\'s in the format "Category > Subcategory > Product Type".',
      
      'Missing Apparel Attributes': 'For apparel items, always include color, size, gender, and age_group attributes. These are required for proper product categorization.',
      
      'Repeated Dashes in Description': 'Replace multiple dashes with a single dash or use appropriate punctuation. Change "product--description" to "product-description".',
      
      'Special Characters in Title': 'Remove special characters (^, $, @, !, "", \'\') from the title. Use only alphanumeric characters, and basic punctuation.',
      
      'Bad Abbreviations in Title': 'Replace abbreviated terms with their full words: "pck" → "pack", "qty" → "quantity", "pc" → "piece", etc.',
      
      'Missing Brand in Title': 'Include the brand name from your brand attribute in the product title.',
      
      'Missing Material in Title': 'Include the material specified in your material attribute in the product title.',
      
      'Whitespace at Title Start/End': 'Remove any spaces or tabs from the beginning and end of your title.',
      
      'Repeated Whitespace in Title': 'Replace multiple spaces with a single space throughout your title.',
      
      'Repeated Dashes in Title': 'Replace multiple dashes with a single dash in your title.',
      
      'Repeated Commas in Title': 'Replace multiple commas with a single comma in your title.',
      
      'Punctuation at Title Start/End': 'Remove any punctuation marks from the start and end of your title.',
      
      'HTML in Title': 'Remove any HTML tags from your title. Use plain text only.',
      
      'HTML Entities in Title': 'Replace HTML entities (&reg;, &copy;, &trade;) with their plain text equivalents or remove them.',
      
      'Promotional Words in Title': 'Remove promotional terms like "save", "off", "free shipping", etc. from your title.',
      
      'Missing Spaces in Title': 'Add appropriate spaces between words and after commas in your title.',
      
      'Non-Breaking Spaces in Title': 'Replace non-breaking spaces with regular spaces in your title.',
      
      'Whitespace at Edges in Description': 'Remove any spaces or tabs from the beginning and end of your description.',
      
      'Repeated Whitespace in Description': 'Replace multiple spaces with a single space throughout your description.',
      
      'Repeated Commas in Description': 'Replace multiple commas with a single comma in your description.',
      
      'HTML in Description': 'Remove any HTML tags from your description. Use plain text only.',
      
      'HTML Entities in Description': 'Replace HTML entities with their plain text equivalents or remove them.',
      
      'Description Too Long': 'Shorten your description to under 5000 characters while maintaining essential product information.',
      
      'Duplicate Id': 'Ensure each product has a unique identifier. Check for and resolve any duplicate IDs in your feed.',
      
      'Id Too Long': 'Shorten your product ID to 50 characters or less.',
      
      'Id Not Set': 'Add a unique identifier for each product in your feed.',
      
      'Link Not Set': 'Add a valid product URL for each item.',
      
      'Missing Image Link': 'Add a valid image URL for each product.',
      
      'Missing Availability': 'Set the availability status (in stock, out of stock, preorder).',
      
      'Missing Price': 'Add a valid price for each product.',
      
      'Missing Brand': 'Add the manufacturer or brand name for each product.',
      
      'Missing Condition': 'Specify the product condition (new, refurbished, used).',
      
      'Commas in Image Link': 'Remove any commas from your image URLs.',
      
      'Promotional Words in Product Type': 'Remove promotional terms from product type. Focus on category hierarchy.',
      
      'Commas in Product Type': 'Use ">" instead of commas to separate category levels in product type.',
      
      'Repeated Tiers in Product Type': 'Remove duplicate category levels from your product type hierarchy.',
      
      'Whitespace at Product Type Start/End': 'Remove spaces from the start and end of your product type.',
      
      'Repeated Whitespace in Product Type': 'Replace multiple spaces with a single space in your product type.',
      
      'Angle Bracket at Product Type Start or End': 'Remove ">" from the start and end of product type. Use only between category levels.',
      
      'Incorrect GTIN Length': 'Ensure GTIN is 8, 12, 13, or 14 digits long and follows the correct format.',
      
      'Invalid GTIN': 'Verify the GTIN is valid with the correct check digit.',
      'Spelling Error in description' : 'Review the description to check potential spelling errors',
      
      'Gender Mismatch': 'Ensure the gender attribute matches any gender terms used in the title.',
      
      'Age Group Mismatch': 'Ensure the age_group attribute matches any age-related terms in the title.',
      
      'Monitored Pharmacy Words': 'Remove any terms that may violate Google\'s pharmacy policy. Check Google\'s restricted products policy.',
    };

    return suggestions[type] || 'Review the item and ensure it follows Google Shopping feed requirements.';
  };

  return (
    <div className="text-sm text-gray-700">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p>{getSuggestion(errorType)}</p>
      </div>
    </div>
  );
};

export default ErrorFixSuggestions;