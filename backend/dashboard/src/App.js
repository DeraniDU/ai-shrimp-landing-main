import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import './App.css';

// Optimization Engine Component
function OptimizationEngine({ selectedPond }) {
  // Mock data for optimization engine
  const [optimizationState, setOptimizationState] = useState({
    costWeight: 40,
    yieldWeight: 35,
    riskWeight: 25,
    feedAmount: 125,
    feedType: '35%',
    feedingFreq: 3,
    fcr: 1.45,
    workersPerDay: 4,
    energyConsumption: 850,
    harvestReadiness: 75,
    harvestWindow: { start: '2024-12-15', end: '2024-12-22' },
    simulationMode: false
  });

  const multiObjectiveData = [
    { name: 'Cost', value: optimizationState.costWeight, fill: '#ef4444' },
    { name: 'Yield', value: optimizationState.yieldWeight, fill: '#10b981' },
    { name: 'Risk', value: optimizationState.riskWeight, fill: '#f59e0b' }
  ];

  const feedGrowthData = [
    { day: 1, feed: 100, biomass: 500 },
    { day: 5, feed: 110, biomass: 650 },
    { day: 10, feed: 120, biomass: 800 },
    { day: 15, feed: 125, biomass: 950 },
    { day: 20, feed: 130, biomass: 1100 }
  ];

  const laborScheduleData = [
    { time: '06:00', workers: 2, task: 'Feeding' },
    { time: '08:00', workers: 4, task: 'Sampling' },
    { time: '10:00', workers: 3, task: 'Monitoring' },
    { time: '14:00', workers: 2, task: 'Feeding' },
    { time: '16:00', workers: 3, task: 'Maintenance' }
  ];

  const energyHeatmapData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    pond1: Math.random() * 50 + 20,
    pond2: Math.random() * 50 + 25,
    pond3: Math.random() * 50 + 30
  }));

  const harvestProfitData = [
    { days: 0, profit: 8500, risk: 10 },
    { days: 5, profit: 9200, risk: 15 },
    { days: 10, profit: 9800, risk: 25 },
    { days: 15, profit: 10200, risk: 40 },
    { days: 20, profit: 9600, risk: 60 }
  ];

  const benchmarkData = [
    { metric: 'FCR', yourFarm: 1.45, top10: 1.35, average: 1.55 },
    { metric: 'Survival', yourFarm: 85, top10: 92, average: 78 },
    { metric: 'Cost/kg', yourFarm: 4.2, top10: 3.8, average: 4.8 },
    { metric: 'Yield', yourFarm: 8.5, top10: 10.2, average: 7.2 }
  ];

  const radarData = [
    { subject: 'FCR', A: 85, B: 100, fullMark: 100 },
    { subject: 'Survival', A: 82, B: 95, fullMark: 100 },
    { subject: 'Cost Efficiency', A: 88, B: 100, fullMark: 100 },
    { subject: 'Yield', A: 75, B: 100, fullMark: 100 },
    { subject: 'Sustainability', A: 90, B: 92, fullMark: 100 }
  ];

  const COLORS = ['#8884d8', '#82ca9d'];

  const recommendations = [
    { type: 'increase', icon: '✅', text: 'Increase feed in Pond 3 by 8%', pond: 3 },
    { type: 'decrease', icon: '⚠️', text: 'Reduce aeration in Pond 1 (energy waste)', pond: 1 },
    { type: 'monitor', icon: '🦠', text: 'Medium disease risk detected – monitor closely', pond: 2 },
    { type: 'harvest', icon: '⏱️', text: 'Harvest Pond 5 within 5–7 days', pond: 5 }
  ];

  return (
    <div className="optimization-engine">
      {/* Section 8: AI Recommendation Summary */}
      <div className="opt-section recommendation-summary">
        <h2>🎯 Daily AI Recommendations</h2>
        <div className="recommendations-grid">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-card">
              <span className="rec-icon">{rec.icon}</span>
              <span className="rec-text">{rec.text}</span>
              <button className="why-btn" onClick={() => alert('Feature importance explanation would appear here')}>
                Why?
              </button>
            </div>
          ))}
        </div>
        <div className="export-options">
          <button className="export-btn">📄 Export PDF</button>
          <button className="export-btn">📱 WhatsApp Summary</button>
          <button className="export-btn">🔔 Push Notification</button>
        </div>
      </div>

      {/* Section 1: Multi-Objective Optimization Panel */}
      <div className="opt-section multi-objective">
        <h2>1️⃣ Multi-Objective Optimization Panel</h2>
        <div className="objective-controls">
          <div className="slider-group">
            <label>Cost Minimization: {optimizationState.costWeight}%</label>
            <input type="range" min="0" max="100" value={optimizationState.costWeight}
              onChange={(e) => setOptimizationState({...optimizationState, costWeight: e.target.value})} />
          </div>
          <div className="slider-group">
            <label>Yield Maximization: {optimizationState.yieldWeight}%</label>
            <input type="range" min="0" max="100" value={optimizationState.yieldWeight}
              onChange={(e) => setOptimizationState({...optimizationState, yieldWeight: e.target.value})} />
          </div>
          <div className="slider-group">
            <label>Risk Minimization: {optimizationState.riskWeight}%</label>
            <input type="range" min="0" max="100" value={optimizationState.riskWeight}
              onChange={(e) => setOptimizationState({...optimizationState, riskWeight: e.target.value})} />
          </div>
        </div>
        <div className="objective-metrics">
          <div className="metric-card">
            <h4>🎯 Cost Minimization</h4>
            <p>Feed: $1,250/week</p>
            <p>Energy: $425/week</p>
            <p>Labor: $680/week</p>
          </div>
          <div className="metric-card">
            <h4>📈 Yield Maximization</h4>
            <p>Biomass Growth: +15%</p>
            <p>Survival Rate: 85%</p>
          </div>
          <div className="metric-card">
            <h4>⚖️ Risk Minimization</h4>
            <p>Disease Risk: Low</p>
            <p>Water Quality: Stable</p>
          </div>
          <div className="metric-card">
            <h4>🌱 Sustainability Score</h4>
            <p>FCR: 1.45</p>
            <p>Energy Efficiency: 92%</p>
          </div>
        </div>
        <div className="strategy-badge">
          <span className="badge profit-optimized">Recommended Strategy: Profit-Optimized</span>
        </div>
        <div className="objective-chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={multiObjectiveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: AI-Driven Feed Optimization */}
      <div className="opt-section feed-optimization">
        <h2>2️⃣ AI-Driven Feed Optimization</h2>
        <div className="feed-controls">
          <div className="feed-input-group">
            <label>Recommended Daily Feed (kg):</label>
            <input type="number" value={optimizationState.feedAmount}
              onChange={(e) => setOptimizationState({...optimizationState, feedAmount: e.target.value})} />
            <span className="unit">kg/day</span>
          </div>
          <div className="feed-input-group">
            <label>Feed Type (Protein %):</label>
            <select value={optimizationState.feedType}
              onChange={(e) => setOptimizationState({...optimizationState, feedType: e.target.value})}>
              <option>30%</option>
              <option>35%</option>
              <option>40%</option>
            </select>
          </div>
          <div className="feed-input-group">
            <label>Feeding Frequency:</label>
            <input type="number" min="1" max="5" value={optimizationState.feedingFreq}
              onChange={(e) => setOptimizationState({...optimizationState, feedingFreq: e.target.value})} />
            <span className="unit">times/day</span>
          </div>
        </div>
        <div className="feed-metrics">
          <div className="fcr-display">
            <h3>Predicted FCR: {optimizationState.fcr}</h3>
            <div className={`fcr-status ${optimizationState.fcr < 1.5 ? 'good' : 'warning'}`}>
              {optimizationState.fcr < 1.5 ? 'Excellent' : 'Good'}
            </div>
          </div>
          <div className="feed-alerts">
            <div className="alert-good">✅ Feed levels optimal</div>
            <div className="alert-info">💡 Consider increasing feed by 5% next week</div>
          </div>
        </div>
        <div className="feed-chart">
          <h3>Feed vs Biomass Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={feedGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="feed" stackId="1" stroke="#8884d8" fill="#8884d8" name="Feed (kg)" />
              <Area type="monotone" dataKey="biomass" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Biomass (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="what-if-simulator">
          <h3>What-If Feed Adjustment Simulation</h3>
          <div className="sim-inputs">
            <input type="number" placeholder="Adjust feed by %" />
            <button>Simulate Impact</button>
          </div>
        </div>
      </div>

      {/* Section 3: Labor & Task Scheduling Optimization */}
      <div className="opt-section labor-optimization">
        <h2>3️⃣ Labor & Task Scheduling Optimization</h2>
        <div className="labor-summary">
          <div className="labor-card">
            <h3>Optimal Workers per Day</h3>
            <div className="big-number">{optimizationState.workersPerDay}</div>
          </div>
          <div className="labor-card">
            <h3>Daily Labor Cost</h3>
            <div className="big-number">$680</div>
          </div>
          <div className="labor-card">
            <h3>AI Efficiency Score</h3>
            <div className="big-number">+23%</div>
            <small>vs manual scheduling</small>
          </div>
        </div>
        <div className="labor-comparison">
          <div className="comparison-item">
            <h4>Manual Scheduling</h4>
            <p>Cost: $880/day</p>
            <p>Workers: 5</p>
          </div>
          <div className="comparison-item ai-optimized">
            <h4>AI-Optimized</h4>
            <p>Cost: $680/day</p>
            <p>Workers: 4</p>
            <span className="savings">Save: $200/day</span>
          </div>
        </div>
        <div className="task-timeline">
          <h3>Suggested Work Shifts</h3>
          <div className="timeline-container">
            {laborScheduleData.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="time">{item.time}</div>
                <div className="workers">{item.workers} workers</div>
                <div className="task">{item.task}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Energy Optimization & Cost Forecasting */}
      <div className="opt-section energy-optimization">
        <h2>4️⃣ Energy Optimization & Cost Forecasting</h2>
        <div className="energy-summary">
          <div className="energy-card">
            <h3>Energy Consumption</h3>
            <div className="big-number">{optimizationState.energyConsumption} kWh/day</div>
          </div>
          <div className="energy-card savings">
            <h3>Cost Savings</h3>
            <div className="big-number">$125/week</div>
            <small>vs baseline</small>
          </div>
          <div className="energy-card">
            <h3>Aerator Schedule</h3>
            <div className="schedule-status">AI-Optimized</div>
          </div>
        </div>
        <div className="aerator-recommendations">
          <h3>AI-Recommended Aerator ON/OFF Schedule</h3>
          <div className="schedule-grid">
            {['Pond 1', 'Pond 2', 'Pond 3'].map(pond => (
              <div key={pond} className="schedule-item">
                <h4>{pond}</h4>
                <div className="schedule-times">
                  <span>ON: 06:00-10:00, 14:00-18:00</span>
                  <span>OFF: 10:00-14:00, 18:00-06:00</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="energy-chart">
          <h3>Energy Usage Heatmap (Hour vs Pond)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyHeatmapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pond1" fill="#8884d8" name="Pond 1" />
              <Bar dataKey="pond2" fill="#82ca9d" name="Pond 2" />
              <Bar dataKey="pond3" fill="#ffc658" name="Pond 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="energy-alert">
          <div className="alert-warning">⚠️ Energy usage in Pond 2 exceeds optimal by 15%</div>
        </div>
      </div>

      {/* Section 5: Harvest Timing Optimization */}
      <div className="opt-section harvest-optimization">
        <h2>5️⃣ Harvest Timing Optimization (Key Feature)</h2>
        <div className="harvest-main">
          <div className="harvest-readiness">
            <h3>Harvest Readiness</h3>
            <div className="gauge-container">
              <div className="gauge">
                <div className="gauge-fill" style={{
                  background: `conic-gradient(var(--success) 0deg ${optimizationState.harvestReadiness * 3.6}deg, #e5e7eb ${optimizationState.harvestReadiness * 3.6}deg 360deg)`
                }}></div>
                <div className="gauge-value">{optimizationState.harvestReadiness}%</div>
              </div>
            </div>
            <div className="harvest-window">
              <h4>Optimal Harvest Window</h4>
              <p>Start: {optimizationState.harvestWindow.start}</p>
              <p>End: {optimizationState.harvestWindow.end}</p>
            </div>
          </div>
          <div className="harvest-analysis">
            <h3>Trade-Off Analysis</h3>
            <div className="tradeoff-card">
              <h4>Harvest Now</h4>
              <p>Size: 18g avg</p>
              <p>Risk: Low (10%)</p>
              <p>Profit: $8,500</p>
            </div>
            <div className="tradeoff-card optimal">
              <h4>Harvest in 5-7 days (Recommended)</h4>
              <p>Size: 22g avg</p>
              <p>Risk: Medium (25%)</p>
              <p>Profit: $9,800</p>
            </div>
            <div className="tradeoff-card">
              <h4>Harvest in 15+ days</h4>
              <p>Size: 25g avg</p>
              <p>Risk: High (60%)</p>
              <p>Profit: $9,600</p>
            </div>
          </div>
        </div>
        <div className="profit-curve">
          <h3>Profit vs Time Curve</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={harvestProfitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" name="Profit ($)" />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="#ef4444" name="Risk (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="harvest-recommendation">
          <div className="ai-advice optimal">
            <h3>⏱️ AI Advice: Wait 5-7 Days</h3>
            <p>Optimal balance between size, profit, and risk</p>
          </div>
        </div>
      </div>

      {/* Section 6: Scenario Simulation */}
      <div className="opt-section scenario-simulation">
        <h2>6️⃣ Scenario Simulation (What-If Analysis)</h2>
        <div className="simulation-banner">
          <span className="sim-badge">📌 SIMULATION MODE - No Real Impact</span>
        </div>
        <div className="scenario-selector">
          <button className="scenario-btn">Increased Feed +10%</button>
          <button className="scenario-btn">Reduced Aeration -20%</button>
          <button className="scenario-btn">Delayed Harvest +2 weeks</button>
          <button className="scenario-btn">Disease Outbreak Scenario</button>
        </div>
        <div className="scenario-results">
          <h3>Simulation Results</h3>
          <div className="result-grid">
            <div className="result-card">
              <h4>Predicted Profit</h4>
              <div className="result-value positive">$9,200</div>
              <small>Change: +$700</small>
            </div>
            <div className="result-card">
              <h4>Mortality Rate</h4>
              <div className="result-value">8.5%</div>
              <small>Change: +1.2%</small>
            </div>
            <div className="result-card">
              <h4>Resource Cost Impact</h4>
              <div className="result-value negative">+$180</div>
              <small>Weekly increase</small>
            </div>
            <div className="result-card">
              <h4>FCR Impact</h4>
              <div className="result-value">1.48</div>
              <small>Change: +0.03</small>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Benchmarking */}
      <div className="opt-section benchmarking">
        <h2>7️⃣ Benchmarking Against Industry Standards</h2>
        <div className="benchmark-summary">
          <div className="rank-badge">
            <h3>Performance Rank</h3>
            <div className="rank-value top-25">Top 25%</div>
            <small>vs regional farms</small>
          </div>
          <div className="benchmark-comparison">
            <h3>Your Farm vs Top 10% vs Average</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="yourFarm" fill="#8884d8" name="Your Farm" />
                <Bar dataKey="top10" fill="#10b981" name="Top 10%" />
                <Bar dataKey="average" fill="#9ca3af" name="Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="radar-comparison">
          <h3>Multi-Metric Performance (Radar Chart)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Your Farm" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Top 10%" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 9: Explainability & Trust Layer */}
      <div className="opt-section explainability">
        <h2>9️⃣ Explainability & Trust Layer</h2>
        <div className="explainability-content">
          <div className="explain-card">
            <h3>Why This Recommendation?</h3>
            <button className="why-button" onClick={() => alert('Detailed explanation: The AI recommends increasing feed based on current biomass, water quality parameters, and growth trajectory analysis.')}>
              Show Explanation
            </button>
            <div className="feature-importance">
              <h4>Feature Importance</h4>
              <div className="importance-list">
                <div className="importance-item">
                  <span className="feature">Current Biomass</span>
                  <div className="importance-bar">
                    <div className="bar-fill" style={{width: '85%'}}>85%</div>
                  </div>
                </div>
                <div className="importance-item">
                  <span className="feature">Water Quality (DO)</span>
                  <div className="importance-bar">
                    <div className="bar-fill" style={{width: '72%'}}>72%</div>
                  </div>
                </div>
                <div className="importance-item">
                  <span className="feature">Growth Rate</span>
                  <div className="importance-bar">
                    <div className="bar-fill" style={{width: '68%'}}>68%</div>
                  </div>
                </div>
                <div className="importance-item">
                  <span className="feature">Historical FCR</span>
                  <div className="importance-bar">
                    <div className="bar-fill" style={{width: '55%'}}>55%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="confidence-score">
              <h4>Confidence Score</h4>
              <div className="confidence-level high">
                <span>High Confidence (87%)</span>
                <div className="confidence-bar">
                  <div className="bar-fill" style={{width: '87%', backgroundColor: '#10b981'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 10: Alerts & Constraints Panel */}
      <div className="opt-section constraints-panel">
        <h2>🔟 Alerts & Constraints Panel</h2>
        <div className="constraints-grid">
          <div className="constraint-card">
            <h3>Budget Limits</h3>
            <div className="constraint-status">
              <span className="status-good">✅ Within Budget</span>
              <p>Current: $12,500 / $15,000</p>
            </div>
          </div>
          <div className="constraint-card">
            <h3>Feed Availability</h3>
            <div className="constraint-status">
              <span className="status-warning">⚠️ Low Stock</span>
              <p>Available: 450 kg (2 weeks)</p>
            </div>
          </div>
          <div className="constraint-card">
            <h3>Labor Availability</h3>
            <div className="constraint-status">
              <span className="status-good">✅ Sufficient</span>
              <p>Workers: 4/4 available</p>
            </div>
          </div>
          <div className="constraint-card">
            <h3>Regulatory Limits</h3>
            <div className="constraint-status">
              <span className="status-good">✅ Compliant</span>
              <p>All parameters within limits</p>
            </div>
          </div>
        </div>
        <div className="constraints-alerts">
          <h3>Active Constraint Alerts</h3>
          <div className="alert-item warning">
            ⚠️ Feed stock running low. Order recommended within 3 days.
          </div>
          <div className="alert-item info">
            ℹ️ Energy usage approaching monthly budget limit (85%).
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ allData, selectedPond, setSelectedPond, history, getConditionColor }) {
  const data = allData[selectedPond] || {};
  const currentHistory = history[selectedPond] || [];
  const forecast = data.forecast || {};

  return (
    <>
      <header className="top-bar">
        <h1>AQUANEXT Water quality monitoring dashboard</h1>
        <div className="pond-selector">
          {['1', '2', '3'].map(id => (
            <button 
              key={id} 
              className={`pond-btn ${selectedPond === id ? 'active' : ''}`}
              onClick={() => setSelectedPond(id)}
            >
              Pond {id}
            </button>
          ))}
        </div>
      </header>

      <div className="status-bar">
        <div className={`system-status ${getConditionColor(data.condition)}`}>
          System Status: {data.condition}
        </div>
        {data.recommendation && (
          <div className="recommendation-banner">
            {data.recommendation}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Dissolved Oxygen</h3>
          <div className="value">{data.sensors?.DO?.toFixed(2)} <span className="unit">mg/L</span></div>
          <div className="sub-text">Target: &gt; 4.0</div>
        </div>
        <div className="stat-card">
          <h3>pH Level</h3>
          <div className="value">{data.sensors?.pH?.toFixed(2)} <span className="unit">pH</span></div>
          <div className="sub-text">Target: 6.5 - 8.5</div>
        </div>
        <div className="stat-card">
          <h3>Temperature</h3>
          <div className="value">{data.sensors?.Temperature?.toFixed(1)} <span className="unit">°C</span></div>
          <div className="sub-text">Target: 26 - 32</div>
        </div>
        <div className="stat-card">
          <h3>Salinity</h3>
          <div className="value">{data.sensors?.Salinity?.toFixed(1)} <span className="unit">ppt</span></div>
          <div className="sub-text">Target: 10 - 30</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="panel chart-panel" style={{ width: '100%', marginBottom: '20px' }}>
          <h2>Live Water Quality Trends</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={currentHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="DO" stroke="#8884d8" name="Dissolved Oxygen" />
                <Line type="monotone" dataKey="PredictedDO" stroke="#82ca9d" strokeDasharray="5 5" name="Predicted DO" />
                <Line type="monotone" dataKey="pH" stroke="#ff7300" name="pH Level" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="panel prediction-panel">
          <h2>AI Forecast (Next 6 Hours)</h2>
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Current</th>
                <th>Predicted</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dissolved Oxygen</td>
                <td>{data.sensors?.DO?.toFixed(2)}</td>
                <td>{forecast.DO?.toFixed(2)}</td>
                <td>{forecast.DO !== undefined && forecast.DO > data.sensors?.DO ? 'Up' : 'Down'}</td>
              </tr>
              <tr>
                <td>pH Level</td>
                <td>{data.sensors?.pH?.toFixed(2)}</td>
                <td>{forecast.pH?.toFixed(2)}</td>
                <td>{forecast.pH !== undefined && forecast.pH > data.sensors?.pH ? 'Up' : 'Down'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel alerts-panel">
          <div className="wqi-container">
            <div className="wqi-box">
              <h2>Current WQI</h2>
              <div className="wqi-circle">{data.wqi}</div>
            </div>
            <div className="wqi-box future-wqi">
              <h2>Future WQI</h2>
              <div className="wqi-circle future">{data.future_wqi}</div>
            </div>
          </div>
          
          <div className="alerts-list">
            <h3>Active Alerts</h3>
            {(!data.alerts || data.alerts.length === 0) ? (
              <div className="alert-item safe">No active alerts. Water is safe.</div>
            ) : (
              data.alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${alert.level}`}>
                  {alert.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [allData, setAllData] = useState(null);
  const [selectedPond, setSelectedPond] = useState('1');
  const [history, setHistory] = useState({ '1': [], '2': [], '3': [] });
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/api/dashboard')
        .then(res => res.json())
        .then(newData => {
          setAllData(newData);
          
          setHistory(prev => {
            const newHistory = { ...prev };
            Object.keys(newData).forEach(pondId => {
              const pondData = newData[pondId];
              if (pondData && pondData.sensors) {
                const newEntry = {
                  time: new Date().toLocaleTimeString(),
                  DO: pondData.sensors.DO,
                  pH: pondData.sensors.pH,
                  PredictedDO: pondData.forecast?.DO,
                  PredictedpH: pondData.forecast?.pH
                };
                newHistory[pondId] = [...(prev[pondId] || []), newEntry].slice(-20);
              }
            });
            return newHistory;
          });
        })
        .catch(err => console.error("API Error:", err));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!allData && currentView === 'dashboard') {
    return <div className="loading-screen">Connecting to AQUANEXT Gateway...</div>;
  }

  const getConditionColor = (cond) => {
    if (cond === 'Good') return 'status-good';
    if (cond === 'Medium') return 'status-medium';
    return 'status-bad';
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">AQUANEXT</div>
        <nav>
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </div>
          <div 
            className={`nav-item ${currentView === 'optimization' ? 'active' : ''}`}
            onClick={() => setCurrentView('optimization')}
          >
            Optimization Engine
          </div>
          <div className="nav-item">Settings</div>
        </nav>
      </aside>

      <main className="main-content">
        {currentView === 'dashboard' ? (
          <Dashboard 
            allData={allData} 
            selectedPond={selectedPond} 
            setSelectedPond={setSelectedPond}
            history={history}
            getConditionColor={getConditionColor}
          />
        ) : (
          <OptimizationEngine selectedPond={selectedPond} />
        )}
      </main>
    </div>
  );
}

export default App;