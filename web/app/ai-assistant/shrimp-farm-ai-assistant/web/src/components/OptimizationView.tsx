import { Bar } from 'react-chartjs-2'
import type { DashboardApiResponse, SavedFarmSnapshot } from '../lib/types'
import { formatNumber, formatDateTime } from '../lib/format'

type Props = {
	data: DashboardApiResponse
	history: SavedFarmSnapshot[]
	pondFilter: number | null
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
	const feedCostPerKg = 1.2
	const totalFeedCost = totalFeedKg * feedCostPerKg
	const totalLaborCost = labor.reduce((sum, l) => sum + l.time_spent * 15, 0) // $15/hour estimate

	const efficiencyChart = {
		labels: ['Feed', 'Energy', 'Labor'],
		datasets: [
			{
				label: 'Current Efficiency',
				data: [feedEfficiency * 100, energyEfficiency * 100, laborEfficiency * 100],
				backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)'],
				borderRadius: 6
			},
			{
				label: 'Target (90%)',
				data: [90, 90, 90],
				backgroundColor: 'rgba(17, 24, 39, 0.1)',
				borderColor: 'rgba(17, 24, 39, 0.3)',
				borderWidth: 2,
				borderDash: [5, 5],
				borderRadius: 6
			}
		]
	}

	const costBreakdown = {
		labels: ['Feed', 'Energy', 'Labor'],
		datasets: [
			{
				label: 'Cost ($)',
				data: [totalFeedCost, totalEnergyCost, totalLaborCost],
				backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)'],
				borderRadius: 6
			}
		]
	}

	const barOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: true, position: 'top' as const }
		},
		scales: {
			x: { grid: { display: false } },
			y: { grid: { color: 'rgba(17, 24, 39, 0.08)' }, max: 100, title: { display: true, text: 'Efficiency (%)' } }
		}
	}

	const costOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { grid: { color: 'rgba(17, 24, 39, 0.08)' }, title: { display: true, text: 'Cost ($)' } }
		}
	}

	const optimizationSuggestions = [
		{
			category: 'Energy',
			title: 'Optimize Aerator Usage',
			description: `Current energy efficiency is ${formatNumber(energyEfficiency * 100, { maximumFractionDigits: 0 })}%. Consider scheduling aerators based on DO levels.`,
			impact: 'High',
			savings: `~$${formatNumber(totalEnergyCost * 0.15, { maximumFractionDigits: 0 })}/day`
		},
		{
			category: 'Feed',
			title: 'Improve Feed Conversion',
			description: `Feed efficiency at ${formatNumber(feedEfficiency * 100, { maximumFractionDigits: 0 })}%. Adjust feeding schedule based on water temperature.`,
			impact: 'High',
			savings: `~$${formatNumber(totalFeedCost * 0.1, { maximumFractionDigits: 0 })}/day`
		},
		{
			category: 'Labor',
			title: 'Streamline Tasks',
			description: `Labor efficiency at ${formatNumber(laborEfficiency * 100, { maximumFractionDigits: 0 })}%. Automate routine monitoring tasks.`,
			impact: 'Medium',
			savings: `~$${formatNumber(totalLaborCost * 0.2, { maximumFractionDigits: 0 })}/day`
		}
	]

	return (
		<div className="dashGrid">
			<div className="panel spanAll">
				<div className="panelHeader">
					<div className="panelTitle">Optimization Overview</div>
					<div className="panelRight">
						<span className="muted">Updated {formatDateTime(dashboard.timestamp)}</span>
					</div>
				</div>
				<div className="summaryStrip" style={{ marginBottom: 20 }}>
					<div className="summaryItem">
						<div className="muted">Feed Efficiency</div>
						<div className="summaryValue mono">{formatNumber(feedEfficiency * 100, { maximumFractionDigits: 0 })}%</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Energy Efficiency</div>
						<div className="summaryValue mono">{formatNumber(energyEfficiency * 100, { maximumFractionDigits: 0 })}%</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Labor Efficiency</div>
						<div className="summaryValue mono">{formatNumber(laborEfficiency * 100, { maximumFractionDigits: 0 })}%</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Overall Health</div>
						<div className="summaryValue mono">{formatNumber(dashboard.overall_health_score * 100, { maximumFractionDigits: 0 })}%</div>
					</div>
				</div>
			</div>

			<div className="panel">
				<div className="panelHeader">
					<div className="panelTitle">Efficiency Metrics</div>
				</div>
				<div className="chartBoxLg" style={{ height: 300 }}>
					<Bar data={efficiencyChart} options={barOptions} />
				</div>
			</div>

			<div className="panel">
				<div className="panelHeader">
					<div className="panelTitle">Cost Breakdown</div>
				</div>
				<div className="chartBoxLg" style={{ height: 300 }}>
					<Bar data={costBreakdown} options={costOptions} />
				</div>
				<div className="kpiStrip" style={{ marginTop: 16 }}>
					<div className="kpiMini">
						<div className="muted">Total Daily Cost</div>
						<div className="kpiMiniValue mono">
							${formatNumber(totalFeedCost + totalEnergyCost + totalLaborCost, { maximumFractionDigits: 2 })}
						</div>
					</div>
				</div>
			</div>

			<div className="panel spanAll">
				<div className="panelHeader">
					<div className="panelTitle">Optimization Recommendations</div>
				</div>
				<div style={{ padding: 16 }}>
					{optimizationSuggestions.map((suggestion, i) => (
						<div
							key={i}
							style={{
								marginBottom: 12,
								padding: 16,
								backgroundColor: 'rgba(255, 255, 255, 0.5)',
								borderLeft: '4px solid rgba(37, 99, 235, 0.6)',
								borderRadius: 8
							}}
						>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
								<div>
									<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
										<span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>{suggestion.category}</span>
										<span className="chip info">{suggestion.impact} Impact</span>
									</div>
									<div style={{ fontWeight: 600, marginBottom: 4 }}>{suggestion.title}</div>
									<div className="muted" style={{ lineHeight: 1.5 }}>
										{suggestion.description}
									</div>
								</div>
								<div style={{ textAlign: 'right' }}>
									<div className="muted" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
										Potential Savings
									</div>
									<div style={{ fontWeight: 600, color: 'var(--good)' }}>{suggestion.savings}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

