from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import io
import base64
import matplotlib
from scipy.stats import boxcox
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://192.168.10.253:3000",
    "http://192.168.10.106:3000"
])

pipeline = joblib.load('file_joblib/pipeline_with_best_model.joblib')

# Mapping nama kolom dari front-end
COLUMN_MAPPING = {
    'Kelahiran Kabupaten/Kota_peserta': 'Kelahiran Kabupaten/Kota',
    'Umur': 'Umur Thn',
    'Status Nikah': 'Status Nikah',
    'Gol_Ruang': 'Gol/Ruang',
    'Kelahiran Provinsi': 'Provinsi_Target',
}

# ------------------- Tambahkan dari hasil training -------------------
label_encoder_classes = ['Belum Menikah', 'Menikah',]  # SESUAI URUTAN training
gol_ruang_categories = [['II/A', 'II/B', 'II/C', 'II/D', 'III/A', 'III/B', 'III/C', 'III/D']]  # sesuai training

tempat_lahir_means = {
    'BANDAR LAMPUNG': 82.25,
    'BANTUL': 87.0,
    'BANYUWANGI': 82.0,
    'BATAM': 80.0,
    'BOGOR': 84.0,
    'BOJONEGORO': 81.0,
    'BUMISARI': 94.0,
    'CIAMIS': 82.0,
    'CILACAP': 88.0,
    'CIREBON': 85.0,
    'DKI Jakarta': 81.0,
    'JAKARTA PUSAT': 87.08,
    'JAKARTA SELATAN': 83.0,
    'KABUPATEN SEMARANG': 93.0,
    'KARAWANG': 86.9,
    'KULON PROGO': 82.7,
    'Kabupaten Agam': 90.3,
    'Kabupaten Asahan': 83.6,
    'Kabupaten BANTUL': 86.4,
    'Kabupaten Banjarnegara': 84.0,
    'Kabupaten Bantul': 89.34,
    'Kabupaten Banyuasin': 91.0,
    'Kabupaten Banyumas': 85.0,
    'Kabupaten Batanghari': 79.0,
    'Kabupaten Bengkulu Utara': 89.0,
    'Kabupaten Blora': 80.5,
    'Kabupaten Dairi': 88.7,
    'Kabupaten Demak': 80.0,
    'Kabupaten Grobogan': 79.0,
    'Kabupaten Jember': 78.0,
    'Kabupaten Karanganyar': 83.0,
    'Kabupaten Kendal': 81.0,
    'Kabupaten Klaten': 81.0,
    'Kabupaten Kulon Progo': 87.5,
    'Kabupaten Lahat': 88.5,
    'Kabupaten Nganjuk': 95.0,
    'Kabupaten Ogan Komering Ilir': 83.0,
    'Kabupaten Ogan Komering Ulu': 87.0,
    'Kabupaten Pacitan': 80.0,
    'Kabupaten Padang Pariaman': 83.0,
    'Kabupaten Ponorogo': 81.0,
    'Kabupaten Semarang': 80.0,
    'Kabupaten Sidoarjo': 87.0,
    'Kabupaten Sijunjung': 84.0,
    'Kabupaten Sintang': 85.0,
    'Kabupaten Sukoharjo': 90.0,
    'Kabupaten Trenggalek': 93.0,
    'Kabupaten Tulang Bawang': 79.0,
    'Kabupaten Tulungagung': 96.0,
    'Kabupaten Wonogiri': 80.0,
    'Kabupaten Wonosobo': 79.0,
    'Kabupaten rembang': 82.0,
    'Kota Padang': 82.0,
    'Kota Bandar Lampung': 87.4,
    'Kota Bandung': 82.0,
    'Kota Bekasi': 81.0,
    'Kota Binjai': 84.0,
    'Kota Bontang': 83.0,
    'Kota Magelang': 82.0,
    'Kota PAYAKUMBUH': 94.62,
    'Kota Pasuruan': 89.0,
    'Kota Pekalongan': 95.7,
    'Kota Prabumulih': 86.0,
    'Kota Solok': 88.0,
    'Kota Sukabumi': 81.0,
    'Kota Tangerang': 82.75,
    'Lampung': 87.0,
    'MADIUN': 86.0,
    'MALANG': 82.0,
    'MEDAN': 87.0,
    'MOJOKERTO': 82.0,
    'NGANJUK': 90.0,
    'PALEMBANG': 85.0,
    'PASURUAN': 86.0,
    'PROBOLINGGO': 84.0,
    'PURWAKARTA': 82.0,
    'REMBANG': 81.0,
    'SEMARANG': 82.0,
    'SERANG': 79.8,
    'SLEMAN': 85.0,
    'SURABAYA': 84.5,
    'TASIKMALAYA': 81.0,
    'TEGAL': 83.0,
    'YOGYAKARTA': 84.0,
    'kabupaten rembang': 80.0,
    'kota PARIAMAN': 78.0
    # Tambahkan semua sesuai hasil training
}
provinsi_target_means = {
    'Banten': 82.617910,
    'Bengkulu': 89.000000,
    'Di Yogyakarta': 86.047262,
    'Jakarta': 82.370230,
    'Jambi': 79.000000,
    'Jawa Barat': 82.733519,
    'Jawa Tengah': 82.344796,
    'Jawa Timur': 84.935090,
    'Kalimantan Barat': 85.000000,
    'Kalimantan Timur': 83.000000,
    'Kepulauan Riau': 80.000000,
    'Lampung': 81.347619,
    'Padang': 84.450000,
    'Sumatera Barat': 83.440916,
    'Sumatera Selatan': 85.670794,
    'Sumatera Utara': 86.160000,
    'Sumatra Utara': 92.000000,
    # Tambahkan semua sesuai hasil training
}
global_mean = 65.0  # fallback kalau value tidak ditemukan

