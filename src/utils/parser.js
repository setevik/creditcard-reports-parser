import * as XLSX from 'xlsx';
import { categorizeExpense } from './categorizer';

export async function parseExcelFile(file, cardAlias) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let allTransactions = [];

                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    if (jsonData.length === 0) return;

                    // Identify format and header row
                    let headerRowIndex = -1;
                    let format = 'unknown';

                    for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
                        const row = jsonData[i];
                        const rowStr = row.join(' ').toLowerCase();

                        if (rowStr.includes('תאריך') && (rowStr.includes('עסקה') || rowStr.includes('חיוב'))) {
                            headerRowIndex = i;
                            if (row.includes('מטבע חיוב')) {
                                format = 'max'; // Max/Leumi style
                            } else {
                                format = 'standard'; // Isracard/Amex/Visa style
                            }
                            break;
                        }
                    }

                    if (headerRowIndex === -1) return;

                    const headers = jsonData[headerRowIndex];
                    const rows = jsonData.slice(headerRowIndex + 1);

                    // Find column indices
                    const colMap = {};
                    headers.forEach((h, index) => {
                        if (!h) return;
                        const header = h.toString().replace(/\r\n/g, '\n').trim();
                        if (header.includes('תאריך') && header.includes('עסקה')) colMap.date = index;
                        if (header.includes('שם בית') && header.includes('עסק')) colMap.vendor = index;
                        if (header.includes('סכום') && header.includes('חיוב')) colMap.amount = index;
                        if (header.includes('מטבע') && header.includes('חיוב')) colMap.currency = index;
                        if (header.includes('ענף')) colMap.sector = index;
                    });

                    rows.forEach(row => {
                        if (!row || row.length === 0) return;

                        // Basic validation - must have date and amount
                        if (colMap.date === undefined || colMap.amount === undefined) return;

                        const rawDate = row[colMap.date];
                        const vendor = row[colMap.vendor];
                        const amount = row[colMap.amount];
                        const currency = colMap.currency !== undefined ? row[colMap.currency] : '₪';
                        const sector = colMap.sector !== undefined ? row[colMap.sector] : '';

                        if (!rawDate || !amount) return;

                        // Parse date (Excel serial date or string)
                        let dateStr = '';
                        if (typeof rawDate === 'number') {
                            const date = XLSX.SSF.parse_date_code(rawDate);
                            dateStr = `${date.d}/${date.m}/${date.y}`;
                        } else {
                            dateStr = rawDate.toString().trim();
                        }

                        // Clean amount
                        let cleanAmount = amount;
                        if (typeof amount === 'string') {
                            cleanAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
                        }

                        if (isNaN(cleanAmount)) return;

                        const category = categorizeExpense(vendor, sector);

                        allTransactions.push({
                            vendor: vendor || 'Unknown',
                            amount: cleanAmount,
                            currency: currency || '₪',
                            date: dateStr,
                            cardAlias: cardAlias,
                            category: category,
                            originalRow: row
                        });
                    });
                });

                resolve(allTransactions);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
