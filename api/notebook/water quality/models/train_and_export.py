import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report

try:
    from xgboost import XGBClassifier
except Exception:
    XGBClassifier = None


def load_data(path):
    df = pd.read_csv(path)
    # Cleanup column name typo `pH`
    if 'pH`' in df.columns:
        df = df.rename(columns={'pH`': 'pH'})
    return df


def prepare_data(df, target_col='Water Quality'):
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)


def make_pipelines():
    scaler = StandardScaler()
    pipelines = {
        'random_forest': Pipeline([('scaler', scaler), ('rf', RandomForestClassifier(n_estimators=200, random_state=42))]),
        'mlp': Pipeline([('scaler', scaler), ('mlp', MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=400, random_state=42))])
    }
    if XGBClassifier is not None:
        pipelines['xgboost'] = Pipeline([('scaler', scaler), ('xgb', XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42))])
    return pipelines


def evaluate_and_save(pipelines, X_train, X_test, y_train, y_test, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    metrics = []
    best_score = -1
    best_name = None
    best_model = None

    for name, pipe in pipelines.items():
        print(f"Training {name}...")
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='macro')
        print(f"{name} -- Accuracy: {acc:.4f}, F1-macro: {f1:.4f}")
        print(classification_report(y_test, y_pred))

        model_path = os.path.join(out_dir, f"{name}.joblib")
        # Save model together with the training feature names so callers know the input ordering
        joblib.dump({'model': pipe, 'feature_names': list(X_train.columns)}, model_path)

        metrics.append({'model': name, 'accuracy': acc, 'f1_macro': f1, 'path': model_path})

        if f1 > best_score:
            best_score = f1
            best_name = name
            best_model = pipe

    # Save metrics and best model
    metrics_df = pd.DataFrame(metrics)
    metrics_df.to_csv(os.path.join(out_dir, 'model_metrics.csv'), index=False)
    if best_model is not None:
        best_path = os.path.join(out_dir, 'best_model.joblib')
        joblib.dump({'model': best_model, 'feature_names': list(X_train.columns)}, best_path)
        print(f"Best model: {best_name} saved to {best_path} (F1-macro={best_score:.4f})")


def main():
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'notebook', 'water quality', 'WQD_synthetic_35000.csv')
    csv_path = os.path.normpath(csv_path)
    print(f"Loading data from {csv_path}")
    df = load_data(csv_path)
    X_train, X_test, y_train, y_test = prepare_data(df)
    pipelines = make_pipelines()
    out_dir = os.path.join(os.path.dirname(__file__), 'exported_models')
    evaluate_and_save(pipelines, X_train, X_test, y_train, y_test, out_dir)


if __name__ == '__main__':
    main()
