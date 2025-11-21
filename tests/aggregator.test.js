import { describe, it, expect } from 'vitest';
import { aggregateTransactions } from '../src/utils/aggregator';

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
});
