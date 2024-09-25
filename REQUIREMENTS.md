# Google Shopping Feed Analyzer

## What is the problem or task and why is this important?

### Problem Statement:
Maintaining high-quality product data in shopping feeds is crucial for maximizing visibility, reducing disapproved products, and enhancing overall ad performance. Many businesses rely on external systems to monitor and improve feed quality, but these solutions can be inflexible, costly, or not fully integrated into existing workflows. This project aims to provide an open-source solution that enables users to perform comprehensive quality checks on their shopping feeds, ensuring data accuracy, consistency, and compliance with best practices, without relying on third-party tools.

## Detailed Requirements

We are currently using DTS to move a daily snapshot of our client’s GMC shopping feed into BigQuery. We need to run the following error checks on the post-transformation, post-rule, and post-supplemental-feed product data.

### Development Requirements:
- **Programming Language**: The program should be written in TypeScript.
- **Error Checks**: Implement the following checks as part of the QA process:

  - **Title doesn't contain size when size is set**: 
    If the size attribute is non-blank, is a “size word” present in the title?
    - Examples: `XS`, `S`, `M`, `L`, `XL`, `small`, `medium`, `large`
  
  - **Description contains missing spaces like `word,word`**: 
    Look for strings that have a comma followed by any non-space character.
  
  - **Title doesn't contain color when color is set**: 
    If the color attribute is non-blank, is a “color word” present in the title? Just check for the same word in the attribute.

  - **Title contains duplicate words**: 
    Example: "Nike Air Jordan Jordan Shoes" - Check for any repeated word/token.

  - **Google Product Category isn't specific enough**: 
    Check for the presence of at least two `>` symbols in the Google Product Category (GPC) value.

  - **Product Type isn't set**: 
    Check for blanks in this field.

  - **Google Product Category isn't set**: 
    Check for blanks in this field.

  - **Google Product Category contains “Apparel”, but color, size, gender, or age_group are missing**: 
    Look for non-empty values of color, size, gender, and age_group when the GPC is any apparel-related value.

  - **Description contains repeated dashes**: 
    Check for “--” or “- -”.

  - **Spelling mistake in title**: 
    Flag if a word has a valid spelling correction.

  - **Product Title contains abbreviations like `pck` instead of `pack`**: 
    Bad abbreviations to check for: `pck`, `pkg`, `qty`, `qt`, `pc`, `pcs`, `ea`, `in.`, `ft`.

  - **Google Product Category isn't valid**: 
    The GPC value isn’t found in the [Google product taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt). We only use the “X > Y > Z” styled values.

  - **Product Title contains bad characters**: 
    Look for characters like `^`, `$`, `@`, `!`, `"", ''`.

  - **Product Title doesn't contain brand**: 
    Check for the value of the “brand” attribute and whether it's present in the title.

  - **Product Title contains whitespace at start or end**: 
    Look for whitespace characters at the start or end of the title.

  - **Product Description too long**: 
    Check if the description exceeds 5000 characters.

  - **Duplicate IDs across feed**: 
    Check for multiple entries of the same `item_id` in the feed.

  - **Id isn't set**: 
    Check if the `id` field is blank/empty.

  - **Image_link isn't set**: 
    Check if the `image_link` field is blank/empty.

  - **Price isn't set**: 
    Check if the `price` field is blank/empty.

  - **GTIN length is incorrect**: 
    GTIN must have 8, 12, 13, or 14 characters. For bonus points, check for valid check digits.

  - **Gender mismatch**: 
    Check for any mismatch between gender in the title and gender attribute value.

  - **Age_group mismatch**: 
    Check for age group mismatches in the title and age_group attribute values.

  - **Monitored Pharmacy Word**: 
    Check for any unapproved pharmaceutical or supplement terms in title or description.

  - **Product Title contains HTML**: 
    Look for any HTML tags or entities in the title.

  - **Product Title contains promotional words**: 
    Look for promotional terms like "save," "off," "free shipping," etc.

  - **Product Title contains nonbreaking spaces**: 
    Use regex to find nonbreaking spaces.

  - **Product type contains whitespace at start or end**: 
    Check for leading or trailing whitespace.

  - **GTIN isn't valid**: 
    GTIN isn’t found in the provided [Google product taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt).

  - **Other checks**: 
    Various other error checks related to product type, price, brand, etc.

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
- 
- 

## Testing Strategy
- **Unit Testing**: Test each error check individually to ensure accuracy and consistency.
- **User Acceptance Testing (UAT)**: Create test cases that cover the most common and critical error scenarios, allowing stakeholders to review and approve.

## Resources Needed
- Example Shopping Feeds

## Additional Information
- This solution should be scalable to handle large data volumes efficiently.
- Consider any potential updates or changes to Google’s product feed requirements, as they may necessitate adjustments to the error checks.
- Ensure robust logging for easier troubleshooting and maintenance.
