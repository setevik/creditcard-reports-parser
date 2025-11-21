export function aggregateTransactions(transactions) {
    // Aggregate by Vendor
    const aggregated = transactions.reduce((acc, curr) => {
        // Group by Vendor, Currency, Card, and Billing Date
        // We exclude Category from the key so that different categories for the same vendor are merged
        const key = `${curr.vendor.toLowerCase()}|${curr.currency}|${curr.cardAlias}|${curr.billingDate}`;
        if (!acc[key]) {
            acc[key] = {
                vendor: curr.vendor,
                amount: 0,
                currency: curr.currency,
                date: curr.billingDate, // Use billing date for the report
                cardAlias: curr.cardAlias,
                category: curr.category, // Take the category of the first transaction
                transactions: [] // Store individual transactions
            };
        }
        acc[key].amount += curr.amount;
        acc[key].transactions.push(curr);
        return acc;
    }, {});

    const aggregatedList = Object.values(aggregated);

    // Sort by Card Alias then Vendor Name
    aggregatedList.sort((a, b) => {
        const cardCompare = a.cardAlias.localeCompare(b.cardAlias);
        if (cardCompare !== 0) return cardCompare;
        return a.vendor.localeCompare(b.vendor);
    });

    return aggregatedList;
}
