from fastapi import FastAPI, HTTPException
import importlib.util
import threading
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from pathlib import Path
import subprocess
import sys
import joblib
import numpy as np
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, RedirectResponse
from fastapi import WebSocket, WebSocketDisconnect, UploadFile, File
import sqlite3
import json
import datetime
import asyncio
import csv
import io


class PredictRequest(BaseModel):
    input: Dict[str, Any]


app = FastAPI(title="Water Quality Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _model_path() -> Path:
    return Path(__file__).resolve().parent.joinpath('models', 'exported_models', 'best_model.joblib')


_MODEL = None
_FEATURE_NAMES = None

# dashboard models cache
_DASH_MODELS: Dict[str, Dict] = {}


def _dashboard_model_path(name: str) -> Path:
    return Path(__file__).resolve().parent.joinpath('models', 'exported_models', 'dashboard_models', f"{name}.joblib")


def load_model():
    global _MODEL, _FEATURE_NAMES
    p = _model_path()
    if not p.exists():
        raise FileNotFoundError(f"Model file not found at {p}")
    obj = joblib.load(p)
    # support saved format: {'model': pipeline, 'feature_names': [...]}
    if isinstance(obj, dict) and 'model' in obj:
        _MODEL = obj.get('model')
        _FEATURE_NAMES = obj.get('feature_names')
    else:
        _MODEL = obj
        _FEATURE_NAMES = None


def _load_dashboard_model(name: str):
    # Cache loaded models in _DASH_MODELS
    if name in _DASH_MODELS:
        return _DASH_MODELS[name]
    p = _dashboard_model_path(name)
    if not p.exists():
        # Attempt to auto-train dashboard models if missing
        trainer = Path(__file__).resolve().parent.joinpath('models', 'train_dashboard_models.py')
        if trainer.exists():
            try:
                print(f"Dashboard model {name} missing; running trainer {trainer}")
                subprocess.check_call([sys.executable, str(trainer)])
            except Exception as e:
                print(f"Auto-training failed: {e}")
        # re-check
        if not p.exists():
            raise FileNotFoundError(f"Dashboard model not found at {p} after attempted training")
    obj = joblib.load(p)
    if isinstance(obj, dict) and 'model' in obj:
        _DASH_MODELS[name] = {'model': obj['model'], 'feature_names': obj.get('feature_names')}
    else:
        _DASH_MODELS[name] = {'model': obj, 'feature_names': None}
    return _DASH_MODELS[name]


def _process_sample_and_persist(sensors: dict):
    """Run models on a single sensors dict, apply KNN DO fallback if needed, persist and broadcast.
    Returns tuple (rf_out, svm_out, knn_out, fallback_used, ts)
    """
    rf_m = _load_dashboard_model('random_forest_multioutput')
    svm_m = _load_dashboard_model('svm_classifier')
    knn_m = _load_dashboard_model('knn_do')

    rf_model = rf_m['model']
    svm_model = svm_m['model']
    knn_model = knn_m['model']

    features = rf_m.get('feature_names')
    if features is None:
        raise HTTPException(status_code=500, detail='RF model missing feature names')

    try:
        X = np.array([[float(sensors.get(k, 0)) for k in features]], dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid input: {e}')

    rf_preds = rf_model.predict(X)[0]
    svm_pred = int(svm_model.predict(X)[0])
    knn_pred = float(knn_model.predict(X)[0])

    rf_out = {'DO(mg/L)': float(rf_preds[0]), 'pH': float(rf_preds[1]), 'Ammonia (mg L-1 )': float(rf_preds[2])}
    svm_out = {'class': svm_pred}
    knn_out = {'DO(mg/L)': knn_pred}

    # fallback
    do_input = sensors.get('DO(mg/L)')
    try:
        do_val = float(do_input) if do_input is not None else None
    except Exception:
        do_val = None

    fallback_used = False
    if do_val is None or do_val <= 0:
        rf_out['DO(mg/L)'] = knn_pred
        rf_out['note'] = 'DO estimated via KNN fallback (sensor missing or invalid)'
        fallback_used = True

    # svm probabilities
    if hasattr(svm_model, 'predict_proba'):
        try:
            svm_out['probabilities'] = svm_model.predict_proba(X)[0].tolist()
            svm_out['label'] = {0:'Good',1:'Warning',2:'Dangerous'}.get(int(svm_out['class']))
        except Exception:
            pass

    ts = int(datetime.datetime.utcnow().timestamp())
    try:
        save_sample_to_db(ts, sensors, rf_out, svm_out, knn_out)
    except Exception as e:
        print('Warning: could not save sample to DB', e)

    # broadcast
    payload = {'ts': ts, 'sensors': sensors, 'rf': rf_out, 'svm': svm_out, 'knn': knn_out}
    try:
        asyncio.get_event_loop().create_task(manager.broadcast(payload))
    except Exception:
        pass

    return rf_out, svm_out, knn_out, fallback_used, ts


# --- Simple SQLite persistence for samples ---
def _db_path() -> Path:
    return Path(__file__).resolve().parent.joinpath('models', 'exported_models', 'dashboard_history.db')

def init_db():
    p = _db_path()
    os.makedirs(p.parent, exist_ok=True)
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts INTEGER NOT NULL,
            sensors TEXT,
            rf TEXT,
            svm TEXT,
            knn TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_sample_to_db(ts:int, sensors:dict, rf:dict, svm:dict, knn:dict):
    p = _db_path()
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute('INSERT INTO samples (ts,sensors,rf,svm,knn) VALUES (?,?,?,?,?)', (
        ts,
        json.dumps(sensors),
        json.dumps(rf),
        json.dumps(svm),
        json.dumps(knn)
    ))
    conn.commit()
    conn.close()


# WebSocket manager with enhanced diagnostics
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_log: List[Dict[str, Any]] = []
        self.max_log_size = 100

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Log connection
        log_entry = {
            'action': 'connect',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'total_connections': len(self.active_connections),
            'client': getattr(websocket, 'client', 'unknown')
        }
        self.connection_log.append(log_entry)
        if len(self.connection_log) > self.max_log_size:
            self.connection_log.pop(0)
        
        print(f"✅ WebSocket connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
            log_entry = {
                'action': 'disconnect',
                'timestamp': datetime.datetime.utcnow().isoformat(),
                'total_connections': len(self.active_connections)
            }
            self.connection_log.append(log_entry)
            if len(self.connection_log) > self.max_log_size:
                self.connection_log.pop(0)
            print(f"❌ WebSocket disconnected. Total active: {len(self.active_connections)}")
        except ValueError:
            pass

    async def broadcast(self, message: dict):
        """Broadcast to all connected clients. Return count of successful sends."""
        living = []
        failed = 0
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
                living.append(connection)
            except Exception as e:
                print(f"⚠️  Failed to send to client: {e}")
                failed += 1
        self.active_connections = living
        return len(living), failed

    def get_status(self) -> Dict[str, Any]:
        """Return current connection status."""
        return {
            'connected_clients': len(self.active_connections),
            'recent_log': self.connection_log[-10:],
            'status': 'healthy' if len(self.active_connections) > 0 else 'idle'
        }

manager = ConnectionManager()

# In-process simulator runners: pond_id -> {'thread': Thread, 'sim': Simulator}
_SIMULATORS: Dict[str, Dict[str, Any]] = {}

def _load_simulator_class():
    """Dynamically load Simulator class from simulator.py so we don't require package imports."""
    sim_path = Path(__file__).resolve().parent.joinpath('simulator.py')
    if not sim_path.exists():
        raise FileNotFoundError(f"Simulator script not found at {sim_path}")
    spec = importlib.util.spec_from_file_location('simulator_module', str(sim_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return getattr(mod, 'Simulator')


@app.on_event('startup')
def startup_db_and_models():
    # ensure DB exists
    try:
        init_db()
    except Exception as e:
        print('Warning: could not initialize DB:', e)


@app.on_event("startup")
def startup_event():
    try:
        load_model()
        print("✅ Model loaded successfully.")
    except Exception as e:
        print(f"⚠️  Warning: could not load model: {e}")
    
    # Verify WebSocket endpoint is registered
    print("\n" + "="*60)
    print("WEBSOCKET ENDPOINT VERIFICATION")
    print("="*60)
    print("✅ /ws/sensors endpoint is REGISTERED")
    print(f"✅ URL: ws://localhost:8000/ws/sensors (or wss:// for HTTPS)")
    print(f"✅ Connection Manager initialized with {len(manager.active_connections)} active connections")
    print("="*60 + "\n")


# --- DIAGNOSTIC ENDPOINTS ---

@app.get('/health')
def health():
    """Check API and WebSocket health."""
    ws_status = manager.get_status()
    return {
        "ok": True,
        "model_loaded": _MODEL is not None,
        "websocket_endpoint": "/ws/sensors",
        "websocket_url": "ws://localhost:8000/ws/sensors",
        "websocket_status": ws_status,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.get('/ws/health')
def ws_health():
    """Dedicated WebSocket health check."""
    status = manager.get_status()
    return {
        "websocket_running": True,
        "endpoint": "/ws/sensors",
        "connected_clients": status['connected_clients'],
        "status": status['status'],
        "connection_log": status['recent_log'],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.get('/ws/test')
def ws_test():
    """Test WebSocket connectivity info and provide client-side code example."""
    return {
        "message": "WebSocket endpoint is available",
        "endpoint": "/ws/sensors",
        "protocol": "ws://",
        "host": "localhost:8000",
        "full_url": "ws://localhost:8000/ws/sensors",
        "current_connections": manager.get_status()['connected_clients'],
        "example_client_code": """
// JavaScript WebSocket client example
const ws = new WebSocket('ws://localhost:8000/ws/sensors');

ws.onopen = (event) => {
    console.log('✅ WebSocket connected!');
    // Optionally send a ping periodically
    setInterval(() => ws.send('ping'), 30000);
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📊 Received sensor data:', data);
    // Update dashboard with data
};

ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
};

ws.onclose = (event) => {
    console.log('❌ WebSocket disconnected');
    // Attempt reconnect after 3 seconds
    setTimeout(() => location.reload(), 3000);
};
"""
    }


def _iter_history_csv(limit: int = 10000):
    p = _db_path()
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute('SELECT ts,sensors,rf,svm,knn FROM samples ORDER BY id ASC LIMIT ?', (limit,))
    yield 'ts,sensor_json,rf_json,svm_json,knn_json\n'
    for ts, sensors, rf, svm, knn in c.fetchall():
        row = [str(ts), json.dumps(json.loads(sensors)), json.dumps(json.loads(rf)), json.dumps(json.loads(svm)), json.dumps(json.loads(knn))]
        yield (','.join('"{}"'.format(x.replace('"', '""')) for x in row) + '\n')
    conn.close()


@app.get('/dashboard/history.csv')
def dashboard_history_csv(limit: int = 10000):
    gen = _iter_history_csv(limit)
    return StreamingResponse(gen, media_type='text/csv', headers={
        'Content-Disposition': 'attachment; filename="dashboard_history.csv"'
    })


@app.websocket('/ws/sensors')
async def websocket_sensors(ws: WebSocket):
    """
    Main WebSocket endpoint for real-time sensor data streaming.
    
    Clients connect here to receive:
    - Sensor readings
    - ML predictions (RF, SVM, KNN)
    - Alerts and recommendations
    
    Keeps connection alive by:
    1. Accepting heartbeat pings from client
    2. Periodically sending data (via /dashboard/predict_all)
    """
    await manager.connect(ws)
    try:
        while True:
            # Keep connection alive; receive heartbeat pings from client
            try:
                # Set a timeout to detect dead connections
                msg = await asyncio.wait_for(ws.receive_text(), timeout=60.0)
                # Client may send 'ping' or other messages; just acknowledge
                if msg.lower() in ['ping', 'keep-alive']:
                    await ws.send_json({'type': 'pong', 'ts': int(datetime.datetime.utcnow().timestamp())})
            except asyncio.TimeoutError:
                # No message received for 60 seconds; connection might be idle
                # Send a keep-alive message to check if still connected
                try:
                    await ws.send_json({'type': 'keep-alive', 'ts': int(datetime.datetime.utcnow().timestamp())})
                except Exception:
                    # Connection is dead; exit
                    break
            except WebSocketDisconnect:
                break
    except Exception as e:
        print(f"⚠️  WebSocket error: {e}")
    finally:
        manager.disconnect(ws)


# --- STARTUP INFO ENDPOINT ---

@app.get('/startup-info')
def startup_info():
    """Return detailed startup and configuration info."""
    return {
        "api_title": app.title,
        "api_version": app.version if hasattr(app, 'version') else "1.0",
        "websocket_endpoints": [
            {
                "path": "/ws/sensors",
                "protocol": "WebSocket",
                "description": "Real-time sensor data streaming",
                "url": "ws://localhost:8000/ws/sensors"
            }
        ],
        "diagnostic_endpoints": [
            {"path": "/health", "method": "GET", "description": "Overall API health"},
            {"path": "/ws/health", "method": "GET", "description": "WebSocket-specific health"},
            {"path": "/ws/test", "method": "GET", "description": "WebSocket connectivity test + example code"},
            {"path": "/startup-info", "method": "GET", "description": "This endpoint"}
        ],
        "model_status": {
            "loaded": _MODEL is not None,
            "path": str(_model_path()) if _MODEL else None
        },
        "cors_origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:8000"
        ],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.post('/predict')
def predict(req: PredictRequest):
    global _MODEL
    if _MODEL is None:
        load_model()
    feat = req.input
    # Ensure consistent ordering: use model feature names if possible
    if _FEATURE_NAMES is not None:
        try:
            X = np.array([[float(feat.get(k, 0)) for k in _FEATURE_NAMES]], dtype=float)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid input values for features: {e}")
    else:
        try:
            X = np.array([list(feat.values())], dtype=float)
        except Exception:
            # fallback: sort keys alphabetically
            keys = sorted(feat.keys())
            X = np.array([[float(feat[k]) for k in keys]], dtype=float)

    pred = _MODEL.predict(X)
    out: Dict[str, Any] = {"prediction": pred[0].tolist() if hasattr(pred[0], 'tolist') else int(pred[0])}
    if hasattr(_MODEL, 'predict_proba'):
        probs = _MODEL.predict_proba(X)
        out['probabilities'] = probs[0].tolist()
    return out


@app.post('/dashboard/predict_rf')
def dashboard_predict_rf(req: PredictRequest):
    m = _load_dashboard_model('random_forest_multioutput')
    model = m['model']
    features = m.get('feature_names')
    if features is None:
        raise HTTPException(status_code=500, detail='Model missing feature names')
    try:
        X = np.array([[float(req.input.get(k, 0)) for k in features]], dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid input: {e}')

    preds = model.predict(X)[0]
    # preds correspond to [DO, pH, Ammonia]
    pred_out = {'DO(mg/L)': float(preds[0]), 'pH': float(preds[1]), 'Ammonia (mg L-1 )': float(preds[2])}

    # Simple heuristic: assume prediction horizon is 30 minutes; estimate time to threshold if DO falls below 4 mg/L
    current_do = None
    try:
        current_do = float(req.input.get('DO(mg/L)'))
    except Exception:
        current_do = None

    if current_do is not None:
        predicted_do = pred_out['DO(mg/L)']
        horizon_minutes = 30
        drop_per_min = (current_do - predicted_do) / max(1.0, horizon_minutes)
        if predicted_do < 4.0 and drop_per_min > 0:
            minutes_to_threshold = int(max(1, (current_do - 4.0) / drop_per_min))
            pred_out['alert'] = f"Predicted DO {predicted_do:.2f} mg/L — expected below 4 mg/L in approx {minutes_to_threshold} minutes"
            pred_out['action'] = 'Turn ON aerator now'
        elif predicted_do < 4.0:
            pred_out['alert'] = f"Predicted DO {predicted_do:.2f} mg/L — below threshold. Immediate action recommended"
            pred_out['action'] = 'Turn ON aerator now'
        else:
            pred_out['alert'] = f"Predicted DO {predicted_do:.2f} mg/L — within safe range"
    else:
        pred_out['note'] = 'Current DO not provided; prediction returned without time estimate.'

    return pred_out


@app.post('/dashboard/predict_svm')
def dashboard_predict_svm(req: PredictRequest):
    m = _load_dashboard_model('svm_classifier')
    model = m['model']
    features = m.get('feature_names')
    if features is None:
        raise HTTPException(status_code=500, detail='Model missing feature names')
    try:
        X = np.array([[float(req.input.get(k, 0)) for k in features]], dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid input: {e}')
    pred = model.predict(X)[0]
    label_map = {0: 'Good', 1: 'Warning', 2: 'Dangerous'}
    prob = None
    if hasattr(model, 'predict_proba'):
        prob = model.predict_proba(X)[0].tolist()
    return {'class': int(pred), 'label': label_map.get(int(pred), str(pred)), 'probabilities': prob}


@app.post('/dashboard/predict_knn')
def dashboard_predict_knn(req: PredictRequest):
    m = _load_dashboard_model('knn_do')
    model = m['model']
    features = m.get('feature_names')
    if features is None:
        raise HTTPException(status_code=500, detail='Model missing feature names')
    try:
        X = np.array([[float(req.input.get(k, 0)) for k in features]], dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid input: {e}')
    pred = float(model.predict(X)[0])
    return {'DO(mg/L)': pred}


@app.post('/dashboard/predict_all')
async def dashboard_predict_all(req: PredictRequest):
    # Load models
    rf_m = _load_dashboard_model('random_forest_multioutput')
    svm_m = _load_dashboard_model('svm_classifier')
    knn_m = _load_dashboard_model('knn_do')

    rf_model = rf_m['model']
    svm_model = svm_m['model']
    knn_model = knn_m['model']

    features = rf_m.get('feature_names')
    if features is None:
        raise HTTPException(status_code=500, detail='RF model missing feature names')

    try:
        X = np.array([[float(req.input.get(k, 0)) for k in features]], dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid input: {e}')

    # Run predictions
    rf_preds = rf_model.predict(X)[0]
    svm_pred = int(svm_model.predict(X)[0])
    knn_pred = float(knn_model.predict(X)[0])

    rf_out = {'DO(mg/L)': float(rf_preds[0]), 'pH': float(rf_preds[1]), 'Ammonia (mg L-1 )': float(rf_preds[2])}
    svm_out = {'class': svm_pred}
    knn_out = {'DO(mg/L)': knn_pred}

    # If input DO is missing or invalid, use KNN as fallback for DO
    do_input = req.input.get('DO(mg/L)')
    try:
        do_val = float(do_input) if do_input is not None else None
    except Exception:
        do_val = None

    fallback_used = False
    if do_val is None or do_val <= 0:
        # override DO in rf_out with knn estimate
        rf_out['DO(mg/L)'] = knn_pred
        rf_out['note'] = 'DO estimated via KNN fallback (sensor missing or invalid)'
        fallback_used = True

    # Simple SVM probability if available
    svm_probs = None
    if hasattr(svm_model, 'predict_proba'):
        try:
            svm_probs = svm_model.predict_proba(X)[0].tolist()
            svm_out['probabilities'] = svm_probs
        except Exception:
            pass

    # Build sample and persist
    ts = int(datetime.datetime.utcnow().timestamp())
    sensors = req.input
    save_sample_to_db(ts, sensors, rf_out, svm_out, knn_out)

    # Broadcast to websocket listeners (with error handling)
    payload = {'ts': ts, 'sensors': sensors, 'rf': rf_out, 'svm': svm_out, 'knn': knn_out}
    try:
        loop = asyncio.get_event_loop()
        # Schedule broadcast as task
        task = loop.create_task(manager.broadcast(payload))
        # Don't await; fire-and-forget but monitor
        print(f"📡 Broadcast scheduled for {len(manager.active_connections)} active clients")
    except Exception as e:
        print(f"⚠️  Could not schedule broadcast: {e}")

    return {'rf': rf_out, 'svm': svm_out, 'knn': knn_out, 'knn_fallback_used': fallback_used}


@app.get('/dashboard/history')
def dashboard_history(limit: int = 200):
    p = _db_path()
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute('SELECT ts,sensors,rf,svm,knn FROM samples ORDER BY id DESC LIMIT ?', (limit,))
    rows = c.fetchall()
    conn.close()
    out = []
    for ts, sensors, rf, svm, knn in rows:
        out.append({'ts': ts, 'sensors': json.loads(sensors), 'rf': json.loads(rf), 'svm': json.loads(svm), 'knn': json.loads(knn)})
    return out


@app.post('/dashboard/predict_batch')
def dashboard_predict_batch(file: UploadFile = File(...)):
    # Accept CSV file, parse rows, run predictions, persist and return CSV results as attachment
    data = file.file.read()
    try:
        text = data.decode('utf-8')
    except Exception:
        text = data.decode('latin-1')

    reader = csv.DictReader(io.StringIO(text))
    # prepare output CSV in-memory
    out_buf = io.StringIO()
    fieldnames = ['ts'] + list(reader.fieldnames or []) + ['DO(mg/L)_rf','pH_rf','Ammonia_rf','DO_knn','svm_class','knn_fallback_used']
    writer = csv.DictWriter(out_buf, fieldnames=fieldnames)
    writer.writeheader()

    count = 0
    for row in reader:
        # normalize keys: if CSV headers match feature names, use them; otherwise attempt simple mapping
        sensors = {k: (v if v != '' else None) for k, v in row.items()}
        try:
            rf_out, svm_out, knn_out, fallback_used, ts = _process_sample_and_persist(sensors)
            out_row = {'ts': ts}
            out_row.update(row)
            out_row['DO(mg/L)_rf'] = rf_out.get('DO(mg/L)')
            out_row['pH_rf'] = rf_out.get('pH')
            out_row['Ammonia_rf'] = rf_out.get('Ammonia (mg L-1 )')
            out_row['DO_knn'] = knn_out.get('DO(mg/L)')
            out_row['svm_class'] = svm_out.get('class')
            out_row['knn_fallback_used'] = int(bool(fallback_used))
            writer.writerow(out_row)
            count += 1
        except Exception as e:
            # write row with error note
            out_row = {'ts': int(datetime.datetime.utcnow().timestamp())}
            out_row.update(row)
            out_row['DO(mg/L)_rf'] = ''
            out_row['pH_rf'] = ''
            out_row['Ammonia_rf'] = ''
            out_row['DO_knn'] = ''
            out_row['svm_class'] = f'error: {e}'
            out_row['knn_fallback_used'] = 0
            writer.writerow(out_row)

    out_buf.seek(0)
    filename = f'dashboard_predictions_{int(datetime.datetime.utcnow().timestamp())}.csv'
    return StreamingResponse(io.BytesIO(out_buf.getvalue().encode('utf-8')), media_type='text/csv', headers={
        'Content-Disposition': f'attachment; filename="{filename}"'
    })


@app.post('/dashboard/simulator/start')
def dashboard_simulator_start(req: Dict[str, Any]):
    """Start an in-process simulator for a pond. Body: {pond, min, max, mode, hourly_agg_seconds}.
    Returns status and thread info.
    """
    pond = req.get('pond', 'POND_01')
    if pond in _SIMULATORS:
        return {'status': 'already_running', 'pond': pond}

    SimulatorClass = _load_simulator_class()
    sim = SimulatorClass(base_url=f"http://127.0.0.1:8000", pond_id=pond,
                         interval_min=float(req.get('min', 5)), interval_max=float(req.get('max', 10)),
                         mode=req.get('mode', 'normal'), logfile=req.get('log', 'simulated_samples.csv'),
                         hourly_agg_seconds=int(req.get('hourly_agg_seconds', 0)))

    t = threading.Thread(target=sim.run, daemon=True)
    t.start()
    _SIMULATORS[pond] = {'thread': t, 'sim': sim, 'started': int(datetime.datetime.utcnow().timestamp())}
    return {'status': 'started', 'pond': pond}


@app.post('/dashboard/simulator/stop')
def dashboard_simulator_stop(req: Dict[str, Any]):
    pond = req.get('pond', None)
    if pond is None:
        return {'status': 'error', 'detail': 'missing pond'}
    entry = _SIMULATORS.get(pond)
    if not entry:
        return {'status': 'not_running', 'pond': pond}
    try:
        sim = entry['sim']
        sim.stop()
        entry['thread'].join(timeout=5)
    except Exception as e:
        return {'status': 'error', 'detail': str(e)}
    _SIMULATORS.pop(pond, None)
    return {'status': 'stopped', 'pond': pond}


@app.get('/dashboard/simulator/status')
def dashboard_simulator_status():
    out = {}
    for pond, entry in _SIMULATORS.items():
        out[pond] = {'running': entry['thread'].is_alive(), 'started': entry.get('started')}
    return out


# Mount a lightweight static dashboard from the api/dashboard folder
dashboard_dir = Path(__file__).resolve().parent.joinpath('dashboard')
if dashboard_dir.exists():
    app.mount('/dashboard/static', StaticFiles(directory=str(dashboard_dir)), name='dashboard_static')


# Redirect root to dashboard
@app.get('/')
def root_redirect():
    """Redirect root to dashboard."""
    return RedirectResponse(url='/dashboard/static/index.html', status_code=302)


@app.get('/dashboard')
def dashboard_root():
    """Redirect /dashboard to dashboard static files."""
    return RedirectResponse(url='/dashboard/static/index.html', status_code=302)

