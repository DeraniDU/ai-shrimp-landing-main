#!/usr/bin/env python3
"""
Demo script for the Shrimp Farm Management System
This script demonstrates the multi-agent system without requiring OpenAI API key
"""

import json
from datetime import datetime
from typing import List, Dict, Any

# Simulate the data models
class WaterQualityData:
    def __init__(self, pond_id: int, ph: float, temperature: float, 
                 dissolved_oxygen: float, salinity: float, status: str):
        self.pond_id = pond_id
        self.ph = ph
        self.temperature = temperature
        self.dissolved_oxygen = dissolved_oxygen
        self.salinity = salinity
        self.status = status
        self.alerts = []

class FeedData:
    def __init__(self, pond_id: int, shrimp_count: int, average_weight: float, 
                 feed_amount: float, feed_type: str, feeding_frequency: int):
        self.pond_id = pond_id
        self.shrimp_count = shrimp_count
        self.average_weight = average_weight
        self.feed_amount = feed_amount
        self.feed_type = feed_type
        self.feeding_frequency = feeding_frequency

class EnergyData:
    def __init__(self, pond_id: int, total_energy: float, cost: float, efficiency_score: float):
        self.pond_id = pond_id
        self.total_energy = total_energy
        self.cost = cost
        self.efficiency_score = efficiency_score

class LaborData:
    def __init__(self, pond_id: int, tasks_completed: List[str], time_spent: float, 
                 worker_count: int, efficiency_score: float):
        self.pond_id = pond_id
        self.tasks_completed = tasks_completed
        self.time_spent = time_spent
        self.worker_count = worker_count
        self.efficiency_score = efficiency_score

def simulate_farm_data():
    """Simulate realistic farm data for demonstration"""
    print("Shrimp Farm Management System - Demo")
    print("=" * 50)
    
    # Simulate water quality data
    water_quality_data = []
    for pond_id in range(1, 5):
        # Simulate some variation in water quality
        ph = 7.8 + (pond_id - 2) * 0.2
        temperature = 28.0 + (pond_id - 2) * 0.5
        dissolved_oxygen = 6.0 - (pond_id - 2) * 0.3
        salinity = 20.0 + (pond_id - 2) * 1.0
        
        # Determine status
        if dissolved_oxygen < 5 or ph < 7.5 or ph > 8.5:
            status = "critical" if dissolved_oxygen < 4 else "poor"
        elif dissolved_oxygen < 6:
            status = "fair"
        else:
            status = "good"
        
        wq_data = WaterQualityData(pond_id, ph, temperature, dissolved_oxygen, salinity, status)
        
        # Add alerts for critical conditions
        if status in ["poor", "critical"]:
            wq_data.alerts = [f"Low dissolved oxygen: {dissolved_oxygen:.1f} mg/L"]
        
        water_quality_data.append(wq_data)
    
    # Simulate feed data
    feed_data = []
    for pond_id in range(1, 5):
        shrimp_count = 10000 + (pond_id - 1) * 500
        average_weight = 10.0 + (pond_id - 1) * 2.0
        feed_amount = 150.0 + (pond_id - 1) * 25.0
        feed_type = "Grower Feed" if average_weight < 15 else "Developer Feed"
        feeding_frequency = 3
        
        feed_data.append(FeedData(pond_id, shrimp_count, average_weight, feed_amount, feed_type, feeding_frequency))
    
    # Simulate energy data
    energy_data = []
    for pond_id in range(1, 5):
        total_energy = 25.0 + (pond_id - 1) * 5.0
        cost = total_energy * 0.12  # $0.12 per kWh
        efficiency_score = 0.8 - (pond_id - 1) * 0.05
        
        energy_data.append(EnergyData(pond_id, total_energy, cost, efficiency_score))
    
    # Simulate labor data
    labor_data = []
    for pond_id in range(1, 5):
        tasks = ["Water quality testing", "Feed distribution", "Equipment maintenance"]
        if pond_id == 2:  # Pond 2 has more tasks
            tasks.append("Emergency aeration check")
        if pond_id == 4:  # Pond 4 has critical issues
            tasks.append("Water exchange")
        
        time_spent = 2.0 + (pond_id - 1) * 0.5
        worker_count = 1 if pond_id <= 2 else 2
        efficiency_score = 0.85 - (pond_id - 1) * 0.05
        
        labor_data.append(LaborData(pond_id, tasks, time_spent, worker_count, efficiency_score))
    
    return water_quality_data, feed_data, energy_data, labor_data

