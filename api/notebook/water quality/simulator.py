#!/usr/bin/env python3
"""
Sensor Data Simulator for Shrimp Farm Water Quality

Generates realistic sensor readings, sends them to the existing FastAPI
prediction endpoints (/dashboard/predict_all, /dashboard/predict_knn), and
logs responses to CSV.

Usage:
  python simulator.py --pond POND_01 --host 127.0.0.1 --port 8000

Run-time options are available via --help.
"""
import argparse
import threading
import requests
import time
import random
import datetime
import json
import csv
import os
from statistics import mean


DEFAULT_LOG = 'simulated_samples.csv'


def iso_ts():
    return datetime.datetime.utcnow().isoformat() + 'Z'


class Simulator:
    def __init__(self, base_url, pond_id='POND_01', interval_min=5, interval_max=10, mode='normal', logfile=DEFAULT_LOG, hourly_agg_seconds=0):
        self.base_url = base_url.rstrip('/')
        self.pond_id = pond_id
        self.interval_min = interval_min
        self.interval_max = interval_max
        self.mode = mode
        self.logfile = logfile
        self.hourly_agg_seconds = hourly_agg_seconds

        # internal state for drift
        self.state = {
            'Temp': 29.0,
            'pH': 7.8,
            'DO(mg/L)': 5.0,
            'Ammonia (mg L-1 )': 0.3,
            'Turbidity (cm)': 35.0,
        }
        self.window = []  # store recent samples for hourly avg
        self._stop_event = threading.Event()

        # ensure logfile header exists
        if not os.path.exists(self.logfile):
            with open(self.logfile, 'w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=['ts','pond_id','sensors','rf','svm','knn','note'])
                w.writeheader()

    def step_drift(self):
        """Apply small drift depending on mode and time of day."""
        # base drift magnitude
        drift = 0.02 if self.mode == 'normal' else (0.08 if self.mode == 'stress' else 0.18)
        # temp drift
        self.state['Temp'] += random.uniform(-drift, drift)
        self.state['pH'] += random.uniform(-drift*0.1, drift*0.1)
        self.state['DO(mg/L)'] += random.uniform(-drift*0.5, drift*0.5)
        self.state['Ammonia (mg L-1 )'] += random.uniform(-drift*0.05, drift*0.05)
        self.state['Turbidity (cm)'] += random.uniform(-drift*0.3, drift*0.3)

        # clamp to reasonable physical ranges
        self.state['Temp'] = min(max(self.state['Temp'], 26.0), 34.0)
        self.state['pH'] = min(max(self.state['pH'], 7.0), 8.8)
        self.state['DO(mg/L)'] = min(max(self.state['DO(mg/L)'], 2.0), 8.0)
        self.state['Ammonia (mg L-1 )'] = min(max(self.state['Ammonia (mg L-1 )'], 0.0), 2.5)
        self.state['Turbidity (cm)'] = min(max(self.state['Turbidity (cm)'], 5.0), 120.0)

    def occasional_events(self, sensors):
        """Inject occasional abnormal events: low DO, ammonia spike."""
        note = ''
        # with small chance, trigger sudden ammonia spike
        if random.random() < 0.005:
            sensors['Ammonia (mg L-1 )'] = round(min(2.5, sensors['Ammonia (mg L-1 )'] + random.uniform(0.5, 1.5)), 3)
            note += 'ammonia_spike;'

        # night-time DO drop (simulate between 19:00-06:00 local)
        now = datetime.datetime.now()
        if now.hour >= 19 or now.hour <= 6:
            if random.random() < 0.15:
                sensors['DO(mg/L)'] = round(max(0.8, sensors['DO(mg/L)'] - random.uniform(0.8, 2.0)), 3)
                note += 'night_do_drop;'

        return note

    def generate(self):
        # apply drift
        self.step_drift()

        # sample with small noise
        def s(name, val, sd):
            return round(float(val + random.uniform(-sd, sd)), 3)

        sensors = {
            'Timestamp': iso_ts(),
            'PondID': self.pond_id,
            'Temp': s('Temp', self.state['Temp'], 0.4),
            'Turbidity (cm)': s('Turbidity', self.state['Turbidity (cm)'], 2.0),
            'DO(mg/L)': s('DO', self.state['DO(mg/L)'], 0.3),
            'BOD (mg/L)': round(random.uniform(2.0,5.0),3),
            'CO2': round(random.uniform(4.0,8.0),3),
            'pH': s('pH', self.state['pH'], 0.05),
            'Alkalinity (mg L-1 )': round(random.uniform(100,140),3),
            'Hardness (mg L-1 )': round(random.uniform(100,160),3),
            'Calcium (mg L-1 )': round(random.uniform(70,110),3),
            'Ammonia (mg L-1 )': s('Ammonia', self.state['Ammonia (mg L-1 )'], 0.05),
            'Nitrite (mg L-1 )': round(random.uniform(0.05,0.2),3),
            'Phosphorus (mg L-1 )': round(random.uniform(0.1,0.4),3),
            'H2S (mg L-1 )': round(random.uniform(0.0005,0.005),4),
            'Plankton (No. L-1)': int(max(100, random.gauss(3500,800)))
        }

        note = self.occasional_events(sensors)

        # simulate sensor failure randomly: missing DO
        do_missing = False
        if random.random() < 0.03:  # ~3% chance per reading
            do_missing = True
            sensors.pop('DO(mg/L)', None)
            note += 'do_missing;'

        # mode-based stress: increase chance of abnormal events
        if self.mode == 'stress' and random.random() < 0.05:
            sensors['Ammonia (mg L-1 )'] = round(min(2.5, sensors.get('Ammonia (mg L-1 )', 0.2) + random.uniform(0.2, 0.6)),3)
            note += 'stress_ammonia;'
        if self.mode == 'danger' and random.random() < 0.08:
            sensors['DO(mg/L)'] = round(max(0.5, (sensors.get('DO(mg/L)', 2.0) - random.uniform(1.0,2.5))),3)
            note += 'danger_do;'

        return sensors, do_missing, note

    def post(self, sensors, do_missing, note):
        # Always call predict_all (server will use knn fallback when DO missing)
        try:
            url_all = f"{self.base_url}/dashboard/predict_all"
            r = requests.post(url_all, json={'input': sensors}, timeout=10)
            rf = r.json()
        except Exception as e:
            rf = {'error': str(e)}

        knn_out = None
        if do_missing:
            try:
                url_knn = f"{self.base_url}/dashboard/predict_knn"
                k = requests.post(url_knn, json={'input': sensors}, timeout=8)
                knn_out = k.json()
            except Exception as e:
                knn_out = {'error': str(e)}

        # also call svm for classification to get explicit label
        try:
            url_svm = f"{self.base_url}/dashboard/predict_svm"
            s = requests.post(url_svm, json={'input': sensors}, timeout=8)
            svm_out = s.json()
        except Exception as e:
            svm_out = {'error': str(e)}

        # persist to CSV log
        with open(self.logfile, 'a', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=['ts','pond_id','sensors','rf','svm','knn','note'])
            w.writerow({
                'ts': iso_ts(),
                'pond_id': self.pond_id,
                'sensors': json.dumps(sensors, ensure_ascii=False),
                'rf': json.dumps(rf, ensure_ascii=False),
                'svm': json.dumps(svm_out, ensure_ascii=False),
                'knn': json.dumps(knn_out, ensure_ascii=False) if knn_out is not None else '',
                'note': note
            })

        # add to in-memory window
        self.window.append({'ts': time.time(), 'sensors': sensors, 'rf': rf, 'svm': svm_out, 'knn': knn_out, 'note': note})
        # keep window modest
        if len(self.window) > 10000:
            self.window = self.window[-5000:]

        return rf, svm_out, knn_out

    def run(self):
        print(f"Simulator started -> posting to {self.base_url} every {self.interval_min}-{self.interval_max}s (mode={self.mode})")
        next_hourly = time.time() + (self.hourly_agg_seconds if self.hourly_agg_seconds>0 else 3600)
        try:
            while not self._stop_event.is_set():
                sensors, do_missing, note = self.generate()
                rf, svm, knn = self.post(sensors, do_missing, note)
                # quick console summary
                label = (svm.get('label') if isinstance(svm, dict) else None) or (svm.get('class') if isinstance(svm, dict) else None)
                print(f"[{iso_ts()}] Pond={self.pond_id} label={label} DO={sensors.get('DO(mg/L)','<missing>')} note={note}")

                # hourly aggregation trigger (if requested via hourly_agg_seconds)
                if self.hourly_agg_seconds > 0 and time.time() >= next_hourly:
                    self.send_hourly_agg()
                    next_hourly = time.time() + self.hourly_agg_seconds

                # sleep
                sleep_t = random.uniform(self.interval_min, self.interval_max)
                # allow early wake when stopping
                waited = 0.0
                step = 0.2
                while waited < sleep_t and not self._stop_event.is_set():
                    time.sleep(min(step, sleep_t - waited))
                    waited += step
        except KeyboardInterrupt:
            print('\nSimulator stopped by user')
        finally:
            self._stop_event.set()

    def stop(self):
        """Signal the simulator to stop gracefully."""
        self._stop_event.set()

    def send_hourly_agg(self):
        # aggregate current window and post average
        if not self.window:
            print('No samples to aggregate')
            return
        # compute average for numeric keys
        sums = {}
        counts = {}
        for row in self.window:
            for k, v in row['sensors'].items():
                try:
                    n = float(v)
                except Exception:
                    continue
                sums[k] = sums.get(k, 0.0) + n
                counts[k] = counts.get(k, 0) + 1
        avg = {}
        for k in sums:
            avg[k] = round(sums[k] / counts[k], 3)
        avg['Timestamp'] = iso_ts()
        avg['PondID'] = self.pond_id
        avg['Aggregated'] = 1
        # call post with do_missing=False and a note string
        rf, svm, knn = self.post(avg, False, 'hourly_agg')
        print(f"Posted hourly aggregation: {len(self.window)} samples -> RF:{rf}")
        # clear window
        self.window = []


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--host', default='127.0.0.1')
    p.add_argument('--port', default=8000, type=int)
    p.add_argument('--pond', default='POND_01')
    p.add_argument('--min', default=5, type=float, dest='imin')
    p.add_argument('--max', default=10, type=float, dest='imax')
    p.add_argument('--mode', default='normal', choices=['normal','stress','danger'])
    p.add_argument('--log', default=DEFAULT_LOG)
    p.add_argument('--hourly-agg-seconds', default=0, type=int, help='If >0 send hourly-like aggregation every N seconds (useful for demo/testing)')
    args = p.parse_args()

    base_url = f"http://{args.host}:{args.port}"
    sim = Simulator(base_url=base_url, pond_id=args.pond, interval_min=args.imin, interval_max=args.imax, mode=args.mode, logfile=args.log, hourly_agg_seconds=args.hourly_agg_seconds)
    sim.run()


if __name__ == '__main__':
    main()
