// Normalize a vendor name so that visually-identical merchants group together.
// Credit-card Excel exports (especially Hebrew ones like the Hebrew bakery chain
// "Maafe Neeman") often carry trailing/leading whitespace, doubled internal
// spaces, or invisible directional / zero-width control marks that would
// otherwise split one merchant into several groups under an exact string match.
export function normalizeVendor(vendor) {
    if (vendor === undefined || vendor === null) return '';
    return vendor
        .toString()
        // Strip zero-width and bidirectional control characters:
        // ZWSP/ZWNJ/ZWJ (200B-200D), LRM/RLM (200E-200F), bidi embeddings/overrides
        // (202A-202E), isolates (2066-2069), and the BOM (FEFF).
        .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
        // Collapse any run of whitespace to a single space and trim the ends.
        .replace(/\s+/g, ' ')
        .trim();
}

// Chains whose individual branches (train stations, malls, in-app purchases,
// etc.) should collapse into a single group instead of one row per location.
// Each entry maps a canonical display name to the markers that identify the
// chain anywhere in the vendor string. Markers are matched case-insensitively
// against the normalized vendor, so both the Hebrew name and any Latin
// spelling can be listed. Add new chains here to group them.
const CHAINS = [
    { canonical: 'ארומה', markers: ['ארומה', 'aroma'] },
    { canonical: 'אילנס', markers: ['אילנס', 'ilan'] },
];

// Collapse a vendor to its chain's canonical name when it belongs to a known
// chain; otherwise return the plain normalized vendor unchanged.
export function canonicalizeVendor(vendor) {
    const normalized = normalizeVendor(vendor);
    const lower = normalized.toLowerCase();
    for (const chain of CHAINS) {
        for (const marker of chain.markers) {
            if (lower.includes(marker.toLowerCase())) {
                return chain.canonical;
            }
        }
    }
    return normalized;
}

export function aggregateTransactions(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const aggregated = transactions.reduce((acc, curr) => {
        // Group by Vendor, Currency, Card, and Billing Date
        // We exclude Category from the key so that different categories for the same vendor are merged
        const normalizedVendor = canonicalizeVendor(curr.vendor);
        const key = `${normalizedVendor.toLowerCase()}|${curr.currency}|${curr.cardAlias}|${curr.billingDate}`;
        if (!acc[key]) {
            acc[key] = {
                vendor: normalizedVendor || curr.vendor,
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
