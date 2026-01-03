export type AlertPriority = 'info' | 'warning' | 'critical'

export type WaterQualityStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'

export type FarmInsight = {
	timestamp: string
	insight_type: string
	priority: AlertPriority
	message: string
	recommendations: string[]
	affected_ponds: number[]
	data: Record<string, unknown>
}

export type ShrimpFarmDashboard = {
	timestamp: string
	overall_health_score: number
	water_quality_summary: Record<string, WaterQualityStatus>
	feed_efficiency: number
	energy_efficiency: number
	labor_efficiency: number
	insights: FarmInsight[]
	alerts: string[]
	recommendations: string[]
}

export type ActionType =
	| 'no_action'
	| 'increase_aeration'
	| 'decrease_aeration'
	| 'water_exchange'
	| 'adjust_feed'
	| 'emergency_response'
	| 'allocate_workers'
	| 'equipment_maintenance'
	| 'monitor_closely'

export type DecisionOutput = {
	timestamp: string
	pond_id: number
	primary_action: ActionType
	action_intensity: number
	secondary_actions: ActionType[]
	priority_rank: number
	urgency_score: number
	recommended_feed_amount: number | null
	recommended_aerator_level: number | null
	recommended_pump_level: number | null
	recommended_heater_level: number | null
	confidence: number
	reasoning: string
	affected_factors: string[]
}

export type MultiPondDecision = {
	timestamp: string
	pond_priorities: Record<string, number>
	urgent_ponds: number[]
	recommended_actions: Record<string, DecisionOutput>
	overall_urgency: number
	resource_allocation: Record<string, number>
}

export type DecisionRecommendation = {
	pond_id: number
	priority_rank: number
	urgency_score: number
	confidence: number
	primary_action: ActionType
	text: string
}

export type WaterQualityData = {
	timestamp: string
	pond_id: number
	ph: number
	temperature: number
	dissolved_oxygen: number
	salinity: number
	ammonia: number
	nitrite: number
	nitrate: number
	turbidity: number
	status: WaterQualityStatus
	alerts: string[]
}

export type FeedData = {
	timestamp: string
	pond_id: number
	shrimp_count: number
	average_weight: number
	feed_amount: number
	feed_type: string
	feeding_frequency: number
	predicted_next_feeding: string
}

export type EnergyData = {
	timestamp: string
	pond_id: number
	aerator_usage: number
	pump_usage: number
	heater_usage: number
	total_energy: number
	cost: number
	efficiency_score: number
}

export type LaborData = {
	timestamp: string
	pond_id: number
	tasks_completed: string[]
	time_spent: number
	worker_count: number
	efficiency_score: number
	next_tasks: string[]
}

export type DashboardApiResponse = {
	dashboard: ShrimpFarmDashboard
	water_quality: WaterQualityData[]
	feed: FeedData[]
	energy: EnergyData[]
	labor: LaborData[]
	decision_agent_type?: string | null
	decisions?: MultiPondDecision | null
	decision_recommendations?: DecisionRecommendation[]
}

// Saved JSON snapshots (farm_data_*.json) are intentionally "lightweight" and may omit
// fields that the live API provides. These types model that on-disk schema.
export type SavedWaterQuality = {
	pond_id: number
	ph: number
	temperature: number
	dissolved_oxygen: number
	salinity: number
	status: WaterQualityStatus
	alerts: string[]
}

export type SavedFeed = {
	pond_id: number
	shrimp_count: number
	average_weight: number
	feed_amount: number
	feed_type: string
	feeding_frequency: number
}

export type SavedEnergy = {
	pond_id: number
	total_energy: number
	cost: number
	efficiency_score: number
}

export type SavedLabor = {
	pond_id: number
	tasks_completed: string[]
	time_spent: number
	worker_count: number
	efficiency_score: number
}

export type SavedFarmSnapshot = {
	source?: string
	timestamp: string
	water_quality: SavedWaterQuality[]
	feed: SavedFeed[]
	energy: SavedEnergy[]
	labor: SavedLabor[]
}

export type HistoryApiResponse = {
	count: number
	items: SavedFarmSnapshot[]
}





