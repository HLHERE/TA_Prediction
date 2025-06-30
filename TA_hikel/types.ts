export interface KeyPerformanceIndicator {
  label: string;
  value: string | number;
  unit?: string;
  description?: string; // Optional short description for the KPI
}

export interface DistributionSegment {
  label: string;
  percentage: number;
  count: number;
  symbol?: string; // e.g., '▓', '●', or an emoji
  colorClass?: string; // Tailwind color class for text/symbol (e.g., 'text-green-500')
}

export interface KeyFactorInfluence {
  factor: string;
  influenceLevel: 'High' | 'Medium' | 'Low' | number; // Qualitative or quantitative score
  influenceVisual?: string; // e.g., "▓▓▓▓▓" or "★★★☆☆"
  description?: string;
}

export interface AnalysisReportSection {
  subTitle: string;
  content: string; // Text content, can include formatted lists, paragraphs
  visualizationType?: 'text_distribution' | 'text_bar_chart'; // Hint for rendering
  visualizationData?: DistributionSegment[] | KeyFactorInfluence[]; // Specific data for the viz
}

export interface FactorBasedPrediction {
  keyPerformanceIndicators?: KeyPerformanceIndicator[];
  
  analysisReport?: {
    title: string;
    introduction?: string;
    sections: AnalysisReportSection[];
  };

  keyFactorsAnalysis?: { // Changed from keyFactors: string[]
    title: string;
    factors: KeyFactorInfluence[];
    summary?: string; 
  };
  
  actionableRecommendations?: {
    title: string;
    content: string; 
  };

  // Tambahan agar bisa akses data input dan insight otomatis
  inputData?: import('./src/types/prediction').PredictionFormData[];

  // Tambahan agar bisa akses array prediksi nilai
  predictions?: number[];

  // Tambahan agar bisa akses jumlah peserta dari backend
  n_participants?: number;

  // Tambahan untuk fitur feature importance (dari backend Flask)
  feature_importance?: Record<string, number>;

  // Tambahkan pada FactorBasedPrediction di types.ts
  comparison?: Array<{
    NILAI: number;
    Prediksi: number;
    Error: number;
    'Error (%)': number;
  }>;
  summary_error?: {
    MAE: number;
    MSE: number;
    RMSE: number;
  };
}