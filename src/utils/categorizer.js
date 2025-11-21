
export const CATEGORIES = [
    "Food", "Misc", "Taxes", "Services", "Utilities", "AI tools",
    "Shopping", "Electronics", "Tea", "Supermarket", "Pharm",
    "Transport", "Investments", "Travel", "Insurance", "Home"
];

const KEYWORDS = {
    "Food": ["wolt", "10bis", "mcdonalds", "aroma", "cafe", "coffee", "restaurant", "pizza", "burger", "sushi", "falafel", "shawarma", "קפה", "מסעדה", "פיצה", "בורגר", "סושי", "פלאפל", "שווארמה", "מאפה", "קפית"],
    "Supermarket": ["shufersal", "mega", "rami levy", "victory", "tiv taam", "super", "market", "makolet", "שופרסל", "מגה", "רמי לוי", "ויקטורי", "טיב טעם", "סופר", "מרכול", "מכולת", "AM:PM"],
    "Pharm": ["super-pharm", "be", "pharmacy", "drugstore", "סופר פארם", "בית מרקחת", "פארם"],
    "Transport": ["gett", "uber", "yango", "moovit", "pango", "cello", "fuel", "gas", "dor alon", "paz", "sonol", "delek", "train", "bus", "rail", "דלק", "פז", "סונול", "דור אלון", "רכבת", "אוטובוס", "מונית", "חניון", "parking"],
    "Utilities": ["electric", "water", "gas", "arnona", "municipality", "internet", "partner", "cellcom", "pelephone", "hot", "bezeq", "חשמל", "מים", "גז", "ארנונה", "עירייה", "בזק", "הוט", "פרטנר", "סלקום", "פלאפון"],
    "Taxes": ["tax", "income tax", "vat", "bituach leumi", "mas hachnasa", "מע\"מ", "מס הכנסה", "ביטוח לאומי"],
    "AI tools": ["openai", "chatgpt", "anthropic", "claude", "midjourney", "github", "copilot", "gemini"],
    "Shopping": ["amazon", "ebay", "aliexpress", "zara", "h&m", "asos", "shein", "terminal x", "ksp", "ivory", "bug", "fox", "castro", "renuar", "clothing", "shoes", "mall", "קניון", "בגדים", "נעליים"],
    "Electronics": ["apple", "samsung", "xiaomi", "sony", "lg", "best buy", "ivory", "ksp", "bug", "electric", "computer", "phone", "מחשב", "טלפון", "אלקטרוניקה"],
    "Travel": ["hotel", "airbnb", "booking", "flight", "airline", "el al", "arkia", "israir", "lufthansa", "united", "delta", "easyjet", "ryanair", "wizz", "agoda", "expedia", "trip", "מלון", "טיסה", "חופשה", "נופש", "תיירות"],
    "Insurance": ["insurance", "harel", "migdal", "menora", "clal", "phoenix", "idi", "aig", "ביטוח", "הראל", "מגדל", "מנורה", "כלל", "פניקס"],
    "Investments": ["investment", "psagot", "meitav", "altshuler", "yelin", "lapidot", "bank", "stock", "crypto", "binance", "coinbase", "השקעות", "פסגות", "מיטב", "אלטשולר", "ילין", "לפידות", "בנק", "מניות"],
    "Home": ["ikea", "ace", "home center", "fox home", "golf & co", "zara home", "furniture", "diy", "איקאה", "אייס", "הום סנטר", "רהיטים", "עיצוב הבית", "ועד הבית"],
    "Tea": ["tea", "adanim", "wissotzky", "ceremony", "palais des thes", "תה", "ויסוצקי"],
    "Services": ["google", "apple", "spotify", "netflix", "disney", "youtube", "zoom", "adobe", "microsoft", "office", "service", "subscription", "maintanance", "cleaning", "laundry", "שירות", "מנוי", "אחזקה", "ניקיון", "כביסה"]
};

export function categorizeExpense(vendorName, sectorName) {
    if (!vendorName) return "Misc";

    const lowerVendor = vendorName.toLowerCase();
    const lowerSector = sectorName ? sectorName.toLowerCase() : "";

    for (const [category, keywords] of Object.entries(KEYWORDS)) {
        if (keywords.some(k => lowerVendor.includes(k) || lowerSector.includes(k))) {
            return category;
        }
    }

    return "Misc";
}
