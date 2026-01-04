

#!/usr/bin/env python3
"""
Evaluate saved XGBoost decision models on a fresh synthetic (rule-generated) test set.

This script:
- Generates synthetic pond samples via models.training.data_generator.TrainingDataGenerator
- Extracts features using FeatureExtractor
- Splits into train/test (holdout) for evaluation
- Loads models from models/xgboost_models/*
- Computes metrics:
  - Classification: accuracy, precision, recall, F1, confusion matrix
  - Regression: RMSE, MAE, R²
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict, Tuple
import json

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, 
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)

from models.training.data_generator import TrainingDataGenerator
from models.xgboost_decision_agent import XGBoostDecisionAgent


def _split_data(X: np.ndarray, y_action: np.ndarray, y_urgency: np.ndarray, 
                test_size: float, seed: int) -> Tuple:
    """Split data into train/test sets"""
    if not (0.0 < test_size < 1.0):
        raise ValueError("--test-size must be between 0 and 1 (exclusive)")
    
    # Ensure X is 2D (should be from generate_dataset, but safety check)
    if X.ndim != 2:
        raise ValueError(f"Expected 2D feature array, got {X.ndim}D with shape {X.shape}")
    
    rng = np.random.default_rng(seed)
    n_samples = len(X)
    indices = np.arange(n_samples)
    rng.shuffle(indices)
    
    n_test = max(1, int(round(n_samples * test_size)))
    test_idx = indices[:n_test]
    train_idx = indices[n_test:]
    
    # Split data (numpy indexing maintains 2D shape)
    X_train = X[train_idx]
    X_test = X[test_idx]
    
    # Ensure 2D shape is maintained (important for single sample case)
    if X_test.ndim == 1:
        X_test = X_test.reshape(1, -1)
    if X_train.ndim == 1:
        X_train = X_train.reshape(1, -1)
    
    return (
        X_train, X_test,
        y_action[train_idx], y_action[test_idx],
        y_urgency[train_idx], y_urgency[test_idx]
    )


def _rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Root Mean Squared Error"""
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def _mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Error"""
    return float(mean_absolute_error(y_true, y_pred))


def generate_synthetic_dataset(samples: int, seed: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Generate synthetic dataset with features and labels using the same method as training"""
    import random
    random.seed(seed)
    
    generator = TrainingDataGenerator()
    
    # Use the same generate_dataset method as training script
    X, y = generator.generate_dataset(num_samples=samples, scenarios=["normal", "good", "poor", "critical"])
    
    # Ensure X is 2D and correct dtype
    X = np.asarray(X, dtype=np.float32)
    if X.ndim != 2:
        raise ValueError(f"Expected 2D feature array from generate_dataset, got shape {X.shape}")
    
    # Extract labels
    y_action = np.asarray(y["action_type"], dtype=np.int64)
    y_urgency = np.asarray(y["urgency"], dtype=np.float32)
    
    return X, y_action, y_urgency


def evaluate_action_classifier(agent: XGBoostDecisionAgent, X_test: np.ndarray, 
                               y_true: np.ndarray) -> Dict:
    """Evaluate action classification model"""
    if agent.action_model is None:
        raise ValueError("Action model not loaded")
    
    # Ensure X_test is 2D
    if X_test.ndim == 1:
        X_test = X_test.reshape(1, -1)
    elif X_test.ndim != 2:
        raise ValueError(f"Expected 1D or 2D array, got {X_test.ndim}D with shape {X_test.shape}")
    
    # Verify feature count matches model
    if X_test.shape[1] != 35:
        raise ValueError(
            f"Feature count mismatch: model expects 35 features, "
            f"got {X_test.shape[1]} (shape: {X_test.shape})"
        )
    
    # Get predictions
    y_pred = agent.action_model.predict(X_test)
    
    # Map encoded predictions back to original if needed
    if agent._enc_to_orig:
        y_pred = np.array([agent._enc_to_orig.get(int(p), int(p)) for p in y_pred])
    
    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, average=None, zero_division=0
    )
    precision_macro = precision_recall_fscore_support(
        y_true, y_pred, average='macro', zero_division=0
    )[0]
    recall_macro = precision_recall_fscore_support(
        y_true, y_pred, average='macro', zero_division=0
    )[1]
    f1_macro = precision_recall_fscore_support(
        y_true, y_pred, average='macro', zero_division=0
    )[2]
    
    cm = confusion_matrix(y_true, y_pred)
    
    # Top-2 accuracy (if prediction is in top 2 probabilities)
    try:
        proba = agent.action_model.predict_proba(X_test)
        top2_correct = 0
        for i, true_label in enumerate(y_true):
            top2_preds = np.argsort(proba[i])[-2:]
            if true_label in top2_preds:
                top2_correct += 1
        top2_accuracy = top2_correct / len(y_true)
    except:
        top2_accuracy = None
    
    return {
        'accuracy': accuracy,
        'precision_macro': precision_macro,
        'recall_macro': recall_macro,
        'f1_macro': f1_macro,
        'precision_per_class': precision.tolist(),
        'recall_per_class': recall.tolist(),
        'f1_per_class': f1.tolist(),
        'confusion_matrix': cm.tolist(),
        'top2_accuracy': top2_accuracy,
        'classification_report': classification_report(y_true, y_pred, output_dict=True)
    }


