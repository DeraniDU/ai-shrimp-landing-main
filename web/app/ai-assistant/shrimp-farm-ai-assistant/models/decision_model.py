"""
Decision-Making Model for Shrimp Farm Management System

This module contains a neural network model that makes operational decisions
based on water quality, feed, energy, and labor data.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, List, Tuple, Any
from pathlib import Path

class DecisionMakingModel(nn.Module):
    """
    Multi-input neural network for making farm management decisions.
    
    Takes data from:
    - Water Quality (8 parameters)
    - Feed Data (7 features)
    - Energy Data (6 features)
    - Labor Data (5 features)
    
    Outputs:
    - Action decisions (what to do)
    - Priority rankings (which pond needs attention)
    - Urgency scores (how urgent)
    - Optimization values (feed amounts, timing)
    """
    
    def __init__(self, input_size=35, hidden_sizes=[128, 64, 32], dropout=0.3):
        super(DecisionMakingModel, self).__init__()
        
        # Input processing
        self.input_layer = nn.Linear(input_size, hidden_sizes[0])
        self.bn_input = nn.BatchNorm1d(hidden_sizes[0])
        
        # Hidden layers
        self.hidden_layers = nn.ModuleList()
        self.batch_norms = nn.ModuleList()
        
        for i in range(len(hidden_sizes) - 1):
            self.hidden_layers.append(
                nn.Linear(hidden_sizes[i], hidden_sizes[i+1])
            )
            self.batch_norms.append(nn.BatchNorm1d(hidden_sizes[i+1]))
        
        self.dropout = nn.Dropout(dropout)
        
        # Output heads for different decision types
        # Action decisions (classification)
        self.action_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 32),
            nn.ReLU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(32, 8)  # 8 action types
        )
        
        # Action intensity (regression)
        self.action_intensity_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 16),
            nn.ReLU(),
            nn.Linear(16, 8),  # Intensity for each action
            nn.Sigmoid()  # 0-1 scale
        )
        
        # Priority ranking (for each pond)
        self.priority_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 32),
            nn.ReLU(),
            nn.Linear(32, 8)  # Max 8 ponds
        )
        
        # Urgency score
        self.urgency_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()  # 0-1 scale
        )
        
        # Optimization outputs
        self.feed_amount_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.ReLU()  # Positive feed amount
        )
        
        self.equipment_schedule_head = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 16),
            nn.ReLU(),
            nn.Linear(16, 3),  # Aerator, Pump, Heater schedules
            nn.Sigmoid()  # 0-1 scale (percentage of max)
        )
    
    def forward(self, x):
        """Forward pass through the network"""
        # Input processing
        x = F.relu(self.input_layer(x))
        x = self.bn_input(x)
        x = self.dropout(x)
        
        # Hidden layers
        for layer, bn in zip(self.hidden_layers, self.batch_norms):
            x = F.relu(layer(x))
            x = bn(x)
            x = self.dropout(x)
        
        # Outputs
        outputs = {
            'action_type': F.softmax(self.action_head(x), dim=1),
            'action_intensity': self.action_intensity_head(x),
            'priority': F.softmax(self.priority_head(x), dim=1),
            'urgency': self.urgency_head(x),
            'feed_amount': self.feed_amount_head(x),
            'equipment_schedule': self.equipment_schedule_head(x)
        }
        
        return outputs
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Make predictions from input features.
        
        Args:
            features: Normalized feature array (35 features)
            
        Returns:
            Dictionary with decision outputs
        """
        self.eval()
        with torch.no_grad():
            features_tensor = torch.tensor(features, dtype=torch.float32).unsqueeze(0)
            outputs = self.forward(features_tensor)
            
            # Convert to numpy and extract values
            predictions = {
                'action_type': torch.argmax(outputs['action_type'], dim=1).item(),
                'action_intensity': outputs['action_intensity'][0].cpu().numpy(),
                'priority': outputs['priority'][0].cpu().numpy(),
                'urgency': outputs['urgency'][0].item(),
                'feed_amount': outputs['feed_amount'][0].item(),
                'equipment_schedule': outputs['equipment_schedule'][0].cpu().numpy()
            }
        
        return predictions
    
    def save_model(self, filepath: str):
        """Save model to file"""
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            'model_state_dict': self.state_dict(),
            'input_size': self.input_layer.in_features,
            'hidden_sizes': [layer.out_features for layer in self.hidden_layers] + [self.hidden_layers[-1].out_features],
            'dropout': self.dropout.p
        }, filepath)
    
    @classmethod
    def load_model(cls, filepath: str):
        """Load model from file"""
        checkpoint = torch.load(filepath, map_location='cpu')
        model = cls(
            input_size=checkpoint['input_size'],
            hidden_sizes=checkpoint['hidden_sizes'],
            dropout=checkpoint['dropout']
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        return model


class FeatureExtractor:
    """
    Extracts and normalizes features from farm data for the decision model.
    """
    
    # Feature ranges for normalization
    FEATURE_RANGES = {
        # Water Quality
        'ph': (6.0, 9.0),
        'temperature': (20.0, 35.0),
        'dissolved_oxygen': (2.0, 10.0),
        'salinity': (10.0, 30.0),
        'ammonia': (0.0, 1.0),
        'nitrite': (0.0, 0.5),
        'nitrate': (0.0, 50.0),
        'turbidity': (0.0, 10.0),
        
        # Feed
        'shrimp_count': (0.0, 20000.0),
        'average_weight': (0.0, 25.0),
        'feed_amount': (0.0, 50.0),
        'feeding_frequency': (1.0, 6.0),
        
        # Energy
        'aerator_usage': (0.0, 50.0),
        'pump_usage': (0.0, 30.0),
        'heater_usage': (0.0, 40.0),
        'total_energy': (0.0, 120.0),
        'cost': (0.0, 20.0),
        'efficiency_score': (0.0, 1.0),
        
        # Labor
        'time_spent': (0.0, 24.0),
        'worker_count': (0.0, 5.0),
        'labor_efficiency': (0.0, 1.0),
    }
    
    # Status encodings
    STATUS_ENCODING = {
        'excellent': 1.0,
        'good': 0.8,
        'fair': 0.6,
        'poor': 0.4,
        'critical': 0.2
    }
    
    # Feed type encoding
    FEED_TYPE_ENCODING = {
        'Starter Feed': 0.0,
        'Grower Feed': 0.33,
        'Developer Feed': 0.66,
        'Finisher Feed': 1.0
    }
    
    @classmethod
    def normalize_value(cls, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to [0, 1] range"""
        normalized = (value - min_val) / (max_val - min_val) if max_val > min_val else 0.0
        return max(0.0, min(1.0, normalized))
    
    @classmethod
    def extract_features(cls, 
                        water_quality_data: List,
                        feed_data: List,
                        energy_data: List,
                        labor_data: List) -> np.ndarray:
        """
        Extract and normalize features from all farm data.
        
        Returns:
            Normalized feature array of shape (num_ponds, 35)
        """
        features_list = []
        
        # Process each pond
        for i in range(len(water_quality_data)):
            wq = water_quality_data[i]
            feed = feed_data[i]
            energy = energy_data[i]
            labor = labor_data[i]
            
            features = []
            
            # Water Quality Features (8 raw + 2 derived = 10)
            features.append(cls.normalize_value(wq.ph, *cls.FEATURE_RANGES['ph']))
            features.append(cls.normalize_value(wq.temperature, *cls.FEATURE_RANGES['temperature']))
            features.append(cls.normalize_value(wq.dissolved_oxygen, *cls.FEATURE_RANGES['dissolved_oxygen']))
            features.append(cls.normalize_value(wq.salinity, *cls.FEATURE_RANGES['salinity']))
            features.append(cls.normalize_value(wq.ammonia, *cls.FEATURE_RANGES['ammonia']))
            features.append(cls.normalize_value(wq.nitrite, *cls.FEATURE_RANGES['nitrite']))
            features.append(cls.normalize_value(wq.nitrate, *cls.FEATURE_RANGES['nitrate']))
            features.append(cls.normalize_value(wq.turbidity, *cls.FEATURE_RANGES['turbidity']))
            features.append(cls.STATUS_ENCODING.get(wq.status.value, 0.5))
            features.append(len(wq.alerts) / 10.0)  # Normalize alert count
            
            # Feed Features (7)
            features.append(cls.normalize_value(feed.shrimp_count, *cls.FEATURE_RANGES['shrimp_count']))
            features.append(cls.normalize_value(feed.average_weight, *cls.FEATURE_RANGES['average_weight']))
            features.append(cls.normalize_value(feed.feed_amount, *cls.FEATURE_RANGES['feed_amount']))
            features.append(cls.FEED_TYPE_ENCODING.get(feed.feed_type.split('(')[0].strip(), 0.5))
            features.append(cls.normalize_value(feed.feeding_frequency, *cls.FEATURE_RANGES['feeding_frequency']))
            # Biomass calculation
            biomass = (feed.shrimp_count * feed.average_weight) / 1000.0
            features.append(cls.normalize_value(biomass, 0.0, 300.0))
            # Time since last feeding (normalized)
            time_since_feeding = 0.5  # Placeholder - would need actual timestamp
            features.append(time_since_feeding)
            
            # Energy Features (6)
            features.append(cls.normalize_value(energy.aerator_usage, *cls.FEATURE_RANGES['aerator_usage']))
            features.append(cls.normalize_value(energy.pump_usage, *cls.FEATURE_RANGES['pump_usage']))
            features.append(cls.normalize_value(energy.heater_usage, *cls.FEATURE_RANGES['heater_usage']))
            features.append(cls.normalize_value(energy.total_energy, *cls.FEATURE_RANGES['total_energy']))
            features.append(cls.normalize_value(energy.cost, *cls.FEATURE_RANGES['cost']))
            features.append(energy.efficiency_score)
            
            # Labor Features (5)
            features.append(cls.normalize_value(labor.time_spent, *cls.FEATURE_RANGES['time_spent']))
            features.append(cls.normalize_value(labor.worker_count, *cls.FEATURE_RANGES['worker_count']))
            features.append(labor.efficiency_score)
            features.append(len(labor.tasks_completed) / 20.0)  # Normalize task count
            features.append(len(labor.next_tasks) / 20.0)  # Normalize pending tasks
            
            # Interaction Features (7)
            # Water quality risk score
            wq_risk = 0.0
            if wq.dissolved_oxygen < 5.0:
                wq_risk += 0.3
            if wq.ammonia > 0.2:
                wq_risk += 0.3
            if wq.ph < 7.5 or wq.ph > 8.5:
                wq_risk += 0.2
            if wq.temperature < 26 or wq.temperature > 30:
                wq_risk += 0.2
            features.append(min(1.0, wq_risk))
            
            # Feed efficiency indicator
            if biomass > 0:
                feed_efficiency = feed.feed_amount / biomass if biomass > 0 else 0.5
                features.append(cls.normalize_value(feed_efficiency, 0.01, 0.1))
            else:
                features.append(0.5)
            
            # Energy efficiency risk
            energy_risk = 1.0 - energy.efficiency_score
            features.append(energy_risk)
            
            # Labor efficiency risk
            labor_risk = 1.0 - labor.efficiency_score
            features.append(labor_risk)
            
            # Overall pond health (combination)
            overall_health = (cls.STATUS_ENCODING.get(wq.status.value, 0.5) + 
                            energy.efficiency_score + 
                            labor.efficiency_score) / 3.0
            features.append(overall_health)
            
            # Urgency indicator (combination of critical factors)
            urgency = 0.0
            if wq.status.value in ['poor', 'critical']:
                urgency += 0.4
            if energy.efficiency_score < 0.6:
                urgency += 0.3
            if labor.efficiency_score < 0.6:
                urgency += 0.3
            features.append(min(1.0, urgency))
            
            # Resource allocation need
            resource_need = (len(wq.alerts) / 5.0 + 
                           (1.0 - energy.efficiency_score) + 
                           (1.0 - labor.efficiency_score)) / 3.0
            features.append(min(1.0, resource_need))
            
            features_list.append(features)
        
        # Flatten if single pond, or pad/truncate to handle multiple ponds
        if len(features_list) == 1:
            return np.array(features_list[0], dtype=np.float32)
        else:
            # For multiple ponds, average the features or use max pond
            # For now, return average
            return np.array(features_list).mean(axis=0).astype(np.float32)

