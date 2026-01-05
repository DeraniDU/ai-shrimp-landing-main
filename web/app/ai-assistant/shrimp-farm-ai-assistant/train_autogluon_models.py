#!/usr/bin/env python3
"""
Train AutoGluon Models for Decision Making

This script trains AutoGluon base models using synthetic training data.
AutoGluon automatically selects the best models and ensembles them.
"""

import sys
import argparse
from pathlib import Path

# Check if AutoGluon is available
try:
    from autogluon.tabular import TabularPredictor
    import pandas as pd
except ImportError:
    print("ERROR: AutoGluon not installed!")
    print("Install with: pip install autogluon")
    sys.exit(1)

from models.autogluon_decision_agent import AutoGluonDecisionAgent
from models.training.data_generator import TrainingDataGenerator
import numpy as np


def train_autogluon_models(num_samples: int = 10000, time_limit: int = 300):
    """
    Train AutoGluon models for decision making.
    
    Args:
        num_samples: Number of training samples to generate
        time_limit: Training time limit per model in seconds
    """
    print("=" * 70)
    print("AutoGluon Model Training for Shrimp Farm Decision Making")
    print("=" * 70)
    print()
    
    # Initialize components
    print("1. Initializing components...")
    agent = AutoGluonDecisionAgent()
    generator = TrainingDataGenerator()
    
    # Generate training data
    print(f"\n2. Generating {num_samples} training samples...")
    print("   This may take a few minutes...")
    
    all_data = []
    all_labels = {
        'action_type': [],
        'urgency': [],
        'priority': [],
        'feed_amount': []
    }
    
    scenarios = ["normal", "good", "poor", "critical"]
    
    for i in range(num_samples):
        if (i + 1) % 1000 == 0:
            print(f"   Generated {i + 1}/{num_samples} samples...")
        
        # Generate sample - evenly distribute scenarios
        scenario = scenarios[i % len(scenarios)]
        wq = generator.generate_water_quality_data(1, scenario)
        feed = generator.generate_feed_data(1, wq)
        energy = generator.generate_energy_data(1, wq)
        labor = generator.generate_labor_data(1, wq, energy)
        
        # Generate labels
        labels = generator.generate_labels(wq, feed, energy, labor)
        
        # Store data
        all_data.append({
            'water_quality': wq,
            'feed': feed,
            'energy': energy,
            'labor': labor
        })
        
        all_labels['action_type'].append(labels['action_type'])
        all_labels['urgency'].append(labels['urgency'])
        all_labels['priority'].append(int(np.argmax(labels['priority'])) + 1)
        all_labels['feed_amount'].append(labels['feed_amount'] * 50.0)  # Denormalize
    
    print(f"   ✓ Generated {num_samples} samples")
    
    # Prepare training data
    print("\n3. Preparing training data for AutoGluon...")
    train_data = agent.prepare_training_data(
        [d['water_quality'] for d in all_data],
        [d['feed'] for d in all_data],
        [d['energy'] for d in all_data],
        [d['labor'] for d in all_data],
        labels=all_labels
    )
    
    print(f"   Training data shape: {train_data.shape}")
    print(f"   Features: {len(train_data.columns) - 4}")  # Exclude label columns
    print(f"   Samples: {len(train_data)}")
    
    # Train models
    print(f"\n4. Training AutoGluon models (time limit: {time_limit}s per model)...")
    print("   AutoGluon will automatically select and ensemble the best models")
    print("   This may take several minutes...")
    
    agent.train_models(train_data, time_limit=time_limit)
    
    # Evaluate models
    print("\n5. Model Evaluation:")
    print("   AutoGluon automatically evaluates models during training")
    print("   Check model directories for detailed evaluation results")
    
    print("\n" + "=" * 70)
    print("Training Complete!")
    print("=" * 70)
    print(f"\nModels saved to: {agent.model_dir}")
    print("\nYou can now use the models in your application:")
    print("  from models.autogluon_decision_agent import AutoGluonDecisionAgent")
    print("  agent = AutoGluonDecisionAgent()")
    print("  decision = agent.make_decision(...)")


if __name__ == "__main__":
    import numpy as np
    
    parser = argparse.ArgumentParser(
        description='Train AutoGluon models for decision making'
    )
    parser.add_argument(
        '--samples',
        type=int,
        default=10000,
        help='Number of training samples (default: 10000)'
    )
    parser.add_argument(
        '--time-limit',
        type=int,
        default=300,
        help='Training time limit per model in seconds (default: 300 = 5 min)'
    )
    
    args = parser.parse_args()
    
    train_autogluon_models(
        num_samples=args.samples,
        time_limit=args.time_limit
    )

