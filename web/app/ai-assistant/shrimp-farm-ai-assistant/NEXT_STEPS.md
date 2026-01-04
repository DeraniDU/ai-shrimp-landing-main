# Next Steps: Decision Model Implementation Guide

## 🎯 Quick Start Checklist

- [ ] Step 1: Install Dependencies
- [ ] Step 2: Train the Decision Model
- [ ] Step 3: Test the Model
- [ ] Step 4: Integrate with Existing System
- [ ] Step 5: Deploy and Monitor

---

## Step 1: Install Dependencies

### Install Required Packages

```bash
# Install PyTorch and other ML dependencies
pip install -r requirements.txt

# Or install PyTorch separately if needed
pip install torch==2.1.0 scikit-learn==1.3.2
```

### Verify Installation

```bash
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python -c "import sklearn; print('scikit-learn installed')"
```

---

## Step 2: Train the Decision Model

### Basic Training (Recommended First)

```bash
# Train with default settings (10,000 samples, 100 epochs)
python train_decision_model.py
```

### Advanced Training Options

```bash
# More samples for better accuracy
python train_decision_model.py --samples 20000 --epochs 150 --batch-size 64

# Faster training (fewer samples)
python train_decision_model.py --samples 5000 --epochs 50 --batch-size 32

# Use GPU if available
python train_decision_model.py --device cuda --samples 20000
```

### What Happens During Training

1. **Data Generation**: Creates 10,000 synthetic training samples
2. **Model Training**: Trains neural network for 100 epochs
3. **Validation**: Tests on 20% of data
4. **Model Saving**: Saves best model to `models/decision_model.pth`
5. **History Saving**: Saves training metrics to `models/training_history.json`

### Expected Training Time

- **CPU**: ~10-30 minutes (depending on samples/epochs)
- **GPU**: ~2-5 minutes (if available)

### Training Output

You should see:
```
Starting training for 100 epochs...
Epoch 10/100
  Train Loss: 0.5234, Action Acc: 0.7821
  Val Loss: 0.4892, Action Acc: 0.8012, Urgency MAE: 0.1234
  ✓ Saved best model (val_loss: 0.4892)
...
Training completed! Best validation loss: 0.4234
```

---

## Step 3: Test the Model

### Run Example Script

```bash
# Test the model with sample data
python example_use_decision_model.py
```

### Expected Output

```
======================================================================
Decision Model Usage Example
======================================================================

1. Loading decision model...
Decision model loaded from models/decision_model.pth

2. Creating sample farm data...

3. Making decision based on farm data...

======================================================================
DECISION OUTPUT
======================================================================

Pond ID: 1
Timestamp: 2024-01-15 10:30:00

Primary Action: emergency_response
Action Intensity: 0.95
Urgency Score: 0.92 (HIGH)
Priority Rank: 1
Confidence: 0.89

Recommendations:
  - Feed Amount: 12.50 grams
  - Aerator Level: 1.00 (100%)
  - Pump Level: 0.85 (85%)
  - Heater Level: 0.70 (70%)

Reasoning: Critical water quality status detected. Low dissolved oxygen (3.5 mg/L). High ammonia levels (0.35 mg/L). High urgency situation requiring immediate attention.

Affected Factors: Water Quality, Dissolved Oxygen, Ammonia Levels
```

### Manual Testing

Create a test script to test with your own data:

```python
from models.decision_integration import DecisionAgent
from models import WaterQualityData, FeedData, EnergyData, LaborData, WaterQualityStatus
from datetime import datetime

# Create agent
agent = DecisionAgent()

# Your test data
water_quality = [WaterQualityData(...)]
feed = [FeedData(...)]
energy = [EnergyData(...)]
labor = [LaborData(...)]

# Make decision
decision = agent.make_decision(water_quality, feed, energy, labor, pond_id=1)
print(decision)
```

---

## Step 4: Integrate with Existing System

### Option A: Add as New Decision Agent

Create a new agent that uses the decision model:

```python
# agents/decision_agent.py
from models.decision_integration import DecisionAgent as DecisionModelAgent
from models import WaterQualityData, FeedData, EnergyData, LaborData

class DecisionAgent:
    def __init__(self):
        self.decision_model = DecisionModelAgent()
    
    def make_operational_decision(self, farm_data):
        """Make decision based on farm data"""
        return self.decision_model.make_decision(
            farm_data['water_quality'],
            farm_data['feed'],
            farm_data['energy'],
            farm_data['labor']
        )
```

### Option B: Enhance Manager Agent

Modify `agents/manager_agent.py` to use decision model:

```python
# In ManagerAgent class
from models.decision_integration import DecisionAgent

class ManagerAgent:
    def __init__(self):
        # ... existing code ...
        self.decision_agent = DecisionAgent()  # Add this
    
    def create_dashboard(self, ...):
        # ... existing code ...
        
        # Get decisions from model
        decisions = self.decision_agent.make_multi_pond_decisions(
            water_quality_data, feed_data, energy_data, labor_data
        )
        
        # Add decisions to dashboard
        dashboard.decisions = decisions
        return dashboard
```

### Option C: Integrate in Main Orchestrator

Modify `main.py` to use decision model:

```python
# In ShrimpFarmOrchestrator class
from models.decision_integration import DecisionAgent

class ShrimpFarmOrchestrator:
    def __init__(self):
        # ... existing code ...
        self.decision_agent = DecisionAgent()  # Add this
    
    async def generate_insights(self):
        # ... existing code ...
        
        # Get ML-based decisions
        ml_decisions = self.decision_agent.make_multi_pond_decisions(
            self.farm_data['water_quality'],
            self.farm_data['feed'],
            self.farm_data['energy'],
            self.farm_data['labor']
        )
        
        # Combine with LLM insights
        # ... combine both ...
```

### Option D: Hybrid Approach (Recommended)

Use both LLM and decision model, combine their outputs:

```python
# Get LLM insights (existing)
llm_insights = self.manager_agent.create_synthesis_task(...)

# Get ML decisions (new)
ml_decisions = self.decision_agent.make_multi_pond_decisions(...)

# Combine both
final_decisions = self._combine_decisions(llm_insights, ml_decisions)
```

---

## Step 5: Add Decision Output to Dashboard

### Update Dashboard Model

Add decision field to `ShrimpFarmDashboard` in `models.py`:

```python
class ShrimpFarmDashboard(BaseModel):
    # ... existing fields ...
    decisions: Optional[MultiPondDecision] = None  # Add this
```

### Display in Dashboard

Update `dashboard.py` to show decisions:

```python
def render_decisions(dashboard):
    if dashboard.decisions:
        st.subheader("🤖 AI Decisions")
        
        for pond_id, decision in dashboard.decisions.recommended_actions.items():
            with st.expander(f"Pond {pond_id} - {decision.primary_action.value}"):
                st.write(f"**Urgency:** {decision.urgency_score:.2f}")
                st.write(f"**Reasoning:** {decision.reasoning}")
                st.write(f"**Recommendations:**")
                if decision.recommended_aerator_level:
                    st.write(f"- Aerator: {decision.recommended_aerator_level*100:.0f}%")
```

---

## Step 6: Configuration

### Update .env File

Add decision model configuration:

```bash
# Decision Model Settings
USE_DECISION_MODEL=true
DECISION_MODEL_PATH=models/decision_model.pth
DECISION_CONFIDENCE_THRESHOLD=0.7
ENABLE_AUTO_ACTIONS=false
```

### Use Configuration

```python
from config import DECISION_MODEL_CONFIG

if DECISION_MODEL_CONFIG['use_decision_model']:
    decision_agent = DecisionAgent(
        model_path=DECISION_MODEL_CONFIG['model_path']
    )
```

---

## Step 7: Testing Integration

### Test with Real Data Flow

1. Run your existing system:
   ```bash
   python main.py
   ```

2. Check if decisions are generated:
   - Look for decision outputs in logs
   - Check dashboard for decision display
   - Verify decisions make sense

3. Compare with LLM decisions:
   - Run both LLM and ML model
   - Compare outputs
   - See which performs better

---

## Step 8: Monitor and Improve

### Track Model Performance

1. **Log Decisions**: Save all decisions made
2. **Track Outcomes**: Record if decisions were correct
3. **Measure Accuracy**: Calculate success rate
4. **Collect Feedback**: Get user feedback on decisions

### Retrain with Real Data

Once you have real farm data:

1. **Collect Data**: Save actual farm data and outcomes
2. **Label Data**: Mark which decisions were correct
3. **Retrain Model**: Use real data instead of synthetic
4. **Fine-tune**: Adjust model for your specific farm

### Continuous Improvement

- **Weekly**: Review decision accuracy
- **Monthly**: Retrain with new data
- **Quarterly**: Update model architecture if needed

---

## Troubleshooting

### Model Not Found Error

```bash
# Make sure model is trained first
python train_decision_model.py

# Check if model file exists
ls models/decision_model.pth
```

### Import Errors

```bash
# Make sure all dependencies installed
pip install -r requirements.txt

# Check Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Low Accuracy

- Train with more samples: `--samples 20000`
- Train for more epochs: `--epochs 150`
- Check training data quality
- Verify feature extraction

### Slow Performance

- Use GPU if available: `--device cuda`
- Reduce batch size: `--batch-size 16`
- Simplify model architecture

---

## Next Level Improvements

### 1. Add Temporal Features

Include historical data:
- Previous water quality readings
- Trends over time
- Seasonal patterns

### 2. Ensemble Methods

Combine multiple models:
- Decision tree + Neural network
- Multiple neural networks
- Voting system

### 3. Online Learning

Update model with new data:
- Incremental learning
- Feedback loop
- Continuous improvement

### 4. Explainability

Add more detailed explanations:
- Feature importance
- Decision path visualization
- Confidence breakdown

### 5. Real-time Integration

Connect to actual sensors:
- Live data feed
- Real-time decisions
- Automated actions

---

## Summary Checklist

- [x] Model architecture created
- [x] Training system ready
- [x] Integration code written
- [ ] Dependencies installed
- [ ] Model trained
- [ ] Model tested
- [ ] Integrated with system
- [ ] Dashboard updated
- [ ] Configuration set
- [ ] Monitoring set up

---

## Quick Reference Commands

```bash
# Install
pip install -r requirements.txt

# Train
python train_decision_model.py

# Test
python example_use_decision_model.py

# Run system
python main.py

# Run dashboard
python run_dashboard.py
```

---

**You're ready to go! Start with Step 1 and work through each step systematically.**

