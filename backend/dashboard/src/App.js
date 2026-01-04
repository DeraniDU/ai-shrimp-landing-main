import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/api/dashboard')
        .then(res => res.json())
        .then(newData => {
          setData(newData);
          if (newData && newData.sensors) {
            setHistory(prev => {
              const newEntry = {
                time: new Date().toLocaleTimeString(),
                DO: newData.sensors.DO,
                pH: newData.sensors.pH,
                PredictedDO: newData.forecast?.DO,
                PredictedpH: newData.forecast?.pH
              };
              const newHistory = [...prev, newEntry];
              return newHistory.slice(-20); // Keep last 20 points
            });
          }
        })
        .catch(err => console.error("API Error:", err));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data || !data.sensors) return <div className="loading-screen">Connecting to IoT Gateway...</div>;

  // Ensure forecast exists to prevent crashes
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
        <div className="logo">🦐 AquaAI</div>
        <nav>
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item">Analytics</div>
          <div className="nav-item">Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h1>Pond #1 Overview</h1>
          <div className={`system-status ${getConditionColor(data.condition)}`}>
            System Status: {data.condition}
          </div>
        </header>

        {/* Sensor Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Dissolved Oxygen</h3>
            <div className="value">{data.sensors.DO.toFixed(2)} <span className="unit">mg/L</span></div>
            <div className="sub-text">Target: > 4.0</div>
          </div>
          <div className="stat-card">
            <h3>pH Level</h3>
            <div className="value">{data.sensors.pH.toFixed(2)} <span className="unit">pH</span></div>
            <div className="sub-text">Target: 6.5 - 8.5</div>
          </div>
          <div className="stat-card">
            <h3>Temperature</h3>
            <div className="value">{data.sensors.Temperature.toFixed(1)} <span className="unit">°C</span></div>
            <div className="sub-text">Target: 26 - 32</div>
          </div>
          <div className="stat-card">
            <h3>Salinity</h3>
            <div className="value">{data.sensors.Salinity.toFixed(1)} <span className="unit">ppt</span></div>
            <div className="sub-text">Target: 10 - 30</div>
          </div>
        </div>

        <div className="dashboard-row">
          {/* Live Chart */}
          <div className="panel chart-panel" style={{ width: '100%', marginBottom: '20px' }}>
            <h2>📈 Live Water Quality Trends</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={history}>
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
            <h2>🤖 AI Forecast (Next 6 Hours)</h2>
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
                  <td>{data.sensors.DO.toFixed(2)}</td>
                  <td>{forecast.DO?.toFixed(2)}</td>
                  <td>{forecast.DO !== undefined && forecast.DO > data.sensors.DO ? '⬆️' : '⬇️'}</td>
                </tr>
                <tr>
                  <td>pH Level</td>
                  <td>{data.sensors.pH.toFixed(2)}</td>
                  <td>{forecast.pH?.toFixed(2)}</td>
                  <td>{forecast.pH !== undefined && forecast.pH > data.sensors.pH ? '⬆️' : '⬇️'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* WQI & Alerts */}
          <div className="panel alerts-panel">
            <div className="wqi-box">
              <h2>Water Quality Index</h2>
              <div className="wqi-circle">{data.wqi}</div>
            </div>
            <div className="alerts-list">
              <h3>Active Alerts</h3>
              {data.alerts.length === 0 ? (
                <div className="alert-item safe">✅ No active alerts. Water is safe.</div>
              ) : (
                data.alerts.map((alert, idx) => (
                  <div key={idx} className={`alert-item ${alert.level}`}>
                    ⚠️ {alert.msg}
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
