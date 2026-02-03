import React, { useState } from 'react';
import { Copy, Check, List, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORY_COLORS = {
    Food: 'bg-orange-100 text-orange-800',
    Transport: 'bg-blue-100 text-blue-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Utilities: 'bg-purple-100 text-purple-800',
};

const DEFAULT_CATEGORY_COLOR = 'bg-slate-100 text-slate-800';

export function ResultsTable({ data }) {
    const [copied, setCopied] = useState(false);
    const [roundUp, setRoundUp] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const { t } = useLanguage();

    const handleCopy = async () => {
        const header = `${t('tableVendor')}\t${t('tableAmount')}\t${t('tableCurrency')}\t${t('tableDate')}\t${t('tableCard')}\t${t('tableCategory')}`;
        const rows = data.map(row => {
            const amount = roundUp ? Math.ceil(row.amount) : row.amount;
            return `${row.vendor}\t${amount}\t${row.currency}\t${row.date}\t${row.cardAlias}\t${row.category}`;
        }).join('\n');

        try {
            await navigator.clipboard.writeText(`${header}\n${rows}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="space-y-4 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">{t('processedExpenses', { count: data.length })}</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-slate-900 select-none">
                        <input
                            type="checkbox"
                            checked={roundUp}
                            onChange={(e) => setRoundUp(e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                        />
                        {t('roundUp')}
                    </label>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? t('copied') : t('copyToClipboard')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableVendor')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableAmount')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableCurrency')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableDate')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableCard')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableCategory')}</th>
                            <th className="px-3 py-3 sm:px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tableDetails')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm font-medium text-slate-900">{row.vendor}</td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-600 font-mono">{row.amount.toFixed(2)}</td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-600">{row.currency}</td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-600">{row.date}</td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-600">{row.cardAlias}</td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[row.category] || DEFAULT_CATEGORY_COLOR}`}>
                                        {row.category}
                                    </span>
                                </td>
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-600">
                                    <button
                                        onClick={() => setSelectedRow(row)}
                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
                                        title="View Details"
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRow && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedRow(null)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setSelectedRow(null); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedRow.vendor}
                >
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedRow.vendor}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedRow.cardAlias} • {selectedRow.date} • Total: {selectedRow.amount.toFixed(2)} {selectedRow.currency}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRow(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{t('tableDate')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{t('tableAmount')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{t('modalOriginalDesc')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedRow.transactions && selectedRow.transactions.map((tx, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-600">{tx.transactionDate}</td>
                                            <td className="px-4 py-3 text-sm text-slate-900 font-mono">{tx.amount.toFixed(2)} {tx.currency}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{tx.vendor}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
