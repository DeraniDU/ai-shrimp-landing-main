import os
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.svm import SVR


# -----------------------------
# 0) Paths & basic config
# -----------------------------
ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "Data set" / "WQD_synthetic_35000.csv"
OUTPUT_DIR = ROOT / "exported_models"
OUTPUT_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42


# -----------------------------
# 1) Data loading & preprocessing
# -----------------------------

def load_and_clean_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")

    df = pd.read_csv(path)

    # Fix known column typo
    if "pH`" in df.columns:
        df = df.rename(columns={"pH`": "pH"})

    # Strip whitespace in column names
    df.columns = [c.strip() for c in df.columns]

    # Basic missing value handling: numeric columns -> median
    num_cols = df.select_dtypes(include=["float64", "float32", "int64", "int32"]).columns
    for col in num_cols:
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

    return df


def iqr_filter(df: pd.DataFrame, cols: List[str], k: float = 1.5) -> pd.DataFrame:
    """Remove rows with IQR-based outliers for given columns."""
    mask = pd.Series(True, index=df.index)
    for col in cols:
        if col not in df.columns:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - k * iqr
        upper = q3 + k * iqr
        mask &= df[col].between(lower, upper)
    return df[mask].reset_index(drop=True)


# -----------------------------
# 2) WQI computation & categories
# -----------------------------

# NOTE: In the referenced paper you will likely have a specific
# water quality index formulation and weights. Here we implement
# a standard weighted-arithmetic style WQI using DO, pH, Temp.
# You can adjust the weights/thresholds to exactly match the paper.


def compute_wqi(row: pd.Series) -> float:
    """Compute a simple WQI-style score in [0, 100] from DO, pH, Temp.

    This is a generic formulation and should be calibrated to
    match your reference paper if you have exact equations.
    """

    # Ideal / permissible ranges (can be tuned)
    # These are typical for shrimp ponds and general aquaculture.
    ph_opt_low, ph_opt_high = 7.5, 8.5
    temp_opt_low, temp_opt_high = 25.0, 32.0  # °C
    do_opt = 5.0  # mg/L minimum desirable

    ph = float(row.get("pH", np.nan))
    temp = float(row.get("Temp", np.nan))
    do = float(row.get("DO(mg/L)", np.nan))

    # Normalize each parameter to 0–100 (100 = ideal)
    def score_ph(p: float) -> float:
        if np.isnan(p):
            return 50.0
        if ph_opt_low <= p <= ph_opt_high:
            return 100.0
        # Penalty when outside optimal range (linear)
        if p < ph_opt_low:
            return max(0.0, 100.0 - (ph_opt_low - p) * 50.0)
        return max(0.0, 100.0 - (p - ph_opt_high) * 50.0)

    def score_temp(t: float) -> float:
        if np.isnan(t):
            return 50.0
        if temp_opt_low <= t <= temp_opt_high:
            return 100.0
        if t < temp_opt_low:
            return max(0.0, 100.0 - (temp_opt_low - t) * 10.0)
        return max(0.0, 100.0 - (t - temp_opt_high) * 10.0)

    def score_do(d: float) -> float:
        if np.isnan(d):
            return 50.0
        if d >= do_opt:
            return 100.0
        # Linear drop down to 0 at DO = 0
        return max(0.0, d / do_opt * 100.0)

    s_ph = score_ph(ph)
    s_temp = score_temp(temp)
    s_do = score_do(do)

    # Weights; adjust per paper if needed
    w_ph = 0.3
    w_temp = 0.2
    w_do = 0.5

    wqi = (w_ph * s_ph + w_temp * s_temp + w_do * s_do) / (w_ph + w_temp + w_do)
    return float(wqi)


def categorize_wqi(wqi: float) -> str:
    """Map continuous WQI to class label.

    We use 4 categories as requested:
    - Good (>= 75)
    - Medium (50–75)
    - Bad (25–50)
    - Very Bad (< 25)
    """
    if wqi >= 75.0:
        return "Good"
    if wqi >= 50.0:
        return "Medium"
    if wqi >= 25.0:
        return "Bad"
    return "Very Bad"


# -----------------------------
# 3) Group 1 – Water quality classification
# -----------------------------


