# Google Shopping Feed Analyzer

The **Google Shopping Feed Analyzer** is an open-source tool designed to help e-commerce businesses optimize their product data feeds for Google Shopping campaigns. This tool performs in-depth analysis of product data, identifying issues like missing attributes, incorrect formatting, and spelling mistakes. With this tool, merchants can improve feed quality, resulting in enhanced ad performance, increased visibility, and more profitable campaigns.

## About StatBid

Since 2015, StatBid has been committed to helping merchants grow their profits through search. We are passionate about building community and fostering peer learning, believing that shared growth benefits everyone. By sharing this project publicly, we aim to contribute to the collective knowledge of the industry, reduce wasted ad spend, and improve productivity.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Search Terms Analysis](#search-terms-analysis)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Analysis Features](#analysis-features)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Feed Analysis**: Validates product data against Google Shopping best practices.
- **Multiple Check Categories**:
  - Title validation and optimization
  - Description quality checks
  - Category and product type validation
  - Required fields verification
  - Attribute consistency checks
  - Content compliance monitoring
  - Spelling and grammar validation
- **Search Terms Analysis**:
  - Attribute-based term generation
  - Description-based term extraction
  - Google Ads search volume estimation
  - Competition metrics analysis
  - Batch processing with quota management
- **Progress Tracking**: Monitor analysis progress with a visual interface.
- **Detailed Error Reporting**: Get comprehensive reports with specific error details and suggestions.
- **Export Capabilities**: Download analysis results in CSV format.
- **Scalable Architecture**: Handles large product catalogs efficiently using worker threads.
- **User-friendly Interface**: Modern, intuitive UI with clear error presentations.

## Prerequisites

- **Node.js** (v14.0 or higher)
- **npm** or **yarn** package manager
- **TypeScript** 4.5+

Ensure that you have these installed before proceeding.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/statbid/shopping-feed-analyzer
   ```

2. **Install dependencies**:

   For the server:

   ```bash
   cd server
   npm install
   ```

   For the client:

   ```bash
   cd ../client
   npm install
   ```

## Configuration

### Default Values

If no `.env` file is present, the application will use these defaults:

   ```bash
   PORT=3001
   HOST=localhost
   MAX_FILE_SIZE=500mb
   ```

### Google Ads API Configuration

For search volume estimation features, configure the following environment variables in your `.env` file:

   ```bash
   GOOGLE_ADS_CLIENT_ID=your_client_id
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
   GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
   GOOGLE_ADS_CUSTOMER_ACCOUNT_ID=your_account_id
   GOOGLE_ADS_DAILY_QUOTA=10000  # Optional, defaults to 10000
   ```

## Running the Application

To start the server:

   ```bash
   cd server
   npm run dev
   ```

To start the client:

   ```bash
   cd client
   npm start
   ```

Access the application at `http://localhost:3000`.

## Usage

1. **Upload Feed File**:
   - Click the "Upload File" button.
   - Select a CSV/TSV file or drag and drop.
   - Supports ZIP files containing CSV/TSV files.

2. **Select Quality Checks**:
   - Choose which checks to run, organized by category for easy selection.

3. **Run Analysis**:
   - Click "Run Analysis" to start.
   - Monitor progress in real-time.
   - View results in a detailed breakdown.

4. **Review Results**:
   - See error counts and types.
   - Access detailed error information.
   - Get suggestions for fixes.

5. **Export Results**:
   - Download full analysis report.
   - Export specific error types in CSV format.

## Search Terms Analysis

The Search Terms Analyzer helps discover potential search terms from your product data:

1. **Generate Search Terms**:
   - Click "Search Terms Analysis" after uploading your feed.
   - Terms are generated using two methods:
     - Attribute-based: Combines product attributes intelligently.
     - Description-based: Extracts relevant phrases from descriptions.

2. **Search Volume Estimation**:
   - Enable search volume estimation in settings.
   - Monitor API quota usage.
   - View monthly search volume estimates.
   - Access competition metrics and bid ranges.
   - Track daily API usage with quota management.

3. **Filter and Analyze**:
   - Filter terms by volume, pattern, or text.
   - View matching products for each term.
   - See detailed keyword metrics including:
     - Monthly search volume
     - Competition level
     - Competition index
     - Suggested bid ranges.

4. **Export Options**:
   - Download complete analysis with metrics.
   - Export filtered results.
   - Include volume and competition data.

## Architecture

### Client

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Architecture**: Component-based
- **State Management**: React hooks

### Server

- **Framework**: Node.js with Express
- **Language**: TypeScript for type safety
- **Concurrency**: Worker threads for parallel processing
- **Efficiency**: Streaming for efficient file handling

### Integration

- **Google Ads API**: For search volume and competition metrics
- **Caching**: Local cache for API responses


## File Structure

   ```
   ├── client/
   │   ├── src/
   │   │   ├── components/
   │   │   ├── utils/
   │   │   └── App.tsx
   │   └── package.json
   ├── server/
   │   ├── src/
   │   │   ├── errorCheckers/
   │   │   ├── utils/
   │   │   ├── worker.ts
   │   │   └── app.ts
   │   └── package.json
   └── README.md
   ```

## Analysis Features

### Feed Analysis

- **Title Checks**:
  - Size and color presence
  - Duplicate words
  - Special characters
  - Brand presence
  - Format validation

- **Description Checks**:
  - Length validation
  - Format consistency
  - HTML validation
  - Spacing checks

- **Category & Type Checks**:
  - Google taxonomy validation
  - Product type hierarchy
  - Required attributes

- **Required Fields**:
  - Essential attribute presence
  - Format validation
  - Link verification

- **Attribute Validation**:
  - Gender consistency
  - Age group validation
  - GTIN format
  - Shipping weight

- **Content Compliance**:
  - Prohibited content
  - Promotional text
  - HTML entities

### Search Terms Analysis

- **Attribute-Based Generation**:
  - Smart attribute combination
  - Category-aware term creation
  - Pattern identification

- **Description-Based Extraction**:
  - Natural language processing
  - Relevant phrase extraction
  - Product context awareness

- **Search Metrics**:
  - Monthly search volume
  - Competition analysis
  - Bid range estimation
  - Historical data tracking

## Contributing

We welcome contributions! Please submit issues, feature requests, or pull requests to help improve this tool. Together, we can build a solution that provides even greater value for the e-commerce and digital marketing community.

## License

This project is licensed under the Apache License 2.0. For more details, please refer to the [LICENSE](LICENSE) file in this repository.
