import React, { useCallback, useState } from 'react';
import { Upload, X, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSavedAliases, clearAliases } from '../utils/cardAliases';

const ACCEPTED_EXTENSIONS = ['.xls', '.xlsx', '.csv'];

function filterAndWrapFiles(fileList) {
    return Array.from(fileList)
        .filter(f => ACCEPTED_EXTENSIONS.some(ext => f.name.endsWith(ext)))
        .map(file => ({
            file,
            id: crypto.randomUUID(),
            alias: ''
        }));
}

const ALIAS_DATALIST_ID = 'savedCardAliases';

export function FileUploader({ files, setFiles, onProcess }) {
    const { t } = useLanguage();
    const [savedAliases, setSavedAliases] = useState(getSavedAliases);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const newFiles = filterAndWrapFiles(e.dataTransfer.files);
        setFiles(prev => [...prev, ...newFiles]);
    }, [setFiles]);

    const handleFileInput = (e) => {
        const newFiles = filterAndWrapFiles(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateAlias = (id, alias) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, alias } : f));
    };

    const handleClearAliases = () => {
        clearAliases();
        setSavedAliases([]);
    };

    const hasSavedAliases = savedAliases.length > 0;

    return (
        <div className="space-y-6">
            {hasSavedAliases && (
                <datalist id={ALIAS_DATALIST_ID}>
                    {savedAliases.map((alias) => (
                        <option key={alias} value={alias} />
                    ))}
                </datalist>
            )}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer bg-slate-50"
                onClick={() => document.getElementById('fileInput').click()}
                role="button"
                tabIndex={0}
                aria-label={t('dropFiles')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('fileInput').click(); } }}
            >
                <input
                    type="file"
                    id="fileInput"
                    multiple
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInput}
                />
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                    <Upload className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-lg font-medium text-slate-900">{t('dropFiles')}</p>
                <p className="text-sm text-slate-500 mt-2">{t('clickToSelect')}</p>
                <p className="text-xs text-slate-500 mt-4">{t('supports')}</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        {files.map((fileObj) => (
                            <div key={fileObj.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{fileObj.file.name}</p>
                                    <p className="text-xs text-slate-500">{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="relative w-full sm:w-48">
                                    <input
                                        type="text"
                                        list={hasSavedAliases ? ALIAS_DATALIST_ID : undefined}
                                        aria-label={t('cardAliasLabel')}
                                        placeholder={t('cardAliasPlaceholder')}
                                        value={fileObj.alias}
                                        onChange={(e) => updateAlias(fileObj.id, e.target.value)}
                                        className={`border-0 bg-slate-50 rounded-lg px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 w-full transition-shadow ${hasSavedAliases ? 'pe-9' : ''}`}
                                    />
                                    {hasSavedAliases && (
                                        <ChevronDown
                                            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                                    className="self-end sm:self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label={`Remove ${fileObj.file.name}`}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {hasSavedAliases ? (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                                    {t('savedCardsHint')}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearAliases}
                                    className="font-medium text-slate-500 underline-offset-2 hover:text-red-500 hover:underline transition-colors"
                                >
                                    {t('clearSavedCards')}
                                </button>
                            </div>
                        ) : (
                            <span />
                        )}
                        <button
                            onClick={onProcess}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            {t('processFiles', { count: files.length })}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
