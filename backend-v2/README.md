# AI Agentic Shrimp Farm Management System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Flask-2.3+-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/Scikit--Learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn"/>
  <img src="https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</p>

<p align="center">
  <strong>A production-ready machine learning powered system for intelligent shrimp pond management with real-time monitoring, predictive analytics, and automated control capabilities.</strong>
</p>

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
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
- [Hardware Integration](#hardware-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## System Overview

This system provides an integrated AI-powered solution for shrimp farm management, combining real-time sensor monitoring, machine learning predictions, and automated hardware control. The platform enables farmers to make data-driven decisions for optimal shrimp production.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Real-time Monitoring | Live sensor data visualization with automatic refresh |
| Predictive Analytics | Time-series forecasting for 6, 12, and 24 hour horizons |
| Automated Control | Smart hardware triggering based on ML predictions |
| Disease Prevention | AI-powered risk assessment and early warning system |
| Feed Optimization | Intelligent feeding schedules based on biomass analysis |
| IoT Integration | ESP32 controller support for device automation |

### Technology Stack

```
Frontend:     React 18 + TypeScript + Vite + TailwindCSS + Chart.js
Backend:      Python 3.9+ + Flask + Flask-CORS
ML Engine:    Scikit-Learn + NumPy + Pandas + Joblib
Hardware:     ESP32 Microcontrollers + IoT Sensors
Database:     CSV-based data storage (expandable to SQL/NoSQL)
```

---

## Architecture

```
                                    +------------------+
                                    |   React Dashboard |
                                    |   (Port 5173)    |
                                    +--------+---------+
                                             |
                                             | HTTP/REST
                                             v
+------------------+              +----------+-----------+
|   ESP32 Devices  |   ------>   |     Flask API        |
|   (IoT Sensors)  |   <------   |    (Port 5001)       |
+------------------+              +----------+-----------+
                                             |
                         +-------------------+-------------------+
                         |                   |                   |
                         v                   v                   v
              +----------+------+  +---------+-------+  +--------+--------+
              | Classification  |  | Time-Series     |  | Anomaly         |
              | Models          |  | Forecasting     |  | Detection       |
              | (RF, MLP)       |  | (ANN, SVR, MLR) |  | (Isolation Forest)|
              +-----------------+  +-----------------+  +-----------------+
```

### Data Flow

```
Sensors --> API --> Preprocessing --> ML Models --> Predictions --> Dashboard
                                           |
                                           v
                                    Auto-Trigger Logic --> ESP32 Commands
```

---

## Components

### AI Agent System

> The AI Agent serves as the central intelligence layer that orchestrates all system components.

**Core Features**

| Feature | Description |
|---------|-------------|
| Autonomous Decision-Making | Real-time analysis of sensor data with automated responses |
| Predictive Triggering | Smart hardware control based on ML predictions |
| Anomaly Detection | Isolation Forest algorithm for sensor health monitoring |
| Confidence Scoring | Probability-based prediction reliability metrics |
| Trend Analysis | Pattern recognition for proactive management |

**Technical Implementation**

```typescript
// Event-driven architecture example
interface TriggerConfig {
  deviceType: 'aerator' | 'oxygen_pump' | 'water_pump' | 'heater';
  threshold: number;
  cooldownMinutes: number;
  confirmationReadings: number;
  autoShutoffMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

**Dashboard Components**

| Component | File | Purpose |
|-----------|------|---------|
| Auto-Trigger Panel | `AutoTriggerPanel.tsx` | Hardware device control, monitoring, and configuration |
| AI Predictions Panel | `AIPredictionsPanel.tsx` | ML prediction visualization and confidence display |
| Water Quality Simulator | `WaterQualitySimulator.tsx` | What-if scenario analysis for decision support |

---

### Water Quality Management

> Comprehensive water quality monitoring and prediction system for optimal shrimp health.

**Monitored Parameters**

| Parameter | Optimal Range | Warning | Critical | Unit |
|-----------|---------------|---------|----------|------|
| pH | 7.5 - 8.5 | 7.0 / 9.0 | 6.5 / 9.5 | - |
| Dissolved Oxygen (DO) | 5.0 - 8.0 | 4.0 | 3.0 | mg/L |
| Temperature | 26 - 30 | 24 / 32 | 22 / 35 | C |
| Salinity | 15 - 25 | 10 / 30 | 5 / 35 | ppt |
| Ammonia (NH3) | 0 - 0.1 | 0.2 | 0.5 | mg/L |
| Nitrite (NO2) | 0 - 0.05 | 0.1 | 0.25 | mg/L |
| Turbidity | 30 - 50 | 20 / 60 | 15 / 70 | cm |

**Water Quality Index (WQI) Calculation**

The WQI score is calculated using weighted parameters:

```
WQI = (w_pH x pH_score + w_Temp x Temp_score + w_DO x DO_score) / (w_pH + w_Temp + w_DO)

Where:
  - w_pH = 0.3 (30% weight)
  - w_Temp = 0.2 (20% weight)  
  - w_DO = 0.5 (50% weight - most critical parameter)
```

**WQI Classification**

| WQI Score | Classification | Color Code | Action Required |
|-----------|----------------|------------|-----------------|
| 75 - 100 | Good | Green | Routine monitoring |
| 50 - 74 | Medium | Yellow | Increase monitoring frequency |
| 25 - 49 | Bad | Orange | Immediate intervention needed |
| 0 - 24 | Very Bad | Red | Emergency response required |

**Advanced Features**

| Feature | Description |
|---------|-------------|
| Time-to-Danger | Predicts when parameters will reach critical levels |
| Night Safety | Special monitoring for oxygen drops during night hours |
| Recovery Estimation | Calculates time needed to return to optimal conditions |
| Trend Analysis | Identifies patterns and seasonal variations |
| Alert Generation | Multi-level notifications (info, warning, critical) |

**Dashboard Components**

| Component | File | Purpose |
|-----------|------|---------|
| Water Quality View | `WaterQualityView.tsx` | Main monitoring dashboard |
| Forecasting View | `ForecastingView.tsx` | Time-series predictions |

---

### Feed Management

> Intelligent feeding optimization system for maximizing growth and minimizing waste.

**Core Metrics**

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Total Daily Feed | Sum of all feed distributed | Sum of pond feeds (kg) |
| Total Biomass | Estimated shrimp weight in pond | Shrimp count x Avg weight |
| Feed Rate | Percentage of biomass fed daily | (Daily feed / Biomass) x 100 |
| Feed Conversion Ratio (FCR) | Feed efficiency indicator | Feed consumed / Weight gained |
| Average Shrimp Weight | Mean individual weight | Total biomass / Shrimp count |

**Feeding Schedule Optimization**

| Factor | Adjustment | Rationale |
|--------|------------|-----------|
| Water Temperature | -20% if temp < 24C | Reduced metabolism in cold water |
| Dissolved Oxygen | -30% if DO < 4 mg/L | Stress reduces appetite |
| Weather (Rain) | -25% during heavy rain | Salinity changes affect feeding |
| Shrimp Age | Variable feed type | Protein requirements change with age |
| Time of Day | Peak at dawn/dusk | Natural feeding patterns |

**Feed Distribution by Pond**

```
Pond Feed Allocation = (Pond Biomass / Total Biomass) x Daily Feed Budget
```

**Feed Type Recommendations by Age**

| Age (Days) | Feed Type | Protein Content | Feeding Frequency |
|------------|-----------|-----------------|-------------------|
| 0 - 15 | Starter | 40-45% | 6x daily |
| 15 - 45 | Grower | 35-40% | 4x daily |
| 45 - 90 | Finisher | 30-35% | 3x daily |
| 90+ | Harvest | 28-32% | 2x daily |

**Dashboard Components**

| Component | File | Purpose |
|-----------|------|---------|
| Feeding View | `FeedingView.tsx` | Complete feed management dashboard |

---

### Disease Detection

> AI-powered disease risk assessment and prevention system for proactive health management.

**Risk Factor Analysis**

| Factor | Risk Score | Trigger Condition | Mitigation |
|--------|------------|-------------------|------------|
| Low Dissolved Oxygen | +30 | DO < 5.0 mg/L | Activate aerators |
| Temperature Deviation | +20 | < 26C or > 30C | Adjust water exchange |
| pH Imbalance | +15 | < 7.5 or > 8.5 | Add lime/acid |
| High Ammonia | +25 | > 0.2 mg/L | Water exchange, reduce feeding |
| Elevated Nitrite | +20 | > 0.1 mg/L | Increase aeration |
| Overcrowding | +15 | > 100 shrimp/m2 | Harvest or redistribute |

**Risk Classification Matrix**

| Total Score | Risk Level | Status | Recommended Action |
|-------------|------------|--------|-------------------|
| 0 - 29 | Low | Safe | Continue routine monitoring |
| 30 - 59 | Medium | Caution | Increase monitoring, prepare interventions |
| 60 - 89 | High | Alert | Immediate corrective measures |
| 90+ | Critical | Emergency | Emergency protocols, consider harvest |

**Common Diseases Monitored**

| Disease | Causative Agent | Symptoms | Prevention |
|---------|-----------------|----------|------------|
| White Spot Syndrome (WSSV) | Viral | White spots on shell, lethargy | Biosecurity, stress reduction |
| Early Mortality Syndrome (EMS) | Bacterial (Vibrio) | Pale hepatopancreas, empty gut | Probiotics, water quality |
| Vibriosis | Vibrio species | Dark gills, reduced feeding | Disinfection, optimal DO |
| Fouling Disease | Protozoa/Bacteria | Shell fouling, slow growth | Water exchange, reduce organics |
| Black Gill Disease | Environmental | Darkened gills | Improve water quality |

**Disease Prevention Protocols**

```
Prevention Score = f(Water Quality, Feeding, Biosecurity, History)

If Prevention Score < 50:
  - Alert: Review all protocols
  - Recommend: Increase monitoring frequency
  - Action: Schedule water quality intervention
```

**Alert System**

| Alert Type | Trigger | Notification |
|------------|---------|--------------|
| Info | Minor deviation | Dashboard indicator |
| Warning | Moderate risk | Dashboard + Email |
| Critical | High risk detected | Dashboard + Email + SMS |
| Emergency | Immediate threat | All channels + Auto-response |

**Dashboard Components**

| Component | File | Purpose |
|-----------|------|---------|
| Disease Detection View | `DiseaseDetectionView.tsx` | Risk assessment and monitoring |

---

## Machine Learning Models

### Model Overview

```
+---------------------+     +------------------------+     +--------------------+
| Classification      |     | Time-Series            |     | Support            |
| Models              |     | Forecasting            |     | Models             |
+---------------------+     +------------------------+     +--------------------+
| Random Forest       |     | ANN (MLPRegressor)     |     | Isolation Forest   |
| MLP Classifier      |     | SVR-RBF                |     | WQI Predictor      |
|                     |     | MLR (Linear)           |     |                    |
+---------------------+     +------------------------+     +--------------------+
```

### Classification Models (Water Quality Status)

| Model | Algorithm | Configuration | Purpose | Accuracy |
|-------|-----------|---------------|---------|----------|
| Random Forest | Ensemble Learning | 400 trees, max_depth=20, min_samples_split=2 | WQI class prediction | ~95% |
| MLP Classifier | Neural Network | 2 hidden layers (64, 32), ReLU activation | WQI class prediction | ~93% |

**Input Features (14 Sensor Parameters)**

```python
FEATURE_COLUMNS = [
    'Temperature',    # Water temperature (C)
    'Turbidity',      # Water clarity (cm)
    'DO',             # Dissolved Oxygen (mg/L)
    'BOD',            # Biochemical Oxygen Demand (mg/L)
    'CO2',            # Carbon Dioxide (mg/L)
    'pH',             # Acidity/Alkalinity
    'Alkalinity',     # Carbonate hardness (mg/L)
    'Hardness',       # Total hardness (mg/L)
    'Calcium',        # Calcium concentration (mg/L)
    'Ammonia',        # NH3 concentration (mg/L)
    'Nitrite',        # NO2 concentration (mg/L)
    'Phosphorus',     # Phosphate level (mg/L)
    'H2S',            # Hydrogen Sulfide (mg/L)
    'Plankton'        # Plankton density (cells/mL)
]
```

**Output Classes**

| Class | WQI Range | Description |
|-------|-----------|-------------|
| Good | 75 - 100 | Optimal conditions for shrimp |
| Medium | 50 - 74 | Acceptable with monitoring |
| Bad | 25 - 49 | Intervention required |
| Very Bad | 0 - 24 | Critical conditions |

### Time-Series Regression Models (Forecasting)

| Model | Algorithm | Configuration | Horizons | Primary Use |
|-------|-----------|---------------|----------|-------------|
| ANN | MLPRegressor | 2 layers (128, 64), ReLU, Adam optimizer | 6h, 12h, 24h | High-accuracy predictions |
| SVR-RBF | Support Vector | RBF kernel, C=100, gamma=scale | 6h, 12h, 24h | Robust to outliers |
| MLR | Linear Regression | Standard OLS | 6h, 12h, 24h | Baseline/Interpretability |

**Predicted Parameters**

| Parameter | Model Output | Use Case |
|-----------|-------------|----------|
| Dissolved Oxygen | Continuous (mg/L) | Night safety, aerator control |
| pH | Continuous | Water treatment planning |
| Temperature | Continuous (C) | Environmental forecasting |

**Feature Engineering**

```python
# Lag features for time-series prediction
LAG_STEPS = 6  # Use past 6 readings

# Generated features:
# - DO_lag_1, DO_lag_2, ..., DO_lag_6
# - pH_lag_1, pH_lag_2, ..., pH_lag_6
# - Temperature_lag_1, ..., Temperature_lag_6
```

### Anomaly Detection

| Model | Algorithm | Purpose | Method |
|-------|-----------|---------|--------|
| Isolation Forest | Unsupervised | Sensor malfunction detection | Isolation-based outlier detection |

**Configuration**

```python
IsolationForest(
    n_estimators=100,
    contamination=0.05,  # Expected 5% anomaly rate
    random_state=42
)
```

### Model Performance Metrics

**Classification Models**

| Metric | Random Forest | MLP |
|--------|--------------|-----|
| Accuracy | 95.2% | 93.1% |
| F1-Score (Macro) | 0.948 | 0.921 |
| Precision | 0.952 | 0.928 |
| Recall | 0.945 | 0.915 |

**Time-Series Models (R2 Score)**

| Horizon | ANN | SVR-RBF | MLR |
|---------|-----|---------|-----|
| 6 hours | 0.92 | 0.89 | 0.82 |
| 12 hours | 0.87 | 0.84 | 0.76 |
| 24 hours | 0.81 | 0.78 | 0.69 |

---

## Project Structure

```
backend-v2/
|
|-- api.py                                  # Flask API server (Port 5001)
|-- train_shrimp_water_quality_models.py    # ML model training pipeline
|-- requirements.txt                        # Python dependencies
|-- README.md                               # This documentation
|
|-- Data set/
|   |-- WQD_synthetic_35000.csv             # Training dataset (35,000 samples)
|   |-- model_metadata.json                 # Model configuration and metadata
|   |-- water_quality_model.joblib          # Legacy pre-trained model
|   |-- Shrimp_IoT_Water_Quality_ML.ipynb   # Jupyter notebook for experiments
|   |-- WQD_synthetic_generator.ipynb       # Data generation notebook
|
|-- exported_models/                        # Trained models directory
|   |
|   |-- Classification Models
|   |   |-- water_quality_cls_random_forest.joblib
|   |   |-- water_quality_cls_mlp.joblib
|   |   |-- water_quality_cls_best.joblib    # Best performing classifier
|   |
|   |-- Time-Series Models (6-hour horizon)
|   |   |-- ts_ann_h6.joblib
|   |   |-- ts_svr_rbf_h6.joblib
|   |   |-- ts_mlr_h6.joblib
|   |   |-- ts_best_h6.joblib
|   |
|   |-- Time-Series Models (12-hour horizon)
|   |   |-- ts_ann_h12.joblib
|   |   |-- ts_svr_rbf_h12.joblib
|   |   |-- ts_mlr_h12.joblib
|   |   |-- ts_best_h12.joblib
|   |
|   |-- Time-Series Models (24-hour horizon)
|   |   |-- ts_ann_h24.joblib
|   |   |-- ts_svr_rbf_h24.joblib
|   |   |-- ts_mlr_h24.joblib
|   |   |-- ts_best_h24.joblib
|   |
|   |-- Support Models
|       |-- wqi_predictor.joblib             # WQI calculation model
|
|-- web/                                     # React Dashboard Application
    |-- index.html                           # Entry HTML
    |-- package.json                         # Node dependencies
    |-- vite.config.ts                       # Vite build configuration
    |-- tsconfig.json                        # TypeScript configuration
    |-- postcss.config.mjs                   # PostCSS configuration
    |
    |-- src/
        |-- App.tsx                          # Main application component
        |-- main.tsx                         # React entry point
        |-- styles.css                       # Global styles (Tailwind)
        |
        |-- components/
        |   |
        |   |-- Core Components
        |   |   |-- Sidebar.tsx              # Navigation sidebar
        |   |   |-- StatusBadge.tsx          # Status indicator badges
        |   |
        |   |-- Dashboard Views
        |   |   |-- DashboardView.tsx        # Main dashboard overview
        |   |   |-- WaterQualityView.tsx     # Water quality monitoring
        |   |   |-- FeedingView.tsx          # Feed management
        |   |   |-- DiseaseDetectionView.tsx # Disease risk assessment
        |   |   |-- ForecastingView.tsx      # Time-series forecasts
        |   |   |-- OptimizationView.tsx     # Optimization tools
        |   |   |-- SettingsView.tsx         # System settings
        |   |
        |   |-- AI Components
        |       |-- AIPredictionsPanel.tsx   # ML predictions display
        |       |-- AutoTriggerPanel.tsx     # Hardware automation control
        |       |-- WaterQualitySimulator.tsx # What-if analysis tool
        |
        |-- lib/
            |-- types.ts                     # TypeScript type definitions
            |-- format.ts                    # Formatting utilities
            |-- mockData.ts                  # Development mock data
            |-- useDashboardData.ts          # Dashboard data hook
            |-- useHistoryData.ts            # Historical data hook
            |-- useForecastsData.ts          # Forecast data hook
            |-- usePrediction.ts             # Prediction API hook
            |-- useAutoTrigger.ts            # Auto-trigger system hook
```

---

## Installation

### Prerequisites

| Requirement | Minimum Version | Recommended |
|-------------|-----------------|-------------|
| Python | 3.9 | 3.11+ |
| Node.js | 18.0 | 20.0+ |
| npm | 9.0 | 10.0+ |
| RAM | 4 GB | 8 GB+ |
| Disk Space | 500 MB | 1 GB+ |

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-shrimp-landing-main.git
cd ai-shrimp-landing-main/backend-v2
```

### Step 2: Set Up Python Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Required Python Packages**

| Package | Version | Purpose |
|---------|---------|---------|
| flask | >= 2.3.0 | REST API framework |
| flask-cors | >= 4.0.0 | Cross-origin resource sharing |
| numpy | >= 1.24.0 | Numerical computations |
| pandas | >= 2.0.0 | Data manipulation |
| scikit-learn | >= 1.3.0 | Machine learning models |
| joblib | >= 1.3.0 | Model serialization |

### Step 4: Install Frontend Dependencies

```bash
cd web
npm install
```

**Key Frontend Dependencies**

| Package | Purpose |
|---------|---------|
| react | UI framework |
| typescript | Type safety |
| vite | Build tool |
| tailwindcss | Styling |
| chart.js | Data visualization |
| react-chartjs-2 | Chart components |
| lucide-react | Icons |

---

## Running the Project

### Quick Start

```bash
# Terminal 1: Train models and start API
cd backend-v2
python train_shrimp_water_quality_models.py
python api.py

# Terminal 2: Start dashboard
cd backend-v2/web
npm run dev
```

### Detailed Steps

#### Step 1: Train the Machine Learning Models

Before running the API, train the ML models using the provided training script:

```bash
cd backend-v2
python train_shrimp_water_quality_models.py
```

**Training Pipeline**

| Phase | Description | Duration |
|-------|-------------|----------|
| Data Loading | Load 35,000 samples from CSV | ~2 seconds |
| Preprocessing | IQR outlier filtering | ~1 second |
| Classification | Train RF and MLP classifiers | ~30 seconds |
| Time-Series | Train ANN, SVR, MLR for 3 horizons | ~2 minutes |
| Export | Save all models to joblib files | ~5 seconds |

**Expected Console Output**

```
================================================================================
               SHRIMP FARM WATER QUALITY ML TRAINING PIPELINE
================================================================================

[1/5] Loading dataset from Data set/WQD_synthetic_35000.csv ...
      Original samples: 35,000 | After IQR filter: ~32,000

[2/5] Training water quality classification models ...
      Training RandomForestClassifier...
      Training MLPClassifier...
      Best classification model: random_forest | F1-macro = 0.9523

[3/5] Training time-series regression models ...
      Processing horizon: 6 hours
      Processing horizon: 12 hours
      Processing horizon: 24 hours
      Best TS model for horizon 6: ann | R2_macro = 0.9187
      Best TS model for horizon 12: ann | R2_macro = 0.8734
      Best TS model for horizon 24: ann | R2_macro = 0.8102

[4/5] Training support models ...
      Isolation Forest for anomaly detection
      WQI Predictor initialization

[5/5] Exporting models to .joblib format ...
      Models exported to: exported_models/

================================================================================
                         TRAINING COMPLETE
================================================================================
```

#### Step 2: Start the Prediction API Server

```bash
cd backend-v2
python api.py
```

**API Server Information**

| Property | Value |
|----------|-------|
| URL | http://localhost:5001 |
| Protocol | HTTP/REST |
| Format | JSON |
| CORS | Enabled (all origins) |

**Startup Console Output**

```
Loading ML models from exported_models/ ...
  [OK] water_quality_cls_best.joblib
  [OK] ts_best_h6.joblib
  [OK] ts_best_h12.joblib
  [OK] ts_best_h24.joblib
  [OK] wqi_predictor.joblib

Flask API running on http://localhost:5001
```

#### Step 3: Start the Dashboard

**Development Mode (with hot-reload)**

```bash
cd backend-v2/web
npm run dev
```

**Dashboard Information**

| Property | Value |
|----------|-------|
| URL | http://localhost:5173 |
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| API Connection | http://localhost:5001 |

#### Step 4: Production Build

```bash
cd backend-v2/web
npm run build
npm run preview  # Preview production build
```

**Build Output**

```
backend-v2/web/dist/
|-- index.html
|-- assets/
    |-- index-[hash].js
    |-- index-[hash].css
```

---

## API Reference

### Base URL

```
http://localhost:5001
```

### Authentication

Currently, the API does not require authentication. For production deployments, implement JWT or API key authentication.

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-01-05T10:30:00Z"
}
```

### Endpoints

#### Health Check

```http
GET /api/health
```

**Response**

```json
{
  "status": "healthy",
  "models_loaded": {
    "classification": true,
    "time_series_6h": true,
    "time_series_12h": true,
    "time_series_24h": true,
    "wqi_predictor": true
  },
  "uptime": "2h 30m 15s"
}
```

---

#### Single Pond Prediction

```http
POST /api/predict
Content-Type: application/json
```

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pond_id | integer | Yes | Pond identifier |
| pH | float | Yes | pH level (6.0-9.5) |
| Temperature | float | Yes | Water temperature in Celsius |
| DO | float | Yes | Dissolved oxygen (mg/L) |
| Salinity | float | No | Salinity (ppt) |
| Ammonia | float | No | Ammonia level (mg/L) |
| Nitrite | float | No | Nitrite level (mg/L) |
| Turbidity | float | No | Water clarity (cm) |

**Example Request**

```json
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

