/**
 * File Copy Script
 *
 * This script ensures that necessary files and directories are copied from the `src` directory to the `dist` directory for use in production.
 * It is designed to handle both files and directories, creating the destination structure if it does not exist.
 *
 * Key Functionalities:
 * - **Directory Recursion:** Recursively copies all files and subdirectories from a source directory to a destination directory.
 * - **Error Handling:** Checks for the existence of source directories and creates destination directories as needed.
 * - **Production Preparation:** Specifically targets directories like `src/dictionaries` and `src/.cache` that need to be available in the production build.
 *
 * Features:
 * - Copies files using `fs.copyFileSync`.
 * - Handles directory creation with `fs.mkdirSync` and ensures the entire directory structure is maintained.
 * - Logs the progress of the copying process for transparency and debugging.
 *
 * Configuration:
 * - The `directories` array contains the source and destination mappings relative to the project root.
 *
 * Usage:
 * - Run this script as part of your build process to ensure that production files are properly prepared.
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copies files and directories from a source to a destination.
 * @param {string} src - Source directory path.
 * @param {string} dest - Destination directory path.
 */
function copyDir(src, dest) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read all files and directories in the source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Recursively copy subdirectories
            copyDir(srcPath, destPath);
        } else {
            // Copy individual files
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath} -> ${destPath}`);
        }
    }
}

// Define directories to copy
const directories = [
    {
        src: 'src/dictionaries',
        dest: 'dist/dictionaries'
    },
    {
        src: 'src/.cache',
        dest: 'dist/.cache'
    }
];

console.log('Starting file copy process...');

// Iterate over directories and copy them
directories.forEach(({ src, dest }) => {
    const srcPath = path.resolve(__dirname, '..', src);
    const destPath = path.resolve(__dirname, '..', dest);

    if (fs.existsSync(srcPath)) {
        console.log(`\nCopying ${src} to ${dest}...`);
        copyDir(srcPath, destPath);
    } else {
        console.log(`\nSource directory does not exist: ${src}`);
    }
});

console.log('\nFile copy process completed!');