def train_classification_models(df: pd.DataFrame) -> Dict[str, Dict]:
    """Train RandomForest and MLP classifiers on WQI-derived classes.

    Returns a dict with fitted models and metrics.
    """

    feature_cols = [
        "Temp",
        "Turbidity (cm)",
        "DO(mg/L)",
        "BOD (mg/L)",
        "CO2",
        "pH",
        "Alkalinity (mg L-1 )",
        "Hardness (mg L-1 )",
        "Calcium (mg L-1 )",
        "Ammonia (mg L-1 )",
        "Nitrite (mg L-1 )",
        "Phosphorus (mg L-1 )",
        "H2S (mg L-1 )",
        "Plankton (No. L-1)",
    ]
    feature_cols = [c for c in feature_cols if c in df.columns]

    df = df.copy()
    df["WQI"] = df.apply(compute_wqi, axis=1)
    df["WQI_Class"] = df["WQI"].apply(categorize_wqi)

    X = df[feature_cols].values
    y = df["WQI_Class"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=True, random_state=RANDOM_STATE, stratify=y
    )

    models: Dict[str, Dict] = {}

    # Random Forest (no scaling needed)
    rf = RandomForestClassifier(
        n_estimators=400,
        max_depth=20,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)

    models["random_forest"] = {
        "model": rf,
        "metrics": {
            "accuracy": float(accuracy_score(y_test, rf_pred)),
            "f1_macro": float(f1_score(y_test, rf_pred, average="macro")),
            "report": classification_report(y_test, rf_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_test, rf_pred).tolist(),
        },
        "features": feature_cols,
    }

    # MLP Classifier with StandardScaler
    mlp_pipe = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "mlp",
                MLPClassifier(
                    hidden_layer_sizes=(64, 32),
                    max_iter=400,
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )
    mlp_pipe.fit(X_train, y_train)
    mlp_pred = mlp_pipe.predict(X_test)

    models["mlp"] = {
        "model": mlp_pipe,
        "metrics": {
            "accuracy": float(accuracy_score(y_test, mlp_pred)),
            "f1_macro": float(f1_score(y_test, mlp_pred, average="macro")),
            "report": classification_report(y_test, mlp_pred, output_dict=True),
            "confusion_matrix": confusion_matrix(y_test, mlp_pred).tolist(),
        },
        "features": feature_cols,
    }

    return models


# -----------------------------
# 4) Group 2 – Time-series regression (6/12/24-step ahead)
# -----------------------------


def make_supervised_timeseries(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_cols: List[str],
    horizon: int,
    n_lags: int = 6,
) -> Tuple[np.ndarray, np.ndarray]:
    """Create supervised (X, y) for multi-step forecasting.

    - horizon: prediction horizon in steps (we treat one row as one time step)
    - n_lags: number of past steps as features
    """
    df = df.reset_index(drop=True)
    values = df[feature_cols + target_cols].values

    X_list: List[np.ndarray] = []
    y_list: List[np.ndarray] = []

    max_index = len(df) - horizon
    for t in range(n_lags, max_index):
        x_window = values[t - n_lags : t, : len(feature_cols)]  # past features
        x_flat = x_window.flatten()
        y_future = values[t + horizon, len(feature_cols) :]  # future targets at horizon
        X_list.append(x_flat)
        y_list.append(y_future)

    X = np.asarray(X_list)
    y = np.asarray(y_list)
    return X, y


