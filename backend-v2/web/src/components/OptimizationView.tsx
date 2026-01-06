import { Bar, Line } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
	LineElement,
	PointElement,
	Filler,
 		RadialLinearScale,
	type ChartOptions
} from 'chart.js'
import { useState } from 'react'
import type { DashboardApiResponse, SavedFarmSnapshot } from '../lib/types'
import { formatNumber, formatDateTime } from '../lib/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend, RadialLinearScale)

type Props = {
	data: DashboardApiResponse
	history: SavedFarmSnapshot[]
	pondFilter: number | null
}

// Circular Progress Component
function CircularProgress({ percentage, size = 120, strokeWidth = 12, color = '#16a34a' }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
	const radius = (size - strokeWidth) / 2
	const circumference = radius * 2 * Math.PI
	const offset = circumference - (percentage / 100) * circumference

	return (
		<div style={{ position: 'relative', width: size, height: size }}>
			<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="rgba(17, 24, 39, 0.1)"
					strokeWidth={strokeWidth}
					fill="none"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="none"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					style={{ transition: 'stroke-dashoffset 0.5s ease' }}
				/>
			</svg>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					textAlign: 'center'
				}}
			>
				<div style={{ fontSize: size * 0.2, fontWeight: 700, color: color }}>{Math.round(percentage)}%</div>
			</div>
		</div>
	)
}

// Octagonal Progress Component
function OctagonalProgress({ percentage, size = 120, color = '#16a34a' }: { percentage: number; size?: number; color?: string }) {
	const radius = size / 2 - 10
	const centerX = size / 2
	const centerY = size / 2
	const sides = 8
	const angleStep = (2 * Math.PI) / sides
	const points: string[] = []

	for (let i = 0; i < sides; i++) {
		const angle = i * angleStep - Math.PI / 2
		const x = centerX + radius * Math.cos(angle)
		const y = centerY + radius * Math.sin(angle)
		points.push(`${x},${y}`)
	}

	const progressPoints = points.map((p, i) => {
		if (i < (percentage / 100) * sides) return p
		return `${centerX},${centerY}`
	})

	return (
		<div style={{ position: 'relative', width: size, height: size }}>
			<svg width={size} height={size}>
				<polygon points={points.join(' ')} fill="rgba(17, 24, 39, 0.05)" stroke="rgba(17, 24, 39, 0.1)" strokeWidth="2" />
				<polygon points={progressPoints.join(' ')} fill={color} fillOpacity={0.2} stroke={color} strokeWidth="3" />
			</svg>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					textAlign: 'center'
				}}
			>
				<div style={{ fontSize: size * 0.2, fontWeight: 700, color: color }}>{Math.round(percentage)}%</div>
			</div>
		</div>
	)
}

