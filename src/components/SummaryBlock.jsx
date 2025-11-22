import React from 'react';
import { Calculator, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function SummaryBlock({ data }) {
    const { t } = useLanguage();

    if (!data || data.length === 0) return null;

    const totalTransactions = data.length;
    const uniqueVendors = new Set(data.map(d => d.vendor)).size;
    const totalSum = data.reduce((sum, d) => sum + d.amount, 0);

    // Group by currency for display
    const sumsByCurrency = data.reduce((acc, d) => {
        acc[d.currency] = (acc[d.currency] || 0) + d.amount;
        return acc;
    }, {});

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm ring-1 ring-slate-900/5 space-y-6">
            <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Calculator className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold">{t('summaryTitle')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t('totalTransactions')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{totalTransactions}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t('uniqueVendors')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{uniqueVendors}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t('totalSum')}</p>
                    <div className="space-y-1 mt-2">
                        {Object.entries(sumsByCurrency).map(([curr, sum]) => (
                            <p key={curr} className="text-2xl font-bold text-slate-900">
                                {sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-slate-500">{curr}</span>
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 text-blue-900 rounded-xl text-sm border border-blue-100">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                    <p className="font-semibold text-blue-800">{t('verificationTipTitle')}</p>
                    <p className="mt-1 text-blue-700 leading-relaxed">
                        {t('verificationTipBody')}
                    </p>
                </div>
            </div>
        </div>
    );
}
