import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        if (saved && ['en', 'he', 'ru', 'fr'].includes(saved)) return saved;
        const browserLang = navigator.language.split('-')[0];
        return ['he', 'ru', 'fr'].includes(browserLang) ? browserLang : 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        if (language === 'he') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'he';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = language;
        }
    }, [language]);

    const t = (key, params = {}) => {
        let text = translations[language][key] || translations['en'][key] || key;

        Object.keys(params).forEach(param => {
            text = text.replaceAll(`{${param}}`, params[param]);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
