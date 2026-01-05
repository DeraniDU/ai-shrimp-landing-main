#!/usr/bin/env python3
"""
Example: Using AutoGluon Decision Agent with Existing System

This demonstrates how AutoGluon is integrated with the existing agents.
"""

from models import WaterQualityData, FeedData, EnergyData, LaborData, WaterQualityStatus
from models.autogluon_decision_agent import AutoGluonDecisionAgent
from agents.manager_agent import ManagerAgent
from datetime import datetime

def example_integration():
    """Example of AutoGluon integration"""
    
    print("=" * 70)
    print("AutoGluon Integration Example")
    print("=" * 70)
    
    # Check if models are trained
    print("\n1. Checking AutoGluon models...")
    agent = AutoGluonDecisionAgent()
    
    if not agent.is_trained:
        print("\n[WARN] Models not trained yet!")
        print("Train models first:")
        print("  python train_autogluon_models.py")
        return
    
    print("[OK] Models loaded and ready")
    
    # Create sample data
    print("\n2. Creating sample farm data...")
    
    water_quality = [
        WaterQualityData(
            timestamp=datetime.now(),
            pond_id=1,
            ph=7.2,
            temperature=25.0,
            dissolved_oxygen=3.5,  # Critical
            salinity=20.0,
            ammonia=0.35,  # Critical
            nitrite=0.1,
            nitrate=8.0,
            turbidity=3.0,
            status=WaterQualityStatus.CRITICAL,
            alerts=["CRITICAL: Low dissolved oxygen", "CRITICAL: High ammonia"]
        )
    ]
    
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
    
    energy = [
        EnergyData(
            timestamp=datetime.now(),
            pond_id=1,
            aerator_usage=30.0,
            pump_usage=18.0,
            heater_usage=15.0,
            total_energy=63.0,
            cost=7.56,
            efficiency_score=0.65
        )
    ]
    
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
    
    # Make decision with AutoGluon
    print("\n3. Making decision with AutoGluon...")
    decision = agent.make_decision(
        water_quality_data=water_quality,
        feed_data=feed,
        energy_data=energy,
        labor_data=labor,
        pond_id=1
    )
    
    print("\n" + "=" * 70)
    print("AUTOGLUON DECISION OUTPUT")
    print("=" * 70)
    print(f"\nPond ID: {decision.pond_id}")
    print(f"Primary Action: {decision.primary_action.value}")
    print(f"Urgency Score: {decision.urgency_score:.2f}")
    print(f"Priority Rank: {decision.priority_rank}")
    print(f"Confidence: {decision.confidence:.2f}")
    print(f"\nReasoning: {decision.reasoning}")
    print(f"Affected Factors: {', '.join(decision.affected_factors)}")
    
    # Integration with Manager Agent
    print("\n" + "=" * 70)
    print("INTEGRATION WITH MANAGER AGENT")
    print("=" * 70)
    
    manager = ManagerAgent(use_autogluon=True)
    
    if manager.use_autogluon:
        print("\n[OK] Manager Agent using AutoGluon for decisions")
        
        # Create dashboard (will include AutoGluon decisions)
        dashboard = manager.create_dashboard(
            water_quality_data=water_quality,
            feed_data=feed,
            energy_data=energy,
            labor_data=labor
        )
        
        print(f"\nDashboard created with {len(dashboard.recommendations)} recommendations")
        print("\nML-Enhanced Recommendations:")
        for i, rec in enumerate(dashboard.recommendations[-3:], 1):  # Last 3 are ML-based
            print(f"  {i}. {rec}")
    else:
        print("\n[WARN] AutoGluon not enabled in Manager Agent")
    
    print("\n" + "=" * 70)
    print("Example completed!")
    print("=" * 70)


if __name__ == "__main__":
    example_integration()

