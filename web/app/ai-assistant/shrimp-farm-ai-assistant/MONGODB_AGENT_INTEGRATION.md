# MongoDB Agent Integration Guide

This guide explains how to configure AI agents to fetch data from MongoDB instead of simulating data.

## Overview

The AI agents have been updated to support fetching real data from MongoDB Atlas. When MongoDB is enabled, agents will automatically fetch the latest data from your database collections. If MongoDB is unavailable or no data exists, agents will fall back to simulation mode.

## Configuration

### Step 1: Enable MongoDB in Environment Variables

Add to your `.env` file:

```env
# Enable MongoDB data fetching
USE_MONGODB=true

# MongoDB Atlas connection
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=shrimp_farm
```

### Step 2: Ensure Data Exists in MongoDB

Before agents can fetch data, you need to populate your MongoDB collections:

```bash
# Generate sample data
python generate_mongodb_samples.py      # Water quality only
python generate_all_samples.py          # All data types (recommended)
```

## How It Works

### Agent Behavior

Each agent now has two methods:

1. **`get_*_data()`** - Fetches from MongoDB, falls back to simulation
2. **`simulate_*_data()`** - Always simulates (for testing/backward compatibility)

### Data Flow

```
Agent.get_*_data() 
  → Try MongoDB fetch
    → Success: Return MongoDB data
    → Failure/No data: Fall back to simulate_*_data()
```

### Updated Agents

1. **WaterQualityAgent**
   - `get_water_quality_data(pond_id)` - Fetches from `water_quality_readings`
   - Falls back to `simulate_water_quality_data()`

2. **FeedPredictionAgent**
   - `get_feed_data(pond_id, water_quality_data)` - Fetches from `feed_readings`
   - Falls back to `simulate_feed_data()`

3. **EnergyOptimizationAgent**
   - `get_energy_data(pond_id, water_quality_data)` - Fetches from `energy_readings`
   - Falls back to `simulate_energy_data()`

4. **LaborOptimizationAgent**
   - `get_labor_data(pond_id, water_quality_data, energy_data)` - Fetches from `labor_readings`
   - Falls back to `simulate_labor_data()`

## Updated Components

### API Server (`api/server.py`)

The `/api/dashboard` and `/api/forecasts` endpoints now use `get_*_data()` methods:

```python
# Automatically uses MongoDB if enabled
wq = water_quality_agent.get_water_quality_data(pond_id)
feed = feed_agent.get_feed_data(pond_id, wq)
energy = energy_agent.get_energy_data(pond_id, wq)
labor = labor_agent.get_labor_data(pond_id, wq, energy)
```

### Main Orchestrator (`main.py`)

The `collect_agent_data()` method now fetches from MongoDB:

```python
wq_data = self.water_quality_agent.get_water_quality_data(pond_id)
feed_data_item = self.feed_agent.get_feed_data(pond_id, wq_data)
energy_data_item = self.energy_agent.get_energy_data(pond_id, wq_data)
labor_data_item = self.labor_agent.get_labor_data(pond_id, wq_data, energy_data_item)
```

## Database Repository

A new `DataRepository` class (`database/repository.py`) provides methods to fetch data:

```python
from database.repository import DataRepository

repo = DataRepository()

# Get latest data for a pond
wq = repo.get_latest_water_quality(pond_id=1)
feed = repo.get_latest_feed_data(pond_id=1)
energy = repo.get_latest_energy_data(pond_id=1)
labor = repo.get_latest_labor_data(pond_id=1)

# Get historical data
history = repo.get_water_quality_history(pond_id=1, hours=24, limit=100)

# Get all ponds at once
all_data = repo.get_all_ponds_latest(pond_ids=[1, 2, 3, 4])
```

## Testing

### Test MongoDB Connection

```bash
python test_atlas_connection.py
```

### Test Agent Data Fetching

Create a test script:

```python
from agents.water_quality_agent import WaterQualityAgent
from config import USE_MONGODB

print(f"MongoDB enabled: {USE_MONGODB}")

agent = WaterQualityAgent()
data = agent.get_water_quality_data(pond_id=1)

print(f"Data source: {'MongoDB' if agent.repository else 'Simulation'}")
print(f"Pond ID: {data.pond_id}")
print(f"Status: {data.status}")
print(f"pH: {data.ph}")
```

## Troubleshooting

### Agents Still Using Simulation

1. **Check `USE_MONGODB` setting:**
   ```bash
   # In your .env file
   USE_MONGODB=true
   ```

2. **Verify MongoDB connection:**
   ```bash
   python test_atlas_connection.py
   ```

3. **Check if data exists:**
   ```python
   from database.repository import DataRepository
   repo = DataRepository()
   data = repo.get_latest_water_quality(pond_id=1)
   print(f"Data found: {data is not None}")
   ```

### Connection Errors

If you see warnings about MongoDB connection:
- Verify `MONGO_URI` is correct
- Check network access in Atlas
- Ensure database user has read permissions
- Agents will automatically fall back to simulation

### No Data Found

If agents fall back to simulation:
- Generate sample data: `python generate_all_samples.py`
- Verify data exists in collections
- Check pond_id matches your data

## Backward Compatibility

All existing code continues to work:
- `simulate_*_data()` methods still available
- Simulation mode works when `USE_MONGODB=false`
- No breaking changes to existing functionality

## Next Steps

1. **Enable MongoDB:** Set `USE_MONGODB=true` in `.env`
2. **Populate Data:** Run `python generate_all_samples.py`
3. **Test:** Verify agents fetch from MongoDB
4. **Deploy:** Your agents now use real IoT data!

## Example: Full Integration

```python
from agents.water_quality_agent import WaterQualityAgent
from agents.feed_prediction_agent import FeedPredictionAgent
from agents.energy_optimization_agent import EnergyOptimizationAgent
from agents.labor_optimization_agent import LaborOptimizationAgent

# Initialize agents (automatically use MongoDB if enabled)
wq_agent = WaterQualityAgent()
feed_agent = FeedPredictionAgent()
energy_agent = EnergyOptimizationAgent()
labor_agent = LaborOptimizationAgent()

# Fetch data (from MongoDB or simulation)
for pond_id in range(1, 5):
    wq = wq_agent.get_water_quality_data(pond_id)
    feed = feed_agent.get_feed_data(pond_id, wq)
    energy = energy_agent.get_energy_data(pond_id, wq)
    labor = labor_agent.get_labor_data(pond_id, wq, energy)
    
    print(f"Pond {pond_id}: {wq.status.value}")
```

Your AI agents are now configured to use real data from MongoDB Atlas!




