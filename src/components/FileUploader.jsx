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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
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
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Drag & drop Excel files here, or click to select</p>
                <p className="text-sm text-gray-500 mt-2">Supports .xlsx, .xls</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-4">
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{fileObj.file.name}</p>
                                <p className="text-xs text-gray-500">{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <input
                                type="text"
                                placeholder="Card Alias (e.g. Visa 1234)"
                                value={fileObj.alias}
                                onChange={(e) => updateAlias(fileObj.id, e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
                            />
                            <button
                                onClick={() => removeFile(fileObj.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={onProcess}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Process {files.length} Files
                    </button>
                </div>
            )}
        </div>
    );
}
