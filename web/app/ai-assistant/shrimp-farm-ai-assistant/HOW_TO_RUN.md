# How to Run the Shrimp Farm Management Application

This guide explains all the ways to run the application.

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
FARM_POND_COUNT=4
EOF
```

Or set environment variable directly:

```bash
export OPENAI_API_KEY="your_openai_api_key_here"
```

**Note:** Some modes work without OpenAI API key (see below).

---

## 🚀 Running Options

### Option 1: Main Orchestrator (CLI Mode)

**Best for:** Testing, automation, background monitoring

```bash
python main.py
```

**What it does:**
- Initializes all AI agents
- Runs a single monitoring cycle
- Displays farm status summary
- Optionally starts continuous monitoring

**Output:**
```
Shrimp Farm Management System
==================================================
Running initial monitoring cycle...

Farm Status Summary:
Overall Health Score: 0.85
Feed Efficiency: 0.82
Energy Efficiency: 0.78
Labor Efficiency: 0.80
Active Alerts: 2
Insights: 3

Farm data saved to: farm_data_20240115_103000.json

Start continuous monitoring? (y/n):
```

**Requires:** OpenAI API key

---

### Option 2: Interactive Dashboard (Web UI)

**Best for:** Visual monitoring, real-time updates, user interaction

#### Method A: Using the run script (Recommended)

```bash
python run_dashboard.py
```

This script:
- Checks for dependencies
- Verifies OpenAI API key
- Launches the dashboard automatically

#### Method B: Direct Streamlit command

```bash
streamlit run dashboard.py
```

**What it does:**
- Opens web dashboard at `http://localhost:8501`
- Shows real-time farm metrics
- Interactive charts and visualizations
- Update dashboard button to refresh data

**Features:**
- Key metrics display
- Water quality charts
- Feed management tables
- Energy usage visualizations
- Labor efficiency reports
- Alerts and recommendations

**Requires:** OpenAI API key

**To stop:** Press `Ctrl+C` in terminal

---

### Option 3: API Server (REST API)

**Best for:** Integration with other systems, frontend applications

```bash
# Start the API server
uvicorn api.server:app --reload --port 8000
```

Or using Python:

```bash
python -m uvicorn api.server:app --reload --port 8000
```

**Windows (PowerShell) tip:** if you use the repo's `venv/`, run uvicorn via that interpreter:

```powershell
.\venv\Scripts\python.exe -m uvicorn api.server:app --reload --port 8000
```

**What it does:**
- Starts FastAPI server on `http://localhost:8000`
- Provides REST endpoints
- No OpenAI API key needed (uses simulation)

**Available Endpoints:**

1. **Health Check:**
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Get Dashboard Data:**
   ```bash
   curl http://localhost:8000/api/dashboard?ponds=4
   ```

3. **Get Historical Snapshots (saved `farm_data_*.json` files):**
   ```bash
   curl "http://localhost:8000/api/history?limit=60"
   ```

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Requires:** No OpenAI API key (uses simulation mode)

---

### Option 3b: React Dashboard (Vite) + API (Recommended for the new UI)

This repo includes a React dashboard in `web/` that proxies API calls to the FastAPI backend.

**Terminal 1 (API backend):**

```powershell
.\venv\Scripts\python.exe -m uvicorn api.server:app --reload --port 8000
```

**Terminal 2 (React dev server):**

```powershell
cd .\web
npm install
npm run dev
```

Open: `http://localhost:5173`

### Option 4: Demo Mode (No API Key Required)

**Best for:** Testing without OpenAI API key

```bash
python demo.py
```

**What it does:**
- Runs without OpenAI API key
- Uses simulated data
- Demonstrates system capabilities
- Good for development/testing

**Requires:** No OpenAI API key

---

### Option 5: Decision Model (New Feature)

**Best for:** Using ML-based decisions instead of LLM

#### Step 1: Train the model (first time only)

```bash
python train_decision_model.py
```

#### Step 2: Test the model

```bash
python example_use_decision_model.py
```

#### Step 3: Use in application

