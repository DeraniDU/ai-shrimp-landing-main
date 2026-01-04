# 🦐 Shrimp Farm Water Quality Dashboard - Complete Guide

## Overview
Real-time water quality monitoring dashboard with ML predictions for shrimp farming.

## System Architecture
- **Backend**: FastAPI (Python) - ML models (RF, SVM, KNN) for water quality prediction
- **Frontend**: React + Vite + TailwindCSS - Interactive dashboard
- **Database**: SQLite - Historical data storage
- **WebSocket**: Real-time sensor data streaming

## Features
✅ Real-time water quality monitoring
✅ Multi-model predictions (Random Forest, SVM, KNN)
✅ Risk assessment and recommendations
✅ Historical data analytics
✅ CSV batch predictions
✅ Live sensor simulation
✅ WebSocket streaming

## Quick Start

### Option 1: Automatic Startup (Recommended)
```powershell
cd "api\notebook\water quality"
.\START_DASHBOARD.ps1
```

This will:
1. Check and install Python dependencies
2. Check and install npm packages
3. Start backend API on http://127.0.0.1:8000
4. Start frontend UI on http://localhost:5173

### Option 2: Manual Startup

#### Terminal 1 - Backend API:
```powershell
cd "api\notebook\water quality"
python -m pip install fastapi uvicorn joblib numpy scikit-learn pydantic websockets
uvicorn predict_api:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 - Frontend Dashboard:
```powershell
cd "api\notebook\water quality\dashboard\web"
npm install
npm run dev
```

Then open: http://localhost:5173

## Dashboard Pages

### 1. Overview (Home)
- **Live Status**: Current water quality classification (Good/Warning/Dangerous)
- **Key Metrics**: DO, pH, Ammonia, Temperature
- **Summary Stats**: Last 200 samples aggregated
- **Recommendations**: Actionable alerts based on predictions
- **Simulation Controls**: Start/stop sensor data simulation
- **Server Simulator**: Backend-controlled continuous simulation

### 2. Manual Input
- Enter water parameters manually
- Choose prediction model (All/RF/SVM/KNN)
- Get instant predictions with recommendations
- Color-coded alerts for critical parameters

### 3. Advanced Prediction
- **Multi-Model Comparison**: Run all 3 models simultaneously
- **Risk Scoring**: Composite risk level (Low/Medium/High/Critical)
- **Detailed Analysis**: Side-by-side model outputs
- **Actionable Recommendations**: Prioritized action list

### 4. CSV Upload
- Batch predictions for multiple samples
- Upload CSV with water parameters
- Download results with all model predictions
- Bulk historical analysis

### 5. Analytics
- **Time Series Charts**: DO, pH, Ammonia trends
- **Status Distribution**: Good/Warning/Dangerous breakdown
- **Auto-refresh**: Updates every 10 seconds
- **Historical Trends**: Visualize patterns over time

### 6. History
- Complete prediction log
- Filterable table
- Timestamp tracking
- Export capabilities

## API Endpoints

### Prediction Endpoints
- `POST /dashboard/predict_all` - All models
- `POST /dashboard/predict_rf` - Random Forest only
- `POST /dashboard/predict_svm` - SVM only
- `POST /dashboard/predict_knn` - KNN only
- `POST /dashboard/predict/batch` - CSV batch prediction

### Data Endpoints
- `GET /dashboard/latest` - Most recent sample
- `GET /dashboard/history?limit=200` - Historical samples

### Simulator Endpoints
- `POST /dashboard/simulator/start` - Start server simulation
- `POST /dashboard/simulator/stop` - Stop server simulation
- `GET /dashboard/simulator/status` - Simulation status

### WebSocket
- `WS /ws/sensors` - Live sensor stream

## Request Format

```json
{
  "input": {
    "Temp": 29.0,
    "DO(mg/L)": 5.0,
    "pH": 7.8,
    "Ammonia (mg L-1 )": 0.4,
    "Turbidity (cm)": 35.0,
    "BOD (mg/L)": 3.0,
    "CO2": 6.0,
    "Alkalinity (mg L-1 )": 120.0,
    "Hardness (mg L-1 )": 130.0,
    "Calcium (mg L-1 )": 90.0,
    "Nitrite (mg L-1 )": 0.15,
    "Phosphorus (mg L-1 )": 0.2,
    "H2S (mg L-1 )": 0.002,
    "Plankton (No. L-1)": 3500
  }
}
```

## Models Description

### 1. Random Forest (Multi-Output Regression)
- **Predicts**: DO, pH, Ammonia (continuous values)
- **Purpose**: Estimate missing/future water parameters
- **Output**: Numeric predictions for key parameters

### 2. SVM Classifier
- **Predicts**: Water quality status (0=Good, 1=Warning, 2=Dangerous)
- **Purpose**: Overall pond health classification
- **Output**: Class label + probability distribution

### 3. KNN (K-Nearest Neighbors)
- **Predicts**: DO (mg/L) only
- **Purpose**: Fallback when DO sensor fails
- **Output**: Single DO value estimate

## Simulation Features

### Client-Side Simulation (Browser)
- Generates realistic sensor readings every 20 seconds
- Simulates natural variations and trends
- Includes hourly aggregation (average of accumulated samples)
- Controllable via UI buttons

### Server-Side Simulation (Backend)
- Continuous background simulation
- Multiple pond support
- Configurable interval and stress modes
- Persists to database automatically

## Risk Scoring Algorithm

The Advanced Prediction page computes a composite risk score:

1. **DO Analysis**:
   - DO < 3: +3 points (Critical)
   - DO < 4: +2 points (High)
   - DO < 5: +1 point (Medium)

2. **Ammonia Analysis**:
   - Ammonia > 1.5: +3 points (Critical)
   - Ammonia > 0.8: +2 points (High)
   - Ammonia > 0.5: +1 point (Medium)

3. **SVM Classification**:
   - Dangerous: +3 points
   - Warning: +1 point
   - Good: 0 points

**Final Risk Level**:
- Score ≥ 6: CRITICAL (🚨)
- Score ≥ 4: HIGH (⚠️)
- Score ≥ 2: MEDIUM (⚡)
- Score < 2: LOW (✅)

## Recommendations Logic

### Critical Alerts (🚨)
- DO < 3.5 mg/L → Start aerators immediately
- Ammonia > 1.0 mg/L → Perform 30-50% water exchange
- pH < 6.5 or > 8.5 → Check alkalinity buffer
- Status = Dangerous → Notify manager, prepare emergency plan

### Warnings (⚠️)
- DO < 5 mg/L → Turn on aerators, monitor closely
- Ammonia > 0.5 mg/L → Reduce feed rate, schedule water exchange
- pH drift → Consider aeration

## Troubleshooting

### Backend won't start
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Install dependencies
pip install -r shrimp-farm-ai-assistant\requirements.txt
```

