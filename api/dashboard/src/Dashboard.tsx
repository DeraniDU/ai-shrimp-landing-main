import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertCircle, CheckCircle, TrendingDown, Droplet, Wind, Thermometer, Activity, Download, Settings, RefreshCw } from 'lucide-react';

interface Sensor {
  DO: number;
  pH: number;
  Temp: number;
  Turbidity: number;
  Ammonia: number;
  Nitrite: number;
}

interface Prediction {
  DO: number;
  pH: number;
  Ammonia: number;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [sensorData, setSensorData] = useState<Sensor | null>(null);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState({
    doMin: 4.0,
    doWarn: 5.0,
    phMin: 7.0,
    phMax: 9.0,
    tempMin: 20,
    tempMax: 34,
    ammoniaMax: 0.5,
  });
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/sensors`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.sensors) {
        setSensorData({
          DO: data.sensors['DO(mg/L)'] || 0,
          pH: data.sensors['pH'] || 0,
          Temp: data.sensors['Temp'] || 0,
          Turbidity: data.sensors['Turbidity (cm)'] || 0,
          Ammonia: data.sensors['Ammonia (mg L-1 )'] || 0,
          Nitrite: data.sensors['Nitrite (mg L-1 )'] || 0,
        });
        if (data.rf) setPredictions(data.rf);
      }
      // Add to history
      setHistory(prev => [...prev.slice(-99), { ...data, ts: new Date(data.ts * 1000) }]);
      checkAlerts(data);
    };

    return () => wsRef.current?.close();
  }, []);

  // Fetch initial history
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/dashboard/history?limit=100');
      const data = await res.json();
      setHistory(data.map((d: any) => ({ ...d, ts: new Date(d.ts * 1000) })));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const checkAlerts = (data: any) => {
    const newAlerts: Alert[] = [];
    const sensors = data.sensors || {};
    const ts = new Date();

    // DO alerts
    if (sensors['DO(mg/L)'] && sensors['DO(mg/L)'] < thresholds.doMin) {
      newAlerts.push({
        id: `do-critical-${ts.getTime()}`,
        level: 'critical',
        message: `⚠️ CRITICAL: Dissolved Oxygen at ${sensors['DO(mg/L)'].toFixed(1)} mg/L (below ${thresholds.doMin})`,
        action: 'Turn ON aerator immediately!',
        timestamp: ts,
      });
    } else if (sensors['DO(mg/L)'] && sensors['DO(mg/L)'] < thresholds.doWarn) {
      newAlerts.push({
        id: `do-warn-${ts.getTime()}`,
        level: 'warning',
        message: `⚠️ WARNING: DO dropping to ${sensors['DO(mg/L)'].toFixed(1)} mg/L`,
        action: 'Monitor closely. Consider turning on aerator.',
        timestamp: ts,
      });
    }

    // Ammonia alerts
    if (sensors['Ammonia (mg L-1 )'] && sensors['Ammonia (mg L-1 )'] > thresholds.ammoniaMax) {
      newAlerts.push({
        id: `ammonia-${ts.getTime()}`,
        level: 'warning',
        message: `⚠️ High Ammonia: ${sensors['Ammonia (mg L-1 )'].toFixed(2)} mg/L`,
        action: 'Partial water exchange recommended. Check feeding rate.',
        timestamp: ts,
      });
    }

    // pH alerts
    if (sensors['pH'] && (sensors['pH'] < thresholds.phMin || sensors['pH'] > thresholds.phMax)) {
      newAlerts.push({
        id: `ph-${ts.getTime()}`,
        level: 'warning',
        message: `⚠️ pH out of range: ${sensors['pH'].toFixed(1)}`,
        action: 'Investigate pH cause. May need lime or aeration adjustment.',
        timestamp: ts,
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  const downloadHistory = async () => {
    try {
      const res = await fetch('/dashboard/history.csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'water_quality_history.csv';
      a.click();
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 border-red-400 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default: return 'bg-green-100 border-green-400 text-green-800';
    }
  };

  const getDoStatus = () => {
    if (!sensorData) return { status: 'unknown', color: 'gray' };
    if (sensorData.DO < thresholds.doMin) return { status: 'Critical', color: 'red' };
    if (sensorData.DO < thresholds.doWarn) return { status: 'Warning', color: 'yellow' };
    return { status: 'Good', color: 'green' };
  };

  const doStatus = getDoStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🌾 Shrimp Pond Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time Water Quality Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchHistory}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={18} /> Refresh
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Settings size={18} /> Settings
            </button>
            <button
              onClick={downloadHistory}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DO Min (Critical)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.doMin}
                onChange={(e) => setThresholds({ ...thresholds, doMin: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DO Warn</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.doWarn}
                onChange={(e) => setThresholds({ ...thresholds, doWarn: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">pH Range</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.phMin}
                onChange={(e) => setThresholds({ ...thresholds, phMin: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ammonia Max</label>
              <input
                type="number"
                step="0.05"
                value={thresholds.ammoniaMax}
                onChange={(e) => setThresholds({ ...thresholds, ammoniaMax: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Critical Alerts */}
        {alerts.filter(a => a.level === 'critical').length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-red-800 text-lg">IMMEDIATE ACTION REQUIRED</h3>
                {alerts
                  .filter(a => a.level === 'critical')
                  .map(alert => (
                    <div key={alert.id} className="mt-2 text-red-700">
                      <p className="font-semibold">{alert.message}</p>
                      <p className="text-lg font-bold">👉 {alert.action}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* DO Card */}
          <div className={`rounded-lg shadow-md p-6 text-white font-bold text-center transform transition hover:scale-105 ${
            doStatus.color === 'red' ? 'bg-red-500' :
            doStatus.color === 'yellow' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Droplet size={24} />
              <span>Dissolved Oxygen</span>
            </div>
            <div className="text-3xl font-bold">{sensorData?.DO.toFixed(1) || '–'} mg/L</div>
            <div className="text-sm mt-2 opacity-90">{doStatus.status}</div>
            <div className="text-xs mt-2 opacity-75">Min: {thresholds.doMin} | Warn: {thresholds.doWarn}</div>
          </div>

          {/* pH Card */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md p-6 text-white font-bold text-center transform transition hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity size={24} />
              <span>pH Level</span>
            </div>
            <div className="text-3xl font-bold">{sensorData?.pH.toFixed(1) || '–'}</div>
            <div className="text-sm mt-2 opacity-90">
              {sensorData && sensorData.pH >= thresholds.phMin && sensorData.pH <= thresholds.phMax ? 'Good' : 'Warning'}
            </div>
            <div className="text-xs mt-2 opacity-75">Range: {thresholds.phMin}–{thresholds.phMax}</div>
          </div>

          {/* Temperature Card */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-md p-6 text-white font-bold text-center transform transition hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Thermometer size={24} />
              <span>Temperature</span>
            </div>
            <div className="text-3xl font-bold">{sensorData?.Temp.toFixed(1) || '–'}°C</div>
            <div className="text-sm mt-2 opacity-90">
              {sensorData && sensorData.Temp >= thresholds.tempMin && sensorData.Temp <= thresholds.tempMax ? 'Good' : 'Check'}
            </div>
            <div className="text-xs mt-2 opacity-75">Range: {thresholds.tempMin}–{thresholds.tempMax}°C</div>
          </div>

          {/* Ammonia Card */}
          <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-lg shadow-md p-6 text-white font-bold text-center transform transition hover:scale-105">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wind size={24} />
              <span>Ammonia</span>
            </div>
            <div className="text-3xl font-bold">{sensorData?.Ammonia.toFixed(2) || '–'} mg/L</div>
            <div className="text-sm mt-2 opacity-90">
              {sensorData && sensorData.Ammonia <= thresholds.ammoniaMax ? 'Good' : 'High!'}
            </div>
            <div className="text-xs mt-2 opacity-75">Max: {thresholds.ammoniaMax}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* DO Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Dissolved Oxygen Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history.slice(-24)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(d) => new Date(d).toLocaleTimeString()}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value.toFixed(2), 'mg/L']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey={(d) => d.sensors?.['DO(mg/L)'] || 0}
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => thresholds.doMin}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-parameter Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Water Quality Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history.slice(-24)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(d) => new Date(d).toLocaleTimeString()}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={(d) => d.sensors?.['pH'] || 0}
                  stroke="#a855f7"
                  dot={false}
                  name="pH"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={(d) => d.sensors?.['Temp'] || 0}
                  stroke="#f97316"
                  dot={false}
                  name="Temp (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Log */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🚨 Alert History</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded text-green-700">
                <CheckCircle size={20} />
                <span>All systems operating normally</span>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`border-l-4 p-4 rounded ${getStatusColor(alert.level)}`}>
                  <div className="font-semibold">{alert.message}</div>
                  <div className="text-sm mt-1">→ {alert.action}</div>
                  <div className="text-xs opacity-75 mt-1">{alert.timestamp.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-2">🔄 Real-time monitoring via WebSocket</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
