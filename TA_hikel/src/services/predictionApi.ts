import type { ApiResponse } from '../types/prediction';

// Ambil base URL dari environment variables. Vite akan otomatis memilih
// file .env yang tepat (development atau production) saat build.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

/**
 * Mengirim file CSV ke backend API untuk prediksi.
 * @param file File CSV yang akan dianalisis.
 * @returns Promise yang resolve dengan data JSON dari API.
 */
export const predictFromCSV = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
};