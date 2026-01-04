#!/usr/bin/env python3
"""
Evaluate saved AutoGluon decision models on a fresh synthetic (rule-generated) test set.

This script:
- Generates synthetic pond samples via models.training.data_generator.TrainingDataGenerator
- Builds the exact feature/label table via AutoGluonDecisionAgent.prepare_training_data
- Splits into train/test (holdout) for evaluation
- Loads predictors from models/autogluon_models/*
- Computes simple metrics:
  - Classification: accuracy
  - Regression: RMSE and MAE

Note: Because the synthetic labels are generated from deterministic rules, results may look
optimistic and may not reflect real-world performance on real farm data.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pandas as pd

from models.autogluon_decision_agent import AutoGluonDecisionAgent
from models.training.data_generator import TrainingDataGenerator


def _split_df(df: pd.DataFrame, test_size: float, seed: int) -> Tuple[pd.DataFrame, pd.DataFrame]:
    if not (0.0 < test_size < 1.0):
        raise ValueError("--test-size must be between 0 and 1 (exclusive)")
    rng = np.random.default_rng(seed)
    idx = np.arange(len(df))
    rng.shuffle(idx)
    n_test = max(1, int(round(len(df) * test_size)))
    test_idx = idx[:n_test]
    train_idx = idx[n_test:]
    return df.iloc[train_idx].reset_index(drop=True), df.iloc[test_idx].reset_index(drop=True)


def _rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    y_true = y_true.astype(float)
    y_pred = y_pred.astype(float)
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def _mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    y_true = y_true.astype(float)
    y_pred = y_pred.astype(float)
    return float(np.mean(np.abs(y_true - y_pred)))


def generate_synthetic_dataset(samples: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    generator = TrainingDataGenerator()
    agent = AutoGluonDecisionAgent()

    scenarios = ["normal", "good", "poor", "critical"]

    all_wq = []
    all_feed = []
    all_energy = []
    all_labor = []
    labels: Dict[str, list] = {"action_type": [], "urgency": [], "priority": [], "feed_amount": []}

    # Ensure reproducible randomness for both numpy and Python's random (used in generator)
    # The generator uses the stdlib `random`, so we seed it too.
    import random  # local import to avoid unused import warnings

    random.seed(seed)

    for i in range(samples):
        # Evenly distribute scenarios, but add a tiny shuffle via RNG for variety
        scenario = scenarios[int(rng.integers(0, len(scenarios)))] if i % 4 == 0 else scenarios[i % 4]

        wq = generator.generate_water_quality_data(pond_id=1, scenario=scenario)
        feed = generator.generate_feed_data(pond_id=1, water_quality=wq)
        energy = generator.generate_energy_data(pond_id=1, water_quality=wq)
        labor = generator.generate_labor_data(pond_id=1, water_quality=wq, energy=energy)

        y = generator.generate_labels(wq, feed, energy, labor)

        all_wq.append(wq)
        all_feed.append(feed)
        all_energy.append(energy)
        all_labor.append(labor)

        labels["action_type"].append(int(y["action_type"]))
        labels["urgency"].append(float(y["urgency"]))
        # priority is stored as a soft distribution in generator; training script converts to 1..N rank
        labels["priority"].append(int(np.argmax(y["priority"])) + 1)
        # feed_amount label is normalized in generator; training script denormalizes to grams
        labels["feed_amount"].append(float(y["feed_amount"]) * 50.0)

    df = agent.prepare_training_data(all_wq, all_feed, all_energy, all_labor, labels=labels)
    return df


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate saved AutoGluon models on synthetic holdout data")
    parser.add_argument("--samples", type=int, default=5000, help="Number of synthetic samples to generate (default: 5000)")
    parser.add_argument("--test-size", type=float, default=0.2, help="Holdout fraction for test (default: 0.2)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (default: 42)")
    args = parser.parse_args()

    model_base = Path("models/autogluon_models")
    if not model_base.exists():
        raise SystemExit(f"Missing {model_base}. Train models first: python train_autogluon_models.py")

    print("=" * 70)
    print("AutoGluon Synthetic Evaluation (Holdout)")
    print("=" * 70)
    print(f"samples={args.samples}  test_size={args.test_size}  seed={args.seed}")

    df = generate_synthetic_dataset(samples=args.samples, seed=args.seed)
    train_df, test_df = _split_df(df, test_size=args.test_size, seed=args.seed)

    print(f"\nDataset shape: {df.shape} (train={train_df.shape[0]}, test={test_df.shape[0]})")

    # Evaluate each predictor
    from autogluon.tabular import TabularPredictor  # imported here so script still loads without autogluon import at import-time

    def eval_classifier(predictor_path: Path, label: str) -> None:
        pred = TabularPredictor.load(str(predictor_path))
        X = test_df.drop(columns=[label], errors="ignore")
        y_true = test_df[label].to_numpy()
        y_pred = pred.predict(X).to_numpy()
        acc = float(np.mean(y_pred == y_true))
        print(f"- {predictor_path.name}: accuracy={acc:.4f}  (n={len(y_true)})")

    def eval_regressor(predictor_path: Path, label: str) -> None:
        pred = TabularPredictor.load(str(predictor_path))
        X = test_df.drop(columns=[label], errors="ignore")
        y_true = test_df[label].to_numpy(dtype=float)
        y_pred = pred.predict(X).to_numpy(dtype=float)
        rmse = _rmse(y_true, y_pred)
        mae = _mae(y_true, y_pred)
        print(f"- {predictor_path.name}: RMSE={rmse:.4f}  MAE={mae:.4f}  (n={len(y_true)})")

    print("\nMetrics on holdout test split:")
    eval_classifier(model_base / "action_predictor", label="action_type")
    eval_regressor(model_base / "urgency_predictor", label="urgency")
    eval_classifier(model_base / "priority_predictor", label="priority")
    eval_regressor(model_base / "feed_amount_predictor", label="feed_amount")

    print("\nTip: These are synthetic-rule labels; use real labeled farm data for real accuracy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


