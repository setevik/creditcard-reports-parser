
export async function parseExcelFile(file, cardAlias) {
    const XLSX = await import('xlsx');
    const { categorizeExpense } = await import('./categorizer');

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
                    let billingDate = '';

                    for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
                        const row = jsonData[i];
                        const rowStr = row.join(' ').toLowerCase();

                        // Try to extract billing date
                        // Example: "עסקאות לחיוב ב-10/11/2025" or "לחיוב ב-10.02"
                        if (rowStr.includes('חיוב ב-')) {
                            const match = rowStr.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
                            if (match) {
                                billingDate = match[1].replace(/\//g, '.');
                                // Normalize to DD.MM.YYYY
                                const parts = billingDate.split('.');
                                if (parts.length === 3) {
                                    billingDate = `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
                                }
                            } else {
                                // Try DD.MM format (no year) - common in Isracard reports
                                const match2 = rowStr.match(/חיוב ב-(\d{1,2})[./-](\d{1,2})/);
                                if (match2) {
                                    billingDate = `${match2[1].padStart(2, '0')}.${match2[2].padStart(2, '0')}`;
                                }
                            }
                        }

                        if (rowStr.includes('תאריך') && (rowStr.includes('עסקה') || rowStr.includes('רכישה') || rowStr.includes('חיוב'))) {
                            headerRowIndex = i;
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
                        if (header.includes('תאריך') && (header.includes('עסקה') || header.includes('רכישה'))) colMap.date = index;
                        if (header.includes('תאריך') && header.includes('חיוב')) colMap.billingDate = index;
                        if (header.includes('שם בית') && header.includes('עסק')) colMap.vendor = index;
                        if (header.includes('סכום') && header.includes('חיוב')) colMap.amount = index;
                        if (header.includes('מטבע') && header.includes('חיוב')) colMap.currency = index;
                        if (header.includes('ענף') || header.includes('קטגוריה')) colMap.sector = index;
                    });

                    // If billing date has only DD.MM (no year), infer year from first transaction
                    if (billingDate && billingDate.split('.').length === 2) {
                        for (const row of rows) {
                            if (!row || row.length === 0 || colMap.date === undefined) break;
                            const rawDate = row[colMap.date];
                            if (!rawDate) continue;
                            let yearStr = '';
                            if (typeof rawDate === 'number') {
                                const date = XLSX.SSF.parse_date_code(rawDate);
                                yearStr = String(date.y);
                            } else {
                                const parts = rawDate.toString().trim().replace(/\//g, '.').split('.');
                                if (parts.length === 3) yearStr = parts[2];
                            }
                            if (yearStr) {
                                billingDate = `${billingDate}.${yearStr}`;
                                break;
                            }
                        }
                    }

                    const normalizeDate = (raw) => {
                        if (raw === undefined || raw === null || raw === '') return '';
                        if (typeof raw === 'number') {
                            const d = XLSX.SSF.parse_date_code(raw);
                            return `${String(d.d).padStart(2, '0')}.${String(d.m).padStart(2, '0')}.${d.y}`;
                        }
                        const s = raw.toString().trim().replace(/\//g, '.').replace(/-/g, '.');
                        const parts = s.split('.');
                        if (parts.length === 3) {
                            return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[2]}`;
                        }
                        return s;
                    };

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

                        const dateStr = normalizeDate(rawDate);

                        // Prefer per-row billing date column (used by Max) over header-extracted date
                        let rowBillingDate = '';
                        if (colMap.billingDate !== undefined) {
                            rowBillingDate = normalizeDate(row[colMap.billingDate]);
                        }
                        if (!rowBillingDate) rowBillingDate = billingDate;

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
                            transactionDate: dateStr,
                            billingDate: rowBillingDate || dateStr, // Fallback to transaction date if billing date not found
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
