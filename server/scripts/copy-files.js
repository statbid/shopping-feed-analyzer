const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read all files in source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Recursively copy directories
            copyDir(srcPath, destPath);
        } else {
            // Copy files
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath} -> ${destPath}`);
        }
    }
}

// Paths relative to project root
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

console.log('Starting file copy...');

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

console.log('\nFile copy completed!');