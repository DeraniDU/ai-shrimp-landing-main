import requests
import sqlite3
import json
from pathlib import Path

base = 'http://127.0.0.1:8000'

def check(url):
    try:
        r = requests.get(url, timeout=5)
        print('URL:', url)
        print('STATUS:', r.status_code)
        try:
            print(json.dumps(r.json(), indent=2))
        except Exception:
            print(r.text)
    except Exception as e:
        print('URL:', url, 'ERROR:', e)


if __name__ == '__main__':
    check(f"{base}/dashboard/latest")
    check(f"{base}/dashboard/history?limit=5")
    check(f"{base}/dashboard/simulator/status")

    # check sqlite DB directly
    db = Path(__file__).resolve().parent.joinpath('models','exported_models','dashboard_history.db')
    print('\nDB path:', db)
    if db.exists():
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute('SELECT COUNT(*) FROM samples')
        print('DB sample count:', c.fetchone()[0])
        c.execute('SELECT ts,sensors,rf,svm,knn FROM samples ORDER BY id DESC LIMIT 3')
        rows = c.fetchall()
        for r in rows:
            ts, sensors, rf, svm, knn = r
            print('---')
            print('ts', ts)
            print('sensors', sensors[:300])
            print('rf', rf)
        conn.close()
    else:
        print('DB not found')
