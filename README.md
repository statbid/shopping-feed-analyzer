# Google Shopping Feed Analyzer

The **Google Shopping Feed Analyzer** is an open-source tool that we aim to develop to help e-commerce businesses ensure their product data feeds are optimized for Google Shopping campaigns. This tool will provide in-depth analysis of product data, checking for common issues like missing attributes, incorrect formatting, and spelling mistakes. By identifying these issues, we aspire to enable merchants to maintain high-quality feeds, resulting in improved ad performance, increased visibility, and more profitable campaigns.

## About StatBid

Since 2015, StatBid has focused on helping merchants grow their profit through search. We are passionate about building community and fostering peer learning, believing that cooperation and shared growth benefit everyone. By sharing this project publicly, we aim to contribute to the collective knowledge of the industry, reduce wasted ad spend, and improve productivity.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Error Checks](#error-checks)
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

### Server Configuration

- **Default port**: 3001 (configurable in `server/src/app.ts`)
- **Upload directory**: `server/uploads/`
- **Cache directory**: `server/.cache/`

### Client Configuration

- **Default port**: 3000
- **API endpoint**: `http://localhost:3001` (configurable in environment variables)

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

## File Structure

```plaintext
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

## Error Checks

The analyzer includes a variety of checks across different categories:

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

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests to help improve this tool. Together, we can build a solution that provides even greater value for the e-commerce and digital marketing community.

## License

This project is licensed under the Apache License 2.0, which means you are free to use, modify, and distribute the code with attribution. For more details, please refer to the [LICENSE](LICENSE) file in this repository.