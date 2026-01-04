# Mock Dashboard Server

This folder contains a lightweight mock server that serves the dashboard UI and returns plausible mock predictions for the demo endpoints.

How to run

1. Open PowerShell and change to this folder:

```powershell
Set-Location -LiteralPath 'C:\Users\Deranindu\Desktop\ai-shrimp-landing-main\api\dashboard'
```

2. Install dependencies and start the server:

```powershell
npm install
npm start
```

3. Open the dashboard in your browser:

http://localhost:3000/index.html

Notes
- This server is a mock. It does not use real trained models. It returns simple heuristic predictions so you can test the UI flows.
- For production or full end-to-end with trained models, follow the README in the repo root to train Python models and run the FastAPI server.