def evaluate_urgency_regressor(agent: XGBoostDecisionAgent, X_test: np.ndarray,
                               y_true: np.ndarray) -> Dict:
    """Evaluate urgency regression model"""
    if agent.urgency_model is None:
        raise ValueError("Urgency model not loaded")
    
    # Ensure X_test is 2D
    if X_test.ndim == 1:
        X_test = X_test.reshape(1, -1)
    elif X_test.ndim != 2:
        raise ValueError(f"Expected 1D or 2D array, got {X_test.ndim}D with shape {X_test.shape}")
    
    # Verify feature count matches model
    if X_test.shape[1] != 35:
        raise ValueError(
            f"Feature count mismatch: model expects 35 features, "
            f"got {X_test.shape[1]} (shape: {X_test.shape})"
        )
    
    y_pred = agent.urgency_model.predict(X_test)
    y_pred = np.clip(y_pred, 0.0, 1.0)  # Ensure in [0, 1] range
    
    rmse = _rmse(y_true, y_pred)
    mae = _mae(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    # Mean Absolute Percentage Error
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100
    
    return {
        'rmse': rmse,
        'mae': mae,
        'r2_score': r2,
        'mape': mape
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Evaluate saved XGBoost models on synthetic holdout data"
    )
    parser.add_argument(
        "--samples", type=int, default=5000,
        help="Number of synthetic samples to generate (default: 5000)"
    )
    parser.add_argument(
        "--test-size", type=float, default=0.2,
        help="Holdout fraction for test (default: 0.2)"
    )
    parser.add_argument(
        "--seed", type=int, default=42,
        help="Random seed (default: 42)"
    )
    parser.add_argument(
        "--model-dir", type=str, default="models/xgboost_models",
        help="Directory containing trained models (default: models/xgboost_models)"
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help="Optional: Save detailed metrics to JSON file"
    )
    args = parser.parse_args()
    
    model_dir = Path(args.model_dir)
    if not (model_dir / "action_model.pkl").exists():
        raise SystemExit(
            f"Missing {model_dir / 'action_model.pkl'}. "
            f"Train models first: python train_xgboost_models.py"
        )
    
    print("=" * 70)
    print("XGBoost Model Evaluation (Holdout)")
    print("=" * 70)
    print(f"samples={args.samples}  test_size={args.test_size}  seed={args.seed}")
    
    # Generate dataset
    print("\n1. Generating synthetic dataset...")
    X, y_action, y_urgency = generate_synthetic_dataset(samples=args.samples, seed=args.seed)
    print(f"   Dataset shape: X={X.shape}, y_action={y_action.shape}, y_urgency={y_urgency.shape}")
    
    # Split data
    print("\n2. Splitting into train/test...")
    X_train, X_test, ya_train, ya_test, yu_train, yu_test = _split_data(
        X, y_action, y_urgency, test_size=args.test_size, seed=args.seed
    )
    print(f"   Train: {X_train.shape[0]} samples, Test: {X_test.shape[0]} samples")
    print(f"   Feature dimensions: Train={X_train.shape[1]}, Test={X_test.shape[1]}")
    
    # Load agent
    print("\n3. Loading XGBoost models...")
    agent = XGBoostDecisionAgent(model_dir=str(model_dir), enable_llm_explanations=False)
    if not agent.is_trained:
        raise SystemExit("Failed to load models")
    print("   [OK] Models loaded successfully")
    
    # Evaluate action classifier
    print("\n4. Evaluating Action Classifier...")
    action_metrics = evaluate_action_classifier(agent, X_test, ya_test)
    print(f"   Accuracy: {action_metrics['accuracy']:.4f}")
    print(f"   Precision (macro): {action_metrics['precision_macro']:.4f}")
    print(f"   Recall (macro): {action_metrics['recall_macro']:.4f}")
    print(f"   F1-score (macro): {action_metrics['f1_macro']:.4f}")
    if action_metrics['top2_accuracy']:
        print(f"   Top-2 Accuracy: {action_metrics['top2_accuracy']:.4f}")
    print("\n   Per-class metrics:")
    for i, (p, r, f) in enumerate(zip(
        action_metrics['precision_per_class'],
        action_metrics['recall_per_class'],
        action_metrics['f1_per_class']
    )):
        print(f"     Class {i}: Precision={p:.4f}, Recall={r:.4f}, F1={f:.4f}")
    
    # Evaluate urgency regressor
    print("\n5. Evaluating Urgency Regressor...")
    urgency_metrics = evaluate_urgency_regressor(agent, X_test, yu_test)
    print(f"   RMSE: {urgency_metrics['rmse']:.4f}")
    print(f"   MAE: {urgency_metrics['mae']:.4f}")
    print(f"   R² Score: {urgency_metrics['r2_score']:.4f}")
    print(f"   MAPE: {urgency_metrics['mape']:.2f}%")
    
    # Save results if requested
    if args.output:
        results = {
            'action_classifier': action_metrics,
            'urgency_regressor': urgency_metrics,
            'test_samples': len(X_test),
            'seed': args.seed
        }
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n6. Detailed metrics saved to {output_path}")
    
    print("\n" + "=" * 70)
    print("Evaluation Summary:")
    print(f"  Action Classification Accuracy: {action_metrics['accuracy']:.2%}")
    print(f"  Urgency Prediction MAE: {urgency_metrics['mae']:.4f}")
    print("=" * 70)
    print("\nTip: These are synthetic-rule labels; use real labeled farm data for real accuracy.")
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())