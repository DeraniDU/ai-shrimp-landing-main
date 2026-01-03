from crewai import Agent, Task

# LangChain has moved OpenAI chat models across packages over time.
# Try the modern import first, then fall back for older LangChain versions.
try:
    from langchain_openai import ChatOpenAI  # type: ignore
except Exception:  # pragma: no cover
    from langchain.chat_models import ChatOpenAI  # type: ignore
from models import LaborData, WaterQualityData, EnergyData
from config import OPENAI_API_KEY, OPENAI_MODEL_NAME, OPENAI_TEMPERATURE
import random
from datetime import datetime, timedelta
from typing import List, Dict

class LaborOptimizationAgent:
    def __init__(self):
        # LLM is optional; simulation mode and downstream dashboards should work without an OpenAI key.
        self.llm = None
        self.agent = None

        if OPENAI_API_KEY:
            self.llm = ChatOpenAI(
                openai_api_key=OPENAI_API_KEY,
                model_name=OPENAI_MODEL_NAME,
                temperature=OPENAI_TEMPERATURE,
            )

            self.agent = Agent(
                role="Labor Efficiency Specialist",
                goal="Optimize labor allocation and task scheduling to maximize farm productivity while ensuring worker safety and job satisfaction",
                backstory="""You are a workforce management expert with 8 years of experience in aquaculture operations. 
                You understand the complex scheduling needs of shrimp farming, including feeding, maintenance, 
                monitoring, and emergency response. You can identify inefficiencies and optimize labor allocation.""",
                verbose=True,
                allow_delegation=False,
                llm=self.llm,
            )
    
    def create_labor_optimization_task(self, pond_id: int, water_quality_data: WaterQualityData,
                                     energy_data: EnergyData, current_labor_data: LaborData) -> Task:
        return Task(
            description=f"""
            Analyze and optimize labor allocation for Pond {pond_id}:
            
            Current Labor Status:
            - Tasks Completed: {', '.join(current_labor_data.tasks_completed)}
            - Time Spent: {current_labor_data.time_spent} hours
            - Worker Count: {current_labor_data.worker_count}
            - Efficiency Score: {current_labor_data.efficiency_score}
            - Next Tasks: {', '.join(current_labor_data.next_tasks)}
            
            Farm Conditions:
            - Water Quality: pH={water_quality_data.ph:.2f}, Temp={water_quality_data.temperature:.1f}°C
            - Energy Status: {energy_data.efficiency_score:.2f} efficiency
            - Alerts: {len(water_quality_data.alerts)} active alerts
            
            Optimization Analysis Required:
            1. Analyze current labor efficiency and task completion rates
            2. Identify bottlenecks and inefficiencies in task scheduling
            3. Recommend optimal worker allocation based on farm conditions
            4. Suggest task prioritization based on urgency and impact
            5. Propose automation opportunities to reduce manual labor
            6. Calculate potential productivity improvements
            7. Ensure worker safety and workload balance
            8. Provide scheduling recommendations for next 24-48 hours
            
            Return comprehensive labor optimization plan with scheduling and efficiency recommendations.
            """,
            agent=self.agent,
            expected_output="Detailed labor optimization plan with scheduling, task prioritization, and efficiency improvements"
        )
    
    def simulate_labor_data(self, pond_id: int, water_quality_data: WaterQualityData, 
                           energy_data: EnergyData) -> LaborData:
        """Simulate realistic labor data based on farm conditions"""
        
        # Base tasks that are typically performed
        base_tasks = [
            "Water quality testing",
            "Feed distribution", 
            "Equipment maintenance",
            "Pond cleaning",
            "Shrimp health monitoring",
            "Data recording"
        ]
        
        # Add urgent tasks based on conditions
        urgent_tasks = []
        if water_quality_data.dissolved_oxygen < 5:
            urgent_tasks.append("Emergency aeration check")
        if water_quality_data.ammonia > 0.2:
            urgent_tasks.append("Water exchange")
        if energy_data.efficiency_score < 0.7:
            urgent_tasks.append("Equipment inspection")
        
        # Simulate completed tasks (some base tasks + urgent tasks)
        completed_tasks = random.sample(base_tasks, random.randint(2, 4))
        if urgent_tasks:
            completed_tasks.extend(random.sample(urgent_tasks, min(2, len(urgent_tasks))))
        
        # Calculate time spent based on task complexity and conditions
        base_time = len(completed_tasks) * 0.5  # 30 minutes per task
        urgency_multiplier = 1.0
        
        if urgent_tasks:
            urgency_multiplier += 0.3
        if water_quality_data.status.value in ["poor", "critical"]:
            urgency_multiplier += 0.2
        
        time_spent = base_time * urgency_multiplier
        
        # Determine worker count based on urgency
        worker_count = 1
        if len(urgent_tasks) > 1:
            worker_count = 2
        if water_quality_data.status.value == "critical":
            worker_count = 3
        
        # Calculate efficiency score
        efficiency_score = self._calculate_labor_efficiency(
            completed_tasks, time_spent, worker_count, water_quality_data
        )
        
        # Generate next tasks
        next_tasks = self._generate_next_tasks(water_quality_data, energy_data, completed_tasks)
        
        return LaborData(
            timestamp=datetime.now(),
            pond_id=pond_id,
            tasks_completed=completed_tasks,
            time_spent=time_spent,
            worker_count=worker_count,
            efficiency_score=efficiency_score,
            next_tasks=next_tasks
        )
    
    def _calculate_labor_efficiency(self, completed_tasks: List[str], time_spent: float, 
                                  worker_count: int, water_quality_data: WaterQualityData) -> float:
        """Calculate labor efficiency score"""
        base_score = 0.8
        
        # Task completion efficiency
        if len(completed_tasks) >= 4:
            base_score += 0.1
        elif len(completed_tasks) < 2:
            base_score -= 0.1
        
        # Time efficiency
        expected_time = len(completed_tasks) * 0.5
        if time_spent <= expected_time:
            base_score += 0.05
        elif time_spent > expected_time * 1.5:
            base_score -= 0.1
        
        # Worker allocation efficiency
        if worker_count == 1 and len(completed_tasks) <= 3:
            base_score += 0.05
        elif worker_count > 2 and len(completed_tasks) < 4:
            base_score -= 0.05
        
        # Water quality impact
        if water_quality_data.status.value in ["excellent", "good"]:
            base_score += 0.05
        elif water_quality_data.status.value in ["poor", "critical"]:
            base_score -= 0.1
        
        return min(1.0, max(0.0, base_score))
    
    def _generate_next_tasks(self, water_quality_data: WaterQualityData, 
                           energy_data: EnergyData, completed_tasks: List[str]) -> List[str]:
        """Generate next priority tasks based on current conditions"""
        next_tasks = []
        
        # Regular maintenance tasks
        if "Equipment maintenance" not in completed_tasks:
            next_tasks.append("Equipment maintenance")
        if "Data recording" not in completed_tasks:
            next_tasks.append("Data recording")
        
        # Water quality based tasks
        if water_quality_data.dissolved_oxygen < 5 and "Aeration check" not in completed_tasks:
            next_tasks.append("Aeration check")
        if water_quality_data.ph < 7.5 or water_quality_data.ph > 8.5:
            next_tasks.append("pH adjustment")
        if water_quality_data.ammonia > 0.2:
            next_tasks.append("Water quality treatment")
        
        # Energy efficiency tasks
        if energy_data.efficiency_score < 0.7:
            next_tasks.append("Energy audit")
        if energy_data.aerator_usage > 20:
            next_tasks.append("Aerator optimization")
        
        # Feeding tasks
        next_tasks.append("Next feeding cycle")
        
        # Safety tasks
        next_tasks.append("Safety equipment check")
        
        return next_tasks[:5]  # Limit to 5 next tasks
    
    def generate_optimization_recommendations(self, labor_data: LaborData, 
                                           water_quality_data: WaterQualityData,
                                           energy_data: EnergyData) -> List[Dict]:
        """Generate specific labor optimization recommendations"""
        recommendations = []
        
        # Efficiency improvements
        if labor_data.efficiency_score < 0.7:
            recommendations.append({
                "category": "Efficiency Improvement",
                "priority": "High",
                "recommendation": "Implement task batching and reduce task switching",
                "expected_improvement": "15-20% efficiency gain",
                "implementation": "Low"
            })
        
        # Worker allocation
        if labor_data.worker_count > 2 and len(labor_data.tasks_completed) < 4:
            recommendations.append({
                "category": "Worker Allocation",
                "priority": "Medium", 
                "recommendation": "Optimize worker allocation - consider reducing team size",
                "expected_improvement": "Cost reduction without productivity loss",
                "implementation": "Low"
            })
        
        # Automation opportunities
        if "Water quality testing" in labor_data.tasks_completed:
            recommendations.append({
                "category": "Automation",
                "priority": "Medium",
                "recommendation": "Implement automated water quality monitoring",
                "expected_improvement": "Reduce manual testing by 60%",
                "implementation": "High"
            })
        
        # Scheduling optimization
        if water_quality_data.status.value in ["poor", "critical"]:
            recommendations.append({
                "category": "Scheduling",
                "priority": "High",
                "recommendation": "Implement priority-based task scheduling",
                "expected_improvement": "Faster response to critical issues",
                "implementation": "Medium"
            })
        
        # Training recommendations
        if labor_data.efficiency_score < 0.8:
            recommendations.append({
                "category": "Training",
                "priority": "Medium",
                "recommendation": "Provide additional training on equipment operation",
                "expected_improvement": "Improved task execution speed",
                "implementation": "Medium"
            })
        
        return recommendations
    
    def calculate_productivity_metrics(self, labor_data: LaborData) -> Dict:
        """Calculate productivity metrics and KPIs"""
        tasks_per_hour = len(labor_data.tasks_completed) / max(labor_data.time_spent, 0.1)
        tasks_per_worker = len(labor_data.tasks_completed) / max(labor_data.worker_count, 1)
        
        # Calculate cost efficiency (assuming $15/hour worker cost)
        hourly_cost = labor_data.worker_count * 15
        cost_per_task = (labor_data.time_spent * hourly_cost) / max(len(labor_data.tasks_completed), 1)
        
        return {
            "tasks_per_hour": round(tasks_per_hour, 2),
            "tasks_per_worker": round(tasks_per_worker, 2),
            "cost_per_task": round(cost_per_task, 2),
            "efficiency_score": round(labor_data.efficiency_score, 2),
            "total_labor_cost": round(labor_data.time_spent * hourly_cost, 2)
        }
    
    def generate_work_schedule(self, labor_data: LaborData, water_quality_data: WaterQualityData) -> Dict:
        """Generate optimized work schedule for next 24 hours"""
        schedule = {
            "morning_shift": {
                "time": "06:00-12:00",
                "tasks": ["Water quality testing", "Feed distribution", "Equipment check"],
                "workers": 1 if water_quality_data.status.value in ["excellent", "good"] else 2
            },
            "afternoon_shift": {
                "time": "12:00-18:00", 
                "tasks": ["Data recording", "Maintenance tasks"],
                "workers": 1
            },
            "evening_shift": {
                "time": "18:00-22:00",
                "tasks": ["Final feeding", "Security check"],
                "workers": 1
            }
        }
        
        # Adjust based on water quality
        if water_quality_data.status.value == "critical":
            schedule["morning_shift"]["tasks"].append("Emergency response")
            schedule["morning_shift"]["workers"] = 2
        
        if water_quality_data.dissolved_oxygen < 5:
            schedule["afternoon_shift"]["tasks"].append("Aeration monitoring")
        
        return schedule
