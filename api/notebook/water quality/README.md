Simulator for Water Quality Dashboard

This script simulates realistic pond sensor readings and posts them to the FastAPI dashboard prediction endpoints so you can test the full pipeline without hardware.

Files
- simulator.py — Python simulator that posts JSON to /dashboard/predict_all, /dashboard/predict_knn, /dashboard/predict_svm and logs responses to simulated_samples.csv.
- requirements.txt — Python dependencies.

Quick start

1. Create and activate a virtual environment (Windows PowerShell example):

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r "api\notebook\water quality\requirements.txt"

2. Ensure the backend FastAPI server is running (from the api\notebook\water quality folder):

# from repository root
cd "api\notebook\water quality"
python -m uvicorn predict_api:app --host 127.0.0.1 --port 8000 --reload

3. Run the simulator (default 5–10s interval):

python "api\notebook\water quality\simulator.py" --host 127.0.0.1 --port 8000 --pond POND_01

Demo / faster aggregation
- To test hourly aggregation behavior in a short demo, use --hourly-agg-seconds N (e.g. 60 for a 1-minute demo):

python "api\notebook\water quality\simulator.py" --host 127.0.0.1 --port 8000 --pond POND_01 --min 2 --max 4 --hourly-agg-seconds 60

Notes
- The simulator posts JSON payloads matching { "input": { ...sensors... } } which is compatible with the existing predict_api.py endpoints.
- Logs are appended to simulated_samples.csv in the simulator folder.
- Use --mode stress or --mode danger to increase abnormal events frequency for testing alerts and recommendations.

If you want, I can: add a small PowerShell script to run this as a background job, integrate it into the README with screenshots, or wire the simulator to the React dashboard websocket for live demo controls.
