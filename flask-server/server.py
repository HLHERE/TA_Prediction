from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.10.253:3000"
])

# Load the trained pipeline (including encoders and model)
pipeline = joblib.load('file_joblib/pipeline_with_best_model.joblib')

# Mapping kolom input dari user ke nama kolom yang dipakai saat training
COLUMN_MAPPING = {
    'Kelahiran Kabupaten/Kota_peserta': 'Kelahiran Kabupaten/Kota',
    'Umur': 'Umur Thn',
    'Status Nikah': 'Status Nikah',
    'Gol_Ruang': 'Gol/Ruang',
    'Kelahiran Provinsi': 'Provinsi_Target',
}

def map_input_columns(df):
    df = df.rename(columns={k: v for k, v in COLUMN_MAPPING.items() if k in df.columns})
    return df

# Preprocessing helpers (for plotting/insight only, not for prediction)
def create_feature_importance_plot(feature_names, importance_scores):
    plt.figure(figsize=(10, 6))
    importance_df = pd.DataFrame({
        'features': feature_names,
        'importance': importance_scores
    }).sort_values('importance', ascending=True)
    plt.barh(importance_df['features'], importance_df['importance'])
    plt.title('Feature Importance')
    plt.xlabel('Importance Score')
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    return base64.b64encode(buffer.getvalue()).decode()

# 🔄 Shared prediction logic
def preprocess_and_predict(df):
    # Pastikan input ke pipeline sesuai dengan yang diharapkan model
    df = map_input_columns(df)
    print("Kolom setelah mapping:", df.columns.tolist())
    print("Sample Gol/Ruang:", df['Gol/Ruang'].unique() if 'Gol/Ruang' in df.columns else "Tidak ada kolom Gol/Ruang")
    try:
        # Coba prediksi dengan DataFrame (dengan nama kolom)
        predictions = pipeline.predict(df)
    except Exception as e:
        # Jika gagal (misal: model tidak kenal feature names), coba tanpa nama kolom
        predictions = pipeline.predict(df.values)

    # --- Analisis Otomatis ---
    provinsi_terbanyak = df['Provinsi_Target'].mode()[0] if 'Provinsi_Target' in df.columns and not df['Provinsi_Target'].mode().empty else None
    kabupaten_terbanyak = df['Kelahiran Kabupaten/Kota'].mode()[0] if 'Kelahiran Kabupaten/Kota' in df.columns and not df['Kelahiran Kabupaten/Kota'].mode().empty else None
    umur_rata2 = df['Umur Thn'].mean() if 'Umur Thn' in df.columns else None
    umur_maks = df['Umur Thn'].max() if 'Umur Thn' in df.columns else None
    umur_min = df['Umur Thn'].min() if 'Umur Thn' in df.columns else None
    rekomendasi = []
    if provinsi_terbanyak:
        rekomendasi.append(f"Banyak peserta berasal dari provinsi {provinsi_terbanyak}. Perlu perhatian khusus untuk pengembangan materi sesuai karakteristik daerah ini.")
    if kabupaten_terbanyak:
        rekomendasi.append(f"Kabupaten/Kota dengan peserta terbanyak: {kabupaten_terbanyak}.")
    if umur_rata2 is not None:
        if umur_rata2 > 50:
            rekomendasi.append("Rata-rata umur peserta di atas 50 tahun. Pertimbangkan metode pembelajaran yang sesuai untuk usia dewasa/mature learner.")
        elif umur_rata2 < 30:
            rekomendasi.append("Banyak peserta berusia muda. Materi bisa lebih interaktif dan berbasis teknologi.")
        else:
            rekomendasi.append(f"Rata-rata umur peserta: {umur_rata2:.1f} tahun.")
    if umur_min is not None and umur_maks is not None:
        rekomendasi.append(f"Umur termuda: {umur_min}, tertua: {umur_maks}.")

    # Plot pentingnya fitur (jika pipeline mendukung .named_steps['regressor'])
    try:
        reg = pipeline.named_steps['regressor'] if hasattr(pipeline, 'named_steps') and 'regressor' in pipeline.named_steps else pipeline
        feature_importance = getattr(reg, 'feature_importances_', None)
        feature_names = getattr(reg, 'feature_names_in_', None)
        if feature_importance is not None and feature_names is not None:
            # Pastikan panjang sama
            if len(feature_importance) == len(feature_names):
                importance_plot = create_feature_importance_plot(feature_names, feature_importance)
                feature_importance_dict = dict(zip(feature_names, feature_importance.tolist()))
            else:
                print("❌ Panjang feature_importance dan feature_names tidak sama")
                importance_plot = None
                feature_importance_dict = None
        else:
            importance_plot = None
            feature_importance_dict = None
    except Exception as e:
        print("❌ Feature importance error:", e)
        importance_plot = None
        feature_importance_dict = None

    # Perbandingan prediksi dengan nilai aktual (jika tersedia)
    if 'NILAI' in df.columns:
        df['Prediksi'] = predictions
        df['Error'] = df['Prediksi'] - df['NILAI']
        df['Error (%)'] = 100 * df['Error'] / df['NILAI'].replace(0, np.nan)
        
        comparison_result = df[['NILAI', 'Prediksi', 'Error', 'Error (%)']].to_dict(orient='records')
        summary_error = {
            'MAE': float(np.mean(np.abs(df['Error']))),
            'MSE': float(np.mean(df['Error'] ** 2)),
            'RMSE': float(np.sqrt(np.mean(df['Error'] ** 2))),
        }
    else:
        comparison_result = None
        summary_error = None

    result = {
        'predictions': predictions.tolist(),
        'n_participants': len(predictions),
        'feature_importance_plot': importance_plot,  # base64 PNG (opsional, jika ingin chart gambar)
        'feature_importance': feature_importance_dict,  # <-- ini yang dipakai frontend chart
        'data_summary': df.describe(include='all').replace({np.nan: None}).to_dict(),
        'input_data': df.to_dict(orient='records'),
        'auto_insight': rekomendasi,
        'comparison': comparison_result,
        'summary_error': summary_error
    }
    return result

# ✅ Endpoint untuk prediksi dari file CSV
@app.route('/predict-csv', methods=['POST'])
def predict_csv():
    try:
        file = request.files['file']
        filename = file.filename.lower()
        # Deteksi tipe file
        if filename.endswith('.csv'):
            # Coba auto-detect delimiter (koma atau titik koma)
            content = file.read()
            try:
                df = pd.read_csv(io.BytesIO(content), encoding='utf-8')
                if len(df.columns) == 1 and ';' in df.columns[0]:
                    df = pd.read_csv(io.BytesIO(content), delimiter=';', encoding='utf-8')
            except Exception:
                df = pd.read_csv(io.BytesIO(content), delimiter=';', encoding='utf-8')
        elif filename.endswith('.xls') or filename.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Format file tidak didukung. Upload file CSV, XLS, atau XLSX.'}), 400

        print("✅ Data masuk:", df.columns.tolist())
        result = preprocess_and_predict(df)
        return jsonify(result)
    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({'error': str(e)}), 400

# ✅ Endpoint untuk prediksi dari input JSON
@app.route('/predict', methods=['POST'])
def predict_json():
    try:
        data = request.get_json()
        df = pd.DataFrame([data])

        print("✅ Data JSON masuk:", df.columns.tolist())
        result = preprocess_and_predict(df)
        return jsonify(result)
    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({'error': str(e)}), 400

@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': str(e)}), 400

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