export function OptimizationView({ data, history, pondFilter }: Props) {
	const { dashboard } = data
	const water = pondFilter ? data.water_quality.filter((w) => w.pond_id === pondFilter) : data.water_quality
	const feed = pondFilter ? data.feed.filter((f) => f.pond_id === pondFilter) : data.feed
	const energy = pondFilter ? data.energy.filter((e) => e.pond_id === pondFilter) : data.energy
	const labor = pondFilter ? data.labor.filter((l) => l.pond_id === pondFilter) : data.labor

	const feedEfficiency = dashboard.feed_efficiency
	const energyEfficiency = dashboard.energy_efficiency
	const laborEfficiency = dashboard.labor_efficiency

	// State for interactive elements
	const [costWeight, setCostWeight] = useState(40)
	const [yieldWeight, setYieldWeight] = useState(40)
	const [riskWeight, setRiskWeight] = useState(20)
	const [showExplain, setShowExplain] = useState<number | null>(null)
	const [simulationFeed, setSimulationFeed] = useState(0)
	const [simulationAeration, setSimulationAeration] = useState(0)
	const [simulationHarvestDelay, setSimulationHarvestDelay] = useState(0)

	const totalEnergyCost = energy.reduce((sum, e) => sum + e.cost, 0)
	const totalFeedKg = feed.reduce((sum, f) => f.feed_amount, 0) / 1000
	const feedCostPerKg = 400 // LKR per kg
	const totalFeedCost = totalFeedKg * feedCostPerKg
	const totalLaborCost = labor.reduce((sum, l) => sum + l.time_spent * 500, 0) // Rs. 500/hour estimate

	// Calculate metrics
	const avgWeight = feed.reduce((sum, f) => sum + f.average_weight, 0) / feed.length || 0
	const totalBiomass = feed.reduce((sum, f) => sum + (f.shrimp_count * f.average_weight) / 1000, 0) // kg
	const projectedYieldTons = totalBiomass / 1000
	const shrimpPricePerKg = 2000 // LKR per kg
	const projectedProfit = projectedYieldTons * 1000 * shrimpPricePerKg - (totalFeedCost + totalEnergyCost + totalLaborCost) * 30

	const fcr = totalFeedKg > 0 && totalBiomass > 0 ? totalFeedKg / totalBiomass : 1.2
	const avgFeedAmount = feed.reduce((sum, f) => sum + f.feed_amount, 0) / feed.length || 0
	const recommendedFeedRate = avgFeedAmount * 1.15 // 15% increase

	// Water quality averages
	const avgPh = water.reduce((sum, w) => sum + w.ph, 0) / water.length || 7.5
	const avgSalinity = water.reduce((sum, w) => sum + w.salinity, 0) / water.length || 25
	const avgOxygen = water.reduce((sum, w) => sum + w.dissolved_oxygen, 0) / water.length || 6.5
	const avgTemp = water.reduce((sum, w) => sum + w.temperature, 0) / water.length || 28

	// Energy breakdown
	const totalEnergyKwh = energy.reduce((sum, e) => sum + e.total_energy, 0)
	const aeratorEnergy = totalEnergyKwh * 0.3
	const pumpEnergy = totalEnergyKwh * 0.25
	const feederEnergy = totalEnergyKwh * 0.45

	// Optimization percentages
	const feedOptimized = feedEfficiency * 100
	const waterQualityOptimized = (avgPh > 7.5 && avgPh < 8.5 && avgOxygen > 6 && avgSalinity > 20 && avgSalinity < 30) ? 94 : 85
	const energyEfficient = energyEfficiency * 100

	// Calculate harvest timing recommendations
	const targetHarvestWeight = 25 // grams - typical harvest weight
	const growthRatePerDay = 0.15 // grams per day (estimated)
	const daysToOptimalWeight = avgWeight > 0 && avgWeight < targetHarvestWeight 
		? Math.ceil((targetHarvestWeight - avgWeight) / growthRatePerDay)
		: 0
	
	// Find best pond for harvest (highest weight and good conditions)
	const pondData = feed.map((f, idx) => ({
		pondId: f.pond_id,
		weight: f.average_weight,
		biomass: (f.shrimp_count * f.average_weight) / 1000,
		waterQuality: water.find(w => w.pond_id === f.pond_id),
		daysToHarvest: f.average_weight > 0 && f.average_weight < targetHarvestWeight
			? Math.ceil((targetHarvestWeight - f.average_weight) / growthRatePerDay)
			: 0
	}))
	
	const bestHarvestPond = pondData
		.filter(p => p.daysToHarvest > 0 && p.daysToHarvest <= 30)
		.sort((a, b) => {
			// Prioritize by: close to harvest, good water quality, high biomass
			const aScore = (30 - a.daysToHarvest) * 2 + (a.waterQuality?.status === 'excellent' || a.waterQuality?.status === 'good' ? 10 : 0) + a.biomass
			const bScore = (30 - b.daysToHarvest) * 2 + (b.waterQuality?.status === 'excellent' || b.waterQuality?.status === 'good' ? 10 : 0) + b.biomass
			return bScore - aScore
		})[0]

	// Energy optimization recommendations
	const peakHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] // 8 AM - 8 PM
	const offPeakHours = [0, 1, 2, 3, 4, 5, 6, 7, 21, 22, 23] // Night hours
	const currentPeakUsage = totalEnergyKwh * 0.6 // Assume 60% during peak
	const potentialSavings = currentPeakUsage * 0.15 // 15% savings by shifting to off-peak

	// Labor allocation recommendations
	const pondIds = Array.from(new Set(water.map((w) => w.pond_id))).sort()
	const urgentPonds = pondData
		.filter(p => p.waterQuality && (p.waterQuality.status === 'poor' || p.waterQuality.status === 'critical'))
		.map(p => p.pondId)
	
	// Labor calculations
	const totalLaborHours = labor.reduce((sum, l) => sum + l.time_spent, 0)
	const avgLaborHours = labor.length > 0 ? totalLaborHours / labor.length : 0
	const totalWorkers = labor.reduce((sum, l) => sum + l.worker_count, 0)
	const avgWorkersPerPond = labor.length > 0 ? totalWorkers / labor.length : 1
	const totalTasksCompleted = labor.reduce((sum, l) => sum + l.tasks_completed.length, 0)
	const avgTasksPerHour = totalLaborHours > 0 ? totalTasksCompleted / totalLaborHours : 0
	const avgTasksPerWorker = totalWorkers > 0 ? totalTasksCompleted / totalWorkers : 0
	const laborEfficiencyPercent = laborEfficiency * 100
	const hourlyWage = 500 // LKR per hour
	const laborCostPerTask = totalTasksCompleted > 0 ? totalLaborCost / totalTasksCompleted : 0
	const avgEfficiencyScore = labor.length > 0 ? labor.reduce((sum, l) => sum + l.efficiency_score, 0) / labor.length : 0.85
	
	// Task breakdown by type
	const allTasks = labor.flatMap(l => l.tasks_completed)
	const waterQualityTasks = allTasks.filter(t => t.toLowerCase().includes('water') || t.toLowerCase().includes('quality') || t.toLowerCase().includes('test')).length
	const feedTasks = allTasks.filter(t => t.toLowerCase().includes('feed') || t.toLowerCase().includes('feeding')).length
	const maintenanceTasks = allTasks.filter(t => t.toLowerCase().includes('maintenance') || t.toLowerCase().includes('equipment') || t.toLowerCase().includes('aerator') || t.toLowerCase().includes('pump')).length
	const cleaningTasks = allTasks.filter(t => t.toLowerCase().includes('clean') || t.toLowerCase().includes('cleaning')).length
	const monitoringTasks = allTasks.filter(t => t.toLowerCase().includes('health') || t.toLowerCase().includes('monitor') || t.toLowerCase().includes('shrimp')).length
	const taskTypes = {
		'Water Quality Testing': waterQualityTasks,
		'Feed Distribution': feedTasks,
		'Equipment Maintenance': maintenanceTasks,
		'Pond Cleaning': cleaningTasks,
		'Health Monitoring': monitoringTasks,
		'Other': allTasks.length - waterQualityTasks - feedTasks - maintenanceTasks - cleaningTasks - monitoringTasks
	}
	
	// Next tasks analysis
	const nextTasks = labor.flatMap(l => l.next_tasks)
	const urgentNextTasks = nextTasks.filter(t => t.toLowerCase().includes('urgent') || t.toLowerCase().includes('emergency') || t.toLowerCase().includes('critical')).length
	
	// Benchmarking calculations
	const totalShrimpCount = feed.reduce((sum, f) => sum + f.shrimp_count, 0)
	const initialShrimpCount = totalShrimpCount * 1.22 // Estimate initial count (assuming 82% survival)
	const survivalRate = totalShrimpCount > 0 && initialShrimpCount > 0 ? (totalShrimpCount / initialShrimpCount) * 100 : 82
	const yieldKgHa = projectedYieldTons > 0 && pondIds.length > 0 ? (projectedYieldTons * 1000) / (pondIds.length * 0.5) : 5200 // Assume 0.5 ha per pond
	const costPerKgShrimp = projectedYieldTons > 0 ? (totalFeedCost + totalLaborCost + totalEnergyCost) / (projectedYieldTons * 1000) : 1150
	const energyPerKgShrimp = projectedYieldTons > 0 && totalEnergyKwh > 0 ? totalEnergyKwh / (projectedYieldTons * 1000) : 3.2

	// Benchmark values
	const benchmarkFCR = 1.60
	const benchmarkSurvival = 78
	const benchmarkYield = 4800
	const benchmarkCostPerKg = 1250
	const benchmarkEnergyPerKg = 3.8

	// Calculate overall performance index
	const fcrScore = fcr > 0 ? (benchmarkFCR / fcr) * 100 : 90 // Lower is better, so invert
	const survivalScore = (survivalRate / benchmarkSurvival) * 100
	const yieldScore = (yieldKgHa / benchmarkYield) * 100
	const costScore = costPerKgShrimp > 0 ? (benchmarkCostPerKg / costPerKgShrimp) * 100 : 92 // Lower is better
	const energyScore = energyPerKgShrimp > 0 ? (benchmarkEnergyPerKg / energyPerKgShrimp) * 100 : 85 // Lower is better
	const overallPerformanceIndex = Math.min(100, (fcrScore + survivalScore + yieldScore + costScore + energyScore) / 5)
	
	// Use decision recommendations from API if available
	const decisionRecommendations = data.decision_recommendations || []
	const harvestRecommendations = decisionRecommendations.filter(r => 
		r.primary_action === 'emergency_response' || r.text.toLowerCase().includes('harvest')
	)
	const energyRecommendations = decisionRecommendations.filter(r => 
		r.primary_action === 'decrease_aeration' || r.primary_action === 'increase_aeration' || 
		r.text.toLowerCase().includes('aerator') || r.text.toLowerCase().includes('energy')
	)
	const laborRecommendations = decisionRecommendations.filter(r => 
		r.primary_action === 'allocate_workers' || r.text.toLowerCase().includes('worker') || 
		r.text.toLowerCase().includes('labor')
	)

	// Chart data
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
	const harvestChart = {
		labels: months,
		datasets: [
			{
				label: 'Yield',
				data: months.map((_, i) => (i === 4 ? 5.4 : 2 + Math.random() * 2)),
				backgroundColor: months.map((_, i) => (i === 4 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 197, 94, 0.6)')),
				borderColor: months.map((_, i) => (i === 4 ? 'rgba(59, 130, 246, 1)' : 'rgba(34, 197, 94, 0.8)')),
				borderWidth: 1,
				borderRadius: 4
			}
		]
	}

	const feedingPlanChart = {
		labels: ['6 AM', '7 AM', '8 AM', '12 PM', '4 PM', '8 PM'],
		datasets: [
			{
				label: 'Feed Amount',
				data: [0, 140, 0, 0, 90, 0],
				backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(245, 158, 11, 0.8)', 'rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.6)', 'rgba(245, 158, 11, 0.8)', 'rgba(34, 197, 94, 0.6)'],
				borderColor: 'rgba(34, 197, 94, 0.8)',
				borderWidth: 1,
				borderRadius: 4
			}
		]
	}

	const chartOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { grid: { display: false }, beginAtZero: true }
		}
	}

	const gridColor = 'rgba(17, 24, 39, 0.08)'
	const axisColor = 'rgba(17, 24, 39, 0.55)'

	// Tab state
	const [activeTab, setActiveTab] = useState<'feeding' | 'labor' | 'general' | 'benchmarking'>('general')

	return (
		<div style={{ padding: '20px 0' }}>
			{/* Header */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' }}>
				<div className="panelHeader">
					<div className="panelTitle">AI Optimization Engine</div>
					<div className="panelRight" style={{ gap: 12 }}>
						<span style={{ cursor: 'pointer', fontSize: 12, padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 4 }}>Camera</span>
						<span style={{ cursor: 'pointer', fontSize: 12, padding: '4px 8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 4 }}>Alerts</span>
						<span style={{ cursor: 'pointer', fontSize: 12, padding: '4px 8px', backgroundColor: 'rgba(107, 114, 128, 0.1)', borderRadius: 4 }}>Settings</span>
					</div>
				</div>
			</div>

			{/* Decision Support Panel - Core Feature */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.08))', border: '2px solid rgba(37, 99, 235, 0.2)' }}>
				<div className="panelHeader">
					<div className="panelTitle" style={{ fontSize: 18, fontWeight: 700 }}>Decision Support Recommendations</div>
					<div className="panelRight" style={{ fontSize: 11, color: 'var(--muted)' }}>
						Updated {formatDateTime(dashboard.timestamp)}
					</div>
				</div>
				<div style={{ padding: '16px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

					{/* Optimal Labor Allocation */}
					<div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
						<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Optimal Labor Allocation</div>
						{laborRecommendations.length > 0 ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								{laborRecommendations[0].text}
							</div>
						) : (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								{urgentPonds.length > 0 ? (
									<>
										Allocate <strong>2 workers</strong> to <strong>Pond {urgentPonds[0]}</strong> for immediate water quality monitoring
										<br />
										<span style={{ color: 'var(--muted)', fontSize: 11 }}>Schedule: Mon/Wed/Fri - Net Cleaning, Tue/Thu - Maintenance</span>
									</>
								) : (
									<>
										<strong>Monday/Wednesday/Friday:</strong> Net Cleaning (2 workers)
										<br />
										<strong>Tuesday/Thursday:</strong> Aerator Maintenance (1 worker)
									</>
								)}
							</div>
						)}
					</div>

					{/* Energy Optimization */}
					<div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
						<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Energy Optimization</div>
						{energyRecommendations.length > 0 ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								{energyRecommendations[0].text}
							</div>
						) : (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								<strong>Shift aerator usage to night hours</strong> (10 PM - 6 AM) to save energy
								<br />
								<span style={{ color: 'var(--good)', fontSize: 11 }}>Potential savings: Rs. {formatNumber(potentialSavings, { maximumFractionDigits: 0 })}/day</span>
								<br />
								<span style={{ color: 'var(--muted)', fontSize: 11 }}>Reduce pump speed by 15% during off-peak hours</span>
							</div>
						)}
					</div>

					{/* Best Harvest Timing */}
					<div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, border: '1px solid rgba(220, 38, 38, 0.3)' }}>
						<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Best Harvest Timing</div>
						{harvestRecommendations.length > 0 ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								{harvestRecommendations[0].text}
							</div>
						) : bestHarvestPond ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								<strong>Harvest Pond {bestHarvestPond.pondId}</strong> in <strong>{bestHarvestPond.daysToHarvest}-{bestHarvestPond.daysToHarvest + 2} days</strong> to maximize profit
								<br />
								<span style={{ color: 'var(--muted)', fontSize: 11 }}>
									Current weight: {formatNumber(bestHarvestPond.weight, { maximumFractionDigits: 1 })}g | 
									Projected yield: {formatNumber(bestHarvestPond.biomass / 1000, { maximumFractionDigits: 2 })} tons
								</span>
							</div>
						) : daysToOptimalWeight > 0 ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								Optimal harvest window: <strong>{daysToOptimalWeight}-{daysToOptimalWeight + 2} days</strong>
								<br />
								<span style={{ color: 'var(--muted)', fontSize: 11 }}>
									Current avg weight: {formatNumber(avgWeight, { maximumFractionDigits: 1 })}g | 
									Target: {targetHarvestWeight}g
								</span>
							</div>
						) : (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--muted)' }}>
								Monitor growth rates to determine optimal harvest timing
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Optimization Tabs Navigation */}
			<div className="panel spanAll" style={{ marginBottom: 16 }}>
				<div style={{ display: 'flex', gap: 8, borderBottom: '2px solid rgba(17, 24, 39, 0.1)' }}>
					<button
						onClick={() => setActiveTab('general')}
						style={{
							padding: '12px 20px',
							fontSize: 14,
							fontWeight: 600,
							border: 'none',
							background: 'transparent',
							color: activeTab === 'general' ? '#3b82f6' : 'var(--muted)',
							borderBottom: activeTab === 'general' ? '3px solid #3b82f6' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
							display: 'flex',
							alignItems: 'center',
							gap: 6
						}}
					>
						<span>General Overview</span>
					</button>
					<button
						onClick={() => setActiveTab('feeding')}
						style={{
							padding: '12px 20px',
							fontSize: 14,
							fontWeight: 600,
							border: 'none',
							background: 'transparent',
							color: activeTab === 'feeding' ? '#16a34a' : 'var(--muted)',
							borderBottom: activeTab === 'feeding' ? '3px solid #16a34a' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
							display: 'flex',
							alignItems: 'center',
							gap: 6
						}}
					>
						<span>Feeding Optimization</span>
					</button>
					<button
						onClick={() => setActiveTab('labor')}
						style={{
							padding: '12px 20px',
							fontSize: 14,
							fontWeight: 600,
							border: 'none',
							background: 'transparent',
							color: activeTab === 'labor' ? '#f59e0b' : 'var(--muted)',
							borderBottom: activeTab === 'labor' ? '3px solid #f59e0b' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
							display: 'flex',
							alignItems: 'center',
							gap: 6
						}}
					>
						<span>Labor Optimization</span>
					</button>
					<button
						onClick={() => setActiveTab('benchmarking')}
						style={{
							padding: '12px 20px',
							fontSize: 14,
							fontWeight: 600,
							border: 'none',
							background: 'transparent',
							color: activeTab === 'benchmarking' ? '#8b5cf6' : 'var(--muted)',
							borderBottom: activeTab === 'benchmarking' ? '3px solid #8b5cf6' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
							display: 'flex',
							alignItems: 'center',
							gap: 6
						}}
					>
						<span>Benchmarking</span>
					</button>
				</div>
			</div>

			{activeTab === 'feeding' && (
				<>
			{/* Feeding Optimization Section */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
				<div className="panelHeader">
					<div className="panelTitle" style={{ fontSize: 18, fontWeight: 700 }}>Feeding Optimization</div>
					<div className="panelRight" style={{ fontSize: 11, color: 'var(--muted)' }}>
						Updated {formatDateTime(dashboard.timestamp)}
					</div>
				</div>
			</div>

			<div className="dashGrid" style={{ marginBottom: 12 }}>
				{/* Feed Efficiency */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Feed Efficiency</div>
					</div>
					<div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
						<div style={{ position: 'relative' }}>
							<CircularProgress percentage={feedOptimized} size={100} color="#16a34a" />
							<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', marginTop: 28 }}>
								<div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>+27%</div>
							</div>
						</div>
						<div style={{ textAlign: 'center', width: '100%' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
								<div style={{ fontSize: 9, color: 'var(--muted)' }}>Current FCR</div>
								<div style={{ fontSize: 11, fontWeight: 700 }}>{formatNumber(fcr, { maximumFractionDigits: 2 })}</div>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<div style={{ fontSize: 9, color: 'var(--muted)' }}>Previous FCR</div>
								<div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>{formatNumber(fcr * 1.4, { maximumFractionDigits: 2 })}</div>
							</div>
						</div>
					</div>
				</div>

				{/* Shrimp Feeding Behavior */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Shrimp Feeding Behavior</div>
						<div style={{ fontSize: 9, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
							<span>AI Camera</span>
						</div>
					</div>
					<div style={{ padding: '4px 0' }}>
						<div style={{ marginBottom: 8 }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Feeding Activity</div>
							<div style={{ height: 70 }}>
								<Line
									data={{
										labels: ['7 AM', '9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '6 PM'],
										datasets: [{
											label: 'Feedings/hr',
											data: [32, 35, 38, 42, 48, 45, 40],
											borderColor: '#16a34a',
											backgroundColor: 'rgba(22, 163, 74, 0.1)',
											tension: 0.4,
											fill: true
										}]
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { display: false }
										},
										scales: {
											y: { min: 30, max: 50, grid: { display: true, color: gridColor }, ticks: { stepSize: 5 } },
											x: { grid: { display: false } }
										}
									} as ChartOptions<'line'>}
								/>
							</div>
						</div>
						<div>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Intensity Levels</div>
							<div style={{ height: 60 }}>
								<Bar
									data={{
										labels: ['7 AM', '9 AM', '11 AM', '1 PM', '3 PM', '5 PM'],
										datasets: [
											{ label: 'Low', data: [10, 8, 5, 3, 2, 5], backgroundColor: 'rgba(34, 197, 94, 0.4)' },
											{ label: 'Medium', data: [30, 35, 30, 25, 20, 30], backgroundColor: 'rgba(34, 197, 94, 0.6)' },
											{ label: 'High', data: [40, 42, 45, 50, 48, 45], backgroundColor: 'rgba(34, 197, 94, 0.8)' },
											{ label: 'Strong', data: [20, 15, 20, 22, 30, 20], backgroundColor: 'rgba(245, 158, 11, 0.8)' }
										]
									}}
									options={{
										...chartOptions,
										scales: {
											y: { stacked: true, min: 0, max: 100, grid: { display: true, color: gridColor } },
											x: { stacked: true, grid: { display: false } }
										},
										plugins: { legend: { display: false } }
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Daily Feed Volume */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Daily Feed Volume</div>
					</div>
					<div style={{ padding: '4px 0' }}>
						<div style={{ marginBottom: 8 }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>AI Optimization</div>
							<div style={{ height: 65 }}>
								<Line
									data={{
										labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
										datasets: [
											{
												label: 'AI Optimization',
												data: [135, 140, 145, 150, 155, 160],
												borderColor: '#3b82f6',
												backgroundColor: 'rgba(59, 130, 246, 0.1)',
												tension: 0.4,
												fill: true,
												pointRadius: 2
											},
											{
												label: 'Daily Feed',
												data: [130, 138, 142, 148, 153, 158],
												borderColor: '#16a34a',
												backgroundColor: 'rgba(34, 197, 94, 0.1)',
												tension: 0.4,
												fill: true,
												pointRadius: 2,
												borderDash: [5, 5]
											}
										]
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { display: false }
										},
										scales: {
											y: { min: 120, max: 160, grid: { display: true, color: gridColor } },
											x: { grid: { display: false } }
										}
									} as ChartOptions<'line'>}
								/>
							</div>
						</div>
						<div style={{ marginBottom: 6 }}>
							<div style={{ fontSize: 9, fontWeight: 600, marginBottom: 2 }}>Optimized Feed:</div>
							<div style={{ fontSize: 9, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
								<div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
								<span>140 kg at 7:00 AM</span>
							</div>
							<div style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
								<div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
								<span>90 kg at 4:00 PM</span>
							</div>
						</div>
						<div>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>Feed Comp: 11%</div>
							<div style={{ height: 3, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
								<div style={{ width: '11%', height: '100%', backgroundColor: '#16a34a' }} />
							</div>
						</div>
					</div>
				</div>

				{/* Cost Efficiency */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Cost Efficiency</div>
					</div>
					<div style={{ padding: '4px 0' }}>
						<div style={{ marginBottom: 8, textAlign: 'center' }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>Savings per week:</div>
							<div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>$78</div>
						</div>
						<div style={{ marginBottom: 6 }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>Adjusted Feed Cost:</div>
							<div style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
								<span>⬆️11%</span>
							</div>
						</div>
						<div>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>Previous Feed Cost:</div>
							<div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>$308/day</div>
						</div>
					</div>
				</div>

				{/* AI Recommendations - Feed */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">
							AI Recommendations
						</div>
						<div style={{ fontSize: 10, color: 'var(--muted)' }}>
							Updated {formatDateTime(dashboard.timestamp)}
						</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						{/* Critical Priority Recommendations */}
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }} />
								<span>Critical</span>
							</div>
							<div style={{ padding: 8, backgroundColor: 'rgba(220, 38, 38, 0.05)', borderRadius: 8, border: '1px solid rgba(220, 38, 38, 0.2)' }}>
								<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>
									Feed 140 kg at 7:00 AM (High-Protein 35%+)
								</div>
								<div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4 }}>
									Peak 6-9 AM. Impact: +5-8% growth, FCR {formatNumber(fcr, { maximumFractionDigits: 2 })} to {formatNumber(fcr * 0.93, { maximumFractionDigits: 2 })}
								</div>
							</div>
						</div>

						{/* High Priority Recommendations */}
						<div style={{ marginBottom: 10 }}>
							<div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
								<span>High Priority</span>
							</div>
							
							<div style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 6 }}>
								<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>
									Afternoon: 90 kg at 4:00 PM
								</div>
								<div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4 }}>
									Reduces waste ~12%, maintains growth. Temp {formatNumber(avgTemp, { maximumFractionDigits: 1 })}°C optimal.
								</div>
							</div>

							<div style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
								<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>
									Adaptive Reduction
								</div>
								<div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4 }}>
									If activity &lt;30/hr, reduce 15-20%. Save ${formatNumber((totalFeedCost * 0.15) / 100, { maximumFractionDigits: 0 })}/day
								</div>
							</div>
						</div>

						{/* Suggested Optimizations */}
						<div>
							<div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
								<span>Suggested</span>
							</div>
							
							<div style={{ padding: 6, backgroundColor: 'rgba(22, 163, 74, 0.05)', borderRadius: 6, border: '1px solid rgba(22, 163, 74, 0.2)', marginBottom: 5 }}>
								<div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, color: 'var(--text)' }}>
									Increase protein to 38-40% | Add probiotics
								</div>
							</div>

							<div style={{ padding: 6, backgroundColor: 'rgba(22, 163, 74, 0.05)', borderRadius: 6, border: '1px solid rgba(22, 163, 74, 0.2)' }}>
								<div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, color: 'var(--text)' }}>
									Shift afternoon feed to 3:00 PM (peak activity)
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Feed Comp */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Feed Comp</div>
					</div>
					<div style={{ padding: '4px 0' }}>
						<div style={{ marginBottom: 6 }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>35% Protein</div>
							<div style={{ height: 5, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
								<div style={{ width: '35%', height: '100%', backgroundColor: '#16a34a' }} />
							</div>
						</div>
						<div style={{ marginBottom: 6 }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>30% Carbohydrates</div>
							<div style={{ height: 5, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
								<div style={{ width: '30%', height: '100%', backgroundColor: '#f59e0b' }} />
							</div>
						</div>
						<div>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>1% Fat</div>
							<div style={{ height: 5, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
								<div style={{ width: '1%', height: '100%', backgroundColor: '#3b82f6' }} />
							</div>
						</div>
					</div>
				</div>
			</div>
				</>
			)}

			{activeTab === 'labor' && (
				<>
			{/* Labor Optimization Section */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(59, 130, 246, 0.08))', border: '2px solid rgba(245, 158, 11, 0.2)' }}>
				<div className="panelHeader">
					<div className="panelTitle" style={{ fontSize: 18, fontWeight: 700 }}>Labor Optimization</div>
					<div className="panelRight" style={{ fontSize: 11, color: 'var(--muted)' }}>
						Updated {formatDateTime(dashboard.timestamp)}
					</div>
				</div>
			</div>

			<div className="dashGrid" style={{ marginBottom: 24 }}>
				{/* Optimized Shift & Schedule Planning */}
				<div className="panel" style={{ gridColumn: 'span 2' }}>
					<div className="panelHeader">
						<div className="panelTitle">Optimized Shift & Schedule Planning</div>
					</div>
					<div style={{ padding: '12px 0' }}>
						<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Today's Schedule</div>
						<div style={{ overflowX: 'auto' }}>
							<div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: 8, minWidth: 600 }}>
								{/* Header */}
								<div style={{ fontWeight: 600, fontSize: 10, color: 'var(--muted)', padding: '8px 4px' }}>Worker/Shift</div>
								<div style={{ fontWeight: 600, fontSize: 10, color: 'var(--muted)', padding: '8px 4px', textAlign: 'center' }}>Morning<br />(6:00 AM - 12:00 PM)</div>
								<div style={{ fontWeight: 600, fontSize: 10, color: 'var(--muted)', padding: '8px 4px', textAlign: 'center' }}>Afternoon<br />(12:00 PM - 6:00 PM)</div>
								<div style={{ fontWeight: 600, fontSize: 10, color: 'var(--muted)', padding: '8px 4px', textAlign: 'center' }}>Evening<br />(6:00 PM - 12:00 AM)</div>
								<div style={{ fontWeight: 600, fontSize: 10, color: 'var(--muted)', padding: '8px 4px', textAlign: 'center' }}>Night<br />(12:00 AM - 6:00 AM)</div>
								
								{/* Worker rows */}
								{['Eric', 'Sarah', 'Alex', 'Ryan', 'Luis'].map((worker, idx) => (
									<>
										<div key={`worker-${idx}`} style={{ fontSize: 11, fontWeight: 600, padding: '8px 4px', display: 'flex', alignItems: 'center' }}>
											{worker}
										</div>
										<div key={`morning-${idx}`} style={{ padding: '8px 4px' }}>
											{idx < 3 ? (
												<div style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
													Pond Cleaning
												</div>
											) : idx === 3 ? (
												<div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
													Feeding
												</div>
											) : (
												<div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>-</div>
											)}
										</div>
										<div key={`afternoon-${idx}`} style={{ padding: '8px 4px' }}>
											{idx === 0 ? (
												<div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
													Water Quality Sampling
												</div>
											) : idx < 3 ? (
												<div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
													Feeding
												</div>
											) : (
												<div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>-</div>
											)}
										</div>
										<div key={`evening-${idx}`} style={{ padding: '8px 4px' }}>
											{idx === 2 ? (
												<div style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
													Harvest Preparation
												</div>
											) : idx < 2 ? (
												<div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '6px 8px', borderRadius: 4, fontSize: 10, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
													Feeding
												</div>
											) : (
												<div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>-</div>
											)}
										</div>
										<div key={`night-${idx}`} style={{ padding: '8px 4px' }}>
											<div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>-</div>
										</div>
									</>
								))}
							</div>
						</div>
						
						{/* AI Recommendations */}
						<div style={{ marginTop: 16, padding: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
							<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>AI Recommendations</div>
							<div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.6, marginBottom: 4 }}>
								• Add one more worker to the evening operation detected at Friday 6 PM
							</div>
							<div style={{ fontSize: 11, color: '#dc2626', lineHeight: 1.6 }}>
								Alert: Ryan is overloaded with back-to-back tasks
							</div>
						</div>
					</div>
				</div>

				{/* Cost-Aware Labor Optimization */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Cost-Aware Labor Optimization</div>
					</div>
					<div style={{ padding: '12px 0' }}>
						<div style={{ marginBottom: 16 }}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Today's Labor Cost</div>
							<div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
								${formatNumber(totalLaborCost / 100, { maximumFractionDigits: 0 })}
							</div>
							<div style={{ fontSize: 10, color: 'var(--muted)' }}>
								(${formatNumber((totalLaborCost / totalLaborHours) / 100, { maximumFractionDigits: 1 })} per hr)
							</div>
						</div>
						
						<div style={{ marginBottom: 16 }}>
							<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Labor Cost Trend</div>
							<div style={{ height: 100 }}>
								<Line
									data={{
										labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
										datasets: [{
											label: 'Cost ($)',
											data: [330, 345, 320, 340, 345, 310, 290],
											borderColor: '#f59e0b',
											backgroundColor: 'rgba(245, 158, 11, 0.1)',
											tension: 0.4,
											fill: true,
											pointRadius: 4,
											pointBackgroundColor: '#f59e0b'
										}]
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: { legend: { display: false } },
										scales: {
											y: { beginAtZero: false, min: 280, max: 360, grid: { display: true, color: gridColor } },
											x: { grid: { display: false } }
										}
									} as ChartOptions<'line'>}
								/>
							</div>
						</div>

						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Forecasted labor cost:</div>
							<div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>${formatNumber((totalLaborCost * 1.74) / 100, { maximumFractionDigits: 0 })} / ${formatNumber(totalLaborCost / 100, { maximumFractionDigits: 0 })}</div>
						</div>

						{totalLaborCost > 30000 && (
							<div style={{ padding: 8, backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 6, border: '1px solid rgba(220, 38, 38, 0.3)', marginBottom: 8 }}>
								<div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>
									Projected Cost Exceeds Budget by ${formatNumber((totalLaborCost - 30000) / 100, { maximumFractionDigits: 0 })} &gt;&gt;
								</div>
							</div>
						)}
						
						<div style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
							<div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>
								Expected cost today (${formatNumber(totalLaborCost / 100, { maximumFractionDigits: 0 })}) is above the budget threshold
							</div>
						</div>
					</div>
				</div>

				{/* Task-Based Labor Allocation */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Task-Based Labor Allocation</div>
					</div>
					<div style={{ padding: '12px 0' }}>
						<div style={{ marginBottom: 16 }}>
							<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>AI Recommendations</div>
							<div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.8, marginBottom: 8 }}>
								• Assign Luis to the morning shift for pond cleaning
							</div>
							<div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.8 }}>
								• Increase worker hours for water quality sampling to avoid idle time
							</div>
						</div>

						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Task Allocation</div>
							{['Feeding', 'Water Quality Sampling', 'Pond Cleaning', 'Disease Inspection', 'Harvest Preparation'].map((task, idx) => {
								const percentages = [38, 24, 18, 12, 8]
								const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
								return (
									<div key={task} style={{ marginBottom: 12 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
											<span style={{ color: 'var(--text)' }}>{task}</span>
											<span style={{ fontWeight: 600, color: 'var(--text)' }}>{percentages[idx]}%</span>
										</div>
										<div style={{ height: 8, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 4, overflow: 'hidden' }}>
											<div style={{ width: `${percentages[idx]}%`, height: '100%', backgroundColor: colors[idx] }} />
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>

				{/* AI Labor Recommendations */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">
							AI Labor Recommendations
						</div>
						<div style={{ fontSize: 10, color: 'var(--muted)' }}>
							Updated {formatDateTime(dashboard.timestamp)}
						</div>
					</div>
					<div style={{ padding: '10px 0' }}>
						{/* Critical Priority */}
						{urgentPonds.length > 0 ? (
							<div style={{ marginBottom: 12 }}>
								<div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
									<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }} />
									<span>Critical Priority</span>
								</div>
								<div style={{ padding: 10, backgroundColor: 'rgba(220, 38, 38, 0.05)', borderRadius: 8, border: '1px solid rgba(220, 38, 38, 0.2)' }}>
									<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
										Allocate 2 workers to Pond {urgentPonds[0]} for urgent water quality monitoring
									</div>
									<div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
										Water quality status is {water.find(w => w.pond_id === urgentPonds[0])?.status || 'poor'}. Immediate attention required.
									</div>
								</div>
							</div>
						) : null}

						{/* High Priority */}
						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
								<span>High Priority</span>
							</div>
							
							<div style={{ padding: 10, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 8 }}>
								<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
									Optimize Weekly Schedule
								</div>
								<div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
									Current efficiency: {formatNumber(laborEfficiencyPercent, { maximumFractionDigits: 0 })}%. Shift tasks to off-peak hours. Save Rs. {formatNumber(totalLaborCost * 0.12, { maximumFractionDigits: 0 })}/day.
								</div>
							</div>

							<div style={{ padding: 10, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
								<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
									Worker Allocation
								</div>
								<div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
									Allocate {formatNumber(avgWorkersPerPond, { maximumFractionDigits: 1 })} workers per pond. Adjust based on water quality status.
								</div>
							</div>
						</div>

						{/* Suggested Optimizations */}
						<div>
							<div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
								<span>Suggested</span>
							</div>
							
							<div style={{ padding: 8, backgroundColor: 'rgba(22, 163, 74, 0.05)', borderRadius: 8, border: '1px solid rgba(22, 163, 74, 0.2)', marginBottom: 6 }}>
								<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: 'var(--text)' }}>
									Task Automation
								</div>
								<div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
									Automate water quality testing. Save {formatNumber(totalLaborHours * 0.4, { maximumFractionDigits: 1 })} hours/week.
								</div>
							</div>

							<div style={{ padding: 8, backgroundColor: 'rgba(22, 163, 74, 0.05)', borderRadius: 8, border: '1px solid rgba(22, 163, 74, 0.2)' }}>
								<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: 'var(--text)' }}>
									Cross-Training
								</div>
								<div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
									Train workers on multiple tasks. Increase efficiency by 15-20%.
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				</>
			)}

			{activeTab === 'general' && (
				<>
			<div className="dashGrid">
				{/* Row 1 */}
				{/* System Overview */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">System Overview</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
							<div>
								<div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Current Shrimp Weight</div>
								<div style={{ fontSize: 32, fontWeight: 700, color: 'var(--info)' }}>
									{formatNumber(avgWeight, { maximumFractionDigits: 1 })}g
								</div>
							</div>
							<div>
								<div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Estimated Harvest Yield</div>
								<div style={{ fontSize: 32, fontWeight: 700, color: 'var(--good)' }}>
									{formatNumber(projectedYieldTons, { maximumFractionDigits: 1 })} Tons
								</div>
							</div>
							<div>
								<div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Projected Profit</div>
								<div style={{ fontSize: 32, fontWeight: 700, color: 'var(--good)' }}>
									${formatNumber(projectedProfit / 100, { maximumFractionDigits: 0 })}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Water Quality Optimization */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Water Quality Optimization</div>
					</div>
					<div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
						<OctagonalProgress percentage={waterQualityOptimized} size={140} color="#16a34a" />
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
							<div>
								<div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>pH</div>
								<div style={{ fontSize: 14, fontWeight: 600 }}>
									{formatNumber(avgPh, { maximumFractionDigits: 1 })}
									<span style={{ fontSize: 10, color: 'var(--good)', marginLeft: 4 }}>(Optimal)</span>
								</div>
							</div>
							<div>
								<div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Oxygen</div>
								<div style={{ fontSize: 14, fontWeight: 600 }}>
									{formatNumber(avgOxygen, { maximumFractionDigits: 1 })} mg/L
									<span style={{ fontSize: 10, color: 'var(--good)', marginLeft: 4 }}>(Good)</span>
								</div>
							</div>
							<div>
								<div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Salinity</div>
								<div style={{ fontSize: 14, fontWeight: 600 }}>
									{formatNumber(avgSalinity, { maximumFractionDigits: 0 })} ppt
									<span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>(Normal)</span>
								</div>
							</div>
							<div>
								<div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Temperature</div>
								<div style={{ fontSize: 14, fontWeight: 600 }}>
									{formatNumber(avgTemp, { maximumFractionDigits: 1 })}°C
									<span style={{ fontSize: 10, color: 'var(--good)', marginLeft: 4 }}>(Stable)</span>
								</div>
							</div>
						</div>
					</div>
				</div>


				{/* Row 2 */}
				{/* Optimized Parameters */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Optimized Parameters</div>
					</div>
					<div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
							<CircularProgress percentage={feedOptimized} size={80} color="#16a34a" />
							<div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Feed Optimized</div>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
							<CircularProgress percentage={energyEfficient} size={80} color="#3b82f6" />
							<div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Energy Efficiency</div>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
							<CircularProgress percentage={waterQualityOptimized} size={80} color="#16a34a" />
							<div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Water Quality</div>
						</div>
					</div>
				</div>


				{/* AI Recommendations - Water Quality */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">AI Recommendations</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, lineHeight: 1.8 }}>
							<li>Aerator fine-tuning to maintain 7-8 mg/L DO</li>
							<li>Reduced salinity from {formatNumber(avgSalinity + 1, { maximumFractionDigits: 0 })} ppt to {formatNumber(avgSalinity, { maximumFractionDigits: 0 })} ppt</li>
							<li>Water pump speed by 15% to stabilize temperature</li>
						</ul>
					</div>
				</div>

				{/* Efficient Labor Plan */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Efficient Labor Plan</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, lineHeight: 1.8 }}>
							<li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								Monday Wed/Fri: Net Cleaning
							</li>
							<li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								Tuesday/Thursday: Aerator Maintenance
							</li>
						</ul>
						<div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
							Workers: 3 | Tasks: 2
						</div>
					</div>
				</div>

				{/* Row 3 */}
				{/* Optimization Log */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Optimization Log</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
							Last updated at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
						</div>
						<div style={{ fontSize: 11, marginBottom: 12 }}>
							Feeder adjusted for better dispense accuracy
						</div>
						<button
							style={{
								width: '100%',
								backgroundColor: 'var(--info)',
								color: 'white',
								border: 'none',
								padding: '8px 12px',
								borderRadius: 6,
								fontSize: 11,
								fontWeight: 600,
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 6
							}}
						>
							<span>Optimization Log {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
						</button>
					</div>
				</div>

				{/* Energy Optimization */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Energy Optimization</div>
					</div>
					<div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
						<CircularProgress percentage={energyEfficient} size={140} color="#3b82f6" />
						<div style={{ width: '100%' }}>
							<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
								Daily Energy Cost: <span style={{ fontWeight: 600 }}>Rs. {formatNumber(totalEnergyCost, { maximumFractionDigits: 0 })}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
								<div>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
										<span>Feeder System</span>
										<span style={{ fontWeight: 600 }}>45%</span>
									</div>
									<div style={{ height: 6, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
										<div style={{ width: '45%', height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.6)' }} />
									</div>
								</div>
								<div>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
										<span>Aerators</span>
										<span style={{ fontWeight: 600 }}>30%</span>
									</div>
									<div style={{ height: 6, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
										<div style={{ width: '30%', height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.6)' }} />
									</div>
								</div>
								<div>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
										<span>Water Pumps</span>
										<span style={{ fontWeight: 600 }}>25%</span>
									</div>
									<div style={{ height: 6, backgroundColor: 'rgba(17, 24, 39, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
										<div style={{ width: '25%', height: '100%', backgroundColor: 'rgba(34, 197, 94, 0.6)' }} />
									</div>
								</div>
							</div>
							<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>AI Recommendations:</div>
							<ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, lineHeight: 1.8 }}>
								<li>Adjust timer for aerator cycles</li>
								<li>Power reduction of feeder motors</li>
								<li>Smart water pump scheduling</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Labor & Harvest Optimization */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Labor & Harvest Optimization</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ marginBottom: 16 }}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Optimal Harvest Window:</div>
							<div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'var(--info)', marginBottom: 12 }}>
								May 20 - May 26
							</div>
							<div style={{ height: 120 }}>
								<Bar data={harvestChart} options={chartOptions} />
							</div>
						</div>
						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Weekly Task Schedule:</div>
							<div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
								<div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
								<span>Net Cleaning & Shrimp Sampling</span>
							</div>
							<div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
								<div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
								<span>Aerator Maintenance</span>
							</div>
						</div>
						<div>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Optimal Harvest Optimization:</div>
							<div style={{ fontSize: 11, color: 'var(--muted)' }}>
								Increase harvesting staff during the max yield & profit period
							</div>
						</div>
					</div>
				</div>

				{/* Optimal Harvest Plan */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Optimal Harvest Plan</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Between May 20 - May 26</div>
						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Estimated Yield:</div>
							<div style={{ fontSize: 18, fontWeight: 700, color: 'var(--good)' }}>
								{formatNumber(projectedYieldTons, { maximumFractionDigits: 1 })} tons
							</div>
						</div>
						<div style={{ marginBottom: 12 }}>
							<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Market Price:</div>
							<div style={{ fontSize: 18, fontWeight: 700 }}>
								${formatNumber(shrimpPricePerKg / 100, { maximumFractionDigits: 2 })}/kg
							</div>
						</div>
						<div style={{ height: 80 }}>
							<Bar data={harvestChart} options={chartOptions} />
						</div>
					</div>
				</div>
			</div>
				</>
			)}

			{activeTab === 'benchmarking' && (
				<>
			{/* Benchmarking Section */}
			<div className="panel spanAll" style={{ marginBottom: 12, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))', border: '2px solid rgba(139, 92, 246, 0.2)' }}>
				<div className="panelHeader">
					<div className="panelTitle" style={{ fontSize: 16, fontWeight: 700 }}>AI KPI Benchmarking & Performance Overview</div>
					<div className="panelRight" style={{ fontSize: 10, color: 'var(--muted)' }}>
						Updated {formatDateTime(dashboard.timestamp)}
					</div>
				</div>
			</div>

			<div className="dashGrid" style={{ marginBottom: 12 }}>
				{/* KPI Comparison */}
				<div className="panel" style={{ gridColumn: 'span 2' }}>
					<div className="panelHeader">
						<div className="panelTitle">KPI Comparison</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ overflowX: 'auto' }}>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<thead>
									<tr style={{ borderBottom: '2px solid rgba(17, 24, 39, 0.1)' }}>
										<th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>KPI</th>
										<th style={{ padding: '6px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Your Farm</th>
										<th style={{ padding: '6px 10px', textAlign: 'right', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Benchmark</th>
										<th style={{ padding: '6px 10px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Status</th>
									</tr>
								</thead>
								<tbody>
									{[
										{ kpi: 'Feed Conversion Ratio (FCR)', your: fcr, benchmark: benchmarkFCR, status: fcr < benchmarkFCR ? 'better' : 'warning' },
										{ kpi: 'Survival Rate (%)', your: survivalRate, benchmark: benchmarkSurvival, status: survivalRate > benchmarkSurvival ? 'better' : 'warning' },
										{ kpi: 'Yield (kg/ha/cycle)', your: yieldKgHa, benchmark: benchmarkYield, status: yieldKgHa > benchmarkYield ? 'better' : 'warning' },
										{ kpi: 'Cost per kg shrimp', your: costPerKgShrimp, benchmark: benchmarkCostPerKg, status: costPerKgShrimp < benchmarkCostPerKg ? 'better' : 'warning', format: 'currency' },
										{ kpi: 'Energy per kg shrimp', your: energyPerKgShrimp, benchmark: benchmarkEnergyPerKg, status: energyPerKgShrimp < benchmarkEnergyPerKg ? 'better' : 'warning', format: 'energy' }
									].map((row, idx) => (
										<tr key={idx} style={{ borderBottom: '1px solid rgba(17, 24, 39, 0.05)' }}>
											<td style={{ padding: '6px 10px', fontSize: 10, color: 'var(--text)' }}>{row.kpi}</td>
											<td style={{ padding: '6px 10px', fontSize: 10, fontWeight: 600, textAlign: 'right', color: 'var(--text)' }}>
												{row.format === 'currency' ? `LKR ${formatNumber(row.your, { maximumFractionDigits: 0 })}` :
												 row.format === 'energy' ? `${formatNumber(row.your, { maximumFractionDigits: 1 })} kWh` :
												 formatNumber(row.your, { maximumFractionDigits: row.kpi.includes('%') ? 0 : 2 })}
											</td>
											<td style={{ padding: '6px 10px', fontSize: 10, textAlign: 'right', color: 'var(--muted)' }}>
												{row.format === 'currency' ? `LKR ${formatNumber(row.benchmark, { maximumFractionDigits: 0 })}` :
												 row.format === 'energy' ? `${formatNumber(row.benchmark, { maximumFractionDigits: 1 })} kWh` :
												 formatNumber(row.benchmark, { maximumFractionDigits: row.kpi.includes('%') ? 0 : 2 })}
											</td>
											<td style={{ padding: '6px 10px', textAlign: 'center' }}>
												<div style={{
													padding: '3px 8px',
													borderRadius: 10,
													fontSize: 9,
													fontWeight: 600,
													display: 'inline-block',
													backgroundColor: row.status === 'better' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
													color: row.status === 'better' ? '#16a34a' : '#f59e0b',
													border: `1px solid ${row.status === 'better' ? '#16a34a' : '#f59e0b'}`
												}}>
													{row.status === 'better' ? 'Better' : 'Warning'}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 6, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 6 }}>
								<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>OK</div>
								<span style={{ fontSize: 10, color: 'var(--text)' }}>Your farm outperforms benchmarks in 4 of 5 KPIs.</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 6 }}>
								<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>!</div>
								<span style={{ fontSize: 10, color: 'var(--text)' }}>Energy efficiency can be improved by {formatNumber(((benchmarkEnergyPerKg - energyPerKgShrimp) / benchmarkEnergyPerKg) * 100, { maximumFractionDigits: 0 })}% to match industry standards.</span>
							</div>
						</div>
					</div>
				</div>

				{/* Overall Performance Index */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Overall Performance Index</div>
					</div>
					<div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
						<div style={{ position: 'relative' }}>
							<CircularProgress percentage={overallPerformanceIndex} size={140} color="#16a34a" />
							<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', marginTop: 38 }}>
								<div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{formatNumber(overallPerformanceIndex, { maximumFractionDigits: 0 })}%</div>
								<div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>Efficient</div>
							</div>
						</div>
						<div style={{ textAlign: 'center', width: '100%' }}>
							<div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>Industry Avg 85%</div>
							<div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>
								Overall Performance Index vs Industry Avg 85%
							</div>
						</div>
					</div>
				</div>

				{/* Performance Trends */}
				<div className="panel" style={{ gridColumn: 'span 2' }}>
					<div className="panelHeader">
						<div className="panelTitle">Performance Trends</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
							{[
								{ label: 'Feed Conversion Ratio', data: [1.50, 1.48, 1.46, 1.45, fcr], color: '#16a34a' },
								{ label: 'Survival Rate (%)', data: [78, 79, 80, 81, survivalRate], color: '#3b82f6' },
								{ label: 'Yield (kg/ha/cycle)', data: [4800, 4900, 5000, 5100, yieldKgHa], color: '#8b5cf6' },
								{ label: 'Energy per kg shrimp', data: [3.8, 3.6, 3.4, 3.3, energyPerKgShrimp], color: '#f59e0b' }
							].map((metric, idx) => (
								<div key={idx} style={{ padding: 6, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 6, border: '1px solid rgba(17, 24, 39, 0.1)' }}>
									<div style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{metric.label}</div>
									<div style={{ height: 60 }}>
										<Line
											data={{
												labels: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4', 'Cycle 5'],
												datasets: [{
													label: metric.label,
													data: metric.data,
													borderColor: metric.color,
													backgroundColor: metric.color + '20',
													tension: 0.4,
													fill: true,
													pointRadius: 2
												}]
											}}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: { legend: { display: false } },
												scales: {
													y: { grid: { display: false }, beginAtZero: false },
													x: { grid: { display: false } }
												}
											} as ChartOptions<'line'>}
										/>
									</div>
								</div>
							))}
						</div>
						<div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 6, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 6 }}>
								<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>+</div>
								<span style={{ fontSize: 10, color: 'var(--text)' }}>Your farm outperforms benchmarks in 4 of 5 KPIs.</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 6 }}>
								<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>!</div>
								<span style={{ fontSize: 10, color: 'var(--text)' }}>Energy efficiency can be improved by {formatNumber(((benchmarkEnergyPerKg - energyPerKgShrimp) / benchmarkEnergyPerKg) * 100, { maximumFractionDigits: 0 })}% to match industry standards.</span>
							</div>
						</div>
					</div>
				</div>

				{/* AI Insights */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">AI Insights</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<div style={{ padding: 8, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 6, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
									<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>+</div>
									<span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>Performance Status</span>
								</div>
								<div style={{ fontSize: 9, color: 'var(--text)', lineHeight: 1.4 }}>
									Your farm outperforms benchmarks in 4 of 5 KPIs.
								</div>
							</div>
							<div style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
									<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>!</div>
									<span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>Energy Optimization</span>
								</div>
								<div style={{ fontSize: 9, color: 'var(--text)', lineHeight: 1.4 }}>
									Energy optimization recommended — reduce aerator runtime by 15%.
								</div>
							</div>
							<div style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 6, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
									<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>i</div>
									<span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>FCR Improvement</span>
								</div>
								<div style={{ fontSize: 9, color: 'var(--text)', lineHeight: 1.4 }}>
									FCR improvement sustained for 3 consecutive cycles.
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				</>
			)}
		</div>
	)
}
