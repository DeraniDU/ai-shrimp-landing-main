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

# Global state for latest sensor data for multiple ponds
latest_state = {
    '1': {'sensors': {'pH': 0, 'DO': 0, 'Temperature': 0, 'Salinity': 0}, 'predictions': {}, 'forecast': {}, 'condition': 'Unknown', 'wqi': 0, 'future_wqi': 0, 'alerts': [], 'recommendation': ''},
    '2': {'sensors': {'pH': 0, 'DO': 0, 'Temperature': 0, 'Salinity': 0}, 'predictions': {}, 'forecast': {}, 'condition': 'Unknown', 'wqi': 0, 'future_wqi': 0, 'alerts': [], 'recommendation': ''},
    '3': {'sensors': {'pH': 0, 'DO': 0, 'Temperature': 0, 'Salinity': 0}, 'predictions': {}, 'forecast': {}, 'condition': 'Unknown', 'wqi': 0, 'future_wqi': 0, 'alerts': [], 'recommendation': ''}
}

@app.route('/api/process', methods=['POST'])
def process_data():
    global latest_state
    if not scaler:
        return jsonify({'error': 'Models not loaded'}), 500

    data = request.json
    pond_id = str(data.get('pond_id', '1'))
    
    # Feature array: [pH, DO, Temp, Salinity]
    raw_features = np.array([[data['pH'], data['DO'], data['Temperature'], data['Salinity']]])
    scaled_features = scaler.transform(raw_features)

    # 1. Classify Condition
    condition = rf_clf.predict(scaled_features)[0]

    # 2. Predict WQI
    wqi = wqi_model.predict(scaled_features)[0]

    # 3. Forecast Future Values (Using ANN for this example)
    forecast = {}
    future_features_list = []
    # Order matters for the model input: pH, DO, Temp, Salinity
    # We need to collect them in order to create the feature vector for Future WQI
    
    # Assuming reg_models keys match the feature order or we construct it explicitly
    # The existing code iterates over a list. Let's be explicit.
    params = ['pH', 'DO', 'Temperature', 'Salinity']
    future_vals = []
    
    for param in params:
        val = reg_models[param]['ANN'].predict(scaled_features)[0]
        forecast[param] = val
        future_vals.append(val)

    # Predict Future WQI
    # We need to scale the future values before passing to wqi_model if it expects scaled input
    # The wqi_model was trained on scaled features in the previous step, so we should scale these too.
    future_raw_features = np.array([future_vals])
    future_scaled_features = scaler.transform(future_raw_features)
    future_wqi = wqi_model.predict(future_scaled_features)[0]

    # 4. Generate Alerts
    alerts = []
    if data['DO'] < 4.0: 
        alerts.append({'level': 'critical', 'msg': 'DO level is low DO Spreading on'})
    if data['pH'] < 6.5 or data['pH'] > 8.5: 
        alerts.append({'level': 'warning', 'msg': 'Unsafe pH Level'})
    if data['Temperature'] > 32: 
        alerts.append({'level': 'warning', 'msg': 'High Temperature Alert'})

    # 5. Recommendations
    recommendation = "Water quality is stable."
    if int(wqi) < 60 or len(alerts) > 0:
        recommendation = "Recommend water change immediately."

    latest_state[pond_id] = {
        'sensors': data,
        'condition': condition,
        'wqi': int(wqi),
        'future_wqi': int(future_wqi),
        'forecast': forecast,
        'alerts': alerts,
        'recommendation': recommendation,
        'timestamp': 'Just now'
    }

    return jsonify({'status': 'ok', 'result': latest_state[pond_id]})

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    return jsonify(latest_state)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
