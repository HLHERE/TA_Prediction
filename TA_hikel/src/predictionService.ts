import type { FactorBasedPrediction, KeyPerformanceIndicator, DistributionSegment } from '../types';
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
    throw error; // <-- Ubah di sini!
  }
};