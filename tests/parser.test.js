import { describe, it, expect } from 'vitest';
import { parseExcelFile } from '../src/utils/parser';
import fs from 'fs';
import path from 'path';

// Mock FileReader since we are in Node environment for tests
class MockFileReader {
    readAsArrayBuffer(buffer) {
        this.onload({ target: { result: buffer } });
    }
}
global.FileReader = MockFileReader;

describe('Parser Logic', () => {
    it('should parse standard format (Isracard/Visa)', async () => {
        const filePath = path.join(__dirname, '../examples/פירוט חיובים לכרטיס ויזה 3234 - 15.11.25.xlsx');
        const buffer = fs.readFileSync(filePath);

        // We need to pass a Blob-like object or just the buffer if our parser supports it.
        // The parser expects a File object which has arrayBuffer() or we use FileReader.
        // In the implementation, we use FileReader.readAsArrayBuffer(file).
        // So we can pass the buffer directly if we mock FileReader to handle it.

        const transactions = await parseExcelFile(buffer, 'Visa 3234');

        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions[0]).toHaveProperty('vendor');
        expect(transactions[0]).toHaveProperty('amount');
        expect(transactions[0]).toHaveProperty('date');
        expect(transactions[0].cardAlias).toBe('Visa 3234');
    });

    it('should parse multi-sheet format (Max)', async () => {
        const filePath = path.join(__dirname, '../examples/transaction-details_export_1763743625279.xlsx');
        const buffer = fs.readFileSync(filePath);

        const transactions = await parseExcelFile(buffer, 'Max Card');

        expect(transactions.length).toBeGreaterThan(0);

        // Check for foreign currency transaction from the second sheet
        const foreignTx = transactions.find(t => t.vendor.includes('SMARTWINGS'));
        expect(foreignTx).toBeDefined();
        expect(foreignTx.amount).toBeGreaterThan(0);
    });
});
