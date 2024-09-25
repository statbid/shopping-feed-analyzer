# Google Shopping Feed Analyzer

## What is the problem or task and why is this important?

### Problem Statement:
Maintaining high-quality product data in shopping feeds is crucial for maximizing visibility, reducing disapproved products, and enhancing overall ad performance. Many businesses rely on external systems to monitor and improve feed quality, but these solutions can be inflexible, costly, or not fully integrated into existing workflows. This project aims to provide an open-source solution that enables users to perform comprehensive quality checks on their shopping feeds, ensuring data accuracy, consistency, and compliance with best practices, without relying on third-party tools.

## Detailed Requirements
- **Programming Language**: The program should be written in TypeScript.
### Error Checks: Implement the following checks as part of the QA process

- **Title doesn't contain size when size is set**  
  If the size attribute is non-blank, is a “size word” present in the title?  
  XS, S, M, L, XL, small, medium, large

- **Description contains missing spaces like `word,word`**  
  Look for strings that have a comma followed by any non-space character.

- **Title doesn't contain color when color is set**  
  If the color attribute is non-blank, is a “color word” present in the title?  
  Just check for the same word in the attribute.

- **Title contains duplicate words like Nike Air Jordan Jordan Shoes**  
  Check for any repeated word/token.

- **Google Product Category isn't specific enough**  
  There are a few ways to do this - I’d probably check for the presence of at least two `>` symbols in the GPC value.

- **Product Type isn't set**  
  Just checking for blanks in this field.

- **Google Product Category isn't set**  
  Just checking for blanks in this field.

- **Google Product Category contains “Apparel”, but color, size, gender, or age_group are missing**  
  Looking for non-empty values of color, size, gender, and age_group when the GPC is any Apparel-related value.

- **Description contains repeated dashes**  
  Check for “--” or “- -”.

- **Spelling mistake in title**  
  Only flag if a word has a valid spelling correction.

- **Spelling mistake in description**  
  Only flag if a word has a valid spelling correction.

- **Product Title contains abbreviations like `pck` instead of `pack`**  
  Bad abbreviations to check for: `pck`, `pkg`, `qty`, `qt`, `pc`, `pcs`, `ea`, `in.`, `ft`

