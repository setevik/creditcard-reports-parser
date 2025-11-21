import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { SanityCheck } from './components/SanityCheck';
import { parseExcelFile } from './utils/parser';
import { Wallet } from 'lucide-react';

function App() {
    const [files, setFiles] = useState([]);
    const [processedData, setProcessedData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleProcess = async () => {
        setIsProcessing(true);
        setError(null);
        setProcessedData([]);

        try {
            let allExpenses = [];

            for (const fileObj of files) {
                const expenses = await parseExcelFile(fileObj.file, fileObj.alias || 'Unknown Card');
                allExpenses = [...allExpenses, ...expenses];
            }

            // Aggregate by Vendor
            const aggregated = allExpenses.reduce((acc, curr) => {
                const key = `${curr.vendor}|${curr.currency}|${curr.cardAlias}|${curr.billingDate}|${curr.category}`;
                if (!acc[key]) {
                    acc[key] = {
                        vendor: curr.vendor,
                        amount: 0,
                        currency: curr.currency,
                        date: curr.billingDate, // Use billing date for the report
                        cardAlias: curr.cardAlias,
                        category: curr.category
                    };
                }
                acc[key].amount += curr.amount;
                return acc;
            }, {});

            const aggregatedList = Object.values(aggregated);

            // Sort by Vendor Name
            aggregatedList.sort((a, b) => a.vendor.localeCompare(b.vendor));

            setProcessedData(aggregatedList);
        } catch (err) {
            console.error(err);
            setError("Failed to parse one or more files. Please check the file format.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 mb-4">
                        <Wallet className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Expense Parser
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Effortlessly parse, categorize, and export your credit card reports.
                        Secure client-side processing.
                    </p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">1</span>
                            Upload Reports
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
                        <p className="text-slate-600 font-medium">Processing your files...</p>
                    </div>
                )}

                {processedData.length > 0 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <SanityCheck data={processedData} />
                        <ResultsTable data={processedData} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
