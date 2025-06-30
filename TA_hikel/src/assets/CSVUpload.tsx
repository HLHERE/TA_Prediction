import React, { useState, useRef } from 'react';
import { predictFromCSV } from '../services/predictionApi';

import type { DataSummary } from '../types/prediction';

interface CSVUploadProps {
    onPredictionsReceived: (predictions: number[], summary?: DataSummary) => void;
    onError: (error: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({
    onPredictionsReceived,
    onError,
    isLoading,
    setIsLoading
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'text/csv') {
                onError('Please upload a CSV file');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            onError('Please select a file first');
            return;
        }

        setIsLoading(true);
        try {            const response = await predictFromCSV(selectedFile);
            if (response.predictions) {
                onPredictionsReceived(response.predictions, response.data_summary);
            } else {
                throw new Error('No predictions received');
            }
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to process CSV file');
        } finally {
            setIsLoading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFile(null);
        }
    };

    const generateSampleCSV = () => {
        const headers = [
            'Kelahiran Kabupaten/Kota_peserta',
            'Umur',
            'Status Nikah',
            'Gol_Ruang',
            'Kelahiran Provinsi'
        ].join(',');

        const sampleData = [
            'Bandung,35,Menikah,III/A,Jawa Barat',
            'Jakarta Selatan,28,Belum Menikah,II/C,DKI Jakarta',
            'Surabaya,42,Menikah,III/D,Jawa Timur'
        ].join('\n');

        const csvContent = `${headers}\n${sampleData}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_prediksi.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Upload CSV File
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Format CSV yang dibutuhkan:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4 mb-4 space-y-1">
                    <li>Kelahiran Kabupaten/Kota_peserta (text)</li>
                    <li>Umur (angka)</li>
                    <li>Status Nikah (Menikah/Belum Menikah/Cerai)</li>
                    <li>Gol_Ruang (II/A - III/D)</li>
                    <li>Kelahiran Provinsi (text)</li>
                </ul>
                <button
                    onClick={generateSampleCSV}
                    className="text-sm text-primary hover:text-primary-dark dark:text-primary-light transition-colors mb-4"
                >
                    ↓ Download Template CSV
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Choose CSV File
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-white
                                hover:file:bg-primary-dark
                                file:cursor-pointer file:transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!selectedFile || isLoading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                             text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-primary transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : 'Upload and Predict'}
                </button>
            </form>
        </div>
    );
};

export default CSVUpload;
