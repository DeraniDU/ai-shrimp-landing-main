import { Line, Bar } from 'react-chartjs-2'
import type { DashboardApiResponse, SavedFarmSnapshot } from '../lib/types'
import { formatNumber, formatDateTime } from '../lib/format'

type Props = {
	data: DashboardApiResponse
	history: SavedFarmSnapshot[]
	pondFilter: number | null
}

export function ForecastingView({ data, history, pondFilter }: Props) {
	const feed = pondFilter ? data.feed.filter((f) => f.pond_id === pondFilter) : data.feed
	const historyFiltered = history.map((snap) => ({
		...snap,
		feed: pondFilter ? snap.feed.filter((f) => f.pond_id === pondFilter) : snap.feed
	}))

	const historyLabels = historyFiltered.map((h) => {
		const d = new Date(h.timestamp)
		return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
	})

	const historyAvgWeight = historyFiltered.map((h) => {
		const weights = h.feed.map((f) => f.average_weight)
		return weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0
	})

	// Simple growth rate calculation
	const growthRate = historyAvgWeight.length >= 2
		? (historyAvgWeight[historyAvgWeight.length - 1] - historyAvgWeight[historyAvgWeight.length - 2]) / 7 // per week
		: 0.5

	const currentWeight = historyAvgWeight[historyAvgWeight.length - 1] || 10
	const targetWeight = 22 // Typical harvest weight
	const daysToHarvest = Math.max(10, Math.min(60, Math.round((targetWeight - currentWeight) / (growthRate * 7))))

	// Forecast next 30 days
	const forecastDays = 30
	const forecastLabels: string[] = []
	const forecastWeights: number[] = []
	const forecastBiomass: number[] = []

	for (let i = 1; i <= forecastDays; i++) {
		const date = new Date()
		date.setDate(date.getDate() + i)
		forecastLabels.push(date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }))
		const projectedWeight = Math.min(targetWeight, currentWeight + (growthRate * 7 * i) / 7)
		forecastWeights.push(projectedWeight)
		const totalBiomass = feed.reduce((sum, f) => sum + (f.shrimp_count * projectedWeight) / 1000, 0)
		forecastBiomass.push(totalBiomass)
	}

	const growthChart = {
		labels: [...historyLabels, ...forecastLabels],
		datasets: [
			{
				label: 'Historical',
				data: [...historyAvgWeight, ...Array(forecastDays).fill(null)],
				borderColor: '#2563eb',
				backgroundColor: 'rgba(37, 99, 235, 0.1)',
				fill: true,
				borderDash: []
			},
			{
				label: 'Forecast',
				data: [...Array(historyAvgWeight.length).fill(null), ...forecastWeights],
				borderColor: '#16a34a',
				backgroundColor: 'rgba(22, 163, 74, 0.1)',
				fill: true,
				borderDash: [5, 5]
			}
		]
	}

	const biomassChart = {
		labels: forecastLabels.slice(0, 14), // Show 2 weeks
		datasets: [
			{
				label: 'Projected Biomass (kg)',
				data: forecastBiomass.slice(0, 14),
				backgroundColor: 'rgba(34, 197, 94, 0.75)',
				borderRadius: 6
			}
		]
	}

	const lineOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: true, position: 'top' as const },
			tooltip: { mode: 'index' as const, intersect: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { grid: { color: 'rgba(17, 24, 39, 0.08)' }, title: { display: true, text: 'Weight (g)' } }
		}
	}

	const barOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		},
		scales: {
			x: { grid: { display: false } },
			y: { grid: { color: 'rgba(17, 24, 39, 0.08)' }, title: { display: true, text: 'Biomass (kg)' } }
		}
	}

	return (
		<div className="dashGrid">
			<div className="panel spanAll">
				<div className="panelHeader">
					<div className="panelTitle">Growth Forecasting</div>
					<div className="panelRight">
						<span className="muted">Updated {formatDateTime(data.dashboard.timestamp)}</span>
					</div>
				</div>
				<div className="summaryStrip" style={{ marginBottom: 20 }}>
					<div className="summaryItem">
						<div className="muted">Current Avg. Weight</div>
						<div className="summaryValue mono">{formatNumber(currentWeight, { maximumFractionDigits: 1 })} g</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Growth Rate</div>
						<div className="summaryValue mono">{formatNumber(growthRate, { maximumFractionDigits: 2 })} g/week</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Projected Harvest</div>
						<div className="summaryValue mono">{daysToHarvest} days</div>
					</div>
					<div className="summaryItem">
						<div className="muted">Target Weight</div>
						<div className="summaryValue mono">{targetWeight} g</div>
					</div>
				</div>
				<div className="chartBoxLg" style={{ height: 300 }}>
					<Line data={growthChart as never} options={lineOptions} />
				</div>
			</div>

			<div className="panel">
				<div className="panelHeader">
					<div className="panelTitle">Biomass Projection (14 days)</div>
				</div>
				<div className="chartBoxLg" style={{ height: 250 }}>
					<Bar data={biomassChart} options={barOptions} />
				</div>
			</div>

			<div className="panel">
				<div className="panelHeader">
					<div className="panelTitle">Forecast Insights</div>
				</div>
				<div style={{ padding: 16 }}>
					<div style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: 8 }}>
						<div style={{ fontWeight: 600, marginBottom: 4 }}>Harvest Window</div>
						<div className="muted">
							Based on current growth rate, optimal harvest is projected in <strong>{daysToHarvest} days</strong>. Monitor
							water quality and feeding to maintain growth trajectory.
						</div>
					</div>
					<div style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: 8 }}>
						<div style={{ fontWeight: 600, marginBottom: 4 }}>Growth Trend</div>
						<div className="muted">
							Growth rate is {growthRate > 0.5 ? 'healthy' : 'below optimal'}. Current trajectory suggests{' '}
							{currentWeight < 15 ? 'continued growth phase' : 'approaching harvest readiness'}.
						</div>
					</div>
					<div style={{ padding: 12, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: 8 }}>
						<div style={{ fontWeight: 600, marginBottom: 4 }}>Recommendations</div>
						<div className="muted">
							<ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
								<li>Maintain optimal water temperature (26-30°C)</li>
								<li>Ensure adequate feeding schedule</li>
								<li>Monitor dissolved oxygen levels</li>
								<li>Prepare harvest equipment in {Math.max(7, daysToHarvest - 7)} days</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

