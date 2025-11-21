import React from 'react';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

export function SanityCheck({ data }) {
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center gap-2 text-gray-800 mb-2">
                <Calculator className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Sanity Check</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Unique Vendors</p>
                    <p className="text-2xl font-bold text-gray-900">{uniqueVendors}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total Sum</p>
                    <div className="space-y-1">
                        {Object.entries(sumsByCurrency).map(([curr, sum]) => (
                            <p key={curr} className="text-xl font-bold text-gray-900">
                                {sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {curr}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Verification Tip</p>
                    <p className="mt-1 text-blue-700">
                        Compare the "Total Sum" above with the total amount shown in your original bank report PDF/Excel summary line to ensure all transactions were captured correctly.
                    </p>
                </div>
            </div>
        </div>
    );
}
