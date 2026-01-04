# Shrimp Farm Dashboard (Vite + React + Tailwind)

This is a small React (Vite) frontend that calls the existing FastAPI backend endpoints in `api/notebook/water quality/predict_api.py`.

Quick start

1. Open PowerShell in this folder:

```powershell
cd "api\notebook\water quality\dashboard\web"
```

2. Install dependencies:

```powershell
# using npm
npm install
# or using yarn
# yarn
```

3. Start dev server (Vite):

```powershell
npm run dev
```

4. The app runs at `http://localhost:5173`. It expects the backend API at the same host/port paths (e.g. `/dashboard/history`, `/dashboard/predict_all`). If your backend runs at `127.0.0.1:8000`, you can run the frontend dev server and the API simultaneously.

Build and deploy

```powershell
npm run build
# copy the generated `dist` into the API static folder if you want the FastAPI to serve it
# e.g. copy contents to api/notebook/water quality/dashboard/
```