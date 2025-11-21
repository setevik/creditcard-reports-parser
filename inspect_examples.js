const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, 'examples');
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n--- ${file} ---`);
    const workbook = XLSX.readFile(path.join(examplesDir, file));
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n  >>> Sheet: ${sheetName} <<<`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

        // Print first 10 rows to see more context
        data.slice(0, 10).forEach(row => console.log(JSON.stringify(row)));
    });
});
