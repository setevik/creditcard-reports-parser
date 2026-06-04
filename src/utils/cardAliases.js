const STORAGE_KEY = 'usedCardAliases';
const MAX_ALIASES = 20;

// Read the list of previously used card aliases from local storage.
export function getSavedAliases() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((a) => typeof a === 'string') : [];
    } catch {
        return [];
    }
}

// Persist newly used aliases, keeping the most recent first and de-duplicating
// case-insensitively. Blank aliases are ignored.
export function saveAliases(aliases) {
    const incoming = (Array.isArray(aliases) ? aliases : [aliases])
        .map((a) => (typeof a === 'string' ? a.trim() : ''))
        .filter(Boolean);

    if (incoming.length === 0) return getSavedAliases();

    const merged = [...incoming, ...getSavedAliases()];
    const seen = new Set();
    const unique = [];
    for (const alias of merged) {
        const key = alias.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(alias);
    }

    const trimmed = unique.slice(0, MAX_ALIASES);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // Ignore storage failures (e.g. private mode / quota).
    }
    return trimmed;
}
