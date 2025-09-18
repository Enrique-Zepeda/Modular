import os
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

# --- 1. Model Training (This runs only once when the server starts) ---

# Cargar los datos desde el archivo CSV (rutas relativas/robustas)
DATA_FILE_CANDIDATES = [
    os.path.join(os.path.dirname(__file__), "gym_routines_dataset.csv"),
    os.path.join(os.getcwd(), "python", "gym_routines_dataset.csv"),
    os.path.join(os.getcwd(), "gym_routines_dataset.csv"),
]

df = None
for candidate in DATA_FILE_CANDIDATES:
    try:
        if os.path.exists(candidate):
            df = pd.read_csv(candidate)
            print(f"✅ Datos cargados correctamente desde: {candidate}")
            break
    except Exception as exc:
        print(f"⚠️  No se pudo leer '{candidate}': {exc}")

if df is None:
    print("❌ Error: No se encontró el archivo 'gym_routines_dataset.csv'.")
    raise FileNotFoundError("gym_routines_dataset.csv no encontrado en rutas conocidas")

# Preprocessing and Encoding
df_encoded = df.copy()
encoders = {}
for column in df.columns:
    if df[column].dtype == 'object':
        le = LabelEncoder()
        df_encoded[column] = le.fit_transform(df[column])
        encoders[column] = le

X = df_encoded.drop('Rutina', axis=1)

y = df_encoded['Rutina']

# Model Training
tree_clf = DecisionTreeClassifier(criterion='entropy', random_state=42)
tree_clf.fit(X, y)
print("✅ Modelo de Árbol de Decisión entrenado y listo.")


# --- 2. API Server Setup ---

app = Flask(__name__)
# Configuración CORS explícita para el frontend local
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=False,
)

@app.after_request
def apply_cors_headers(response):
    # Asegura cabeceras mínimas para navegadores exigentes
    response.headers.setdefault("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.setdefault("Vary", "Origin")
    response.headers.setdefault(
        "Access-Control-Allow-Headers", "Content-Type, Authorization"
    )
    response.headers.setdefault(
        "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
    )
    return response


def normalizar_entrada(objetivo: str, nivel: str, dias, tiempo):
    objetivo_map = {
        "ganar músculo": "Ganar Musculo",
        "ganar musculo": "Ganar Musculo",
        "perder grasa": "Perder Grasa",
        "mantenerse": "Mantenerse",
    }
    nivel_map = {
        "principiante": "Principiante",
        "intermedio": "Intermedio",
        "avanzado": "Avanzado",
    }

    def parse_int(value, default=None):
        try:
            return int(value)
        except Exception:
            return default

    objetivo_norm = objetivo_map.get(str(objetivo).strip().lower())
    nivel_norm = nivel_map.get(str(nivel).strip().lower())

    dias_str = str(dias).strip().lower()
    if dias_str in {"5 o más", "5 o mas", "5+", ">=5", "5 o más días"}:
        dias_norm = 5
    else:
        dias_norm = parse_int(dias_str)

    tiempo_str = str(tiempo).strip().lower().replace(" minutos", " min")
    if "+" in tiempo_str:
        tiempo_norm = parse_int(tiempo_str.split("+")[0])
    else:
        tiempo_norm = parse_int(tiempo_str.split()[0])

    if not objetivo_norm or not nivel_norm or dias_norm is None or tiempo_norm is None:
        raise ValueError("Entradas inválidas. Verifique objetivo, nivel, días y tiempo.")

    return objetivo_norm, nivel_norm, dias_norm, tiempo_norm


def predecir_rutina(objetivo, nivel, dias, tiempo):
    objetivo_norm, nivel_norm, dias_norm, tiempo_norm = normalizar_entrada(
        objetivo, nivel, dias, tiempo
    )
    nuevo_usuario_df = pd.DataFrame({
        'Objetivo': [objetivo_norm], 'Nivel': [nivel_norm], 'Dias': [dias_norm], 'Tiempo': [tiempo_norm]
    })
    for column in ['Objetivo', 'Nivel']:
        try:
            nuevo_usuario_df[column] = encoders[column].transform(nuevo_usuario_df[column])
        except Exception as exc:
            raise ValueError(f"Valor no reconocido para {column}: {exc}")
    try:
        prediccion_codificada = tree_clf.predict(nuevo_usuario_df)
        rutina_recomendada = encoders['Rutina'].inverse_transform(prediccion_codificada)
    except Exception as exc:
        raise RuntimeError(f"Fallo al predecir: {exc}")
    return rutina_recomendada[0]

@app.route('/predict', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173"], allow_headers=["Content-Type", "Authorization"], methods=["POST", "OPTIONS"])
def predict():
    # Preflight
    if request.method == 'OPTIONS':
        return ('', 204)

    data = request.get_json(silent=True) or {}
    required_fields = ['objetivo', 'nivel', 'dias', 'tiempo']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan datos en la solicitud."}), 400

    try:
        recomendacion = predecir_rutina(data['objetivo'], data['nivel'], data['dias'], data['tiempo'])
        return jsonify({'rutina_recomendada': recomendacion})
    except Exception as e:
        return jsonify({"error": f"Error al procesar la solicitud: {e}"}), 400

@app.route('/health', methods=['GET', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173"], methods=["GET", "OPTIONS"])
def health():
    if request.method == 'OPTIONS':
        return ('', 204)
    return jsonify({
        "status": "ok",
        "model": "DecisionTreeClassifier",
        "samples": int(len(df)),
    })

# --- 3. Run the Server ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)