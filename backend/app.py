from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app) # Enable CORS for React frontend

# Load the exported models
model_path = 'models.pkl'
try:
    with open(model_path, 'rb') as f:
        artifacts = pickle.load(f)
    scaler = artifacts['scaler']
    rf_clf = artifacts['rf_clf']
    reg_models = artifacts['reg_models']
    wqi_model = artifacts['wqi_model']
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    scaler = None

# Global state for latest sensor data
latest_state = {
    'sensors': {'pH': 0, 'DO': 0, 'Temperature': 0, 'Salinity': 0},
    'predictions': {},
    'forecast': {'pH': 0, 'DO': 0, 'Temperature': 0, 'Salinity': 0},
    'condition': 'Unknown',
    'wqi': 0,
    'alerts': []
}

@app.route('/api/process', methods=['POST'])
def process_data():
    global latest_state
    if not scaler:
        return jsonify({'error': 'Models not loaded'}), 500

    data = request.json
    # Feature array: [pH, DO, Temp, Salinity]
    raw_features = np.array([[data['pH'], data['DO'], data['Temperature'], data['Salinity']]])
    scaled_features = scaler.transform(raw_features)

    # 1. Classify Condition
    condition = rf_clf.predict(scaled_features)[0]

    # 2. Predict WQI
    wqi = wqi_model.predict(scaled_features)[0]

    # 3. Forecast Future Values (Using ANN for this example)
    forecast = {}
    for param in ['pH', 'DO', 'Temperature', 'Salinity']:
        forecast[param] = reg_models[param]['ANN'].predict(scaled_features)[0]

    # 4. Generate Alerts
    alerts = []
    if data['DO'] < 4.0: alerts.append({'level': 'critical', 'msg': 'Critical: Low Oxygen (DO)'})
    if data['pH'] < 6.5 or data['pH'] > 8.5: alerts.append({'level': 'warning', 'msg': 'Warning: Abnormal pH'})
    if data['Temperature'] > 32: alerts.append({'level': 'warning', 'msg': 'Warning: High Temp'})

    latest_state = {
        'sensors': data,
        'condition': condition,
        'wqi': int(wqi),
        'forecast': forecast,
        'alerts': alerts,
        'timestamp': 'Just now'
    }

    return jsonify({'status': 'ok', 'result': latest_state})

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    return jsonify(latest_state)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