# ------------------- Manual Preprocessing -------------------
def map_input_columns(df):
    return df.rename(columns={k: v for k, v in COLUMN_MAPPING.items() if k in df.columns})

def manual_preprocessing(df):
    df['Umur Thn'] = df['Umur Thn'].astype(float)
    df['Umur_Thn_BoxCox'], _ = boxcox(df['Umur Thn'] + 1e-3)

    le = LabelEncoder()
    le.classes_ = np.array(label_encoder_classes)
    df['Status Nikah_encoded'] = le.transform(df['Status Nikah'])

    oe = OrdinalEncoder(categories=gol_ruang_categories)
    df['Gol_Ruang_encoded'] = oe.fit_transform(df[['Gol/Ruang']])

    df['Kelahiran Kabupaten/Kota_peserta_encoded'] = df['Kelahiran Kabupaten/Kota'].map(tempat_lahir_means)
    df['Kelahiran Kabupaten/Kota_peserta_encoded'] = df['Kelahiran Kabupaten/Kota_peserta_encoded'].fillna(global_mean)
    
    df['Provinsi_Target_Nama'] = df['Provinsi_Target']

    df['Provinsi_Target'] = df['Provinsi_Target'].map(provinsi_target_means)
    df['Provinsi_Target'] = df['Provinsi_Target'].fillna(global_mean)

    return df[[
        'Umur_Thn_BoxCox',
        'Status Nikah_encoded',
        'Gol_Ruang_encoded',
        'Kelahiran Kabupaten/Kota_peserta_encoded',
        'Provinsi_Target'
    ]]

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

# ------------------- Fungsi Prediksi -------------------
def preprocess_and_predict(df):
    df = map_input_columns(df)
    df_model = manual_preprocessing(df)
    predictions = pipeline.predict(df_model)

    # Analisis tambahan
    provinsi_terbanyak = df['Provinsi_Target'].mode()[0] if 'Provinsi_Target' in df.columns and not df['Provinsi_Target'].mode().empty else None
    kabupaten_terbanyak = df['Kelahiran Kabupaten/Kota'].mode()[0] if 'Kelahiran Kabupaten/Kota' in df.columns and not df['Kelahiran Kabupaten/Kota'].mode().empty else None
    umur_rata2 = df['Umur Thn'].mean() if 'Umur Thn' in df.columns else None
    umur_maks = df['Umur Thn'].max() if 'Umur Thn' in df.columns else None
    umur_min = df['Umur Thn'].min() if 'Umur Thn' in df.columns else None
    rekomendasi = []
    if provinsi_terbanyak:
        rekomendasi.append(f"Banyak peserta berasal dari provinsi {provinsi_terbanyak}.")
    if kabupaten_terbanyak:
        rekomendasi.append(f"Kabupaten/Kota dengan peserta terbanyak: {kabupaten_terbanyak}.")
    if umur_rata2 is not None:
        if umur_rata2 > 50:
            rekomendasi.append("Rata-rata umur peserta di atas 50 tahun.")
        elif umur_rata2 < 30:
            rekomendasi.append("Banyak peserta berusia muda.")
        else:
            rekomendasi.append(f"Rata-rata umur peserta: {umur_rata2:.1f} tahun.")
    if umur_min is not None and umur_maks is not None:
        rekomendasi.append(f"Umur termuda: {umur_min}, tertua: {umur_maks}.")

    try:
        reg = pipeline.named_steps['regressor'] if hasattr(pipeline, 'named_steps') and 'regressor' in pipeline.named_steps else pipeline
        feature_importance = getattr(reg, 'feature_importances_', None)
        feature_names = getattr(reg, 'feature_names_in_', None)
        if feature_importance is not None and feature_names is not None:
            if len(feature_importance) == len(feature_names):
                importance_plot = create_feature_importance_plot(feature_names, feature_importance)
                feature_importance_dict = dict(zip(feature_names, feature_importance.tolist()))
            else:
                importance_plot = None
                feature_importance_dict = None
        else:
            importance_plot = None
            feature_importance_dict = None
    except Exception as e:
        print("❌ Feature importance error:", e)
        importance_plot = None
        feature_importance_dict = None

    if 'Gol/Ruang' in df.columns:
        df.rename(columns={'Gol/Ruang': 'Gol_Ruang'}, inplace=True)

    df['Provinsi_Target'] = df['Provinsi_Target_Nama']
    result = {
        'predictions': predictions.tolist(),
        'n_participants': len(predictions),
        'feature_importance_plot': importance_plot,
        'feature_importance': feature_importance_dict,
        'data_summary': df.describe(include='all').replace({np.nan: None}).to_dict(),
        'input_data': df.to_dict(orient='records'),
        'auto_insight': rekomendasi,
        'comparison': None,
        'summary_error': None
    }
    return result

# ------------------- API Endpoint -------------------
@app.route('/predict-csv', methods=['POST'])
def predict_csv():
    try:
        file = request.files['file']
        filename = file.filename.lower()
        if filename.endswith('.csv'):
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

        REQUIRED_COLUMNS = [
            'Kelahiran Kabupaten/Kota_peserta', 'Umur', 'Status Nikah', 'Gol_Ruang', 'Kelahiran Provinsi'
        ]
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            return jsonify({'error': f'Format data tidak sesuai. Kolom kurang: {missing}'}), 400

        print("✅ Data masuk:", df.columns.tolist())
        result = preprocess_and_predict(df)
        return jsonify(result)
    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({'error': str(e)}), 400

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
