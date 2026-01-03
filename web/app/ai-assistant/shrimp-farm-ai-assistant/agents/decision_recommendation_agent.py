"""
Decision Recommendation Agent

Consumes DecisionOutput / MultiPondDecision (e.g., from XGBoostDecisionAgent)
and produces actionable, human-readable recommendations.

Design goals:
- Works without any LLM / API key (rule-based templating).
- Optional LLM enhancement can be added later; keep the interface stable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from models import WaterQualityData, FeedData, EnergyData, LaborData
from models.decision_outputs import ActionType, MultiPondDecision, DecisionOutput


@dataclass(frozen=True)
class DecisionRecommendation:
    pond_id: int
    priority_rank: int
    urgency_score: float
    confidence: float
    primary_action: ActionType
    text: str


class DecisionRecommendationAgent:
    """
    Convert decision-agent outputs into operational recommendations.
    """

    def generate(
        self,
        decisions: MultiPondDecision,
        water_quality: List[WaterQualityData],
        feed: List[FeedData],
        energy: List[EnergyData],
        labor: List[LaborData],
        max_items: int = 10,
    ) -> List[DecisionRecommendation]:
        by_pond = decisions.recommended_actions
        rows: List[DecisionRecommendation] = []

        # Sort by priority (1 = most urgent)
        ordered = sorted(by_pond.values(), key=lambda d: (d.priority_rank, -d.urgency_score))
        for d in ordered[: max_items if max_items > 0 else len(ordered)]:
            wq = next((w for w in water_quality if w.pond_id == d.pond_id), None)
            f = next((x for x in feed if x.pond_id == d.pond_id), None)
            e = next((x for x in energy if x.pond_id == d.pond_id), None)
            l = next((x for x in labor if x.pond_id == d.pond_id), None)

            rows.append(
                DecisionRecommendation(
                    pond_id=d.pond_id,
                    priority_rank=d.priority_rank,
                    urgency_score=float(d.urgency_score),
                    confidence=float(d.confidence),
                    primary_action=d.primary_action,
                    text=self._recommendation_text(d, wq=wq, feed=f, energy=e, labor=l),
                )
            )
        return rows

    def _recommendation_text(
        self,
        d: DecisionOutput,
        wq: Optional[WaterQualityData],
        feed: Optional[FeedData],
        energy: Optional[EnergyData],
        labor: Optional[LaborData],
    ) -> str:
        # Core template
        prefix = f"Pond {d.pond_id} (P{d.priority_rank}, urgency {d.urgency_score:.2f}, conf {d.confidence:.2f}): "

        # Action-specific recommendations
        if d.primary_action == ActionType.EMERGENCY_RESPONSE:
            parts = ["EMERGENCY response."]
            if wq and wq.dissolved_oxygen < 5.0:
                parts.append(f"Increase aeration immediately (DO={wq.dissolved_oxygen:.1f}).")
            if wq and wq.ammonia > 0.2:
                parts.append(f"Plan water exchange (NH3={wq.ammonia:.2f}).")
            parts.append("Re-test water in 30–60 minutes.")
            return prefix + " ".join(parts)

        if d.primary_action == ActionType.INCREASE_AERATION:
            if wq:
                return prefix + f"Increase aeration to raise dissolved oxygen (DO={wq.dissolved_oxygen:.1f} mg/L). Recheck in 1–2 hours."
            return prefix + "Increase aeration and monitor dissolved oxygen."

        if d.primary_action == ActionType.WATER_EXCHANGE:
            if wq:
                return prefix + f"Perform partial water exchange to reduce toxins (NH3={wq.ammonia:.2f}, NO2={wq.nitrite:.2f}). Recheck ammonia/nitrite."
            return prefix + "Perform partial water exchange and recheck ammonia/nitrite."

        if d.primary_action == ActionType.ADJUST_FEED:
            # Keep it simple: recommend reducing feed under stress.
            if wq and (wq.ammonia > 0.2 or wq.dissolved_oxygen < 5.0):
                return prefix + "Reduce feed 10–30% until water parameters stabilize (low DO / elevated ammonia)."
            if feed:
                return prefix + f"Adjust feeding schedule/amount based on conditions. Current feed per serving: {feed.feed_amount:.1f} g."
            return prefix + "Adjust feeding schedule/amount based on conditions."

        if d.primary_action == ActionType.ALLOCATE_WORKERS:
            if labor:
                return prefix + f"Allocate workers to priority tasks. Pending tasks: {len(labor.next_tasks)}; workers: {labor.worker_count}."
            return prefix + "Allocate workers to priority tasks."

        if d.primary_action == ActionType.MONITOR_CLOSELY:
            if wq:
                return prefix + f"Monitor closely (status={wq.status.value}). Re-test DO/ammonia and watch for trend changes."
            return prefix + "Monitor closely and re-test key parameters."

        # NO_ACTION / any other
        return prefix + "No immediate action; continue routine monitoring."




