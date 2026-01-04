import sqlite3
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parent

def ensure_db():
    p = ROOT.joinpath('models', 'exported_models', 'dashboard_history.db')
    p.parent.mkdir(parents=True, exist_ok=True)
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
    print('OK: DB initialized at', p)

def check_models():
    base = ROOT.joinpath('models', 'exported_models', 'dashboard_models')
    required = ['random_forest_multioutput.joblib', 'svm_classifier.joblib', 'knn_do.joblib']
    missing = []
    for r in required:
        if not base.joinpath(r).exists():
            missing.append(r)
    if missing:
        print('\nWARNING: Missing model files in', base)
        for m in missing:
            print(' -', m)
        print('\nThe dashboard will still run, but endpoints using those models may fail.')
    else:
        print('OK: All dashboard models present in', base)

def print_next_steps():
    print('\nNext steps:')
    print('1) Start the API server (from this folder):')
    print('   python -m uvicorn predict_api:app --host 127.0.0.1 --port 8000 --reload')
    print('2) Open the dashboard: http://127.0.0.1:8000/dashboard/static/index.html')

def main():
    print('Initializing dashboard...')
    ensure_db()
    check_models()
    print_next_steps()

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('Error:', e)
        sys.exit(1)
