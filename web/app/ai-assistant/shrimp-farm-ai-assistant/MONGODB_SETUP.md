# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas integration for the Shrimp Farm AI Assistant.

## Prerequisites

1. A MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
2. A cluster created in MongoDB Atlas
3. A database user with read/write permissions

## Step 1: Get Your Connection String

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click **"Connect"**
4. Select **"Connect your application"**
5. Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/`)

## Step 2: Configure Environment Variables

Add the following to your `.env` file:

```env
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=shrimp_farm
```

**Important:** Replace:
- `username` with your Atlas database username
- `password` with your Atlas database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster address

## Step 3: Configure Network Access

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. For development, you can add `0.0.0.0/0` (allows all IPs)
4. For production, add your specific IP addresses

## Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install `pymongo>=4.6.0` which is required for MongoDB Atlas connections.

## Step 5: Test Connection

Run the test script to verify your connection:

```bash
python test_atlas_connection.py
```

You should see:
```
✓ Successfully connected to MongoDB Atlas!
```

## Step 6: Generate Sample Data

### Option 1: Generate Water Quality Samples Only

Generate 300 water quality samples and insert them into MongoDB:

```bash
python generate_mongodb_samples.py
```

This will:
- Generate 300 realistic water quality samples
- Distribute them across 4 ponds
- Spread timestamps over the last 30 days
- Insert them into the `water_quality_readings` collection
- Create indexes for efficient queries

### Option 2: Generate All Data Types (Recommended)

Generate 300 samples each for feed, energy, and labor data:

```bash
python generate_all_samples.py
```

This will:
- Generate 300 feed samples → `feed_readings` collection
- Generate 300 energy samples → `energy_readings` collection
- Generate 300 labor samples → `labor_readings` collection
- Distribute all samples across 4 ponds
- Spread timestamps over the last 30 days
- Create indexes for efficient queries on all collections

## Database Structure

### Collections

- **water_quality_readings**: Individual water quality sensor readings
- **feed_readings**: Feed distribution and prediction data
- **energy_readings**: Energy consumption and efficiency data
- **labor_readings**: Labor task completion and efficiency data
- **farm_snapshots**: Aggregated farm state snapshots (for AI agents)

### Document Structures

**Water Quality Document:**
```json
{
  "pond_id": 1,
  "timestamp": "2026-01-02T10:45:50.710Z",
  "ph": 7.96,
  "temperature": 29.66,
  "dissolved_oxygen": 6.91,
  "salinity": 17.55,
  "ammonia": 0.23,
  "nitrite": 0.05,
  "nitrate": 5.2,
  "turbidity": 2.1,
  "status": "good",
  "alerts": ["CRITICAL: High ammonia levels (0.23 mg/L) - water change needed"],
  "created_at": "2026-01-03T12:00:00.000Z"
}
```

**Feed Document:**
```json
{
  "pond_id": 1,
  "timestamp": "2026-01-02T10:45:50.710Z",
  "shrimp_count": 11109,
  "average_weight": 10.05,
  "feed_amount": 756.32,
  "feed_type": "Developer Feed (32% protein)",
  "feeding_frequency": 4,
  "predicted_next_feeding": "2026-01-02T18:45:50.710Z",
  "created_at": "2026-01-03T12:00:00.000Z"
}
```

**Energy Document:**
```json
{
  "pond_id": 1,
  "timestamp": "2026-01-02T10:45:50.710Z",
  "aerator_usage": 15.2,
  "pump_usage": 20.5,
  "heater_usage": 8.1,
  "total_energy": 43.8,
  "cost": 5.26,
  "efficiency_score": 0.95,
  "created_at": "2026-01-03T12:00:00.000Z"
}
```

**Labor Document:**
```json
{
  "pond_id": 1,
  "timestamp": "2026-01-02T10:45:50.710Z",
  "tasks_completed": ["Feed distribution", "Water quality testing", "Shrimp health monitoring"],
  "time_spent": 2.6,
  "worker_count": 1,
  "efficiency_score": 0.95,
  "next_tasks": ["Pond cleaning", "Equipment check"],
  "created_at": "2026-01-03T12:00:00.000Z"
}
```

## Using MongoDB in Your Code

### Synchronous Operations

```python
from database.mongodb import get_mongo_client, get_database

# Get client and database
client = get_mongo_client()
db = get_database(client)

# Access collections
collection = db["water_quality_readings"]

# Query data
latest = collection.find_one({"pond_id": 1}, sort=[("timestamp", -1)])
```

### Asynchronous Operations (FastAPI)

```python
from database.mongodb import get_async_mongo_client, get_async_database

# Get async client and database
client = get_async_mongo_client()
db = get_async_database(client)

# Query data
collection = db["water_quality_readings"]
latest = await collection.find_one({"pond_id": 1}, sort=[("timestamp", -1)])
```

## Troubleshooting

### Connection Failed

1. **Check your MONGO_URI**: Ensure it's correctly formatted and includes credentials
2. **Verify Network Access**: Make sure your IP is whitelisted in Atlas
3. **Check Credentials**: Verify your database username and password are correct
4. **Cluster Status**: Ensure your cluster is running (not paused)

### Import Errors

If you see import errors for `pymongo`:
```bash
pip install pymongo>=4.6.0
```

### Authentication Failed

- Double-check your username and password in the connection string
- Ensure your database user has read/write permissions
- Try creating a new database user if issues persist

## Next Steps

After setting up MongoDB Atlas:

1. Update `api/server.py` to read from MongoDB instead of JSON files
2. Update `main.py` to save data to MongoDB
3. Create aggregation pipelines for AI agent data processing
4. Set up scheduled data collection from IoT devices

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [MongoDB Python Driver](https://www.mongodb.com/docs/drivers/python/)