def train_timeseries_models(
    df: pd.DataFrame,
    horizons: List[int],
    n_lags: int = 6,
) -> Dict[int, Dict[str, Dict]]:
    """Train ANN, SVR (RBF), and MLR for each horizon.

    Returns nested dict: models[horizon][model_name] -> {model, metrics, features}.
    """

    # We only have Temp, pH, DO in this dataset; salinity is not present.
    # The code is written so that if a future dataset includes a
    # 'Salinity' column, adding it to target_cols will work.

    feature_cols = [
        "Temp",
        "Turbidity (cm)",
        "DO(mg/L)",
        "BOD (mg/L)",
        "CO2",
        "pH",
        "Alkalinity (mg L-1 )",
        "Hardness (mg L-1 )",
        "Calcium (mg L-1 )",
        "Ammonia (mg L-1 )",
        "Nitrite (mg L-1 )",
        "Phosphorus (mg L-1 )",
        "H2S (mg L-1 )",
        "Plankton (No. L-1)",
    ]
    feature_cols = [c for c in feature_cols if c in df.columns]

    target_cols_base = ["DO(mg/L)", "pH", "Temp"]
    target_cols = [c for c in target_cols_base if c in df.columns]

    results: Dict[int, Dict[str, Dict]] = {}

    for horizon in horizons:
        X, y = make_supervised_timeseries(df, feature_cols, target_cols, horizon, n_lags=n_lags)
        if len(X) == 0:
            continue

        # Time-based split (no shuffling)
        n_samples = X.shape[0]
        split = int(n_samples * 0.8)
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        horizon_results: Dict[str, Dict] = {}

        # ANN (MLPRegressor)
        ann = MLPRegressor(
            hidden_layer_sizes=(128, 64),
            activation="relu",
            random_state=RANDOM_STATE,
            max_iter=500,
        )
        ann.fit(X_train_scaled, y_train)
        ann_pred = ann.predict(X_test_scaled)

        horizon_results["ann"] = {
            "model": {"scaler": scaler, "regressor": ann},
            "metrics": _regression_metrics(y_test, ann_pred, target_cols),
            "features": feature_cols,
            "target_cols": target_cols,
            "n_lags": n_lags,
        }

        # SVM with RBF kernel (SVR), multi-output by looping per target
        svr_models = []
        svr_preds = []
        for j in range(y_train.shape[1]):
            svr = SVR(kernel="rbf")
            svr.fit(X_train_scaled, y_train[:, j])
            svr_models.append(svr)
            svr_preds.append(svr.predict(X_test_scaled))
        svr_pred = np.stack(svr_preds, axis=1)

        horizon_results["svr_rbf"] = {
            "model": {"scaler": scaler, "regressors": svr_models},
            "metrics": _regression_metrics(y_test, svr_pred, target_cols),
            "features": feature_cols,
            "target_cols": target_cols,
            "n_lags": n_lags,
        }

        # Multiple Linear Regression (multi-output)
        mlr = LinearRegression()
        mlr.fit(X_train_scaled, y_train)
        mlr_pred = mlr.predict(X_test_scaled)

        horizon_results["mlr"] = {
            "model": {"scaler": scaler, "regressor": mlr},
            "metrics": _regression_metrics(y_test, mlr_pred, target_cols),
            "features": feature_cols,
            "target_cols": target_cols,
            "n_lags": n_lags,
        }

        results[horizon] = horizon_results

    return results


def _regression_metrics(y_true: np.ndarray, y_pred: np.ndarray, target_cols: List[str]) -> Dict:
    metrics: Dict[str, Dict[str, float]] = {}
    for j, col in enumerate(target_cols):
        mae = mean_absolute_error(y_true[:, j], y_pred[:, j])
        rmse = mean_squared_error(y_true[:, j], y_pred[:, j], squared=False)
        r2 = r2_score(y_true[:, j], y_pred[:, j])
        metrics[col] = {"mae": float(mae), "rmse": float(rmse), "r2": float(r2)}
    # Aggregate as well
    metrics["_macro"] = {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(mean_squared_error(y_true, y_pred, squared=False)),
        "r2": float(r2_score(y_true, y_pred)),
    }
    return metrics


# -----------------------------
# 5) Group 3 – WQI prediction using predicted sensor values
# -----------------------------


class WQIPredictor:
    """Simple deployment-ready WQI computation helper.

    Usage:
      - Initialize once and persist via joblib.
      - Call .predict_wqi_from_sensors() with arrays or DataFrames
        of future sensor predictions.
    """

    def __init__(self):
        # Put configuration here if you want to tune later
        self.version = "1.0"

    def predict_wqi_from_sensors(self, df_sensors: pd.DataFrame) -> pd.Series:
        required = ["DO(mg/L)", "pH", "Temp"]
        missing = [c for c in required if c not in df_sensors.columns]
        if missing:
            raise ValueError(f"Missing required sensor columns for WQI: {missing}")
        return df_sensors.apply(compute_wqi, axis=1)

    def categorize(self, wqi_values: pd.Series) -> pd.Series:
        return wqi_values.apply(categorize_wqi)


# -----------------------------
# 6) Model selection & export
# -----------------------------


