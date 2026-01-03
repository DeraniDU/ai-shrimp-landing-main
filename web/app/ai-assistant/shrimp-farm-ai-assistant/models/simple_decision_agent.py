"""
Simple (rule-based) Decision Agent

This provides a lightweight alternative to ML-based agents (AutoGluon / PyTorch).
It implements the same public API used by `ManagerAgent`:
  - make_decision(...)
  - make_multi_pond_decisions(...)

The logic is intentionally transparent and easy to tune via thresholds.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict, Tuple

from config import FARM_CONFIG
from models import WaterQualityData, FeedData, EnergyData, LaborData
from models.decision_outputs import DecisionOutput, MultiPondDecision, ActionType


@dataclass(frozen=True)
class _OptimalTargets:
    ph_min: float
    ph_max: float
    temp_min: float
    temp_max: float
    do_min: float


class SimpleDecisionAgent:
    """
    A simple, deterministic decision agent based on domain heuristics.

    Notes:
    - No training required.
    - `confidence` reflects rule strength, not statistical probability.
    """

    def __init__(self):
        ph_min, ph_max = FARM_CONFIG.get("optimal_ph_range", (7.5, 8.5))
        t_min, t_max = FARM_CONFIG.get("optimal_temperature_range", (26, 30))
        do_min = float(FARM_CONFIG.get("optimal_dissolved_oxygen", 5.5))
        self.targets = _OptimalTargets(
            ph_min=float(ph_min),
            ph_max=float(ph_max),
            temp_min=float(t_min),
            temp_max=float(t_max),
            do_min=float(do_min),
        )

        # For compatibility with code that checks this flag.
        self.is_trained = True

    def make_decision(
        self,
        water_quality_data: List[WaterQualityData],
        feed_data: List[FeedData],
        energy_data: List[EnergyData],
        labor_data: List[LaborData],
        pond_id: Optional[int] = None,
    ) -> DecisionOutput:
        if not water_quality_data or not feed_data or not energy_data or not labor_data:
            raise ValueError("All data lists must be non-empty")

        if pond_id is None:
            pond_id = water_quality_data[0].pond_id

        wq = next((w for w in water_quality_data if w.pond_id == pond_id), water_quality_data[0])
        feed = next((f for f in feed_data if f.pond_id == pond_id), feed_data[0])
        energy = next((e for e in energy_data if e.pond_id == pond_id), energy_data[0])
        labor = next((l for l in labor_data if l.pond_id == pond_id), labor_data[0])

        urgency, reasons, affected = self._score_urgency(wq, energy, labor)
        primary_action, secondary_actions = self._select_actions(wq, feed, energy, labor, urgency)

        recommended_feed_amount = self._recommended_feed_per_serving_g(wq, feed)
        aerator_level, pump_level, heater_level = self._recommended_equipment_levels(wq)

        confidence = self._rule_confidence(wq, urgency, primary_action)

        return DecisionOutput(
            timestamp=datetime.now(),
            pond_id=pond_id,
            primary_action=primary_action,
            action_intensity=urgency,
            secondary_actions=secondary_actions,
            priority_rank=1,  # overwritten in multi-pond pass
            urgency_score=urgency,
            recommended_feed_amount=recommended_feed_amount,
            recommended_aerator_level=aerator_level,
            recommended_pump_level=pump_level,
            recommended_heater_level=heater_level,
            confidence=confidence,
            reasoning=" ".join(reasons).strip(),
            affected_factors=affected,
        )

    def make_multi_pond_decisions(
        self,
        water_quality_data: List[WaterQualityData],
        feed_data: List[FeedData],
        energy_data: List[EnergyData],
        labor_data: List[LaborData],
    ) -> MultiPondDecision:
        decisions: Dict[int, DecisionOutput] = {}

        pond_ids = [wq.pond_id for wq in water_quality_data]
        for pond_id in pond_ids:
            decisions[pond_id] = self.make_decision(
                water_quality_data=water_quality_data,
                feed_data=feed_data,
                energy_data=energy_data,
                labor_data=labor_data,
                pond_id=pond_id,
            )

        # Assign priority ranks: 1 = most urgent
        urgency_sorted = sorted(decisions.items(), key=lambda kv: kv[1].urgency_score, reverse=True)
        pond_priorities: Dict[int, int] = {}
        for rank, (pond_id, decision) in enumerate(urgency_sorted, start=1):
            # Be robust across pydantic v1/v2: avoid relying on in-place mutation.
            try:
                decisions[pond_id] = decision.model_copy(update={"priority_rank": rank})  # pydantic v2
            except Exception:
                try:
                    decisions[pond_id] = decision.copy(update={"priority_rank": rank})  # pydantic v1
                except Exception:
                    decision.priority_rank = rank  # last resort
                    decisions[pond_id] = decision
            pond_priorities[pond_id] = rank

        urgent_ponds = [pid for pid, d in decisions.items() if d.urgency_score > 0.7]
        overall_urgency = max((d.urgency_score for d in decisions.values()), default=0.0)

        total_urgency = sum(d.urgency_score for d in decisions.values())
        resource_allocation: Dict[str, float] = {}
        if total_urgency > 0:
            for pond_id, decision in decisions.items():
                resource_allocation[f"pond_{pond_id}"] = decision.urgency_score / total_urgency

        return MultiPondDecision(
            timestamp=datetime.now(),
            pond_priorities=pond_priorities,
            urgent_ponds=urgent_ponds,
            recommended_actions=decisions,
            overall_urgency=overall_urgency,
            resource_allocation=resource_allocation,
        )

    # -----------------------
    # Heuristics (tunable)
    # -----------------------

    def _score_urgency(
        self, wq: WaterQualityData, energy: EnergyData, labor: LaborData
    ) -> Tuple[float, List[str], List[str]]:
        reasons: List[str] = []
        affected: List[str] = []

        urgency = 0.0

        # Water-quality status (coarse)
        status_weight = {
            "excellent": 0.0,
            "good": 0.05,
            "fair": 0.2,
            "poor": 0.4,
            "critical": 0.65,
        }.get(wq.status.value, 0.2)
        if status_weight > 0:
            urgency += status_weight
            reasons.append(f"Water quality status: {wq.status.value}.")
            affected.append("Water Quality")

        # Dissolved oxygen
        if wq.dissolved_oxygen < self.targets.do_min:
            delta = self.targets.do_min - wq.dissolved_oxygen
            bump = min(0.5, (delta / self.targets.do_min) * 0.5)
            urgency += bump
            reasons.append(f"Low dissolved oxygen ({wq.dissolved_oxygen:.1f} mg/L).")
            affected.append("Dissolved Oxygen")

        # Ammonia
        if wq.ammonia > 0.2:
            bump = min(0.5, ((wq.ammonia - 0.2) / 0.8) * 0.5)
            urgency += bump
            reasons.append(f"High ammonia ({wq.ammonia:.2f} mg/L).")
            affected.append("Ammonia Levels")

        # Temperature
        if wq.temperature < self.targets.temp_min or wq.temperature > self.targets.temp_max:
            nearest = self.targets.temp_min if wq.temperature < self.targets.temp_min else self.targets.temp_max
            delta = abs(wq.temperature - nearest)
            bump = min(0.3, (delta / 10.0) * 0.3)
            urgency += bump
            reasons.append(f"Temperature out of range ({wq.temperature:.1f}°C).")
            affected.append("Temperature")

        # Energy / labor (lower weight)
        if energy.efficiency_score < 0.7:
            bump = min(0.2, (0.7 - energy.efficiency_score) * 0.4)
            urgency += bump
            reasons.append(f"Low energy efficiency ({energy.efficiency_score:.2f}).")
            affected.append("Energy Efficiency")

        if labor.efficiency_score < 0.7:
            bump = min(0.2, (0.7 - labor.efficiency_score) * 0.4)
            urgency += bump
            reasons.append(f"Low labor efficiency ({labor.efficiency_score:.2f}).")
            affected.append("Labor Efficiency")

        # Hard clamps and minor smoothing
        urgency = max(0.0, min(1.0, urgency))

        if not reasons:
            reasons = ["Normal operating conditions."]
        if not affected:
            affected = ["Normal Operations"]
        else:
            # de-dupe while preserving order
            seen = set()
            affected = [x for x in affected if not (x in seen or seen.add(x))]

        return urgency, reasons, affected

    def _select_actions(
        self,
        wq: WaterQualityData,
        feed: FeedData,
        energy: EnergyData,
        labor: LaborData,
        urgency: float,
    ) -> Tuple[ActionType, List[ActionType]]:
        secondary: List[ActionType] = []

        # Emergency triggers
        if wq.status.value == "critical" or wq.dissolved_oxygen < 3.0 or wq.ammonia > 0.5 or urgency > 0.9:
            if wq.dissolved_oxygen < self.targets.do_min:
                secondary.append(ActionType.INCREASE_AERATION)
            if wq.ammonia > 0.2 or wq.nitrite > 0.2:
                secondary.append(ActionType.WATER_EXCHANGE)
            return ActionType.EMERGENCY_RESPONSE, secondary

        # Water quality interventions
        if wq.dissolved_oxygen < self.targets.do_min:
            if wq.ammonia > 0.2 or wq.nitrite > 0.2 or wq.turbidity > 8.0:
                secondary.append(ActionType.WATER_EXCHANGE)
            if wq.ammonia > 0.2:
                secondary.append(ActionType.ADJUST_FEED)
            return ActionType.INCREASE_AERATION, secondary

        if wq.ammonia > 0.2 or wq.nitrite > 0.2 or wq.turbidity > 8.0:
            if wq.ammonia > 0.2:
                secondary.append(ActionType.ADJUST_FEED)
            return ActionType.WATER_EXCHANGE, secondary

        # Feed tuning (only when water is otherwise OK)
        if (wq.temperature < 26 or wq.temperature > 30 or wq.ph < self.targets.ph_min or wq.ph > self.targets.ph_max) and urgency > 0.4:
            return ActionType.ADJUST_FEED, secondary

        # Operational follow-ups
        if energy.efficiency_score < 0.6:
            return ActionType.EQUIPMENT_MAINTENANCE, secondary

        if labor.efficiency_score < 0.6 or (labor.next_tasks and len(labor.next_tasks) >= 3):
            return ActionType.ALLOCATE_WORKERS, secondary

        # If only mild deviations exist, monitor
        if urgency > 0.25:
            return ActionType.MONITOR_CLOSELY, secondary

        return ActionType.NO_ACTION, secondary

    def _recommended_equipment_levels(self, wq: WaterQualityData) -> Tuple[float, float, float]:
        # Aerator level reacts to DO
        aerator_level = 0.5
        if wq.dissolved_oxygen < self.targets.do_min:
            aerator_level = min(1.0, 0.5 + (self.targets.do_min - wq.dissolved_oxygen) / self.targets.do_min)
        elif wq.dissolved_oxygen > self.targets.do_min + 1.5:
            aerator_level = max(0.3, 0.5 - (wq.dissolved_oxygen - (self.targets.do_min + 1.5)) / 6.0)

        # Pump level reacts to ammonia / turbidity
        pump_level = 0.5
        if wq.ammonia > 0.2:
            pump_level = min(1.0, 0.5 + (wq.ammonia - 0.2) * 2.0)
        if wq.turbidity > 8.0:
            pump_level = min(1.0, max(pump_level, 0.75))

        # Heater level reacts to low temperature (no action enum for heating; we encode via level)
        heater_level = 0.0
        if wq.temperature < self.targets.temp_min:
            heater_level = min(1.0, (self.targets.temp_min - wq.temperature) / 5.0)

        return float(aerator_level), float(pump_level), float(heater_level)

    def _recommended_feed_per_serving_g(self, wq: WaterQualityData, feed: FeedData) -> float:
        biomass_kg = (feed.shrimp_count * feed.average_weight) / 1000.0

        # Simple feed-rate schedule by size (daily feed % of biomass)
        if feed.average_weight < 10:
            base_feed_rate = 0.05
        elif feed.average_weight < 15:
            base_feed_rate = 0.04
        else:
            base_feed_rate = 0.03

        daily_feed_g = biomass_kg * base_feed_rate * 1000.0

        # Adjust for water quality (mirrors FeedPredictionAgent, but deterministic)
        adj = 1.0
        if wq.temperature < 26:
            adj *= 0.8
        elif wq.temperature > 30:
            adj *= 0.9
        if wq.dissolved_oxygen < 5.0:
            adj *= 0.7
        if wq.ph < self.targets.ph_min or wq.ph > self.targets.ph_max:
            adj *= 0.9
        if wq.ammonia > 0.2:
            adj *= 0.6

        adj = max(0.5, min(1.2, adj))
        servings = max(1, int(feed.feeding_frequency))
        return float(max(0.0, (daily_feed_g * adj) / servings))

    def _rule_confidence(self, wq: WaterQualityData, urgency: float, action: ActionType) -> float:
        # Higher confidence when rules are unambiguous (critical water metrics).
        if action == ActionType.EMERGENCY_RESPONSE:
            return 0.95
        if action in (ActionType.INCREASE_AERATION, ActionType.WATER_EXCHANGE) and (
            wq.dissolved_oxygen < self.targets.do_min or wq.ammonia > 0.2
        ):
            return 0.9
        # Otherwise confidence tracks urgency modestly
        return float(max(0.6, min(0.85, 0.6 + urgency * 0.25)))