def display_farm_status(water_quality_data, feed_data, energy_data, labor_data):
    """Display comprehensive farm status"""
    print("\nFARM STATUS OVERVIEW")
    print("=" * 50)
    
    # Water Quality Summary
    print("\nWATER QUALITY STATUS:")
    for data in water_quality_data:
        print(f"  Pond {data.pond_id}: {data.status.upper()}")
        print(f"    pH: {data.ph:.2f}, Temp: {data.temperature:.1f}°C, DO: {data.dissolved_oxygen:.1f} mg/L")
        if data.alerts:
            for alert in data.alerts:
                print(f"    WARNING: {alert}")
    
    # Feed Management Summary
    print("\nFEED MANAGEMENT:")
    for data in feed_data:
        print(f"  Pond {data.pond_id}: {data.shrimp_count:,} shrimp, {data.average_weight:.1f}g avg")
        print(f"    Feed: {data.feed_amount:.1f}g, Type: {data.feed_type}, {data.feeding_frequency}x/day")
    
    # Energy Usage Summary
    print("\nENERGY MANAGEMENT:")
    total_cost = 0
    for data in energy_data:
        print(f"  Pond {data.pond_id}: {data.total_energy:.1f} kWh, ${data.cost:.2f}, {data.efficiency_score:.2f} efficiency")
        total_cost += data.cost
    print(f"  Total Daily Cost: ${total_cost:.2f}")
    
    # Labor Summary
    print("\nLABOR MANAGEMENT:")
    for data in labor_data:
        print(f"  Pond {data.pond_id}: {len(data.tasks_completed)} tasks, {data.time_spent:.1f}h, {data.worker_count} workers")
        print(f"    Efficiency: {data.efficiency_score:.2f}")
        print(f"    Tasks: {', '.join(data.tasks_completed)}")
    
    # Overall Health Score
    avg_water_score = sum(0.8 if data.status == "good" else 0.6 if data.status == "fair" else 0.4 for data in water_quality_data) / len(water_quality_data)
    avg_energy_score = sum(data.efficiency_score for data in energy_data) / len(energy_data)
    avg_labor_score = sum(data.efficiency_score for data in labor_data) / len(labor_data)
    overall_health = (avg_water_score + avg_energy_score + avg_labor_score) / 3
    
    print(f"\nOVERALL FARM HEALTH: {overall_health:.2f}")
    health_status = "EXCELLENT" if overall_health > 0.8 else "GOOD" if overall_health > 0.6 else "NEEDS ATTENTION"
    print(f"Status: {health_status}")

def generate_recommendations(water_quality_data, energy_data, labor_data):
    """Generate AI-powered recommendations"""
    print("\nAI RECOMMENDATIONS:")
    print("=" * 50)
    
    recommendations = []
    
    # Water quality recommendations
    critical_ponds = [data for data in water_quality_data if data.status in ["poor", "critical"]]
    if critical_ponds:
        recommendations.append(f"CRITICAL: Immediate action required for {len(critical_ponds)} pond(s)")
        for data in critical_ponds:
            recommendations.append(f"   - Pond {data.pond_id}: Increase aeration, check pH levels")
    
    # Energy optimization recommendations
    low_energy_ponds = [data for data in energy_data if data.efficiency_score < 0.7]
    if low_energy_ponds:
        recommendations.append(f"ENERGY: Optimize energy usage in {len(low_energy_ponds)} pond(s)")
        for data in low_energy_ponds:
            recommendations.append(f"   - Pond {data.pond_id}: Review equipment scheduling, consider automation")
    
    # Labor optimization recommendations
    low_labor_ponds = [data for data in labor_data if data.efficiency_score < 0.7]
    if low_labor_ponds:
        recommendations.append(f"LABOR: Improve efficiency in {len(low_labor_ponds)} pond(s)")
        for data in low_labor_ponds:
            recommendations.append(f"   - Pond {data.pond_id}: Optimize task allocation, consider training")
    
    # General recommendations
    recommendations.append("MONITORING: Implement real-time IoT sensors for continuous monitoring")
    recommendations.append("AUTOMATION: Consider automated feeding and aeration systems")
    recommendations.append("ANALYTICS: Set up predictive analytics for proactive management")
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}")

def save_demo_data(water_quality_data, feed_data, energy_data, labor_data):
    """Save demo data to JSON file"""
    demo_data = {
        "timestamp": datetime.now().isoformat(),
        "water_quality": [
            {
                "pond_id": data.pond_id,
                "ph": data.ph,
                "temperature": data.temperature,
                "dissolved_oxygen": data.dissolved_oxygen,
                "salinity": data.salinity,
                "status": data.status,
                "alerts": data.alerts
            }
            for data in water_quality_data
        ],
        "feed": [
            {
                "pond_id": data.pond_id,
                "shrimp_count": data.shrimp_count,
                "average_weight": data.average_weight,
                "feed_amount": data.feed_amount,
                "feed_type": data.feed_type,
                "feeding_frequency": data.feeding_frequency
            }
            for data in feed_data
        ],
        "energy": [
            {
                "pond_id": data.pond_id,
                "total_energy": data.total_energy,
                "cost": data.cost,
                "efficiency_score": data.efficiency_score
            }
            for data in energy_data
        ],
        "labor": [
            {
                "pond_id": data.pond_id,
                "tasks_completed": data.tasks_completed,
                "time_spent": data.time_spent,
                "worker_count": data.worker_count,
                "efficiency_score": data.efficiency_score
            }
            for data in labor_data
        ]
    }
    
    filename = f"demo_farm_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(demo_data, f, indent=2)
    
    print(f"\nDemo data saved to: {filename}")

def main():
    """Main demo function"""
    print("AI AGENT COORDINATION DEMO")
    print("This demonstrates how multiple AI agents work together:")
    print("1. Water Quality Agent - Monitors water parameters")
    print("2. Feed Prediction Agent - Optimizes feeding schedules") 
    print("3. Energy Optimization Agent - Manages energy usage")
    print("4. Labor Optimization Agent - Schedules tasks efficiently")
    print("5. Manager Agent - Coordinates all agents and provides insights")
    print()
    
    # Simulate data collection from all agents
    print("Collecting data from all AI agents...")
    water_quality_data, feed_data, energy_data, labor_data = simulate_farm_data()
    
    # Display comprehensive farm status
    display_farm_status(water_quality_data, feed_data, energy_data, labor_data)
    
    # Generate AI recommendations
    generate_recommendations(water_quality_data, energy_data, labor_data)
    
    # Save demo data
    save_demo_data(water_quality_data, feed_data, energy_data, labor_data)
    
    print("\nDemo completed successfully!")
    print("\nTo run the full system with real AI agents:")
    print("1. Set up your OpenAI API key")
    print("2. Run: python main.py")
    print("3. Or launch dashboard: python run_dashboard.py")

if __name__ == "__main__":
    main()
