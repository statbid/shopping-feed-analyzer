/**
 * Directory Creation Script
 *
 * This script ensures that essential directories required for production are created in the `dist` directory.
 * It checks for the existence of specific directories and creates them if they do not already exist.
 *
 * Key Functionalities:
 * - **Directory Validation:** Checks if each specified directory exists.
 * - **Directory Creation:** Creates missing directories, including all necessary parent directories, using `fs.mkdirSync`.
 * - **Logging:** Outputs a log message for each directory that is created, aiding in debugging and process transparency.
 *
 * Features:
 * - Ensures production readiness by creating directories like `dist/dictionaries`, `dist/.cache`, and `dist/uploads`.
 * - Handles nested directory structures with the `{ recursive: true }` option in `fs.mkdirSync`.
 *
 * Usage:
 * - Run this script as part of your build process to set up the required directory structure for production.
 */

const fs = require('fs');
const path = require('path');

// List of directories to validate and create
const dirs = [
  'dist/dictionaries',
  'dist/.cache',
  'dist/uploads'
];

// Iterate over each directory in the list
dirs.forEach(dir => {
  // Resolve the full path for the directory
  const fullPath = path.join(__dirname, '..', dir);

  // Check if the directory exists
  if (!fs.existsSync(fullPath)) {
    // Create the directory (including any necessary parent directories)
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});
