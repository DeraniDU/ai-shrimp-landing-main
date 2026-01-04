#!/usr/bin/env python3
"""
Example: Using the Decision Model

This script demonstrates how to use the trained decision model
to make decisions based on farm data.
"""

from models.decision_integration import DecisionAgent
from models import WaterQualityData, FeedData, EnergyData, LaborData, WaterQualityStatus
from datetime import datetime

def example_usage():
    """Example of using the decision model"""
    
    print("=" * 70)
    print("Decision Model Usage Example")
    print("=" * 70)
    
    # Create decision agent
    print("\n1. Loading decision model...")
    agent = DecisionAgent(model_path='models/decision_model.pth')
    
    # Create sample data (simulating a critical situation)
    print("\n2. Creating sample farm data...")
    
    # Water quality - critical situation
    water_quality = [
        WaterQualityData(
            timestamp=datetime.now(),
            pond_id=1,
            ph=7.2,
            temperature=25.0,
            dissolved_oxygen=3.5,  # Critical - too low
            salinity=20.0,
            ammonia=0.35,  # Critical - too high
            nitrite=0.1,
            nitrate=8.0,
            turbidity=3.0,
            status=WaterQualityStatus.CRITICAL,
            alerts=["CRITICAL: Low dissolved oxygen", "CRITICAL: High ammonia"]
        )
    ]
    
    # Feed data
    feed = [
        FeedData(
            timestamp=datetime.now(),
            pond_id=1,
            shrimp_count=10000,
            average_weight=12.0,
            feed_amount=15.0,
            feed_type="Grower Feed (35% protein)",
            feeding_frequency=3,
            predicted_next_feeding=datetime.now()
        )
    ]
    
    # Energy data
    energy = [
        EnergyData(
            timestamp=datetime.now(),
            pond_id=1,
            aerator_usage=30.0,  # High due to low DO
            pump_usage=18.0,
            heater_usage=15.0,
            total_energy=63.0,
            cost=7.56,
            efficiency_score=0.65  # Low efficiency
        )
    ]
    
    # Labor data
    labor = [
        LaborData(
            timestamp=datetime.now(),
            pond_id=1,
            tasks_completed=["Water testing", "Emergency aeration"],
            time_spent=3.0,
            worker_count=2,
            efficiency_score=0.7,
            next_tasks=["Monitor DO levels", "Water exchange"]
        )
    ]
    
    # Make decision
    print("\n3. Making decision based on farm data...")
    decision = agent.make_decision(
        water_quality_data=water_quality,
        feed_data=feed,
        energy_data=energy,
        labor_data=labor,
        pond_id=1
    )
    
    # Display decision
    print("\n" + "=" * 70)
    print("DECISION OUTPUT")
    print("=" * 70)
    print(f"\nPond ID: {decision.pond_id}")
    print(f"Timestamp: {decision.timestamp}")
    print(f"\nPrimary Action: {decision.primary_action.value}")
    print(f"Action Intensity: {decision.action_intensity:.2f}")
    print(f"Urgency Score: {decision.urgency_score:.2f} ({'HIGH' if decision.urgency_score > 0.7 else 'MEDIUM' if decision.urgency_score > 0.4 else 'LOW'})")
    print(f"Priority Rank: {decision.priority_rank}")
    print(f"Confidence: {decision.confidence:.2f}")
    
    print(f"\nRecommendations:")
    if decision.recommended_feed_amount:
        print(f"  - Feed Amount: {decision.recommended_feed_amount:.2f} grams")
    if decision.recommended_aerator_level:
        print(f"  - Aerator Level: {decision.recommended_aerator_level:.2f} ({decision.recommended_aerator_level*100:.0f}%)")
    if decision.recommended_pump_level:
        print(f"  - Pump Level: {decision.recommended_pump_level:.2f} ({decision.recommended_pump_level*100:.0f}%)")
    if decision.recommended_heater_level:
        print(f"  - Heater Level: {decision.recommended_heater_level:.2f} ({decision.recommended_heater_level*100:.0f}%)")
    
    print(f"\nReasoning: {decision.reasoning}")
    print(f"\nAffected Factors: {', '.join(decision.affected_factors)}")
    
    if decision.secondary_actions:
        print(f"\nSecondary Actions: {[a.value for a in decision.secondary_actions]}")
    
    # Example with multiple ponds
    print("\n" + "=" * 70)
    print("MULTI-POND DECISION EXAMPLE")
    print("=" * 70)
    
    # Add second pond with good conditions
    water_quality.append(
        WaterQualityData(
            timestamp=datetime.now(),
            pond_id=2,
            ph=8.0,
            temperature=28.0,
            dissolved_oxygen=6.5,
            salinity=20.0,
            ammonia=0.1,
            nitrite=0.05,
            nitrate=5.0,
            turbidity=2.0,
            status=WaterQualityStatus.EXCELLENT,
            alerts=[]
        )
    )
    
    feed.append(
        FeedData(
            timestamp=datetime.now(),
            pond_id=2,
            shrimp_count=9500,
            average_weight=13.0,
            feed_amount=18.0,
            feed_type="Grower Feed (35% protein)",
            feeding_frequency=3,
            predicted_next_feeding=datetime.now()
        )
    )
    
    energy.append(
        EnergyData(
            timestamp=datetime.now(),
            pond_id=2,
            aerator_usage=18.0,
            pump_usage=10.0,
            heater_usage=5.0,
            total_energy=33.0,
            cost=3.96,
            efficiency_score=0.92
        )
    )
    
    labor.append(
        LaborData(
            timestamp=datetime.now(),
            pond_id=2,
            tasks_completed=["Water testing", "Feed distribution"],
            time_spent=1.5,
            worker_count=1,
            efficiency_score=0.9,
            next_tasks=["Regular monitoring"]
        )
    )
    
    # Make multi-pond decision
    multi_decision = agent.make_multi_pond_decisions(
        water_quality_data=water_quality,
        feed_data=feed,
        energy_data=energy,
        labor_data=labor
    )
    
    print(f"\nOverall Urgency: {multi_decision.overall_urgency:.2f}")
    print(f"\nPond Priorities:")
    for pond_id, priority in multi_decision.pond_priorities.items():
        print(f"  Pond {pond_id}: Priority {priority}")
    
    print(f"\nUrgent Ponds: {multi_decision.urgent_ponds}")
    
    print(f"\nResource Allocation:")
    for resource, allocation in multi_decision.resource_allocation.items():
        print(f"  {resource}: {allocation*100:.1f}%")
    
    print("\n" + "=" * 70)
    print("Example completed!")
    print("=" * 70)


if __name__ == "__main__":
    example_usage()

