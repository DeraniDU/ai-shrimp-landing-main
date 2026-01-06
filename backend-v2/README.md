# AI Agentic Shrimp Farm Management System

A production-ready machine learning powered system for intelligent shrimp pond management with real-time monitoring, predictive analytics, and automated control capabilities.

## Table of Contents

- [System Overview](#system-overview)
- [Components](#components)
  - [AI Agent System](#ai-agent-system)
  - [Water Quality Management](#water-quality-management)
  - [Feed Management](#feed-management)
  - [Disease Detection](#disease-detection)
- [Machine Learning Models](#machine-learning-models)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Reference](#api-reference)
- [Configuration](#configuration)

---

## System Overview

This system provides an integrated AI-powered solution for shrimp farm management, combining real-time sensor monitoring, machine learning predictions, and automated hardware control. The platform enables farmers to make data-driven decisions for optimal shrimp production.

### Key Capabilities

- Real-time water quality monitoring and prediction
- Automated hardware triggering based on sensor thresholds
- Time-series forecasting for 6, 12, and 24 hour horizons
- Disease risk assessment and prevention recommendations
- Feed optimization and scheduling
- IoT device integration with ESP32 controllers

---

## Components

### AI Agent System

The AI Agent serves as the central intelligence layer that orchestrates all system components.

**Features:**
- Autonomous decision-making based on sensor data
- Predictive triggering of hardware devices (aerators, pumps, heaters)
- Real-time anomaly detection using Isolation Forest algorithm
- Confidence scoring for predictions
- Trend analysis and pattern recognition

**Technical Implementation:**
- Event-driven architecture for real-time response
- Configurable trigger thresholds with cooldown periods
- Manual override capabilities for operator intervention
- ESP32 hardware integration for device control

**Dashboard Components:**
- `AutoTriggerPanel.tsx` - Hardware device control and monitoring
- `AIPredictionsPanel.tsx` - ML prediction visualization
- `WaterQualitySimulator.tsx` - What-if scenario analysis

---

### Water Quality Management

Comprehensive water quality monitoring and prediction system.

**Monitored Parameters:**
| Parameter | Optimal Range | Critical Threshold |
|-----------|---------------|-------------------|
| pH | 7.5 - 8.5 | < 6.5 or > 9.0 |
| Dissolved Oxygen (DO) | 5.0 - 8.0 mg/L | < 4.0 mg/L |
| Temperature | 26 - 30 C | > 35 C |
| Salinity | 15 - 25 ppt | Variable |
| Ammonia | < 0.1 mg/L | > 0.5 mg/L |
| Nitrite | < 0.05 mg/L | > 0.25 mg/L |
| Turbidity | 30 - 50 cm | < 20 cm |

**Water Quality Index (WQI) Calculation:**
```
WQI = (0.3 x pH_score + 0.2 x Temp_score + 0.5 x DO_score) / (w_pH + w_Temp + w_DO)
```

**WQI Classification:**
| WQI Score | Classification |
|-----------|----------------|
| >= 75 | Good |
| 50 - 74 | Medium |
| 25 - 49 | Bad |
| < 25 | Very Bad |

**Features:**
- Real-time sensor data visualization
- Historical trend analysis
- Time-to-danger predictions
- Night safety monitoring
- Automatic alert generation
- Recovery time estimation

**Dashboard Components:**
- `WaterQualityView.tsx` - Main water quality dashboard
- `ForecastingView.tsx` - Time-series predictions

---

### Feed Management

Intelligent feeding optimization system for maximizing growth and minimizing waste.

**Features:**
- Daily feed consumption tracking
- Feed rate calculation based on biomass
- Feed efficiency metrics
- Automated feeding schedule recommendations
- Per-pond feed distribution analysis
- Shrimp weight trend monitoring

**Metrics Tracked:**
- Total Daily Feed (kg)
- Total Biomass (kg)
- Feed Rate (%)
- Feed Efficiency (%)
- Average Shrimp Weight (g)

**Feeding Schedule Optimization:**
- Feed type recommendations based on shrimp age
- Frequency adjustments based on water quality
- Weather-based feeding modifications
- Predicted next feeding times

**Dashboard Components:**
- `FeedingView.tsx` - Feed management dashboard

---

### Disease Detection

AI-powered disease risk assessment and prevention system.

**Risk Factor Analysis:**
| Factor | Risk Score | Trigger Condition |
|--------|------------|-------------------|
| Low Dissolved Oxygen | +30 | DO < 5.0 mg/L |
| Temperature Deviation | +20 | < 26 C or > 30 C |
| pH Imbalance | +15 | < 7.5 or > 8.5 |
| High Ammonia | +25 | > 0.2 mg/L |
| Elevated Nitrite | +20 | > 0.1 mg/L |

**Risk Classification:**
| Total Score | Risk Level |
|-------------|------------|
| < 30 | Low |
| 30 - 59 | Medium |
| >= 60 | High |

**Common Diseases Monitored:**
1. **White Spot Syndrome (WSSV)** - Viral disease causing white spots on shell
2. **Early Mortality Syndrome (EMS)** - Bacterial disease causing mass mortality
3. **Vibriosis** - Bacterial infection causing reduced feeding and darkened gills
4. **Fouling Disease** - Shell fouling causing reduced growth

**Prevention Recommendations:**
- Water quality maintenance protocols
- Biosecurity measures
- Feeding adjustments
- Aeration recommendations

**Dashboard Components:**
- `DiseaseDetectionView.tsx` - Disease risk dashboard

---

## Machine Learning Models

### Classification Models (Water Quality Status)

| Model | Algorithm | Purpose | Accuracy |
|-------|-----------|---------|----------|
| Random Forest | Ensemble of decision trees (400 estimators, max_depth=20) | WQI class prediction | ~95% |
| MLP Classifier | Neural network (64, 32 hidden layers) | WQI class prediction | ~93% |

**Input Features (14 parameters):**
- Temperature, Turbidity, Dissolved Oxygen, BOD, CO2
- pH, Alkalinity, Hardness, Calcium
- Ammonia, Nitrite, Phosphorus, H2S, Plankton

**Output Classes:**
- Good, Medium, Bad, Very Bad

### Time-Series Regression Models (Forecasting)

| Model | Algorithm | Purpose | Horizons |
|-------|-----------|---------|----------|
| ANN | MLPRegressor (128, 64 hidden layers, ReLU activation) | Multi-step prediction | 6h, 12h, 24h |
| SVR-RBF | Support Vector Regression with RBF kernel | Multi-step prediction | 6h, 12h, 24h |
| MLR | Multiple Linear Regression | Baseline prediction | 6h, 12h, 24h |

**Predicted Parameters:**
- Dissolved Oxygen (DO)
- pH Level
- Temperature

**Features:**
- Lag features (6 time steps)
- All 14 sensor parameters as input

### Anomaly Detection

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Isolation Forest | Unsupervised anomaly detection | Sensor health monitoring |

### WQI Predictor

| Component | Type | Purpose |
|-----------|------|---------|
| WQI Predictor | Rule-based computation | Convert sensor readings to WQI score |

---

## Project Structure

```
backend-v2/
|-- api.py                              # Flask API server
|-- train_shrimp_water_quality_models.py  # Model training script
|-- requirements.txt                    # Python dependencies
|-- README.md                           # This documentation
|
|-- Data set/
|   |-- WQD_synthetic_35000.csv         # Training dataset (35,000 samples)
|   |-- model_metadata.json             # Model metadata
|   |-- water_quality_model.joblib      # Pre-trained model
|   |-- Shrimp_IoT_Water_Quality_ML.ipynb  # Jupyter notebook
|   |-- WQD_synthetic_generator.ipynb   # Data generation notebook
|
|-- exported_models/                    # Trained models (generated after training)
|   |-- water_quality_cls_random_forest.joblib
|   |-- water_quality_cls_mlp.joblib
|   |-- water_quality_cls_best.joblib
|   |-- ts_ann_h6.joblib
|   |-- ts_ann_h12.joblib
|   |-- ts_ann_h24.joblib
|   |-- ts_svr_rbf_h6.joblib
|   |-- ts_svr_rbf_h12.joblib
|   |-- ts_svr_rbf_h24.joblib
|   |-- ts_mlr_h6.joblib
|   |-- ts_mlr_h12.joblib
|   |-- ts_mlr_h24.joblib
|   |-- ts_best_h6.joblib
|   |-- ts_best_h12.joblib
|   |-- ts_best_h24.joblib
|   |-- wqi_predictor.joblib
|
|-- web/                                # React Dashboard
    |-- index.html
    |-- package.json
    |-- vite.config.ts
    |-- tsconfig.json
    |
    |-- src/
        |-- App.tsx                     # Main application
        |-- main.tsx                    # Entry point
        |-- styles.css                  # Global styles
        |
        |-- components/
        |   |-- Sidebar.tsx             # Navigation sidebar
        |   |-- DashboardView.tsx       # Main dashboard
        |   |-- WaterQualityView.tsx    # Water quality monitoring
        |   |-- FeedingView.tsx         # Feed management
        |   |-- DiseaseDetectionView.tsx  # Disease detection
        |   |-- ForecastingView.tsx     # Time-series forecasts
        |   |-- OptimizationView.tsx    # Optimization tools
        |   |-- SettingsView.tsx        # System settings
        |   |-- AIPredictionsPanel.tsx  # AI predictions display
        |   |-- AutoTriggerPanel.tsx    # Hardware automation
        |   |-- WaterQualitySimulator.tsx  # What-if analysis
        |   |-- StatusBadge.tsx         # Status indicators
        |
        |-- lib/
            |-- types.ts                # TypeScript definitions
            |-- format.ts               # Formatting utilities
            |-- mockData.ts             # Mock data for development
            |-- useDashboardData.ts     # Dashboard data hook
            |-- useHistoryData.ts       # Historical data hook
            |-- useForecastsData.ts     # Forecast data hook
            |-- usePrediction.ts        # Prediction API hook
            |-- useAutoTrigger.ts       # Auto-trigger system hook
```

---

## Installation

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-shrimp-landing-main.git
cd ai-shrimp-landing-main/backend-v2
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Required Python Packages:**
- flask >= 2.3.0
- flask-cors >= 4.0.0
- numpy >= 1.24.0
- pandas >= 2.0.0
- scikit-learn >= 1.3.0
- joblib >= 1.3.0

### Step 3: Install Frontend Dependencies

```bash
cd web
npm install
```

---

## Running the Project

### Step 1: Train the Machine Learning Models

Before running the API, train the ML models:

```bash
cd backend-v2
python train_shrimp_water_quality_models.py
```

**Training Output:**
- Loads dataset from `Data set/WQD_synthetic_35000.csv`
- Applies IQR-based outlier filtering
- Trains classification models (Random Forest, MLP)
- Trains time-series regression models (ANN, SVR-RBF, MLR) for 6h, 12h, 24h horizons
- Exports all models to `exported_models/` directory
- Displays accuracy and performance metrics

**Expected Console Output:**
```
Loading dataset from Data set/WQD_synthetic_35000.csv ...
Original samples: 35,000 | After IQR filter: ~32,000

=== Training water quality classification models (RandomForest, MLP) ===
Best classification model: random_forest | F1-macro = 0.95XX

=== Training time-series regression models (ANN, SVR-RBF, MLR) ===
Best TS model for horizon 6: ann | R2_macro = 0.XX
Best TS model for horizon 12: ann | R2_macro = 0.XX
Best TS model for horizon 24: ann | R2_macro = 0.XX

=== Exporting models to .joblib ===
Models exported to: exported_models/
```

### Step 2: Start the Prediction API Server

```bash
cd backend-v2
python api.py
```

**API Server Details:**
- URL: http://localhost:5001
- Auto-loads trained models from `exported_models/`
- Falls back to rule-based predictions if models not found

### Step 3: Start the Dashboard (Development Mode)

```bash
cd backend-v2/web
npm run dev
```

**Dashboard Details:**
- URL: http://localhost:5173
- Hot-reload enabled for development
- Connects to API at http://localhost:5001

### Step 4: Build for Production

```bash
cd backend-v2/web
npm run build
```

---

## API Reference

### Base URL

```
http://localhost:5001
```

### Endpoints

#### Health Check
```
GET /api/health
```
Returns server status and loaded models information.

#### Single Pond Prediction
```
POST /api/predict
Content-Type: application/json

{
  "pond_id": 1,
  "pH": 7.8,
  "Temperature": 28.5,
  "DO": 6.2,
  "Salinity": 20,
  "Ammonia": 0.05,
  "Nitrite": 0.02,
  "Turbidity": 35
}
```

**Response:**
```json
{
  "pond_id": 1,
  "current": {
    "wqi": 82,
    "wqi_class": "Good",
    "sensors": { ... }
  },
  "forecasts": {
    "6h": { "pH": 7.7, "DO": 6.0, "Temperature": 28.8 },
    "12h": { ... },
    "24h": { ... }
  },
  "predicted_wqi": {
    "6h": { "value": 80, "class": "Good" },
    "12h": { ... },
    "24h": { ... }
  },
  "alerts": [ ... ],
  "recommendations": [ ... ],
  "time_to_danger": { ... },
  "night_safety": { ... },
  "confidence": { ... }
}
```

#### Batch Prediction
```
POST /api/predict/batch
Content-Type: application/json

{
  "ponds": [
    { "pond_id": 1, "pH": 7.8, ... },
    { "pond_id": 2, "pH": 7.5, ... }
  ]
}
```

#### IoT Sensor Data Ingestion
```
POST /api/sensor-data
Content-Type: application/json

{
  "device_id": "ESP32_001",
  "pond_id": 1,
  "readings": {
    "pH": 7.8,
    "DO": 6.2,
    "Temperature": 28.5
  },
  "timestamp": "2026-01-05T10:30:00Z"
}
```

#### Generate Simulated Data
```
GET /api/simulate?ponds=4
```
Returns simulated sensor data for testing.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| FLASK_PORT | 5001 | API server port |
| MODEL_DIR | exported_models/ | Directory for trained models |
| DATA_DIR | Data set/ | Directory for training data |

### Water Quality Thresholds

Thresholds can be configured in `api.py`:

```python
OPTIMAL_RANGES = {
    "DO": {
        "optimal_min": 5.0,
        "optimal_max": 8.0,
        "acceptable_min": 4.0,
        "acceptable_max": 10.0,
        "critical_min": 3.0,
    },
    "pH": {
        "optimal_min": 7.5,
        "optimal_max": 8.5,
        "acceptable_min": 7.0,
        "acceptable_max": 9.0,
        "critical_min": 6.5,
        "critical_max": 9.5,
    },
    # ... additional parameters
}
```

### Auto-Trigger Configuration

Hardware triggers can be configured with:
- Threshold values
- Cooldown periods
- Confirmation readings required
- Auto-shutoff timers
- Priority levels (low, medium, high, critical)

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For technical support or questions, please contact the development team.