The decision model can be integrated into the main application (see NEXT_STEPS.md)

**Requires:** PyTorch (already in requirements.txt)

---

## 🔧 Quick Start Commands

### For First-Time Setup:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set OpenAI API key
export OPENAI_API_KEY="your_key_here"

# 3. Run dashboard (easiest way to start)
python run_dashboard.py
```

### For Development:

```bash
# Run API server (no API key needed)
uvicorn api.server:app --reload

# In another terminal, test API
curl http://localhost:8000/api/health
```

---

### Option 6: React Web Dashboard (Vite)

**Best for:** A React-based web UI (dev server on `http://localhost:5173`).

**Terminal 1 (backend API):**

```powershell
.\venv\Scripts\python.exe -m uvicorn api.server:app --reload --port 8000
```

**Terminal 2 (React dev server):**

```powershell
cd .\web
npm install
npm run dev
```

If you already had Vite running, restart it after backend/proxy changes (`Ctrl+C`, then `npm run dev`).

### For Production:

```bash
# Run main orchestrator with continuous monitoring
python main.py
# Answer 'y' when prompted for continuous monitoring
```

---

## 📊 Application Modes Comparison

| Mode | Command | API Key Needed | Best For |
|------|---------|----------------|----------|
| **Dashboard** | `python run_dashboard.py` | ✅ Yes | Visual monitoring |
| **Main CLI** | `python main.py` | ✅ Yes | Automation |
| **API Server** | `uvicorn api.server:app` | ❌ No | Integration |
| **Demo** | `python demo.py` | ❌ No | Testing |
| **Decision Model** | `python train_decision_model.py` | ❌ No | ML decisions |

---

## 🐛 Troubleshooting

### Issue: "OpenAI API key not found"

**Solution:**
```bash
# Set environment variable
export OPENAI_API_KEY="your_key_here"

# Or create .env file
echo "OPENAI_API_KEY=your_key_here" > .env
```

### Issue: "Module not found"

**Solution:**
```bash
# Install requirements
pip install -r requirements.txt

# Or install specific package
pip install streamlit crewai langchain
```

### Issue: "Port already in use"

**Solution:**
```bash
# Use different port for dashboard
streamlit run dashboard.py --server.port 8502

# Or for API
uvicorn api.server:app --port 8001
```

### Issue: "Permission denied" (Linux/Mac)

**Solution:**
```bash
# Make scripts executable
chmod +x run_dashboard.py
chmod +x train_decision_model.py
```

---

## 🔄 Running Multiple Components

### Run Dashboard + API Server:

**Terminal 1:**
```bash
python run_dashboard.py
```

**Terminal 2:**
```bash
uvicorn api.server:app --reload
```

### Run Main Orchestrator + Dashboard:

**Terminal 1:**
```bash
python main.py
```

**Terminal 2:**
```bash
streamlit run dashboard.py
```

---

## 📝 Configuration

Edit `config.py` to customize:

- Number of ponds
- Monitoring intervals
- OpenAI model settings
- Decision model settings

Or use environment variables (see `.env` file).

---

## 🎯 Recommended Workflow

### For Development:
1. Start with demo mode: `python demo.py`
2. Then try API: `uvicorn api.server:app --reload`
3. Finally dashboard: `python run_dashboard.py`

### For Production:
1. Set up environment variables
2. Run main orchestrator: `python main.py`
3. Or use dashboard: `python run_dashboard.py`

### For Integration:
1. Start API server: `uvicorn api.server:app`
2. Connect your frontend to `http://localhost:8000`

---

## 📚 Additional Resources

- **NEXT_STEPS.md** - Guide for decision model integration
- **README.md** - General project documentation
- **WORKFLOW_EXPLANATION.md** - Detailed system workflow
- **SYSTEM_OVERVIEW.md** - System architecture overview

---

## ✅ Quick Checklist

Before running, ensure:

- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] OpenAI API key set (for LLM features)
- [ ] Ports available (8501 for dashboard, 8000 for API)
- [ ] Sufficient disk space for logs and data files

---

**Ready to run! Choose the mode that best fits your needs.**