**Example Response**

```json
{
  "pond_id": 1,
  "current": {
    "wqi": 82,
    "wqi_class": "Good",
    "sensors": {
      "pH": { "value": 7.8, "status": "optimal", "trend": "stable" },
      "DO": { "value": 6.2, "status": "optimal", "trend": "rising" },
      "Temperature": { "value": 28.5, "status": "optimal", "trend": "stable" }
    }
  },
  "forecasts": {
    "6h": { "pH": 7.7, "DO": 6.0, "Temperature": 28.8 },
    "12h": { "pH": 7.6, "DO": 5.8, "Temperature": 29.2 },
    "24h": { "pH": 7.5, "DO": 5.5, "Temperature": 29.5 }
  },
  "predicted_wqi": {
    "6h": { "value": 80, "class": "Good", "confidence": 0.92 },
    "12h": { "value": 76, "class": "Good", "confidence": 0.87 },
    "24h": { "value": 72, "class": "Medium", "confidence": 0.81 }
  },
  "alerts": [
    {
      "type": "warning",
      "parameter": "DO",
      "message": "DO may drop below optimal in 24h",
      "predicted_value": 5.5,
      "threshold": 5.0
    }
  ],
  "recommendations": [
    "Consider activating aerators before nightfall",
    "Monitor DO levels closely during night hours"
  ],
  "time_to_danger": {
    "DO": { "hours": 36, "confidence": 0.75 },
    "pH": null,
    "Temperature": null
  },
  "night_safety": {
    "risk_level": "low",
    "minimum_do_forecast": 5.2,
    "recommendation": "Current aeration sufficient"
  },
  "confidence": {
    "overall": 0.89,
    "classification": 0.95,
    "forecasting": 0.84
  }
}
```

