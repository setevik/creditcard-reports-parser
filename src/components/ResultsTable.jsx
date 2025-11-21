import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function ResultsTable({ data }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const header = "Vendor\tAmount\tCurrency\tDate\tCard\tCategory";
        const rows = data.map(row =>
            `${row.vendor}\t${row.amount}\t${row.currency}\t${row.date}\t${row.cardAlias}\t${row.category}`
        ).join('\n');

        navigator.clipboard.writeText(`${header}\n${rows}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Processed Expenses ({data.length})</h2>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Currency</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Card</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.vendor}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{row.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.currency}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.cardAlias}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${row.category === 'Food' ? 'bg-orange-100 text-orange-800' :
                                            row.category === 'Transport' ? 'bg-blue-100 text-blue-800' :
                                                row.category === 'Shopping' ? 'bg-pink-100 text-pink-800' :
                                                    row.category === 'Utilities' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-slate-100 text-slate-800'}`}>
                                        {row.category}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
