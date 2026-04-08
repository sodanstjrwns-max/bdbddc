#!/usr/bin/env node
// Complete self-contained script: generates data + HTML for all 12 implant pages
const fs = require('fs');
const path = require('path');

// Read the data from the separate data file
const dataFile = path.join(__dirname, 'implant-data-v3.json');
if (!fs.existsSync(dataFile)) {
  console.error('Data file not found:', dataFile);
  console.error('Please run: node scripts/create-data.cjs first');
  process.exit(1);
}
const { implantTypes, allCards } = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
console.log('Loaded', implantTypes.length, 'implant types');

// Now read and run the HTML generator
require('./generate-html-v3.cjs')(implantTypes, allCards);
