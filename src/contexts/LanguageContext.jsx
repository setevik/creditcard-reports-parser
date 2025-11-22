import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Auto-detect language
        const browserLang = navigator.language.split('-')[0];
        if (['he', 'ru', 'fr'].includes(browserLang)) {
            setLanguage(browserLang);
        }
    }, []);

    useEffect(() => {
        // Handle RTL for Hebrew
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

        // Replace params like {count}
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
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
