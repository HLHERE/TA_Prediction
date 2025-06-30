import React from 'react';
import type { FactorBasedPrediction} from '../../types';
import type { PredictionFormData } from '../types/prediction';
import { Bar} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import type { ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ResultsDisplayProps {
  result: FactorBasedPrediction | null;
  isLoading: boolean;
  error: string | null;
}


// Helper untuk rata-rata
const getAverage = (arr: number[]) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;


// Helper untuk mengurutkan data bar chart
function getSortedBarData(labels: string[], values: number[], ascending = false) {
  const combined = labels.map((label, i) => ({ label, value: values[i] }));
  combined.sort((a, b) => ascending ? a.value - b.value : b.value - a.value);
  return {
    labels: combined.map(d => d.label),
    values: combined.map(d => d.value),
  };
}
// Tambahkan palet warna
const chartColors = [
  "#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa", "#f472b6", "#38bdf8", "#facc15",
  "#4ade80", "#fb7185", "#818cf8", "#f472b6", "#2dd4bf", "#fcd34d", "#c084fc", "#fca5a5",
  "#f9a8d4", "#bef264", "#fdba74", "#a3e635", "#fef08a", "#fca5a5", "#fbbf24", "#a3e635"
];

// Komponen Bar Chart dengan sorting dan orientasi opsional
const SortedBarChart: React.FC<{
  labels: string[];
  values: number[];
  title: string;
  horizontal?: boolean;
  ascending?: boolean;
}> = ({ labels, values, title, horizontal = false, ascending = false }) => {
  const sorted = getSortedBarData(labels, values, ascending);
  // Pilih warna sesuai jumlah bar
  const bgColors = sorted.labels.map((_, i) => chartColors[i % chartColors.length]);
  const options: ChartOptions<"bar"> = {
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: !horizontal, text: title } },
      y: { title: { display: horizontal, text: title }, beginAtZero: true }
    },
    maintainAspectRatio: false
  };
  return (
    <div style={{ height: 320 }}>
      <Bar
        data={{
          labels: sorted.labels,
          datasets: [{
            label: 'Rata-rata Prediksi Nilai',
            data: sorted.values,
            backgroundColor: bgColors,
          }]
        }}
        options={options}
      />
    </div>
  );
};

// Komponen visualisasi rata-rata prediksi per kategori faktor
const FactorPredictionBarChart: React.FC<{ data: PredictionFormData[], predictions: number[], factorKey: string, title: string }> = ({ data, predictions, factorKey, title }) => {
  if (!data || !predictions || data.length === 0 || predictions.length === 0) return null;
  const factorMap: Record<string, number[]> = {};
  data.forEach((row, idx) => {
    const key = ((row as unknown) as Record<string, unknown>)[factorKey] as string || 'Tidak Diketahui';
    if (!factorMap[key]) factorMap[key] = [];
    factorMap[key].push(predictions[idx]);
  });
  const labels = Object.keys(factorMap);
  const avgPredictions = labels.map(label => {
    const arr = factorMap[label];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });
  const bgColors = labels.map((_, i) => chartColors[i % chartColors.length]);
  return (
    <div style={{ height: 220 }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Rata-rata Prediksi Nilai',
            data: avgPredictions,
            backgroundColor: bgColors,
          }]
        }}
        options={{
          plugins: { legend: { display: false } },
          scales: { x: { title: { display: true, text: title } }, y: { title: { display: true, text: 'Rata-rata Prediksi' }, beginAtZero: true } },
          maintainAspectRatio: false
        }}
      />
    </div>
  );
};

// Komponen Feature Importance
const FeatureImportanceBarChart: React.FC<{ importance: Record<string, number> }> = ({ importance }) => {
  const labels = Object.keys(importance);
  const values = Object.values(importance);
  return (
    <div style={{ height: 220 }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Importance',
            data: values,
            backgroundColor: 'rgba(251,191,36,0.7)',
          }]
        }}
        options={{
          plugins: { legend: { display: false } },
          scales: { x: { title: { display: true, text: 'Fitur' } }, y: { title: { display: true, text: 'Importance' }, beginAtZero: true } },
          maintainAspectRatio: false
        }}
      />
    </div>
  );
};



