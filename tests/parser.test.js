import { describe, it, expect } from 'vitest';
import { parseExcelFile } from '../src/utils/parser';
import * as XLSX from 'xlsx';

// Mock FileReader since we are in Node environment for tests
class MockFileReader {
    readAsArrayBuffer(buffer) {
        this.onload({ target: { result: buffer } });
    }
}
global.FileReader = MockFileReader;

describe('Parser Logic', () => {
    it('should parse standard format (Isracard/Visa)', async () => {
        // Create a mock standard Excel file
        const data = [
            ["שם כרטיס", "Visa 3234"],
            ["עסקאות לחיוב ב-15/11/2025"],
            [],
            ["תאריך עסקה", "שם בית העסק", "סכום חיוב", "מטבע חיוב", "ענף"],
            ["01/11/2025", "SUPERMARKET", "150.00", "₪", "Food"],
            ["02/11/2025", "GAS STATION", "200.00", "₪", "Transport"]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const transactions = await parseExcelFile(buffer, 'Visa 3234');

        expect(transactions.length).toBe(2);
        expect(transactions[0].vendor).toBe('SUPERMARKET');
        expect(transactions[0].amount).toBe(150);
        expect(transactions[0].currency).toBe('₪');
        expect(transactions[0].transactionDate).toBe('01.11.2025');
        expect(transactions[0].billingDate).toBe('15.11.2025');
        expect(transactions[0].cardAlias).toBe('Visa 3234');
    });

    it('should parse multi-sheet format (Max)', async () => {
        // Create a mock Max Excel file with two sheets
        const sheet1Data = [
            ["עסקאות לחיוב ב-10/11/2025"],
            ["תאריך עסקה", "שם בית העסק", "סכום חיוב", "מטבע חיוב", "ענף"],
            ["05/11/2025", "LOCAL STORE", "50.00", "₪", "Shopping"]
        ];

        const sheet2Data = [
            ["עסקאות מט\"ח"],
            ["תאריך עסקה", "שם בית העסק", "סכום חיוב", "מטבע חיוב", "ענף"],
            ["06/11/2025", "FOREIGN AIRLINE", "300.00", "$", "Travel"]
        ];

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
        const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

        XLSX.utils.book_append_sheet(wb, ws1, "Domestic");
        XLSX.utils.book_append_sheet(wb, ws2, "International");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const transactions = await parseExcelFile(buffer, 'Max Card');

        expect(transactions.length).toBe(2);

        const localTx = transactions.find(t => t.vendor === 'LOCAL STORE');
        expect(localTx).toBeDefined();
        expect(localTx.amount).toBe(50);
        expect(localTx.currency).toBe('₪');
        expect(localTx.billingDate).toBe('10.11.2025');

        const foreignTx = transactions.find(t => t.vendor === 'FOREIGN AIRLINE');
        expect(foreignTx).toBeDefined();
        expect(foreignTx.amount).toBe(300);
        expect(foreignTx.currency).toBe('$');
    });
});
