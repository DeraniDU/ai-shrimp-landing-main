import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [allData, setAllData] = useState(null);
  const [selectedPond, setSelectedPond] = useState('1');
  const [history, setHistory] = useState({ '1': [], '2': [], '3': [] });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/api/dashboard')
        .then(res => res.json())
        .then(newData => {
          setAllData(newData);
          
          // Update history for all ponds
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

  if (!allData) return <div className="loading-screen">Connecting to AQUANEXT Gateway...</div>;

  const data = allData[selectedPond] || {};
  const currentHistory = history[selectedPond] || [];
  const forecast = data.forecast || {};

  const getConditionColor = (cond) => {
    if (cond === 'Good') return 'status-good';
    if (cond === 'Medium') return 'status-medium';
    return 'status-bad';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">AQUANEXT</div>
        <nav>
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item">Analytics</div>
          <div className="nav-item">Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
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

        {/* Sensor Cards */}
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
          {/* Live Chart */}
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
          {/* AI Predictions */}
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

          {/* WQI & Alerts */}
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
      </main>
    </div>
  );
}

export default App;
