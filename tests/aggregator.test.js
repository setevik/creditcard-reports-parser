import { describe, it, expect } from 'vitest';
import { aggregateTransactions, normalizeVendor, canonicalizeVendor } from '../src/utils/aggregator';

describe('Aggregator Logic', () => {
    it('should aggregate transactions for the same vendor, card, and billing date', () => {
        const transactions = [
            {
                vendor: 'IKEA',
                amount: 427.00,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Cal Cashback',
                category: 'Utilities'
            },
            {
                vendor: 'IKEA',
                amount: 28.00,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Cal Cashback',
                category: 'Home'
            }
        ];

        const aggregated = aggregateTransactions(transactions);

        expect(aggregated.length).toBe(1);
        expect(aggregated[0].vendor).toBe('IKEA');
        expect(aggregated[0].amount).toBe(455.00);
        expect(aggregated[0].transactions.length).toBe(2);
        // Should use the category of the first transaction
        expect(aggregated[0].category).toBe('Utilities');
    });

    it('should NOT aggregate transactions with different vendors', () => {
        const transactions = [
            {
                vendor: 'IKEA',
                amount: 100,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Visa',
                category: 'Home'
            },
            {
                vendor: 'SUPERMARKET',
                amount: 50,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Visa',
                category: 'Food'
            }
        ];

        const aggregated = aggregateTransactions(transactions);
        expect(aggregated.length).toBe(2);
    });

    it('should NOT aggregate transactions with different cards', () => {
        const transactions = [
            {
                vendor: 'IKEA',
                amount: 100,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Visa',
                category: 'Home'
            },
            {
                vendor: 'IKEA',
                amount: 50,
                currency: '₪',
                billingDate: '10.11.2025',
                cardAlias: 'Amex',
                category: 'Home'
            }
        ];

        const aggregated = aggregateTransactions(transactions);
        expect(aggregated.length).toBe(2);
    });

    it('should sort by Card Alias then Vendor', () => {
        const transactions = [
            { vendor: 'ZARA', amount: 10, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Visa', category: 'Shopping' },
            { vendor: 'APPLE', amount: 10, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Visa', category: 'Tech' },
            { vendor: 'AMAZON', amount: 10, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Amex', category: 'Shopping' }
        ];

        const aggregated = aggregateTransactions(transactions);

        expect(aggregated.length).toBe(3);
        // Amex comes before Visa
        expect(aggregated[0].cardAlias).toBe('Amex');
        expect(aggregated[0].vendor).toBe('AMAZON');

        // Within Visa, APPLE comes before ZARA
        expect(aggregated[1].cardAlias).toBe('Visa');
        expect(aggregated[1].vendor).toBe('APPLE');

        expect(aggregated[2].cardAlias).toBe('Visa');
        expect(aggregated[2].vendor).toBe('ZARA');
    });

    it('should group a Hebrew vendor despite whitespace and invisible-mark differences', () => {
        // Same merchant ("מאפה נאמן באר יעקב") as it commonly appears across rows of a
        // credit-card export: clean, with a doubled internal space + trailing space, and
        // wrapped in RTL/LTR directional marks.
        const transactions = [
            { vendor: 'מאפה נאמן באר יעקב', amount: 10, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: 'מאפה נאמן  באר יעקב ', amount: 20, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: '\u200Fמאפה נאמן באר יעקב\u200E', amount: 30, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' }
        ];

        const aggregated = aggregateTransactions(transactions);

        expect(aggregated.length).toBe(1);
        expect(aggregated[0].amount).toBe(60);
        expect(aggregated[0].vendor).toBe('מאפה נאמן באר יעקב');
        expect(aggregated[0].transactions.length).toBe(3);
    });

    it('should group coffee-chain branches under one canonical vendor', () => {
        const transactions = [
            { vendor: 'ארומה אפליקציה', amount: 15, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: 'ארומה באר יעקב', amount: 25, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: 'ארומה בית התפוצות', amount: 35, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: 'אילנס רכבת -ת"א האונ', amount: 12, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' },
            { vendor: 'אילנס רכבת-ת"א השלום', amount: 18, currency: '₪', billingDate: '10.11.2025', cardAlias: 'Cal', category: 'Food' }
        ];

        const aggregated = aggregateTransactions(transactions);

        // Two chains -> two groups
        expect(aggregated.length).toBe(2);

        const aroma = aggregated.find(a => a.vendor === 'ארומה');
        expect(aroma).toBeTruthy();
        expect(aroma.amount).toBe(75);
        expect(aroma.transactions.length).toBe(3);

        const ilans = aggregated.find(a => a.vendor === 'אילנס');
        expect(ilans).toBeTruthy();
        expect(ilans.amount).toBe(30);
        expect(ilans.transactions.length).toBe(2);
    });

    it('canonicalizeVendor collapses known chains and leaves others intact', () => {
        expect(canonicalizeVendor('ארומה באר יעקב')).toBe('ארומה');
        expect(canonicalizeVendor('אילנס רכבת-ת"א השלום')).toBe('אילנס');
        expect(canonicalizeVendor('AROMA Espresso Bar')).toBe('ארומה');
        // Unknown vendors are returned normalized, unchanged.
        expect(canonicalizeVendor('  ZARA   STORE ')).toBe('ZARA STORE');
    });

    it('normalizeVendor strips invisible marks and collapses whitespace', () => {
        expect(normalizeVendor('  ZARA   STORE ')).toBe('ZARA STORE');
        expect(normalizeVendor('\u200Fמאפה נאמן\u200E')).toBe('מאפה נאמן');
        expect(normalizeVendor(undefined)).toBe('');
        expect(normalizeVendor(null)).toBe('');
    });
});