---

#### Batch Prediction

```http
POST /api/predict/batch
Content-Type: application/json
```

**Request Body**

```json
{
  "ponds": [
    { "pond_id": 1, "pH": 7.8, "Temperature": 28.5, "DO": 6.2 },
    { "pond_id": 2, "pH": 7.5, "Temperature": 29.0, "DO": 5.8 },
    { "pond_id": 3, "pH": 8.0, "Temperature": 27.5, "DO": 6.5 }
  ]
}
```

**Response**

```json
{
  "predictions": [
    { "pond_id": 1, "wqi": 82, "wqi_class": "Good", ... },
    { "pond_id": 2, "wqi": 75, "wqi_class": "Good", ... },
    { "pond_id": 3, "wqi": 85, "wqi_class": "Good", ... }
  ],
  "summary": {
    "total_ponds": 3,
    "average_wqi": 80.7,
    "critical_alerts": 0,
    "warnings": 1
  }
}
```

---

#### IoT Sensor Data Ingestion

```http
POST /api/sensor-data
Content-Type: application/json
```

**Request Body**

```json
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

**Response**

```json
{
  "status": "received",
  "device_id": "ESP32_001",
  "pond_id": 1,
  "immediate_actions": [],
  "next_poll_seconds": 60
}
```

---

#### Generate Simulated Data

```http
GET /api/simulate?ponds=4
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ponds | integer | 4 | Number of ponds to simulate |