- **Google Product Category isn't valid**  
  GPC value isn’t found in [Google's product taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt).  
  We don’t want the numbered version - just the “X > Y > Z” styled values.

- **Product Title contains bad characters like: ^, $, @, !, "", ''**  
  Check for any special characters.

- **Product Title doesn't contain brand**  
  Look for the value of the “brand” attribute, and check for that word in the title.

- **Product Title doesn't contain material when material is set**  
  Look for the value of the “material” attribute, and check for that word in the title.

- **Product Title contains whitespace at start or end**  
  Look for any whitespace character at the start and end of the title value.

- **Product Title contains repeated whitespace**  
  Look for any repeated whitespace character in the title value.

- **Product Title contains repeated dashes**  
  Look for any repeated dash in the title value.

- **Product Title contains repeated commas**  
  Look for any repeated comma in the title value.

- **Product Title contains punctuation at start or end**  
  Look for any punctuation marks (!,.?:;) at the start or end of the title value.

- **Product Title contains HTML**  
  Look for any angle brackets `<>` in the title value.

- **Product Title contains HTML entities (&reg, &copy, &trade)**  
  Look for any HTML entities in the title value.  
  Complete list of HTML entities - [FreeFormatter.com](https://www.freeformatter.com/html-entities.html)

- **Product Title contains promotional words (save, off, free shipping, best seller, 30% off, buy one get one, open box)**  
  Look for any of the listed phrases in the title value:  
  Save, Off, Free shipping, Best seller, % off, Buy, Open box, clearance

- **Product Title contains missing spaces like `word,word`**  
  Might be difficult, if there isn’t a library function you can use.  
  Perhaps run a “decompounding” function, where you check a string that fails to match a dictionary value to see if any different two-part splits of the string match two dictionary values?

- **Product Title contains non breaking spaces**  
  Use regex to find non breaking spaces in the title value.  
  [Find non-breaking space with regular expression](https://community.adobe.com/t5/framemaker-discussions/find-non-breaking-space-with-regular-expression/td-p/12361052)

- **Product Description contains whitespace at start or end**  
  Look for any whitespace character at the start and end of the description value.

- **Product Description contains repeated whitespace**  
  Look for any repeated whitespace character in the description value.

- **Product Description contains repeated commas**  
  Look for any repeated comma in the description value.

- **Product Description contains HTML**  
  Look for any angle brackets `<>` in the description value.

- **Product Description contains HTML entities (&reg, &copy, &trade)**  
  Look for any HTML entities in the description value.  
  Complete list of HTML entities - [FreeFormatter.com](https://www.freeformatter.com/html-entities.html)

- **Product Description too long**  
  Check to see if the description value is over 5000 characters.

- **Product Description contains nonbreaking spaces**  
  Use regex to find nonbreaking spaces in the description value.  
  [Find non-breaking space with regular expression](https://community.adobe.com/t5/framemaker-discussions/find-non-breaking-space-with-regular-expression/td-p/12361052)

- **Duplicate Ids across Feed**  
  Does the `item_id` (also referred to as `id` or `product_id`) have multiple entries in the feed?

- **Id too long**  
  Check to see if `id` is over 50 characters.

- **Id isn't set**  
  Check to see if `id` is blank/empty.

- **Link isn't set**  
  Check to see if `link` is blank/empty.

- **Image_link isn't set**  
  Check to see if `image_link` is blank/empty.

- **Availability isn't set**  
  Check to see if Availability is blank/empty.

- **Price isn't set**  
  Check to see if Price is blank/empty.

- **Brand isn't set**  
  Check to see if Brand is blank/empty.

- **Condition isn't set**  
  Check to see if Condition is blank/empty.

- **Image Link contains commas**  
  Check to see if any comma characters are present in `image_link` value.

- **Product types contain words like "clearance" and "sale"**  
  Check to see if `product_type` values contain promotional words:  
  Clearance, Sale, Save, Open box

- **Product type contains commas**  
  Check to see if `product_type` contains commas.

- **Product type contains repeated tiers**  
  Check to see if `product_type` repeats any strings between angle brackets.  
  Good product type: X > Y > Z  
  Bad product type: X > X > Z

- **Product type contains whitespace at start or end**  
  Check for whitespace characters at start or end of `product_type` value.

- **Product type contains repeated whitespace**  
  Check for repeated whitespace characters in `product_type` value.

- **Product type contains > at start or end**  
  Check for presence of angle brackets at start or end of `product_type` value.

- **GTIN length is incorrect**  
  Do not return this error if value is null, that’s fine.  
  Correct values have 8, 12, 13, or 14 characters.  
  For bonus points, check them for valid check digits (UPC, EAN, JAN, and ISBN formats).

- **Gender mismatch - women's or girl's is in the title and gender is male**  
  Check for any of these combinations:  
  “Female”, “Women”, “woman”, or “girl” in title value and “male” in gender attribute value.  
  “Male”, “men”, “man”, “boy” in title value and “female” in gender attribute value.

- **Age_group mismatch - kids or toddler is the title and age_group is equal to adult**  
  Check for any of these combinations:  
  “Kid”, “toddler”, “infant”, “baby”, or “newborn” in title value and age_group value is “adult”  
  “Adult”, “men”, or “Women” in title value and age_group value is any of “newborn”, “infant”, “toddler”, or “kids”

- **Monitored Pharmacy Word**  
  Check for any of the following phrases in title or description values:  
  Everything in these lists: [Unapproved pharmaceuticals and supplements - Advertising Policies Help](https://support.google.com/adspolicy/answer/176031)

- **Disapproved Pharmacy Word**  
  Remove this item from the report, redundant with Monitored Pharmacy Word.

- **Disapproved Pharmacy Word Category**  
  Remove this item from the report, redundant with Monitored Pharmacy Word.


## Inputs
- A simple web interface should be created to upload a CSV shopping feed (see example).

## Outputs
- The system should provide counts and types of each error.
- Allow exports/downloads for each error case, providing either a full product record or `item_id` + relevant fields for that error.
- Include options for exporting in common formats such as CSV.

## Stakeholder Acceptance Criteria
- The system accurately replicates all error checks currently performed by the Feedonomics FeedQA report.
- Users can easily download/export detailed error cases with relevant product information.
- The solution must handle large product catalogs without significant performance issues (several hundred thousand rows).

## Task Completion Criteria
- All listed error checks are implemented, tested, and verified.
- Stakeholders can access, download, and review error reports with no critical bugs.
- User acceptance testing is complete, with stakeholders signing off on functionality.
- The code is documented, and a README file is developed according to our standards for maintainability.

## Dependencies
- Dependent on correctly formed shopping feeds

## Testing Strategy
- **Unit Testing**: Test each error check individually to ensure accuracy and consistency.
- **User Acceptance Testing (UAT)**: Create test cases that cover the most common and critical error scenarios, allowing stakeholders to review and approve.

## Resources Needed
- Example Shopping Feeds

## Additional Information
- This solution should be scalable to handle large data volumes efficiently.
- Consider any potential updates or changes to Google’s product feed requirements, as they may necessitate adjustments to the error checks.
- Ensure robust logging for easier troubleshooting and maintenance.
