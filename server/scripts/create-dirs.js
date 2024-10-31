const fs = require('fs');
const path = require('path');

const dirs = [
  'dist/dictionaries',
  'dist/.cache',
  'dist/uploads'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});