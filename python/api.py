import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- 1. Carga y Preparación de Datos ---

# Cargar el nuevo dataset con más registros y variables
DATA_FILE = "pruebas.csv" 
try:
    # Intenta construir una ruta más robusta
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, DATA_FILE)
    if not os.path.exists(data_path):
        data_path = DATA_FILE # Fallback a ruta relativa si no se encuentra

    df = pd.read_csv(data_path)
    print(f"✅ Datos cargados correctamente desde: {data_path}")
    print(f"Total de registros: {len(df)}")
except FileNotFoundError:
    print(f"❌ Error: No se encontró el archivo '{DATA_FILE}'. Asegúrate de que esté en la misma carpeta que el script.")
    # Termina la ejecución si no hay datos, ya que el modelo no se puede entrenar
    exit()

# --- 2. Preprocesamiento y Codificación ---

df_encoded = df.copy()
encoders = {}

# Las variables numéricas como 'Edad', 'Dias', 'Tiempo' no necesitan codificación LabelEncoder
# Solo codificamos las columnas de tipo 'object' (texto)
categorical_cols = df.select_dtypes(include=['object']).columns

for column in categorical_cols:
    le = LabelEncoder()
    df_encoded[column] = le.fit_transform(df[column])
    encoders[column] = le

# Separamos las características (X) de la etiqueta a predecir (y)
X = df_encoded.drop('Rutina', axis=1)
y = df_encoded['Rutina']

# Identificar y eliminar clases con un solo miembro para evitar errores en train_test_split con stratify
class_counts = y.value_counts()
single_member_classes = class_counts[class_counts < 2].index

if not single_member_classes.empty:
    print(f"⚠️ Eliminando las siguientes clases con menos de 2 miembros para la estratificación: {list(encoders['Rutina'].inverse_transform(single_member_classes))}")
    df_encoded = df_encoded[~df_encoded['Rutina'].isin(single_member_classes)]
    X = df_encoded.drop('Rutina', axis=1)
    y = df_encoded['Rutina']

# --- 3. División de Datos y Entrenamiento del Modelo ---

# 80% para entrenamiento, 20% para prueba.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Usamos RandomForestClassifier, que es más robusto
model = RandomForestClassifier(n_estimators=150, random_state=42, oob_score=True, max_features='sqrt')
model.fit(X_train, y_train)
print("✅ Modelo de Random Forest entrenado.")

# --- 4. Evaluación del Modelo ---

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"📊 Precisión del modelo en el conjunto de prueba: {accuracy:.2f}")
# OOB score es una buena estimación de cómo se comportará el modelo con datos nuevos
if hasattr(model, 'oob_score_'):
    print(f"📊 Precisión Out-of-Bag (OOB): {model.oob_score_:.2f}")


# --- 5. Lógica de la API con Flask ---

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

def predecir_rutina(objetivo, nivel, dias, tiempo, equipo, edad, sexo):
    """
    Toma los datos del usuario, los preprocesa y devuelve la predicción del modelo.
    """
    # El orden de las columnas debe ser exactamente el mismo que en X
    feature_columns = ['Objetivo', 'Nivel', 'Dias', 'Tiempo', 'Equipo_Disponible', 'Edad', 'Sexo']
    
    input_data = pd.DataFrame({
        'Objetivo': [objetivo], 'Nivel': [nivel], 'Dias': [int(dias)],
        'Tiempo': [int(tiempo)], 'Equipo_Disponible': [equipo],
        'Edad': [int(edad)], 'Sexo': [sexo]
    })
    
    # Aseguramos el orden de las columnas
    input_data = input_data[feature_columns]

    # Codificamos las columnas categóricas de la entrada del usuario
    for column in ['Objetivo', 'Nivel', 'Equipo_Disponible', 'Sexo']:
        try:
            le = encoders[column]
            input_data[column] = le.transform(input_data[column])
        except ValueError as e:
            raise ValueError(f"Valor no reconocido para '{column}': '{input_data[column].iloc[0]}'. Valores esperados: {list(le.classes_)}") from e

    # Realizamos la predicción
    prediccion_codificada = model.predict(input_data)

    # Devolvemos el nombre de la rutina
    rutina_recomendada = encoders['Rutina'].inverse_transform(prediccion_codificada)
    return rutina_recomendada[0]


@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint de la API actualizado para recibir las nuevas variables.
    """
    try:
        data = request.get_json()
        required_fields = ['objetivo', 'nivel', 'dias', 'tiempo', 'equipo', 'edad', 'sexo']
        if not data or not all(k in data for k in required_fields):
            return jsonify({"error": f"Faltan datos. Se requieren: {', '.join(required_fields)}."}), 400

        recomendacion = predecir_rutina(
            data['objetivo'], data['nivel'], data['dias'], data['tiempo'],
            data['equipo'], data['edad'], data['sexo']
        )
        return jsonify({'rutina_recomendada': recomendacion})
    except ValueError as e:
        # Error por valor no reconocido (ej. 'Nivel'='Super Saiyan')
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Error genérico para cualquier otro problema
        print(f"Error inesperado: {type(e).__name__} - {e}")
        return jsonify({"error": "Ocurrió un error interno en el servidor."}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar el estado del servidor y el modelo."""
    return jsonify({
        "status": "ok",
        "model": "RandomForestClassifier",
        "dataset": DATA_FILE,
        "total_samples": len(df),
        "test_set_accuracy": f"{accuracy:.2f}",
        "oob_accuracy": f"{model.oob_score_:.2f}" if hasattr(model, 'oob_score_') else "N/A"
    })

# --- 6. Ejecución del Servidor ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)