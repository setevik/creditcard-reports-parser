import { describe, it, expect } from 'vitest';
import { categorizeExpense } from '../src/utils/categorizer';

describe('Categorizer Logic', () => {
    it('should categorize exact matches', () => {
        expect(categorizeExpense('Super-Pharm')).toBe('Pharm');
        expect(categorizeExpense('McDonalds')).toBe('Food');
    });

    it('should categorize partial matches', () => {
        expect(categorizeExpense('Some Super-Pharm Branch')).toBe('Pharm');
    });

    it('should categorize Hebrew matches via transliteration', () => {
        // "שופרסל" -> "shufersal" -> Match "shufersal" keyword
        expect(categorizeExpense('שופרסל')).toBe('Supermarket');
        // "רמי לוי" -> "rmy lvy" -> Match "rami levy" keyword (fuzzy)
        expect(categorizeExpense('רמי לוי')).toBe('Supermarket');
        // "ועד הבית" -> "v`d hbyt" -> Utilities
        expect(categorizeExpense('ועד הבית')).toBe('Utilities');
        // "סלקום שירות" -> "slqvm shyrvt" -> Utilities
        expect(categorizeExpense('סלקום שירות')).toBe('Utilities');
        // "מאפה" -> "mph" -> Food
        expect(categorizeExpense('מאפה')).toBe('Food');
        // "רולדין" -> "rvldyn" -> Food
        expect(categorizeExpense('רולדין')).toBe('Food');
        // "קפית" -> "qpyt" -> Food
        expect(categorizeExpense('קפית')).toBe('Food');
        // "ביטוח" -> "bytvkh" -> Insurance
        expect(categorizeExpense('ביטוח')).toBe('Insurance');
        // "חברת החשמל" -> "khbrt hkhshml" -> Utilities
        expect(categorizeExpense('חברת החשמל')).toBe('Utilities');
        // "רב קו און ליין" -> "rb qv vn lyyn" -> Transport
        expect(categorizeExpense('רב קו און ליין')).toBe('Transport');
        // "עיריית לדוגמה" -> "iriyat ldvgmh" -> Utilities
        expect(categorizeExpense('עיריית לדוגמה')).toBe('Utilities');
        // "עיריית תל אביב" -> "iriyat tl aviv" -> Utilities
        expect(categorizeExpense('עיריית תל אביב')).toBe('Utilities');
        // "פוליצר" -> "pvlytsr" -> Supermarket
        expect(categorizeExpense('פוליצר')).toBe('Supermarket');
        // "סופר פארם" -> "svpr prm" -> Pharm
        expect(categorizeExpense('סופר פארם')).toBe('Pharm');
        // "גורמה" -> "gvrmh" -> Food
        expect(categorizeExpense('גורמה')).toBe('Food');
        // "ארומה" -> "rvmh" -> Food
        expect(categorizeExpense('ארומה')).toBe('Food');
        // "בולנזרי 96" -> "bvlnzry 96" -> Food
        expect(categorizeExpense('בולנזרי 96')).toBe('Food');
        // "קפה ג'ו" -> "qph g'v" -> Food
        expect(categorizeExpense('קפה ג\'ו')).toBe('Food');
        // "יפן 73 עזריאלי ת"א" -> "ypn 73 `zryly t"" -> Food
        expect(categorizeExpense('יפן 73 עזריאלי ת"א')).toBe('Food');
        // "בוקאדו" -> "bvqdv" -> Food
        expect(categorizeExpense('בוקאדו')).toBe('Food');
    });

    it('should categorize new categories and priority', () => {
        expect(categorizeExpense('STEAMGAMES')).toBe('Games');
        expect(categorizeExpense('ChatGPT')).toBe('AI tools');
        // "Google ChatGPT" -> Contains "Google" (Services) and "ChatGPT" (AI tools).
        // Should be AI tools because AI tools is checked first.
        expect(categorizeExpense('Google ChatGPT')).toBe('AI tools');
    });

    it('should categorize using fuzzy matching on transliterated text', () => {
        // "harel bituah" -> transliterated "harel bituah" -> fuzzy match "bituach" (Insurance)
        expect(categorizeExpense('harel bituah')).toBe('Insurance');

        // "restorant" -> fuzzy match "restaurant" (Food)
        expect(categorizeExpense('My Restorant')).toBe('Food');
    });

    it('should categorize short keywords', () => {
        // "Be" -> "be" (Pharm)
        expect(categorizeExpense('Be Pharm')).toBe('Pharm');
        // "Gas" -> "gas" (Transport)
        expect(categorizeExpense('Paz Gas')).toBe('Transport');
    });

    it('should categorize Hebrew text via transliteration if direct match fails', () => {
        // "מקדונלדס" -> "mqdvnlds". Keyword "mcdonalds".
        // With threshold 0.4, this should match.
        expect(categorizeExpense('מקדונלדס')).toBe('Food');
    });

    it('should return Misc for unknown vendors', () => {
        expect(categorizeExpense('Unknown Vendor 123')).toBe('Misc');
    });

    it('should not false-positive short keywords within longer words', () => {
        // "be" is a Pharm keyword but shouldn't match inside "uber" or "better"
        expect(categorizeExpense('Uber Rides')).toBe('Transport');
        expect(categorizeExpense('Better Business')).toBe('Misc');
        // "hot" is Utilities but shouldn't match inside "hotel"
        expect(categorizeExpense('Hotel California')).toBe('Travel');
        // "bus" is Transport but shouldn't match inside "business"
        expect(categorizeExpense('Business Solutions Ltd')).toBe('Misc');
        // "tea" is Tea but shouldn't match inside "steam"
        expect(categorizeExpense('STEAM Digital')).toBe('Games');
    });

    it('should correctly categorize deduplicated keywords to Electronics', () => {
        // KSP, Ivory, Bug are Israeli electronics chains - now exclusively Electronics
        expect(categorizeExpense('KSP Store')).toBe('Electronics');
        expect(categorizeExpense('Ivory Computers')).toBe('Electronics');
        expect(categorizeExpense('Bug Multistore')).toBe('Electronics');
    });

    it('should handle word-boundary short keywords correctly', () => {
        // "be" as standalone word should match Pharm
        expect(categorizeExpense('Be Pharmacy')).toBe('Pharm');
        // "hot" as standalone word should match Utilities
        expect(categorizeExpense('HOT Internet Services')).toBe('Utilities');
        // "bus" as standalone word should match Transport
        expect(categorizeExpense('Bus Station Payment')).toBe('Transport');
    });
});