**Response**

```json
{
  "ponds": [
    {
      "pond_id": 1,
      "pH": 7.82,
      "DO": 6.15,
      "Temperature": 28.3,
      "Salinity": 19.5,
      "Ammonia": 0.04,
      "Nitrite": 0.02
    },
    ...
  ],
  "generated_at": "2026-01-05T10:30:00Z"
}
```

---

#### Hardware Trigger Command

```http
POST /api/trigger
Content-Type: application/json
```

**Request Body**

```json
{
  "device_id": "ESP32_001",
  "action": "activate",
  "device_type": "aerator",
  "duration_minutes": 30,
  "reason": "DO below threshold"
}
```

**Response**

```json
{
  "status": "command_sent",
  "device_id": "ESP32_001",
  "action": "activate",
  "estimated_completion": "2026-01-05T11:00:00Z"
}
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| FLASK_PORT | 5001 | API server port |
| FLASK_DEBUG | False | Enable debug mode |
| MODEL_DIR | exported_models/ | Directory for trained models |
| DATA_DIR | Data set/ | Directory for training data |
| CORS_ORIGINS | * | Allowed CORS origins |
| LOG_LEVEL | INFO | Logging verbosity |

**Setting Environment Variables**

```bash
# Windows (PowerShell)
$env:FLASK_PORT = "5001"
$env:FLASK_DEBUG = "True"

