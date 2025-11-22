import React, { useCallback } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';

export function FileUploader({ files, setFiles, onProcess }) {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
            f.name.endsWith('.xls') || f.name.endsWith('.xlsx') || f.name.endsWith('.csv')
        );

        const newFiles = droppedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            alias: ''
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, [setFiles]);

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(f =>
            f.name.endsWith('.xls') || f.name.endsWith('.xlsx') || f.name.endsWith('.csv')
        );

        const newFiles = selectedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            alias: ''
        }));

        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateAlias = (id, alias) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, alias } : f));
    };

    return (
        <div className="space-y-6">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer bg-slate-50"
                onClick={() => document.getElementById('fileInput').click()}
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
                <p className="text-lg font-medium text-slate-900">Drop files here to upload</p>
                <p className="text-sm text-slate-500 mt-2">or click to select from your computer</p>
                <p className="text-xs text-slate-400 mt-4">Supports .xlsx, .xls, .csv</p>
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
                                <input
                                    type="text"
                                    placeholder="Card Alias (e.g. Visa)"
                                    value={fileObj.alias}
                                    onChange={(e) => updateAlias(fileObj.id, e.target.value)}
                                    className="border-0 bg-slate-50 rounded-lg px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 transition-shadow"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(fileObj.id); }}
                                    className="self-end sm:self-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={onProcess}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            Process {files.length} Files
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
