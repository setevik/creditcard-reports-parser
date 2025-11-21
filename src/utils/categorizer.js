import Fuse from 'fuse.js';
import { transliterate } from 'transliteration';

export const CATEGORIES = [
    "Food", "Misc", "Games", "Taxes", "AI tools", "Services", "Transport", "Utilities",
    "Shopping", "Electronics", "Tea", "Pharm", "Supermarket",
    "Investments", "Travel", "Insurance", "Home"
];

const KEYWORDS = {
    "Food": ["wolt", "10bis", "mcdonalds", "mqdvnlds", "aroma", "rvmh", "cafe", "coffee", "restaurant", "pizza", "burger", "sushi", "falafel", "shawarma", "mph", "mkvnvt vtvmtyvt", "rvldyn", "qpyt", "gvrmh"],
    "Supermarket": ["shufersal", "shvprsl", "mega", "rami levy", "rmy lvy", "victory", "tiv taam", "super", "market", "makolet", "am:pm", "pvlytsr"],
    "Pharm": ["super-pharm", "svpr prm", "be", "pharmacy", "drugstore"],
    "Transport": ["gett", "uber", "yango", "moovit", "pango", "cello", "fuel", "gas", "dor alon", "paz", "sonol", "delek", "train", "bus", "rail", "parking", "rb qv"],
    "Utilities": ["electric", "water", "gas", "arnona", "municipality", "internet", "partner", "cellcom", "slqvm", "pelephone", "hot", "bezeq", "v`d hbyt", "khbrt hkhshml"],
    "Taxes": ["tax", "income tax", "vat", "bituach leumi", "mas hachnasa"],
    "AI tools": ["openai", "chatgpt", "anthropic", "claude", "midjourney", "github", "copilot", "gemini"],
    "Shopping": ["amazon", "ebay", "aliexpress", "zara", "h&m", "asos", "shein", "terminal x", "ksp", "ivory", "bug", "fox", "castro", "renuar", "clothing", "shoes", "mall"],
    "Electronics": ["apple", "samsung", "xiaomi", "sony", "lg", "best buy", "ivory", "ksp", "bug", "electric", "computer", "phone"],
    "Travel": ["hotel", "airbnb", "booking", "flight", "airline", "el al", "arkia", "israir", "lufthansa", "united", "delta", "easyjet", "ryanair", "wizz", "agoda", "expedia", "trip"],
    "Insurance": ["insurance", "harel", "migdal", "menora", "clal", "phoenix", "idi", "aig", "bytvkh"],
    "Investments": ["investment", "psagot", "meitav", "altshuler", "yelin", "lapidot", "bank", "stock", "crypto", "binance", "coinbase"],
    "Home": ["ikea", "ace", "home center", "fox home", "golf & co", "zara home", "furniture", "diy"],
    "Tea": ["tea", "adanim", "wissotzky", "ceremony", "palais des thes"],
    "Services": ["google", "apple", "spotify", "netflix", "disney", "youtube", "zoom", "adobe", "microsoft", "office", "service", "subscription", "maintanance", "cleaning", "laundry"],
    "Games": ["steam", "steamgames", "nintendo", "playstation", "xbox"]
};

export function categorizeExpense(vendorName, sectorName) {
    if (!vendorName) return "Misc";

    const lowerVendor = vendorName.toLowerCase();
    const lowerSector = sectorName ? sectorName.toLowerCase() : "";

    // Always transliterate
    const transliteratedVendor = transliterate(lowerVendor);
    const transliteratedSector = lowerSector ? transliterate(lowerSector) : "";

    // Search targets: transliterated vendor and sector
    // We can also include the original strings if we want to match English-to-English directly 
    // (though transliteration of English usually keeps it English, so it's fine).
    // Adding original strings might help if transliteration messes up something simple, 
    // but for now let's stick to the plan: transliterate everything.

    const searchTargets = [transliteratedVendor];
    if (transliteratedSector) searchTargets.push(transliteratedSector);

    const fuse = new Fuse(searchTargets, {
        includeScore: true,
        threshold: 0.2,
        ignoreLocation: true,
        minMatchCharLength: 2 // Support short keywords like "be", "gas"
    });

    let matches = [];

    for (const category of CATEGORIES) {
        const keywords = KEYWORDS[category];
        if (!keywords) continue;

        for (const keyword of keywords) {
            const results = fuse.search(keyword);
            if (results.length > 0) {
                matches.push({
                    category,
                    keyword,
                    score: results[0].score
                });
            }
        }
    }

    if (matches.length > 0) {
        // Sort matches:
        // 1. Score (ascending, lower is better)
        // 2. Keyword length (descending, longer is more specific)
        matches.sort((a, b) => {
            if (a.score !== b.score) {
                return a.score - b.score;
            }
            return b.keyword.length - a.keyword.length;
        });

        return matches[0].category;
    }

    return "Misc";
}
