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
            ["שם כרטיס", "Visa XXXX"],
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

        const transactions = await parseExcelFile(buffer, 'Visa XXXX');

        expect(transactions.length).toBe(2);
        expect(transactions[0].vendor).toBe('SUPERMARKET');
        expect(transactions[0].amount).toBe(150);
        expect(transactions[0].currency).toBe('₪');
        expect(transactions[0].transactionDate).toBe('01.11.2025');
        expect(transactions[0].billingDate).toBe('15.11.2025');
        expect(transactions[0].cardAlias).toBe('Visa XXXX');
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

    it('should parse Max format with per-row billing date column (תאריך חיוב)', async () => {
        // New Max format has no "לחיוב ב-" text - billing date is a per-row column
        const data = [
            ["כל המשתמשים (1)"],
            ["XXXX-max executive"],
            ["04/2026"],
            ["תאריך עסקה", "שם בית העסק", "קטגוריה", "סוג עסקה", "4 ספרות אחרונות", "סכום עסקה", "מטבע עסקה", "סכום חיוב", "מטבע חיוב", "תאריך חיוב"],
            ["10-03-2026", "מאפה לדוגמה", "מזון וצריכה", "רגילה", "XXXX", 26, "₪", 26, "₪", "10-04-2026"],
            ["15-03-2026", "מאפה לדוגמה", "מזון וצריכה", "רגילה", "XXXX", 20, "₪", 20, "₪", "10-04-2026"],
            ["16-03-2026", "מאפה לדוגמה", "מזון וצריכה", "רגילה", "XXXX", 20, "₪", 20, "₪", "10-04-2026"],
            ["25-03-2026", "חנות לדוגמה", "שונות", "רגילה", "XXXX", 73, "₪", 73, "₪", "10-04-2026"],
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const transactions = await parseExcelFile(buffer, 'Max');

        expect(transactions.length).toBe(4);

        // All transactions share the same billing date from the per-row column
        transactions.forEach(t => {
            expect(t.billingDate).toBe('10.04.2026');
        });

        // Transaction dates preserved separately
        const first = transactions.find(t => t.transactionDate === '10.03.2026');
        expect(first).toBeDefined();
        expect(first.vendor).toBe('מאפה לדוגמה');
        expect(first.amount).toBe(26);
    });

    it('should parse Isracard format (תאריך רכישה header, DD.MM billing date)', async () => {
        // Isracard uses "תאריך רכישה" instead of "תאריך עסקה" and
        // billing date without year: "לחיוב ב-10.02"
        const data = [
            [],
            ["פירוט עסקאות", null, "פברואר 2026"],
            [],
            [],
            ["פלטינה מסטרקארד - XXXX", null, null, null, null, null, null, "₪ 500.00"],
            ["על שם ישראל ישראלי", null, null, null, null, null, null, "לחיוב ב-10.02"],
            ["", "", "", "", "", "", "", ""],
            [],
            ["עסקאות למועד חיוב"],
            ["תאריך רכישה", "שם בית עסק", "סכום עסקה", "מטבע עסקה", "סכום חיוב", "מטבע חיוב", "מס' שובר", "פירוט נוסף"],
            ["05.02.26", "CLAUDE.AI SUBSCRIPTION", 82.24, "$", 257, "₪", "000000001", "אתר חו\"ל"],
            ["02.02.26", "WOLT", 178.77, "₪", 178.77, "₪", "000000002", ""],
            ["27.01.26", "מאפה לדוגמה", 10, "₪", 10, "₪", "000000003", ""],
            ["", "סה\"כ לחיוב החודש בכרטיס בש\"ח", "", "", 445.77, "₪", "", ""],
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "פירוט עסקאות");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const transactions = await parseExcelFile(buffer, 'Isracard XXXX');

        expect(transactions.length).toBe(3);

        // Billing date should have year inferred from first transaction
        expect(transactions[0].billingDate).toBe('10.02.26');

        // Verify all transactions got the same billing date
        transactions.forEach(t => {
            expect(t.billingDate).toBe('10.02.26');
            expect(t.cardAlias).toBe('Isracard XXXX');
        });

        // Verify individual transactions
        const claude = transactions.find(t => t.vendor.includes('CLAUDE'));
        expect(claude).toBeDefined();
        expect(claude.amount).toBe(257);
        expect(claude.currency).toBe('₪');
        expect(claude.transactionDate).toBe('05.02.26');

        const wolt = transactions.find(t => t.vendor === 'WOLT');
        expect(wolt).toBeDefined();
        expect(wolt.amount).toBe(178.77);

        const bakery = transactions.find(t => t.vendor.includes('מאפה'));
        expect(bakery).toBeDefined();
        expect(bakery.amount).toBe(10);

        // Summary row should NOT be parsed as a transaction
        const summary = transactions.find(t => t.vendor.includes('סה"כ'));
        expect(summary).toBeUndefined();
    });
});
