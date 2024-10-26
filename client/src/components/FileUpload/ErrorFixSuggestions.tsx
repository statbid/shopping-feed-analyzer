import React from 'react';

interface ErrorFixSuggestionsProps {
  errorType: string;
}

const ErrorFixSuggestions: React.FC<ErrorFixSuggestionsProps> = ({ errorType }) => {
  const getSuggestion = (type: string): string => {
    const suggestions: { [key: string]: string } = {
      'Title Doesn\'t Contain Size When Size is Set ': 'Include the product size in the title when the size attribute is set. Use the exact size value or standard size abbreviations (XS, S, M, L, XL) that match your size attribute.',
      
      'Description Contains Missing Spaces After Commas': 'Add a space after each comma in your descriptions. Example: Change "red,blue,green" to "red, blue, green".',
      
      'Title Doesn\'t Contain Color When Color Is Set': 'Ensure the color mentioned in the color attribute appears in the product title. Use the exact same color term from your attribute.',
      
      'Title Contains Duplicate Words': 'Remove redundant words from your title. Example: Change "Nike Air Jordan Jordan Shoes" to "Nike Air Jordan Shoes".',
      
      'Google Product Category Isn\'t Specific Enough': 'Use more specific Google Product Categories with at least three levels. Example: Change "Apparel" to "Apparel > Women\'s Clothing > Dresses".',
      
      'Product Type is not set': 'Add a product type that describes your item\'s category hierarchy. Use the format "Main Category > Subcategory > Product Type".',
      
      'Google Product Category is not set': 'Add a valid Google Product Category from the official Google Product Taxonomy. Ensure it\'s in the format "Category > Subcategory > Product Type".',
      
      'Missing Apparel Attributes': 'For apparel items, always include color, size, gender, and age_group attributes. These are required for proper product categorization.',
       
    'Spelling Mistake in Title': 'Review and correct the spelling in your product title. Consider the suggested corrections provided. Proper nouns (like brand names) and specialized terms might be flagged incorrectly - verify these before making changes.',
    
    'Spelling Mistake in Description': 'Check and correct any misspelled words in your product description. Review the suggested corrections provided. Technical terms, brand names, and product-specific terminology might be flagged - verify these before making changes.',
     
      'Description Contains Repeated Dashes': 'Replace multiple dashes with a single dash or use appropriate punctuation. Change "product--description" to "product-description".',
      
      'Title Contains Special Characters': 'Remove special characters (^, $, @, !, "", \'\') from the title. Use only alphanumeric characters, and basic punctuation.',
      
      'Title Contains Bad Abbreviations': 'Replace abbreviated terms with their full words: "pck" → "pack", "qty" → "quantity", "pc" → "piece", etc.',

      'Google Product Category is Invalid': 'Use the Google product taxonomy format "X > Y > Z" instead of numbered values to specify a valid category.',
      
      'Title Doesn\'t Contain Brand': 'Include the brand name from your brand attribute in the product title.',
            
      'Title Doesn\'t Contain Material': 'Include the material specified in your material attribute in the product title.',
      
      'Title Contains Whitespace At Start Or End': 'Remove any spaces or tabs from the beginning and end of your title.',
      
      'Title Contains Repeated Whitespace': 'Replace multiple spaces with a single space throughout your title.',
      
      'Title Contains Repeated Dashes': 'Replace multiple dashes with a single dash in your title.',
      
      'Title Contains Repeated Commas': 'Replace multiple commas with a single comma in your title.',
      
      'Title Contains Punctuation At Start Or End': 'Remove any punctuation marks from the start and end of your title.',
      
      'Title Contains HTML Tags': 'Remove any HTML tags from your title. Use plain text only.',
      
      'Title Contains HTML Entities': 'Replace HTML entities (&reg;, &copy;, &trade;) with their plain text equivalents or remove them.',
      
      'Title Contains Promotional Words': 'Remove promotional terms like "save", "off", "free shipping", etc. from your title.',
      
      'Title Contains Missing Spaces After Commas': 'Add appropriate spaces between words and after commas in your title.',
      
      'Title Contains Non-Breaking Spaces': 'Replace non-breaking spaces with regular spaces in your title.',
      
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
    <div className="font-bold text-[#17235E] text-[17px] leading-tight">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p>{getSuggestion(errorType)}</p>
      </div>
    </div>
  );
};

export default ErrorFixSuggestions;