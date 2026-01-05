import type { ReactNode } from 'react'

type NavItem = {
	id: string
	label: string
	icon: string
}

type Props = {
	activeView: string
	onViewChange: (view: string) => void
}

const navItems: NavItem[] = [
	{ id: 'dashboard', label: 'Dashboard', icon: '📊' },
	{ id: 'forecasting', label: 'Forecasting', icon: '🔮' },
	{ id: 'optimization', label: 'Optimization', icon: '⚡' },
	{ id: 'water-quality', label: 'Water Quality', icon: '💧' },
	{ id: 'feeding', label: 'Feeding', icon: '🍽️' },
	{ id: 'disease-detection', label: 'Disease Detection', icon: '🦠' },
	{ id: 'settings', label: 'Settings', icon: '⚙️' }
]

export function Sidebar({ activeView, onViewChange }: Props) {
	return (
		<div className="sidebar">
			<div className="sidebarHeader">
				<div className="sidebarBrand">
					<div className="sidebarBrandMark" aria-hidden="true" />
					<span className="sidebarBrandText">Shrimp Farm AI</span>
				</div>
			</div>
			<nav className="sidebarNav">
				{navItems.map((item) => (
					<button
						key={item.id}
						className={`sidebarNavItem ${activeView === item.id ? 'active' : ''}`}
						onClick={() => onViewChange(item.id)}
						type="button"
					>
						<span className="sidebarNavIcon">{item.icon}</span>
						<span className="sidebarNavLabel">{item.label}</span>
					</button>
				))}
			</nav>
		</div>
	)
}

