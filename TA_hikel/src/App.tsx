
import React, { useState, useCallback } from 'react';
import Navbar from './assets/Navbar';
import InputForm from './assets/InputForm';
import ResultsDisplay from './assets/ResultsDisplay';
import Footer from './assets/Footer';
import type { FactorBasedPrediction } from '../types';
import { getPredictionFromCsvFile } from './predictionService';

const App: React.FC = () => {
  const [predictionResult, setPredictionResult] = useState<FactorBasedPrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    try {
      const result = await getPredictionFromCsvFile(file);
      setPredictionResult(result);
    } catch (err) {
      setError('Gagal mendapatkan prediksi dari file CSV. Pastikan format file benar dan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        logoSrcs={[
          'public/Logo_PT_Kereta_Api_Indonesia_(Persero)_2020.svg.png',
          'public/Logo_Unpas_Retouch_2021.png',
          'public/3CrR7mBVQQyiDKES92vF_aNY3dXriT319u2mF.png'
          
        ]}
      />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">
            Analisis Prediktif Skor Peserta dari Data CSV
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Selamat datang! Unggah file data peserta (CSV) untuk mendapatkan analisis dan prediksi skor. Aplikasi ini bertujuan untuk:
          </p>
          <ul className="list-disc list-inside text-left max-w-2xl mx-auto mt-4 text-slate-600 dark:text-slate-300 space-y-1 sm:space-y-1.5 text-base sm:text-lg">
            <li>Memanfaatkan hasil identifikasi faktor-faktor dari data untuk meningkatkan nilai peserta pelatihan secara optimal.</li>
            <li>Mengidentifikasi informasi dan variabel relevan dari data peserta dan pengajar (jika ada dalam CSV) untuk analisis mendalam.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8 max-w-3xl mx-auto">
          <div>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          <div>
            <ResultsDisplay result={predictionResult} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>
      <Footer companyName="Tim Analitik EduTech" />
    </div>
  );
};

export default App;











// function App() {
//   const [data, setData] = useState([{}])





  
//   return (
//     <div>App</div>
//   )
// }

// export default App


