from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import time
import random
import json
from pathlib import Path

import numpy as np

from agents.water_quality_agent import WaterQualityAgent
from agents.feed_prediction_agent import FeedPredictionAgent
from agents.energy_optimization_agent import EnergyOptimizationAgent
from agents.labor_optimization_agent import LaborOptimizationAgent
from agents.manager_agent import ManagerAgent
from agents.decision_recommendation_agent import DecisionRecommendationAgent
from config import FARM_CONFIG

app = FastAPI(title="Shrimp Farm Management API", version="0.1.0")

# In-memory snapshot cache so dashboard reloads are stable.
# Keyed by (ponds, seed). Values are already-serialized JSON dictionaries.
_DASHBOARD_CACHE: Dict[Tuple[int, Optional[int]], Dict[str, Any]] = {}
_DASHBOARD_CACHE_TS: Dict[Tuple[int, Optional[int]], float] = {}
_CACHE_TTL_S_DEFAULT = 300  # 5 minutes

# Allow local dev origins (Vite default: http://localhost:5173)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/api/health")
def health() -> Dict[str, Any]:
	return {"status": "ok", "time": datetime.utcnow().isoformat()}


def _repo_root() -> Path:
	# api/ lives at repo_root/api/
	return Path(__file__).resolve().parents[1]


def _load_saved_snapshots(limit: int) -> List[Dict[str, Any]]:
	"""
	Load saved farm snapshots from JSON files in the repo root.

	Expected filename patterns:
	- farm_data_YYYYMMDD_HHMMSS.json
	- demo_farm_data_YYYYMMDD_HHMMSS.json
	"""
	root = _repo_root()
	files = list(root.glob("farm_data_*.json")) + list(root.glob("demo_farm_data_*.json"))

	def file_key(p: Path) -> str:
		return p.name

	files.sort(key=file_key)
	if limit > 0:
		files = files[-limit:]

	out: List[Dict[str, Any]] = []
	for p in files:
		try:
			with p.open("r", encoding="utf-8") as f:
				data = json.load(f)
			# Normalize: ensure timestamp exists.
			if "timestamp" not in data:
				continue
			out.append({"source": p.name, **data})
		except Exception:
			continue

	# Sort chronologically by embedded timestamp (fallback to source).
	def ts_key(item: Dict[str, Any]) -> str:
		return str(item.get("timestamp") or "") + " " + str(item.get("source") or "")

	out.sort(key=ts_key)
	return out


@app.get("/api/history")
def get_history(limit: int = 30) -> Dict[str, Any]:
	"""
	Return historical snapshots from saved JSON files for dashboard charting.
	"""
	limit = max(0, min(int(limit), 500))
	items = _load_saved_snapshots(limit=limit)
	return {"count": len(items), "items": items}


@app.get("/api/dashboard")
def get_dashboard(
	ponds: int = FARM_CONFIG.get("pond_count", 4),
	fresh: bool = False,
	seed: Optional[int] = None,
	cache_ttl_s: int = _CACHE_TTL_S_DEFAULT,
) -> Dict[str, Any]:
	"""
	Generate dashboard data using simulation (no API key needed).

	By default this endpoint returns a cached snapshot so the React dashboard is
	stable across browser reloads.

	Query params:
	- fresh: if true, bypass cache and generate a new snapshot
	- seed: optional RNG seed for reproducible simulation (affects cache key)
	- cache_ttl_s: snapshot TTL in seconds (0 disables caching)
	"""
	cache_key = (int(ponds), int(seed) if seed is not None else None)
	now = time.time()

	if not fresh and cache_ttl_s > 0:
		ts = _DASHBOARD_CACHE_TS.get(cache_key)
		if ts is not None and (now - ts) <= cache_ttl_s:
			cached = _DASHBOARD_CACHE.get(cache_key)
			if cached is not None:
				return cached

	# Optional deterministic seeding for repeatable simulations.
	if seed is not None:
		random.seed(int(seed))
		np.random.seed(int(seed))

	water_quality_agent = WaterQualityAgent()
	feed_agent = FeedPredictionAgent()
	energy_agent = EnergyOptimizationAgent()
	labor_agent = LaborOptimizationAgent()
	manager_agent = ManagerAgent()

	water_quality_data = []
	feed_data = []
	energy_data = []
	labor_data = []

	for pond_id in range(1, ponds + 1):
		wq = water_quality_agent.simulate_water_quality_data(pond_id)
		water_quality_data.append(wq)

		feed = feed_agent.simulate_feed_data(pond_id, wq)
		feed_data.append(feed)

		energy = energy_agent.simulate_energy_data(pond_id, wq)
		energy_data.append(energy)

		labor = labor_agent.simulate_labor_data(pond_id, wq, energy)
		labor_data.append(labor)

	dashboard = manager_agent.create_dashboard(water_quality_data, feed_data, energy_data, labor_data)

	# Include decision-agent outputs (e.g., XGBoost) explicitly for the UI.
	decision_bundle_dump: Optional[Dict[str, Any]] = None
	decision_agent_type = getattr(manager_agent, "decision_agent_type", None)
	decision_recommendations: List[Dict[str, Any]] = []
	try:
		if getattr(manager_agent, "decision_agent", None) and getattr(manager_agent.decision_agent, "is_trained", True):
			decision_bundle = manager_agent.decision_agent.make_multi_pond_decisions(
				water_quality_data, feed_data, energy_data, labor_data
			)
			decision_bundle_dump = decision_bundle.model_dump(mode="json")

			# Human-friendly recommendations derived from decision outputs.
			reco_agent = DecisionRecommendationAgent()
			decision_recommendations = [
				{
					"pond_id": r.pond_id,
					"priority_rank": r.priority_rank,
					"urgency_score": r.urgency_score,
					"confidence": r.confidence,
					"primary_action": r.primary_action.value,
					"text": r.text,
				}
				for r in reco_agent.generate(
					decisions=decision_bundle,
					water_quality=water_quality_data,
					feed=feed_data,
					energy=energy_data,
					labor=labor_data,
					max_items=10,
				)
			]
	except Exception:
		decision_bundle_dump = None

	# Pydantic v2: use model_dump to serialize
	payload = {
		"dashboard": dashboard.model_dump(mode="json"),
		"water_quality": [w.model_dump(mode="json") for w in water_quality_data],
		"feed": [f.model_dump(mode="json") for f in feed_data],
		"energy": [e.model_dump(mode="json") for e in energy_data],
		"labor": [l.model_dump(mode="json") for l in labor_data],
		"decision_agent_type": decision_agent_type,
		"decisions": decision_bundle_dump,
		"decision_recommendations": decision_recommendations,
	}

	if cache_ttl_s > 0:
		_DASHBOARD_CACHE[cache_key] = payload
		_DASHBOARD_CACHE_TS[cache_key] = now

	return payload


