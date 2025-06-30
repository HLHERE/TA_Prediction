import type { PredictionResponse } from '../types/prediction';

const API_URL = 'http://127.0.0.1:5000';

interface PredictionInput {
    'Kelahiran Kabupaten/Kota_peserta': string;
    'Umur': number;
    'Status Nikah': string;
    'Gol_Ruang': string;
    'Kelahiran Provinsi': string;
}

const handleFetchError = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            // Try to get error from 'error' or 'message' field
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        // Log the error message for debugging
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
    }
    return response;
};

export const predictScore = async (formData: PredictionInput): Promise<PredictionResponse> => {
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(formData),
        });

        await handleFetchError(response);
        return response.json();
    } catch (error) {
        console.error('Prediction error:', error);
        throw error;
    }
};

export const predictFromCSV = async (file: File): Promise<PredictionResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/predict-csv`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            body: formData,
        });

        await handleFetchError(response);
        return response.json();
    } catch (error) {
        console.error('CSV processing error:', error);
        throw error;
    }
};