### Frontend won't start
```powershell
# Clear node_modules and reinstall
cd "api\notebook\water quality\dashboard\web"
Remove-Item -Recurse -Force node_modules
npm install
```

### Models not found
The system will attempt to auto-train models if missing. Check:
```
api/notebook/water quality/models/exported_models/dashboard_models/
```

Required files:
- `random_forest_multioutput.joblib`
- `svm_classifier.joblib`
- `knn_do.joblib`

### WebSocket connection failed
Ensure backend is running on port 8000. Frontend proxy should route `/ws` to `ws://127.0.0.1:8000`.

### No data in dashboard
1. Check backend logs for errors
2. Test endpoint: `curl http://127.0.0.1:8000/dashboard/latest`
3. Start simulation from Overview page
4. Check database: `api/notebook/water quality/models/exported_models/dashboard_history.db`

## Testing the System

### 1. Backend Health Check
```powershell
python -c "import requests; print(requests.get('http://127.0.0.1:8000/dashboard/latest').status_code)"
```

### 2. Prediction Test
```powershell
python -c "import requests,json; payload={'input':{'Temp':29,'DO(mg/L)':5,'pH':7.8,'Ammonia (mg L-1 )':0.4}}; print(requests.post('http://127.0.0.1:8000/dashboard/predict_rf',json=payload).json())"
```

### 3. WebSocket Test
Open browser console and run:
```javascript
const ws = new WebSocket('ws://127.0.0.1:8000/ws/sensors');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## Data Flow

```
Sensors (Real/Simulated)
    ↓
Backend API (predict_api.py)
    ↓
ML Models (RF/SVM/KNN)
    ↓
SQLite Database + WebSocket Broadcast
    ↓
React Frontend (Dashboard)
    ↓
User Interface (Charts/Alerts/Recommendations)
```

## Performance

- **Prediction Speed**: < 50ms per sample
- **WebSocket Latency**: < 100ms
- **Simulation Rate**: Configurable (default 20s)
- **Database Size**: ~1KB per sample
- **Frontend Load**: < 2MB bundle size

## Future Enhancements

- [ ] Real IoT sensor integration (MQTT/HTTP)
- [ ] Email/SMS alerts for critical conditions
- [ ] Mobile app (React Native)
- [ ] Multi-pond management
- [ ] Export to PDF reports
- [ ] Historical trend prediction
- [ ] Feed recommendation optimization
- [ ] Disease risk assessment

## Support

For issues or questions:
1. Check console logs (browser DevTools + backend terminal)
2. Verify all dependencies installed
3. Ensure ports 8000 and 5173 are available
4. Review this README thoroughly

## License

MIT License - Free for educational and commercial use.

---

**Built with ❤️ for sustainable shrimp farming**
