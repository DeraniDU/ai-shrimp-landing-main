# 🦐 Shrimp Pond Water Quality Prediction System

A production-ready ML-powered system for predicting shrimp pond water quality with real-time monitoring and forecasting capabilities.

## System Architecture

```
backend-v2/
├── train_shrimp_water_quality_models.py  # Model training script
├── api.py                                 # Flask prediction API
├── requirements.txt                       # Python dependencies
├── exported_models/                       # Saved ML models (after training)
├── Data set/                              # Training data
│   └── WQD_synthetic_35000.csv
└── web/                                   # React Dashboard
    └── src/
        ├── components/
        │   ├── WaterQualityView.tsx       # Main water quality dashboard
        │   └── AIPredictionsPanel.tsx     # AI predictions component
        └── lib/
            ├── types.ts                   # TypeScript type definitions
            └── usePrediction.ts           # Prediction API hooks
```

## Quick Start

### Step 1: Train the ML Models

First, train the water quality models:

```powershell
cd backend-v2
pip install -r requirements.txt
python train_shrimp_water_quality_models.py
```

This will:
- Load the dataset from `Data set/WQD_synthetic_35000.csv`
- Train classification models (Random Forest, MLP)
- Train time-series regression models (ANN, SVM-RBF, MLR) for 6h, 12h, 24h horizons
- Export models to `exported_models/` folder

### Step 2: Start the Prediction API

```powershell
cd backend-v2
python api.py
```

The API will start on `http://localhost:5001` with endpoints:
- `POST /api/predict` - Single pond prediction
- `POST /api/predict/batch` - Multi-pond batch prediction
- `POST /api/sensor-data` - IoT device data ingestion
- `GET /api/health` - Health check
- `GET /api/simulate` - Generate test data

### Step 3: Start the Dashboard

```powershell
cd backend-v2/web
npm install
npm run dev
```

The dashboard will open at `http://localhost:5173`

## Features

### 1. Water Quality Classification
- **Models**: Random Forest, Multi-Layer Perceptron (MLP)
- **Classes**: Good, Medium, Bad, Very Bad
- **Inputs**: pH, Dissolved Oxygen, Temperature, Salinity, Ammonia, Nitrite, Turbidity

### 2. Time-Series Forecasting
- **Models**: ANN, SVM (RBF kernel), Multiple Linear Regression
- **Horizons**: 6 hours, 12 hours, 24 hours
- **Predicted Parameters**: pH, DO, Temperature, Salinity

### 3. Water Quality Index (WQI)
- Computed from predicted sensor values
- Weighted formula: WQI = (0.3×pH_score + 0.2×Temp_score + 0.5×DO_score)
- Categories: Good (≥75), Medium (50-75), Bad (25-50), Very Bad (<25)

### 4. Smart Alerts & Recommendations
Automatic alerts for:
- Low Dissolved Oxygen (< 4.0 mg/L critical, < 5.0 mg/L warning)
- Abnormal pH (< 6.5 or > 9.0 critical)
- High Temperature (> 35°C critical, > 32°C warning)
- High Ammonia (> 0.5 mg/L critical)

### 5. Real-Time Dashboard
- Live sensor readings with status indicators
- Predicted values for 6h, 12h, 24h horizons
- WQI visualization with trend analysis
- Alert notifications with action recommendations

## API Usage

### Single Pond Prediction

```bash
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "pH": 7.8,
    "Temperature": 28.5,
    "DO": 6.2,
    "Salinity": 20,
    "Ammonia": 0.05,
    "Nitrite": 0.1,
    "Turbidity": 30
  }'
```

Response:
```json
{
  "timestamp": "2026-01-05T10:30:00",
  "current": {
    "sensors": {...},
    "wqi": 82.5,
    "wqi_class": "Good"
  },
  "forecasts": {
    "6h": {"pH": 7.75, "DO": 6.1, "Temperature": 28.8, "Salinity": 20.2},
    "12h": {"pH": 7.7, "DO": 5.9, "Temperature": 29.2, "Salinity": 20.5},
    "24h": {"pH": 7.65, "DO": 5.7, "Temperature": 29.8, "Salinity": 20.8}
  },
  "predicted_wqi": {
    "6h": {"value": 80.2, "class": "Good"},
    "12h": {"value": 76.5, "class": "Good"},
    "24h": {"value": 72.1, "class": "Medium"}
  },
  "alerts": [],
  "recommendations": [...],
  "urgency": "normal"
}
```

### ESP32 Integration

For IoT devices, use the `/api/sensor-data` endpoint:

```cpp
// Arduino/ESP32 Example
HTTPClient http;
http.begin("http://YOUR_SERVER:5001/api/sensor-data");
http.addHeader("Content-Type", "application/json");

String payload = "{\"pond_id\":1,\"pH\":7.8,\"DO\":6.2,\"Temperature\":28.5,\"Salinity\":20}";
int httpCode = http.POST(payload);
```

## Model Evaluation Metrics

After training, the system reports:

**Classification (Water Quality Status)**
- Accuracy
- F1-Score (macro)
- Confusion Matrix

**Regression (Time-Series Forecasting)**
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- R² Score

## Troubleshooting

### Models not loading
Run the training script first:
```powershell
python train_shrimp_water_quality_models.py
```

### API not responding
Check if the API is running on port 5001:
```powershell
netstat -an | Select-String "5001"
```

### Dashboard shows "Using Client Simulation"
This means the API is not reachable. Ensure `api.py` is running.

## License
MIT License
