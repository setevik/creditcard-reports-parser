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

            setProcessedData(allExpenses);
        } catch (err) {
            console.error(err);
            setError("Failed to parse one or more files. Please check the file format.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Credit Card Reports Parser</h1>
                        <p className="text-gray-500">Upload your monthly reports to categorize and export expenses</p>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Upload Files</h2>
                    <FileUploader files={files} setFiles={setFiles} onProcess={handleProcess} />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {isProcessing && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing files...</p>
                    </div>
                )}

                {processedData.length > 0 && (
                    <>
                        <SanityCheck data={processedData} />
                        <ResultsTable data={processedData} />
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
