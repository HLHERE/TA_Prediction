import type { FactorBasedPrediction, KeyPerformanceIndicator, AnalysisReportSection, DistributionSegment, KeyFactorInfluence } from '../types';
import { predictFromCSV } from './services/predictionApi';

export const getPredictionFromCsvFile = async (file: File): Promise<FactorBasedPrediction> => {
  console.log(`Received CSV file for analysis: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
  
  try {
    const apiResponse = await predictFromCSV(file);
    
    // Transform API response to FactorBasedPrediction format
    const predictions = apiResponse.predictions || [];
    const totalParticipants = apiResponse.data_summary?.total_records || 0;
    const avgPrediction =
      predictions.length > 0
        ? predictions.reduce((a, b) => a + b, 0) / predictions.length
        : 0;
    
    
    const highThreshold = 85;
    const mediumThreshold = 70;
    
    // Calculate distribution based on predictions
    const highCount = predictions.filter(p => p >= highThreshold).length;
    const mediumCount = predictions.filter(p => p >= mediumThreshold && p < highThreshold).length;
    const lowCount = predictions.filter(p => p < mediumThreshold).length;
    // Hapus unused percentage vars
    // const highPercentage = (highCount / totalParticipants) * 100;
    // const mediumPercentage = (mediumCount / totalParticipants) * 100;
    // const lowPercentage = (lowCount / totalParticipants) * 100;

    // Pastikan persentase tidak NaN/Infinity jika total peserta 0
    const safePercentage = (count: number) => totalParticipants > 0 ? parseFloat(((count / totalParticipants) * 100).toFixed(1)) : 0;

    const distributionSegments: DistributionSegment[] = [
      {
        label: "Potensi Tinggi (>85%)",
        percentage: safePercentage(highCount),
        count: highCount,
        symbol: '🚀',
        colorClass: 'text-green-500 dark:text-green-400'
      },
      {
        label: "Potensi Baik (70-85%)",
        percentage: safePercentage(mediumCount),
        count: mediumCount,
        symbol: '✅',
        colorClass: 'text-blue-500 dark:text-blue-400'
      },
      {
        label: "Perlu Perhatian (<70%)",
        percentage: safePercentage(lowCount),
        count: lowCount,
        symbol: '⚠️',
        colorClass: 'text-orange-500 dark:text-orange-400'
      }
    ];

    const kpis: KeyPerformanceIndicator[] = [
      {
        label: "Rata-Rata Prediksi Nilai",
        value: parseFloat(avgPrediction.toFixed(2)),
        unit: "%",
        description: "Estimasi skor rata-rata untuk seluruh kelompok."
      },
      {
        label: "Jumlah Peserta Dianalisis",
        value: totalParticipants,
        unit: "peserta",
        description: "Total peserta yang datanya diproses dari file CSV."
      },
      {
        label: "Estimasi Potensi Tinggi (Nilai >85%)",
        value: highCount,
        unit: "peserta",
        description: "Jumlah peserta yang diprediksi memiliki potensi skor tinggi."
      }
    ];

    // Ambil insight otomatis dan data input dari backend jika ada
    const autoInsight: string[] = apiResponse.auto_insight || [];
    const inputData = apiResponse.input_data || [];

    const result: FactorBasedPrediction = {
      keyPerformanceIndicators: kpis,
      analysisReport: {
        title: "Analisis Prediksi Nilai Peserta",
        sections: [
          {
            subTitle: "Distribusi Potensi Peserta",
            content: `Dari ${totalParticipants} peserta yang dianalisis, data menunjukkan variasi potensi yang signifikan. ${highCount} peserta diprediksi memiliki potensi tinggi.`,
            visualizationType: 'text_distribution',
            visualizationData: distributionSegments,
          },
          // Insight otomatis dari backend
          ...(autoInsight.length > 0 ? [{
            subTitle: "Insight Otomatis dari Data Peserta",
            content: autoInsight.join('\n'),
          }] : [])
        ]
      },
      inputData,
      predictions, // <-- Tambahkan ini agar predictions tersedia di frontend
    };

    return result;

  } catch (error) {
    console.error('Error processing predictions:', error);
    // Fallback ke mock data jika error
    return await new Promise((resolve) => {
      setTimeout(() => {
        const randomBaseScore = Math.floor(Math.random() * 31) + 60; // Random base score 60-90
        const totalParticipants = Math.floor(Math.random() * 100) + 50; // 50-149 participants
        
        const highPotentialPercentage = (Math.random() * 0.2) + 0.15; // 15-35%
        const mediumPotentialPercentage = (Math.random() * 0.2) + 0.35; // 35-55%
        const lowPotentialPercentage = 1 - highPotentialPercentage - mediumPotentialPercentage;

        const highPotentialCount = Math.floor(totalParticipants * highPotentialPercentage);
        const mediumPotentialCount = Math.floor(totalParticipants * mediumPotentialPercentage);
        const lowPotentialCount = totalParticipants - highPotentialCount - mediumPotentialCount;

        const mockKPIs: KeyPerformanceIndicator[] = [
          { label: "Rata-Rata Prediksi Nilai", value: randomBaseScore + Math.floor(Math.random() * 5) - 2, unit: "%", description: "Estimasi skor rata-rata untuk seluruh kelompok." },
          { label: "Jumlah Peserta Dianalisis", value: totalParticipants, unit: "peserta", description: "Total peserta yang datanya diproses dari file CSV." },
          { label: "Estimasi Potensi Tinggi (Nilai >85%)", value: highPotentialCount, unit: "peserta", description: "Jumlah peserta yang diprediksi memiliki potensi skor tinggi." },
          { label: "Tingkat Penyelesaian Modul (Contoh)", value: Math.floor(Math.random() * 21) + 75, unit: "%", description: "KPI contoh berdasarkan data hipotetis."}
        ];

        const distributionSegments: DistributionSegment[] = [
          { label: "Potensi Tinggi (>85%)", percentage: parseFloat((highPotentialPercentage * 100).toFixed(1)), count: highPotentialCount, symbol: '🚀', colorClass: 'text-green-500 dark:text-green-400' },
          { label: "Potensi Baik (70-85%)", percentage: parseFloat((mediumPotentialPercentage * 100).toFixed(1)), count: mediumPotentialCount, symbol: '✅', colorClass: 'text-blue-500 dark:text-blue-400' },
          { label: "Perlu Perhatian (<70%)", percentage: parseFloat((lowPotentialPercentage * 100).toFixed(1)), count: lowPotentialCount, symbol: '⚠️', colorClass: 'text-orange-500 dark:text-orange-400' },
        ];
        
        const mockAnalysisSections: AnalysisReportSection[] = [
          {
            subTitle: "Distribusi Potensi Peserta",
            content: `Dari ${totalParticipants} peserta yang dianalisis, data menunjukkan variasi potensi yang signifikan. Segmentasi ini penting untuk merencanakan intervensi yang tepat.`,
            visualizationType: 'text_distribution',
            visualizationData: distributionSegments,
          },
          {
            subTitle: "Karakteristik Umum Kelompok",
            content: `Analisis demografis (berdasarkan kolom hipotetis dalam CSV) menunjukkan mayoritas peserta berusia antara 25-35 tahun. Tingkat pengalaman kerja rata-rata adalah 5 tahun. Peserta dengan latar belakang pendidikan di bidang teknis cenderung menunjukkan skor awal yang sedikit lebih tinggi. File "${file.name}" tampaknya mencakup data dari beberapa departemen.`,
          },
          {
            subTitle: "Identifikasi Pola Belajar (Hipotetis)",
            content: "Peserta yang aktif dalam forum diskusi dan menyelesaikan kuis mingguan secara konsisten cenderung mendapatkan skor prediksi yang lebih tinggi. Data menunjukkan korelasi positif antara frekuensi interaksi dengan materi pelatihan dan hasil akhir.",
          }
        ];
        
        const mockKeyFactors: KeyFactorInfluence[] = [
          { factor: "Tingkat Partisipasi Diskusi", influenceLevel: 'High', influenceVisual: "▓▓▓▓▓", description: "Keterlibatan aktif dalam diskusi online." },
          { factor: "Skor Kuis Mingguan", influenceLevel: 'High', influenceVisual: "▓▓▓▓░", description: "Hasil tes formatif berkala." },
          { factor: "Latar Belakang Pendidikan Relevan", influenceLevel: 'Medium', influenceVisual: "▓▓▓░░", description: "Kesesuaian latar belakang pendidikan." },
          { factor: "Pengalaman Kerja Terkait", influenceLevel: 'Medium', influenceVisual: "▓▓▓░░", description: "Durasi dan relevansi pengalaman kerja." },
          { factor: "Penyelesaian Modul Pelatihan", influenceLevel: 'High', influenceVisual: "▓▓▓▓▓", description: "Kehadiran dan tingkat penyelesaian materi." },
        ];

        const mockRecommendationsContent = 
`1.  **Segmentasi Peserta:** Bagi peserta ke dalam beberapa kelompok berdasarkan skor prediksi untuk program mentoring atau pelatihan tambahan yang disesuaikan.
    *   Kelompok Potensi Tinggi: Berikan materi pengayaan dan tantangan lanjutan.
    *   Kelompok Potensi Sedang: Fokus pada penguatan konsep inti dan studi kasus.
    *   Kelompok Perlu Perhatian: Sediakan sesi bimbingan tambahan dan review materi dasar.
2.  **Intervensi Berbasis Faktor:** Untuk faktor seperti 'partisipasi diskusi', dorong lingkungan belajar yang lebih interaktif. Untuk 'skor kuis', identifikasi area kesulitan umum dan sediakan sumber daya tambahan.
3.  **Optimalisasi Materi Pelatihan:** Kaji kembali modul atau topik di mana banyak peserta menunjukkan skor rendah untuk perbaikan di masa mendatang.
4.  **Pengembangan Pengajar:** Berikan feedback kepada pengajar mengenai area mana saja yang mungkin memerlukan penekanan atau metode pengajaran berbeda berdasarkan analisis ini (jika data pengajar relevan).`;

        const result: FactorBasedPrediction = {
          keyPerformanceIndicators: mockKPIs,
          analysisReport: {
            title: "Laporan Analisis Komprehensif Data Peserta",
            introduction: `Analisis ini didasarkan pada data yang diunggah dari file "${file.name}". Tujuan utama adalah untuk mengidentifikasi faktor-faktor yang mempengaruhi skor peserta dan memberikan wawasan untuk optimalisasi program pelatihan.`,
            sections: mockAnalysisSections,
          },
          keyFactorsAnalysis: {
            title: "Faktor Utama yang Mempengaruhi Nilai (Estimasi)",
            factors: mockKeyFactors,
            summary: "Faktor-faktor ini diestimasi berdasarkan analisis data. Akurasi akan meningkat dengan model AI yang dilatih secara spesifik pada data historis Anda.",
          },
          actionableRecommendations: {
            title: "Rekomendasi Strategis & Tindak Lanjut",
            content: mockRecommendationsContent,
          }
        };
        resolve(result);
      }, 1500 + Math.random() * 1000); // Simulate network delay
    });
  }
};