def select_best_classification_model(models: Dict[str, Dict]) -> Tuple[str, Dict]:
    best_name = None
    best = None
    best_f1 = -1.0
    for name, info in models.items():
        f1_macro = info["metrics"]["f1_macro"]
        if f1_macro > best_f1:
            best_f1 = f1_macro
            best_name = name
            best = info
    assert best_name is not None and best is not None
    return best_name, best


def select_best_ts_model(ts_models: Dict[int, Dict[str, Dict]]) -> Dict[int, Tuple[str, Dict]]:
    """Select, for each horizon, the model with highest macro R²."""
    best: Dict[int, Tuple[str, Dict]] = {}
    for horizon, models in ts_models.items():
        best_name = None
        best_info = None
        best_r2 = -1.0
        for name, info in models.items():
            r2_macro = info["metrics"]["_macro"]["r2"]
            if r2_macro > best_r2:
                best_r2 = r2_macro
                best_name = name
                best_info = info
        if best_name is not None and best_info is not None:
            best[horizon] = (best_name, best_info)
    return best


def export_models(
    cls_models: Dict[str, Dict],
    best_cls_name: str,
    ts_models: Dict[int, Dict[str, Dict]],
    best_ts: Dict[int, Tuple[str, Dict]],
) -> None:
    # Classification models
    for name, info in cls_models.items():
        path = OUTPUT_DIR / f"water_quality_cls_{name}.joblib"
        joblib.dump({"model": info["model"], "features": info["features"]}, path)

    best_cls = cls_models[best_cls_name]
    joblib.dump(
        {
            "model": best_cls["model"],
            "features": best_cls["features"],
            "type": best_cls_name,
            "task": "water_quality_status_classification",
        },
        OUTPUT_DIR / "water_quality_cls_best.joblib",
    )

    # Time-series models: save all and best per horizon
    for horizon, models in ts_models.items():
        for name, info in models.items():
            base = f"ts_{name}_h{horizon}"
            payload = {
                "model": info["model"],
                "features": info["features"],
                "target_cols": info["target_cols"],
                "n_lags": info["n_lags"],
                "horizon_steps": horizon,
            }
            joblib.dump(payload, OUTPUT_DIR / f"{base}.joblib")

    for horizon, (name, info) in best_ts.items():
        payload = {
            "model": info["model"],
            "features": info["features"],
            "target_cols": info["target_cols"],
            "n_lags": info["n_lags"],
            "horizon_steps": horizon,
            "type": name,
            "task": "timeseries_forecast",
        }
        joblib.dump(payload, OUTPUT_DIR / f"ts_best_h{horizon}.joblib")

    # WQI helper
    wqi_helper = WQIPredictor()
    joblib.dump(wqi_helper, OUTPUT_DIR / "wqi_predictor.joblib")


# -----------------------------
# 7) Main entry point
# -----------------------------


def main() -> None:
    print(f"Loading dataset from {DATA_PATH} ...")
    df = load_and_clean_dataset(DATA_PATH)

    # Focus columns for IQR-based outlier removal
    key_sensor_cols = [
        c
        for c in ["Temp", "DO(mg/L)", "pH", "Ammonia (mg L-1 )", "Nitrite (mg L-1 )"]
        if c in df.columns
    ]
    df_filtered = iqr_filter(df, key_sensor_cols, k=1.5)
    print(f"Original samples: {len(df):,} | After IQR filter: {len(df_filtered):,}")

    # Group 1: classification
    print("\n=== Training water quality classification models (RandomForest, MLP) ===")
    cls_models = train_classification_models(df_filtered)
    best_cls_name, best_cls = select_best_classification_model(cls_models)
    print(f"Best classification model: {best_cls_name} | F1-macro = {best_cls['metrics']['f1_macro']:.4f}")

    # Group 2: time-series regression for 6/12/24-step ahead
    print("\n=== Training time-series regression models (ANN, SVR-RBF, MLR) ===")
    horizons = [6, 12, 24]
    ts_models = train_timeseries_models(df_filtered, horizons=horizons, n_lags=6)
    best_ts = select_best_ts_model(ts_models)
    for h, (name, info) in best_ts.items():
        r2_macro = info["metrics"]["_macro"]["r2"]
        print(f"Best TS model for horizon {h}: {name} | R2_macro = {r2_macro:.4f}")

    # Export all models and helpers
    print("\n=== Exporting models to .joblib ===")
    export_models(cls_models, best_cls_name, ts_models, best_ts)
    print(f"Models exported to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
