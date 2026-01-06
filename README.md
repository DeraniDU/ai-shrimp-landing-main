 🦐 Smart Shrimp Pond Monitoring System

## Prerequisites
- Python 3.8+
- Node.js & npm

## 1. Backend Setup & Model Training
Open a terminal and navigate to the `backend` folder:

```bash
cd backend
pip install -r requirements.txt
```

**Train the AI Models:**
Before starting the server, you must train the models and generate the `models.pkl` file.
```bash
python train_models.py
```

**Start the API Server:**
```bash
python app.py
```
*The backend will run on http://localhost:5000*

## 2. Frontend Dashboard Setup
Open a **new terminal** and navigate to the dashboard folder:

```bash
cd backend/dashboard
npm install
npm start
```
*The dashboard will open automatically at http://localhost:3000*

## 3. Start Data Simulation
To see the dashboard come alive with data, open a **third terminal** and run the simulator:

```bash
cd backend
python simulator.py
```

## Summary of Terminals
1. **Terminal 1:** `python app.py` (Backend API)
2. **Terminal 2:** `npm start` (React Dashboard)
3. **Terminal 3:** `python simulator.py` (IoT Device Simulator)
