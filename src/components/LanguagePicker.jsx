import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguagePicker() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'he', label: 'עברית', flag: '🇮🇱' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' }
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white text-slate-600 rounded-xl shadow-sm ring-1 ring-slate-900/5 hover:text-indigo-600 hover:ring-indigo-500/20 transition-all text-sm font-medium"
            >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{language}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors
                                ${language === lang.code ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-slate-700'}
                            `}
                        >
                            <span className="text-base">{lang.flag}</span>
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
