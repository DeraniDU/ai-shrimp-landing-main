import os
import pandas as pd
import joblib
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score


def load_data(path):
    df = pd.read_csv(path)
    if 'pH`' in df.columns:
        df = df.rename(columns={'pH`': 'pH'})
    return df


def train_and_export(csv_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    print(f"Loading CSV from: {csv_path}")
    try:
        df = load_data(csv_path)
    except Exception as e:
        print(f"Failed to load CSV: {e}")
        raise

    # Features used for models (drop targets)
    # Ensure consistent names exist
    target_regressors = ['DO(mg/L)', 'pH', 'Ammonia (mg L-1 )']
    clf_target = 'Water Quality'

    # Drop any rows with NaNs in the used columns
    needed_cols = [clf_target] + target_regressors
    for c in needed_cols:
        if c not in df.columns:
            raise ValueError(f"Required column '{c}' not found in CSV")

    df = df.dropna(subset=needed_cols)

    # Prepare features X (drop the regressor targets and classification target)
    X = df.drop(columns=needed_cols)
    y_reg = df[target_regressors]
    y_clf = df[clf_target]

    X_train, X_test, y_reg_train, y_reg_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    _, _, y_clf_train, y_clf_test = train_test_split(X, y_clf, test_size=0.2, random_state=42)

    # 1) Random Forest multi-output regressor for DO, pH, Ammonia
    print("Training RandomForest multi-output regressor...")
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    multi_rf = MultiOutputRegressor(rf)
    try:
        multi_rf.fit(X_train, y_reg_train)
    except Exception as e:
        print(f"RandomForest training failed: {e}")
        raise
    preds_rf = multi_rf.predict(X_test)
    mae = mean_absolute_error(y_reg_test, preds_rf)
    rmse = np.sqrt(mean_squared_error(y_reg_test, preds_rf))
    r2 = r2_score(y_reg_test, preds_rf)

    rf_metrics = {'model': 'random_forest_multioutput', 'mae': mae, 'rmse': rmse, 'r2': r2}
    joblib.dump({'model': multi_rf, 'feature_names': list(X_train.columns)}, os.path.join(out_dir, 'random_forest_multioutput.joblib'))

    # 2) SVM classifier for Water Quality
    print("Training SVM classifier...")
    clf_pipe = Pipeline([('scaler', StandardScaler()), ('svc', SVC(probability=True, random_state=42))])
    try:
        clf_pipe.fit(X_train, y_clf_train)
    except Exception as e:
        print(f"SVM training failed: {e}")
        raise
    preds_clf = clf_pipe.predict(X_test)
    acc = accuracy_score(y_clf_test, preds_clf)
    f1 = f1_score(y_clf_test, preds_clf, average='macro')
    clf_metrics = {'model': 'svm_classifier', 'accuracy': acc, 'f1_macro': f1}
    joblib.dump({'model': clf_pipe, 'feature_names': list(X_train.columns)}, os.path.join(out_dir, 'svm_classifier.joblib'))

    # 3) KNN regressor for DO (simple nearest-neighbor prediction)
    print("Training KNN regressor for DO...")
    knn = KNeighborsRegressor(n_neighbors=5)
    try:
        knn.fit(X_train, y_reg_train['DO(mg/L)'])
    except Exception as e:
        print(f"KNN training failed: {e}")
        raise
    preds_knn = knn.predict(X_test)
    knn_mae = mean_absolute_error(y_reg_test['DO(mg/L)'], preds_knn)
    knn_rmse = np.sqrt(mean_squared_error(y_reg_test['DO(mg/L)'], preds_knn))
    knn_r2 = r2_score(y_reg_test['DO(mg/L)'], preds_knn)
    knn_metrics = {'model': 'knn_dO_regressor', 'mae': knn_mae, 'rmse': knn_rmse, 'r2': knn_r2}
    joblib.dump({'model': knn, 'feature_names': list(X_train.columns)}, os.path.join(out_dir, 'knn_do.joblib'))

    # Write metrics summary
    metrics = [rf_metrics, clf_metrics, knn_metrics]
    pd.DataFrame(metrics).to_csv(os.path.join(out_dir, 'dashboard_model_metrics.csv'), index=False)

    print("Training complete. Models saved to:")
    for m in ['random_forest_multioutput.joblib', 'svm_classifier.joblib', 'knn_do.joblib']:
        print(" -", os.path.join(out_dir, m))


if __name__ == '__main__':
    csv_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'notebook', 'water quality', 'WQD_synthetic_35000.csv'))
    out_dir = os.path.join(os.path.dirname(__file__), 'exported_models', 'dashboard_models')
    train_and_export(csv_path, out_dir)