const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error }) => {
  const cardBaseClass = "backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border transition-colors duration-300";
  const lightCardClass = "bg-white/80 border-slate-300";
  const darkCardClass = "dark:bg-slate-800/80 dark:border-slate-700";

  if (isLoading) {
    return (
      <div className={`${cardBaseClass} ${lightCardClass} ${darkCardClass} h-full flex items-center justify-center`}>
        <div className="text-center">
          <svg className="animate-spin mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-300">Menghasilkan prediksi dan analisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardBaseClass} bg-red-100/80 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-center`}>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-red-700 dark:text-red-300">Error Analisis</h3>
        <p className="text-red-600 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`${cardBaseClass} ${lightCardClass} ${darkCardClass} h-full flex flex-col items-center justify-center text-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h4.5M7.5 21H3M21 21h-4.5M15 3h4.5M7.5 3H3m12 .75L10.5 8.25m0 0L8.25 10.5M10.5 8.25L12.75 6M10.5 8.25L8.25 6" />
        </svg>
        <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-600 dark:text-gray-400">Hasil Analisis Faktor</h3>
        <p className="text-slate-500 dark:text-gray-500">Silakan unggah file CSV dan klik "Prediksi & Analisis Skor dari CSV" untuk melihat hasilnya.</p>
      </div>
    );
  }

  // Tambahkan visualisasi komparasi prediksi vs nilai aktual
  const renderComparisonTable = () => {
    if (!result?.comparison || result.comparison.length === 0) return null;
    return (
      <section className="mb-6 sm:mb-8">
        <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
          Komparasi Prediksi vs Nilai Aktual
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-300 dark:border-slate-600 rounded-md text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="px-3 py-2 border">NILAI Aktual</th>
                <th className="px-3 py-2 border">Prediksi</th>
                <th className="px-3 py-2 border">Error</th>
                <th className="px-3 py-2 border">Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {result.comparison.slice(0, 20).map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'}>
                  <td className="px-3 py-2 border text-center">{row['NILAI']}</td>
                  <td className="px-3 py-2 border text-center">{row['Prediksi']?.toFixed?.(2) ?? row['Prediksi']}</td>
                  <td className="px-3 py-2 border text-center">{row['Error']?.toFixed?.(2) ?? row['Error']}</td>
                  <td className="px-3 py-2 border text-center">{row['Error (%)']?.toFixed?.(2) ?? row['Error (%)']}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.comparison.length > 20 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Menampilkan 20 data pertama dari {result.comparison.length} baris.</div>
          )}
        </div>
        {result.summary_error && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
            <span className="font-semibold">Ringkasan Error:</span>
            <ul className="list-disc list-inside ml-4">
              <li>MAE: {result.summary_error.MAE.toFixed(2)}</li>
              <li>MSE: {result.summary_error.MSE.toFixed(2)}</li>
              <li>RMSE: {result.summary_error.RMSE.toFixed(2)}</li>
            </ul>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className={`${cardBaseClass} ${lightCardClass} ${darkCardClass}`}>
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center text-primary">Ringkasan Hasil Analisis</h3>

      {/* Komparasi Prediksi vs Nilai Aktual */}
      {renderComparisonTable()}

      {/* 1. Rata-rata Nilai Prediksi Peserta */}
      {result.predictions && result.predictions.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">Rata-rata Nilai Prediksi Peserta</h4>
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600 text-center">
            <span className="text-3xl font-bold text-primary">
              {getAverage(result.predictions).toFixed(2)}
            </span>
          </div>
        </section>
      )}

      {/* 2. Distribusi Nilai Prediksi per Umur */}
      {result.inputData && result.predictions && result.inputData.length === result.predictions.length && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
            Distribusi Nilai Prediksi per Umur
          </h4>
          {(() => {
            // Kelompok umur
            const umurGroups = ['<30', '30-39', '40-49', '50+', 'Tidak Diketahui'];
            const factorMap: Record<string, number[]> = {};
            result.inputData.forEach((row, idx) => {
              const umur = row['Umur Thn'] ?? row['Umur'];
              let group = 'Tidak Diketahui';
              if (typeof umur === 'number' && !isNaN(umur)) {
                if (umur < 30) group = '<30';
                else if (umur < 40) group = '30-39';
                else if (umur < 50) group = '40-49';
                else group = '50+';
              }
              if (!factorMap[group]) factorMap[group] = [];
              const pred = result.predictions?.[idx];
              if (typeof pred === 'number') {
                factorMap[group].push(pred);
              }
            });
            const labels = umurGroups.filter(g => factorMap[g]);
            const avgPredictions = labels.map(label => {
              const arr = factorMap[label];
              return arr.reduce((a, b) => a + b, 0) / arr.length;
            });
            return (
              <SortedBarChart
                labels={labels}
                values={avgPredictions}
                title="Kelompok Umur"
              />
            );
          })()}
        </section>
      )}

      {/* 3. Distribusi Nilai Prediksi per Daerah Asal */}
      {result.inputData && result.predictions && result.inputData.length === result.predictions.length && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
            Distribusi Nilai Prediksi per Daerah Asal (Bar Chart)
          </h4>
          {(() => {
            const factorMap: Record<string, number[]> = {};
            result.inputData.forEach((row, idx) => {
              const key = row["Provinsi_Target"] || 'Tidak Diketahui';
              if (!factorMap[key]) factorMap[key] = [];
              if (result.predictions) {
                if (result.predictions) {
                  if (result.predictions) {
                    factorMap[key].push(result.predictions[idx]);
                  }
                }
              }
            });
            const labels = Object.keys(factorMap);
            const avgPredictions = labels.map(label => {
              const arr = factorMap[label];
              return arr.reduce((a, b) => a + b, 0) / arr.length;
            });
            return (
              <SortedBarChart
                labels={labels}
                values={avgPredictions}
                title="Provinsi"
                horizontal
              />
            );
          })()}
        </section>
      )}

      {/* 4. Performa Peserta terhadap Variabel Spesifik */}
      {result.inputData && result.predictions && result.inputData.length === result.predictions.length && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
            Performa Peserta terhadap Variabel Spesifik
          </h4>
          <FactorPredictionBarChart
            data={result.inputData}
            predictions={result.predictions}
            factorKey="Status Nikah"
            title="Status Nikah"
          />
          <FactorPredictionBarChart
            data={result.inputData}
            predictions={result.predictions}
            factorKey="Gol/Ruang" // ⬅️ ini sesuai field hasil mapping backend
            title="Golongan/Ruang"
          />
        </section>
      )}

      {/* 5. Feature Importance */}
      {result.feature_importance && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
            Feature Importance
          </h4>
          <FeatureImportanceBarChart importance={result.feature_importance} />
        </section>
      )}

      {/* 6. Kota/Kabupaten Terbaik (Horizontal Bar Chart, diurutkan dari tertinggi) */}
      {result.inputData && result.predictions && result.inputData.length === result.predictions.length && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-3 sm:mb-4">
            Kota/Kabupaten dengan Potensi Nilai Terbaik
          </h4>
          {(() => {
            const factorMap: Record<string, number[]> = {};
            result.inputData.forEach((row, idx) => {
              const key = row["Kelahiran Kabupaten/Kota"] || 'Tidak Diketahui';
              if (!factorMap[key]) factorMap[key] = [];
              if (result.predictions) {
                factorMap[key].push(result.predictions[idx]);
              }
            });
            const labels = Object.keys(factorMap);
            const avgPredictions = labels.map(label => {
              const arr = factorMap[label];
              return arr.reduce((a, b) => a + b, 0) / arr.length;
            });
            return (
              <SortedBarChart
                labels={labels}
                values={avgPredictions}
                title="Kota/Kabupaten"
                horizontal
              />
            );
          })()}
        </section>
      )}


      {result.keyFactorsAnalysis && result.keyFactorsAnalysis.factors.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-200 mb-2 sm:mb-3">{result.keyFactorsAnalysis.title}</h4>
          <div className="space-y-2 sm:space-y-3">
            {result.keyFactorsAnalysis.factors.map((factorInfo, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-slate-700 dark:text-gray-300 text-sm sm:text-base">{factorInfo.factor}</span>
                  {factorInfo.influenceVisual && (
                    <span className="text-primary text-sm sm:text-lg font-mono mt-1 sm:mt-0" aria-label={`Influence: ${factorInfo.influenceLevel}`}>
                      {factorInfo.influenceVisual}
                    </span>
                  )}
                </div>
                {factorInfo.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{factorInfo.description}</p>
                )}
              </div>
            ))}
          </div>
          {result.keyFactorsAnalysis.summary &&
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">{result.keyFactorsAnalysis.summary}</p>
          }
        </section>
      )}
    </div>
  );
};

export default ResultsDisplay;