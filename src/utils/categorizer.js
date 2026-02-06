import Fuse from 'fuse.js';
import { transliterate } from 'transliteration';

export const CATEGORIES = [
    "Food", "Misc", "Games", "Taxes", "AI tools", "Services", "Transport", "Utilities",
    "Shopping", "Electronics", "Tea", "Pharm", "Supermarket",
    "Investments", "Travel", "Insurance", "Home"
];

// Deduplicated keywords - each keyword belongs to exactly one category
const KEYWORDS = {
    "Food": ["wolt", "10bis", "mcdonalds", "mqdvnlds", "aroma", "rvmh", "cafe", "coffee", "restaurant", "pizza", "burger", "sushi", "falafel", "shawarma", "mph", "mkvnvt vtvmtyvt", "rvldyn", "qpyt", "gvrmh", "bvlnzry 96", "qph", "ypn 73", "bvqdv"],
    "Supermarket": ["shufersal", "shvprsl", "mega", "rami levy", "rmy lvy", "victory", "tiv taam", "super", "market", "makolet", "am:pm", "pvlytsr"],
    "Pharm": ["super-pharm", "svpr prm", "be", "pharmacy", "drugstore"],
    "Transport": ["gett", "uber", "yango", "moovit", "pango", "cello", "fuel", "gas", "dor alon", "paz", "sonol", "delek", "train", "bus", "rail", "parking", "rb qv"],
    "Utilities": ["electric", "water", "arnona", "municipality", "iriyat", "`yryyt", "internet", "partner", "cellcom", "slqvm", "pelephone", "hot", "bezeq", "v`d hbyt", "khbrt hkhshml", "gas bill", "gas company"],
    "Taxes": ["tax", "income tax", "vat", "bituach leumi", "mas hachnasa"],
    "AI tools": ["openai", "chatgpt", "anthropic", "claude", "midjourney", "github", "copilot", "gemini"],
    "Shopping": ["amazon", "ebay", "aliexpress", "zara", "h&m", "asos", "shein", "terminal x", "fox", "castro", "renuar", "clothing", "shoes", "mall"],
    "Electronics": ["apple", "samsung", "xiaomi", "sony", "lg", "best buy", "ivory", "ksp", "bug", "computer", "phone", "electronics"],
    "Travel": ["hotel", "airbnb", "booking", "flight", "airline", "el al", "arkia", "israir", "lufthansa", "united", "delta", "easyjet", "ryanair", "wizz", "agoda", "expedia", "trip"],
    "Insurance": ["insurance", "harel", "migdal", "menora", "clal", "phoenix", "idi", "aig", "bytvkh"],
    "Investments": ["investment", "psagot", "meitav", "altshuler", "yelin", "lapidot", "bank", "stock", "crypto", "binance", "coinbase"],
    "Home": ["ikea", "ace", "home center", "fox home", "golf & co", "zara home", "furniture", "diy"],
    "Tea": ["tea", "adanim", "wissotzky", "ceremony", "palais des thes"],
    "Services": ["google", "spotify", "netflix", "disney", "youtube", "zoom", "adobe", "microsoft", "office", "service", "subscription", "maintanance", "cleaning", "laundry", "apple.com/bill", "apple services"],
    "Games": ["steam", "steamgames", "nintendo", "playstation", "xbox"]
};

// Threshold for "short" keywords that need word-boundary protection
const SHORT_KEYWORD_MAX_LENGTH = 3;

// Escape special regex characters
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Precompute keyword entries at module load time
// Sorted by length descending (longer keywords are more specific, check first)
const KEYWORD_ENTRIES = [];
for (const category of CATEGORIES) {
    const keywords = KEYWORDS[category];
    if (!keywords) continue;
    for (const keyword of keywords) {
        const isShort = keyword.length <= SHORT_KEYWORD_MAX_LENGTH;
        KEYWORD_ENTRIES.push({
            keyword,
            category,
            isShort,
            // Precompile word-boundary regex for short keywords
            pattern: isShort ? new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i') : null
        });
    }
}
KEYWORD_ENTRIES.sort((a, b) => b.keyword.length - a.keyword.length);

// Non-short keywords for fuzzy matching (short keywords are too unreliable for fuzzy)
const FUZZY_KEYWORDS = KEYWORD_ENTRIES.filter(e => !e.isShort);

export function categorizeExpense(vendorName, sectorName) {
    if (!vendorName) return "Misc";

    const lowerVendor = vendorName.toLowerCase();
    const lowerSector = sectorName ? sectorName.toLowerCase() : "";

    // Transliterate Hebrew/Cyrillic to Latin
    const transliteratedVendor = transliterate(lowerVendor);
    const transliteratedSector = lowerSector ? transliterate(lowerSector) : "";

    // Combined search text
    const searchText = transliteratedSector
        ? `${transliteratedVendor} ${transliteratedSector}`
        : transliteratedVendor;

    // --- Tier 1: Exact substring match (fast path) ---
    // Check all keywords against the vendor/sector text
    // Short keywords use word-boundary matching to avoid false positives
    for (const entry of KEYWORD_ENTRIES) {
        let matched = false;

        if (entry.isShort) {
            // Short keywords: require word boundary match
            matched = entry.pattern.test(searchText);
        } else {
            // Normal keywords: substring match
            matched = searchText.includes(entry.keyword);
        }

        if (matched) {
            // Return immediately - KEYWORD_ENTRIES is sorted by length desc,
            // so first match is the longest (most specific) keyword
            return entry.category;
        }
    }

    // --- Tier 2: Fuzzy match (fallback for misspellings) ---
    // Create Fuse over the vendor/sector text and search keywords against it
    const searchTargets = [transliteratedVendor];
    if (transliteratedSector) searchTargets.push(transliteratedSector);

    const fuse = new Fuse(searchTargets, {
        includeScore: true,
        threshold: 0.2,
        ignoreLocation: true,
        minMatchCharLength: 2
    });

    let bestMatch = null;

    for (const entry of FUZZY_KEYWORDS) {
        const results = fuse.search(entry.keyword);
        if (results.length > 0) {
            const score = results[0].score;
            if (!bestMatch || score < bestMatch.score ||
                (score === bestMatch.score && entry.keyword.length > bestMatch.keyword.length)) {
                bestMatch = {
                    category: entry.category,
                    keyword: entry.keyword,
                    score
                };
            }
        }
    }

    if (bestMatch) {
        return bestMatch.category;
    }

    return "Misc";
}
