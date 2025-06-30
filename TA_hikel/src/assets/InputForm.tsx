
import React, { useState, useCallback } from 'react';

interface InputFormProps {
  onSubmit: (file: File) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setInputError(null);
      } else {
        setInputError('Format file tidak valid. Harap unggah file .csv');
        setSelectedFile(null);
      }
    }
    event.target.value = ''; // Reset input value to allow re-upload of same file name
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setInputError(null);
      } else {
        setInputError('Format file tidak valid. Harap unggah file .csv');
        setSelectedFile(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);
  
  const clearFile = () => {
    setSelectedFile(null);
    setInputError(null);
    // Also clear the file input element if it has a reference
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setInputError('Mohon pilih file CSV untuk dianalisis.');
      return;
    }
    if (!isLoading && selectedFile) {
      onSubmit(selectedFile);
    }
  };
  
  const labelBaseClass = "block text-sm font-medium mb-1";
  const lightLabelClass = "text-slate-700";
  const darkLabelClass = "dark:text-gray-300";

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-300 dark:border-slate-700 transition-colors duration-300">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-primary">Unggah File Data Peserta (CSV)</h2>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="file-upload-area" className={`${labelBaseClass} ${lightLabelClass} ${darkLabelClass}`}>
            File Data Peserta (.csv):
          </label>
          <div
            id="file-upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 ${
              isDragOver ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
            } border-dashed rounded-md transition-colors duration-150 ${selectedFile ? 'h-auto py-3' : 'h-32'}`}
          >
            <div className="space-y-1 text-center">
              {!selectedFile ? (
                <>
                  <svg
                    className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-primary hover:text-opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary dark:focus-within:ring-offset-slate-800"
                    >
                      <span>Unggah file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" disabled={isLoading} />
                    </label>
                    <p className="pl-1">atau tarik dan lepas</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Hanya file CSV yang diterima</p>
                </>
              ) : (
                <div className="text-sm text-slate-700 dark:text-gray-300">
                  <p className="font-semibold">File terpilih:</p>
                  <p>{selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Hapus file
                  </button>
                </div>
              )}
            </div>
          </div>
          {inputError && (
            <p id="file-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {inputError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className="w-full bg-primary hover:bg-opacity-80 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Analisis...
            </>
          ) : (
            'Prediksi & Analisis Skor dari CSV'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
