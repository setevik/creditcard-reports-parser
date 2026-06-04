import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSavedAliases, saveAliases, clearAliases } from '../src/utils/cardAliases';

function createLocalStorageMock() {
    let store = {};
    return {
        getItem: vi.fn((key) => (key in store ? store[key] : null)),
        setItem: vi.fn((key, value) => { store[key] = String(value); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
}

describe('Card Alias Storage', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', createLocalStorageMock());
    });

    it('returns an empty array when nothing is stored', () => {
        expect(getSavedAliases()).toEqual([]);
    });

    it('saves and retrieves aliases with most recent first', () => {
        saveAliases(['Visa']);
        saveAliases(['Mastercard']);
        expect(getSavedAliases()).toEqual(['Mastercard', 'Visa']);
    });

    it('de-duplicates aliases case-insensitively, keeping the latest spelling', () => {
        saveAliases(['Visa']);
        saveAliases(['VISA']);
        expect(getSavedAliases()).toEqual(['VISA']);
    });

    it('ignores blank and whitespace-only aliases', () => {
        saveAliases(['', '   ', 'Cal Cashback']);
        expect(getSavedAliases()).toEqual(['Cal Cashback']);
    });

    it('trims whitespace around aliases', () => {
        saveAliases(['  Amex  ']);
        expect(getSavedAliases()).toEqual(['Amex']);
    });

    it('accepts an array of aliases in a single call', () => {
        saveAliases(['Visa', 'Mastercard', 'Amex']);
        expect(getSavedAliases()).toEqual(['Visa', 'Mastercard', 'Amex']);
    });

    it('caps the stored list at 20 entries', () => {
        const many = Array.from({ length: 25 }, (_, i) => `Card ${i}`);
        saveAliases(many);
        expect(getSavedAliases()).toHaveLength(20);
    });

    it('tolerates corrupted storage contents', () => {
        localStorage.setItem('usedCardAliases', 'not-json');
        expect(getSavedAliases()).toEqual([]);
    });

    it('clears all saved aliases', () => {
        saveAliases(['Visa', 'Mastercard']);
        clearAliases();
        expect(getSavedAliases()).toEqual([]);
    });
});
