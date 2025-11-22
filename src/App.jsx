import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { SummaryBlock } from './components/SummaryBlock';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguagePicker } from './components/LanguagePicker';
import { parseExcelFile } from './utils/parser';
import { aggregateTransactions } from './utils/aggregator';
import { Wallet, MessageSquare } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function AppContent() {
    const [files, setFiles] = useState([]);
    const [processedData, setProcessedData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const resultsRef = useRef(null);
    const { t, language } = useLanguage();

    useEffect(() => {
        if (processedData.length > 0 && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [processedData]);

    const handleProcess = async () => {
        setIsProcessing(true);
        setError(null);
        setProcessedData([]);

        try {
            let allExpenses = [];

            for (let i = 0; i < files.length; i++) {
                const fileObj = files[i];
                const expenses = await parseExcelFile(fileObj.file, fileObj.alias || `Card #${i + 1}`);
                allExpenses = [...allExpenses, ...expenses];
            }

            const aggregatedList = aggregateTransactions(allExpenses);

            setProcessedData(aggregatedList);
        } catch (err) {
            console.error(err);
            setError(t('errorParse'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="text-center space-y-4 relative">
                    <div className="absolute top-0 left-0 z-10">
                        <LanguagePicker />
                    </div>
                    <div className="absolute top-0 right-0 z-10">
                        <a
                            href="https://forms.google.com/your-form-id" // TODO: Replace with your actual Google Form URL
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl shadow-sm ring-1 ring-slate-900/5 hover:text-indigo-600 hover:ring-indigo-500/20 transition-all text-sm font-medium"
                        >
                            <MessageSquare className="h-4 w-4" />
                            {t('feedback')}
                        </a>
                    </div>
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 mb-4">
                        <Wallet className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">1</span>
                            {t('uploadTitle')}
                        </h2>
                        <FileUploader files={files} setFiles={setFiles} onProcess={handleProcess} />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                {isProcessing && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">{t('processing')}</p>
                    </div>
                )}

                {processedData.length > 0 && (
                    <div ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <SummaryBlock data={processedData} />
                        <ResultsTable data={processedData} />
                    </div>
                )}

                <footer className="border-t border-slate-200 pt-8 mt-12 text-center space-y-6">
                    <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                        {t('footerText')}
                    </p>
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} Credit Card Reports Parser.
                    </p>
                </footer>
            </div>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
            <Analytics />
            <SpeedInsights />
        </LanguageProvider>
    );
}

export default App;