# Linux/Mac
export FLASK_PORT=5001
export FLASK_DEBUG=True
```

### Water Quality Thresholds

Thresholds are configured in `api.py`. Modify these values to match your specific farm conditions:

```python
OPTIMAL_RANGES = {
    "DO": {
        "optimal_min": 5.0,      # Ideal minimum DO
        "optimal_max": 8.0,      # Ideal maximum DO
        "acceptable_min": 4.0,   # Tolerable minimum
        "acceptable_max": 10.0,  # Tolerable maximum
        "critical_min": 3.0,     # Emergency threshold
    },
    "pH": {
        "optimal_min": 7.5,
        "optimal_max": 8.5,
        "acceptable_min": 7.0,
        "acceptable_max": 9.0,
        "critical_min": 6.5,
        "critical_max": 9.5,
    },
    "Temperature": {
        "optimal_min": 26.0,
        "optimal_max": 30.0,
        "acceptable_min": 24.0,
        "acceptable_max": 32.0,
        "critical_min": 22.0,
        "critical_max": 35.0,
    },
    "Ammonia": {
        "optimal_max": 0.1,
        "acceptable_max": 0.2,
        "critical_max": 0.5,
    },
    "Nitrite": {
        "optimal_max": 0.05,
        "acceptable_max": 0.1,
        "critical_max": 0.25,
    }
}
```

### Auto-Trigger Configuration

Hardware triggers are configured through the dashboard or API:

```typescript
// Auto-trigger configuration structure
interface TriggerConfig {
  enabled: boolean;
  deviceType: 'aerator' | 'oxygen_pump' | 'water_pump' | 'heater';
  parameter: 'DO' | 'pH' | 'Temperature';
  threshold: number;
  direction: 'above' | 'below';
  cooldownMinutes: number;        // Minimum time between triggers
  confirmationReadings: number;   // Readings required before trigger
  autoShutoffMinutes: number;     // Auto turn-off duration
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

**Default Trigger Configurations**

| Device | Parameter | Threshold | Direction | Cooldown | Priority |
|--------|-----------|-----------|-----------|----------|----------|
| Aerator | DO | 4.5 mg/L | Below | 15 min | High |
| Oxygen Pump | DO | 4.0 mg/L | Below | 10 min | Critical |
| Water Pump | Temperature | 32 C | Above | 30 min | Medium |
| Heater | Temperature | 24 C | Below | 30 min | Medium |

---

## Hardware Integration

### Supported Devices

| Device Type | Protocol | Purpose |
|-------------|----------|---------|
| ESP32 | WiFi/HTTP | Main controller |
| pH Sensor | I2C | pH measurement |
| DO Sensor | Analog | Dissolved oxygen |
| Temp Sensor | OneWire | Water temperature |
| Relay Module | GPIO | Device switching |

### ESP32 Wiring Diagram

```
ESP32 Controller
    |
    |-- GPIO 25 --> Aerator Relay
    |-- GPIO 26 --> Oxygen Pump Relay
    |-- GPIO 27 --> Water Pump Relay
    |-- GPIO 32 --> Heater Relay
    |
    |-- GPIO 34 (ADC) <-- DO Sensor
    |-- GPIO 35 (ADC) <-- Turbidity Sensor
    |-- GPIO 21 (SDA) <-- pH Sensor (I2C)
    |-- GPIO 22 (SCL) <-- pH Sensor (I2C)
    |-- GPIO 4 (OneWire) <-- Temperature Sensor
```

### ESP32 API Endpoints

The ESP32 devices expose these endpoints for the main API to control:

```http
GET  /status          # Get device status
POST /activate        # Activate device
POST /deactivate      # Deactivate device
GET  /sensors         # Read sensor values
POST /config          # Update configuration
```

---

## Troubleshooting

### Common Issues

#### Models Not Loading

**Symptom:** API starts but predictions fail

**Solution:**
```bash
# Verify models exist
ls exported_models/

# Re-train if missing
python train_shrimp_water_quality_models.py
```

#### CORS Errors in Browser

**Symptom:** Dashboard cannot connect to API

**Solution:** Ensure Flask-CORS is installed and configured:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

#### Port Already in Use

**Symptom:** `Address already in use` error

**Solution:**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5001
kill -9 <PID>
```

#### Training Takes Too Long

**Symptom:** Model training exceeds 10 minutes

**Solution:**
- Reduce dataset size for testing
- Use fewer model configurations
- Increase available RAM

#### Dashboard Not Updating

**Symptom:** Charts show stale data

**Solution:**
- Check API connection in browser console
- Verify API is running
- Check CORS configuration

---

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `python -m pytest`
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style

- Python: Follow PEP 8
- TypeScript: Use ESLint with Prettier
- Commits: Use conventional commit messages

### Pull Request Guidelines

- Include tests for new features
- Update documentation as needed
- Ensure all CI checks pass
- Request review from maintainers

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For technical support or questions, please contact the development team.

---

## Changelog

### Version 2.0.0 (Current)

- Added time-series forecasting with multiple horizons (6h, 12h, 24h)
- Implemented auto-trigger system for hardware automation
- Added disease detection risk assessment
- Improved UI with enhanced visualization
- Added what-if scenario simulator
- ESP32 integration for IoT devices

### Version 1.0.0

- Initial release
- Basic water quality monitoring
- Random Forest classification model
- Flask API backend
- React dashboard

---

<p align="center">
  <strong>Built for sustainable aquaculture management</strong>
</p>
