export interface PredictionFormData {
    'Kelahiran Kabupaten/Kota_peserta': string;
    'Umur': number;
    'Status Nikah': string;
    'Gol_Ruang': string;
    'Kelahiran Provinsi': string;
    // Tambahan agar kompatibel dengan hasil mapping backend
    'Umur Thn'?: number | string;
    'Provinsi_Target'?: string;
    'Kelahiran Kabupaten/Kota'?: string;
}

export interface DataSummary {
    total_records: number;
    golongan_distribution: { [key: string]: number };
    avg_age: number;
    status_nikah_distribution: { [key: string]: number };
    provinces: string[];
    cities: string[];
}

export interface PredictionResponse {
    status?: string;
    prediction?: number[];
    predictions?: number[];
    message?: string;
    error?: string;
    data_summary?: DataSummary;
    input_data?: PredictionFormData[];
    auto_insight?: string[];
}
