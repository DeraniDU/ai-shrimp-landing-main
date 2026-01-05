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
	type ChartOptions
} from 'chart.js'
import type { DashboardApiResponse, SavedFarmSnapshot } from '../lib/types'
import { formatNumber, formatDateTime } from '../lib/format'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend)

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

	return (
		<div style={{ padding: '20px 0' }}>
			{/* Header */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' }}>
				<div className="panelHeader">
					<div className="panelTitle">AI Optimization Engine</div>
					<div className="panelRight" style={{ gap: 12 }}>
						<span style={{ cursor: 'pointer', fontSize: 18 }}>📷</span>
						<span style={{ cursor: 'pointer', fontSize: 18 }}>🔔</span>
						<span style={{ cursor: 'pointer', fontSize: 18 }}>⚙️</span>
					</div>
				</div>
			</div>

			{/* Decision Support Panel - Core Feature */}
			<div className="panel spanAll" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.08))', border: '2px solid rgba(37, 99, 235, 0.2)' }}>
				<div className="panelHeader">
					<div className="panelTitle" style={{ fontSize: 18, fontWeight: 700 }}>🎯 Decision Support Recommendations</div>
					<div className="panelRight" style={{ fontSize: 11, color: 'var(--muted)' }}>
						Updated {formatDateTime(dashboard.timestamp)}
					</div>
				</div>
				<div style={{ padding: '16px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
					{/* Best Feeding Plan */}
					<div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
							<span style={{ fontSize: 24 }}>✅</span>
							<div style={{ fontSize: 14, fontWeight: 700 }}>Best Feeding Plan</div>
						</div>
						{decisionRecommendations.find(r => r.text.toLowerCase().includes('feed') || r.primary_action === 'adjust_feed') ? (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								{decisionRecommendations.find(r => r.text.toLowerCase().includes('feed') || r.primary_action === 'adjust_feed')?.text}
							</div>
						) : (
							<div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>
								Feed <strong>{formatNumber(recommendedFeedRate * 1.08, { maximumFractionDigits: 0 })} kg</strong> at <strong>7:00 AM</strong> and <strong>{formatNumber(recommendedFeedRate * 0.7, { maximumFractionDigits: 0 })} kg</strong> at <strong>4:00 PM</strong>
								<br />
								<span style={{ color: 'var(--muted)', fontSize: 11 }}>Feed Type: 35% protein, balanced vitamins</span>
							</div>
						)}
					</div>

					{/* Optimal Labor Allocation */}
					<div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
							<span style={{ fontSize: 24 }}>👨‍🌾</span>
							<div style={{ fontSize: 14, fontWeight: 700 }}>Optimal Labor Allocation</div>
						</div>
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
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
							<span style={{ fontSize: 24 }}>⚡</span>
							<div style={{ fontSize: 14, fontWeight: 700 }}>Energy Optimization</div>
						</div>
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
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
							<span style={{ fontSize: 24 }}>🦐</span>
							<div style={{ fontSize: 14, fontWeight: 700 }}>Best Harvest Timing</div>
						</div>
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

				{/* Shrimp Feed Optimization */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">Shrimp Feed Optimization</div>
					</div>
					<div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
						<CircularProgress percentage={feedOptimized} size={140} color="#16a34a" />
						<div style={{ textAlign: 'center' }}>
							<div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Current FCR</div>
							<div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
								{formatNumber(recommendedFeedRate, { maximumFractionDigits: 0 })} kg/day
								<span style={{ fontSize: 14, color: 'var(--good)', marginLeft: 4 }}>↑</span>
							</div>
							<div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
								<span>🌿</span>
								<span>35% protein - balanced vitamins</span>
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

				{/* AI Recommendations Summary - Best Feeding Plan */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">AI Recommendations Summary</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--muted)' }}>Best Feeding Plan:</div>
						<div style={{ fontSize: 11, marginBottom: 8 }}>
							{formatNumber(recommendedFeedRate * 1.08, { maximumFractionDigits: 0 })} kg at: 7:00 AM and 8:00 PM
						</div>
						<div style={{ fontSize: 11, marginBottom: 12 }}>
							Feed Type: 35% protein, balanced vitamins
						</div>
						<div style={{ height: 80 }}>
							<Bar data={feedingPlanChart} options={chartOptions} />
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

				{/* AI Recommendations - Feed */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">AI Recommendations</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, lineHeight: 1.8 }}>
							<li>Feed: {formatNumber(recommendedFeedRate * 1.08, { maximumFractionDigits: 0 })} kg at 7:00 AM and {formatNumber(recommendedFeedRate * 0.7, { maximumFractionDigits: 0 })} kg at 4 PM</li>
							<li>Feed Type: 35% protein, balanced vitamins</li>
						</ul>
						<div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
							Optimal settings calibrated to maximize yield and profit.
						</div>
					</div>
				</div>

				{/* AI Recommendations - Water Quality */}
				<div className="panel">
					<div className="panelHeader">
						<div className="panelTitle">AI Recommendations</div>
					</div>
					<div style={{ padding: '8px 0' }}>
						<ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, lineHeight: 1.8 }}>
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
								Monday Wed/Fri: Net Cleaning <span>👥</span>
							</li>
							<li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
								Tuesday/Thursday: Aerator Maintenance <span>⚙️</span>
							</li>
						</ul>
						<div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							{['👤', '👤', '👤', '📊', '📊'].map((icon, i) => (
								<span key={i} style={{ fontSize: 16 }}>{icon}</span>
							))}
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
							<span>📅</span>
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
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>AI Recommendations:</div>
							<ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, lineHeight: 1.8 }}>
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
								<span>👥</span>
								<span>Net Cleaning & Shrimp Sampling</span>
							</div>
							<div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
								<span>⚙️</span>
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
		</div>
	)
}
