import React, {useEffect, useState, useRef} from 'react'

export default function Home(){
  const [latest, setLatest] = useState(null)
  const [simulating, setSimulating] = useState(false)
  const [serverSimStatus, setServerSimStatus] = useState(null)
  const [lastSim, setLastSim] = useState(null)
  const [summary, setSummary] = useState(null)
  const samplesRef = useRef([]) // accumulate for hourly average
  const intervalRef = useRef(null)
  const hourlyRef = useRef(null)

  useEffect(()=>{
    fetch('/dashboard/latest').then(r=>r.json()).then(setLatest).catch(()=>setLatest(null))
    // refresh server simulator status on mount
    refreshServerSimStatus()
    // fetch summary for overall status
    fetch('/dashboard/history?limit=200').then(r=>r.json()).then(rows=>{
      if(!rows || rows.length===0) return setSummary(null)
      const counts = {Good:0, Warning:0, Dangerous:0}
      let sumDO=0, sumPH=0, sumAm=0, n=0
      rows.forEach(h=>{
        const label = h.svm?.label || (h.svm && (h.svm.class===0? 'Good': h.svm.class===1? 'Warning':'Dangerous'))
        if(label) counts[label] = (counts[label]||0)+1
        const dov = Number(h.rf?.['DO(mg/L)'] ?? h.sensors?.['DO(mg/L)'] ?? NaN)
        const phv = Number(h.rf?.pH ?? h.sensors?.pH ?? NaN)
        const amv = Number(h.rf?.['Ammonia (mg L-1 )'] ?? h.sensors?.['Ammonia (mg L-1 )'] ?? NaN)
        if(!isNaN(dov)){ sumDO+=dov; n++ }
        if(!isNaN(phv) && !isNaN(amv)){ sumPH+=phv; sumAm+=amv }
      })
      setSummary({counts, avgDO: n? +(sumDO/n).toFixed(2) : null, avgPH: +(sumPH/rows.length).toFixed(2), avgAm: +(sumAm/rows.length).toFixed(3), total: rows.length})
    }).catch(()=>setSummary(null))
  },[])

  // WebSocket listener for live updates from server broadcasts
  useEffect(()=>{
    let ws
    try{
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.hostname || '127.0.0.1'
      // Always point websocket to backend port 8000 where FastAPI runs
      const backendPort = 8000
      const wsUrl = `${proto}://${host}:${backendPort}/ws/sensors`
      ws = new WebSocket(wsUrl)
      ws.onopen = ()=> console.log('ws open', wsUrl)
      ws.onmessage = (ev)=>{
        try{
          const data = JSON.parse(ev.data)
          // update latest and push into accumulated samples
          setLatest(data)
          if(data && data.sensors) samplesRef.current.push({ sensors: data.sensors, ts: Date.now() })
        }catch(e){ console.warn('ws parse', e) }
      }
      ws.onclose = ()=> console.log('ws closed')
      ws.onerror = (e)=> console.warn('ws error', e)
    }catch(e){ console.warn('ws setup failed', e) }
    return ()=>{ if(ws) ws.close() }
  },[])

  useEffect(()=>{
    return ()=>{
      // cleanup intervals
      if(intervalRef.current) clearInterval(intervalRef.current)
      if(hourlyRef.current) clearInterval(hourlyRef.current)
    }
  },[])

  const renderBadge = (label)=>{
    // accept numeric classes as well
    const mapped = label === 0 || label === '0' ? 'Good' : label === 1 || label === '1' ? 'Warning' : label === 2 || label === '2' ? 'Dangerous' : label
    const cls = mapped === 'Good' ? 'bg-emerald-100 text-emerald-800' : mapped==='Warning'? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{mapped}</span>
  }

  // sensor simulation generator
  const genReading = ()=>{
    // base values and small random noise
    const rand = (mean, sd=0.1) => +(mean + (Math.random()*2 -1) * sd).toFixed(3)
    return {
      'Temp': rand(29, 1.2),
      'Turbidity (cm)': rand(35,5),
      'DO(mg/L)': rand(4.5, 1.2),
      'BOD (mg/L)': rand(3,0.5),
      'CO2': rand(6,1),
      'pH': rand(7.8, 0.3),
      'Alkalinity (mg L-1 )': rand(120,10),
      'Hardness (mg L-1 )': rand(130,10),
      'Calcium (mg L-1 )': rand(90,8),
      'Ammonia (mg L-1 )': rand(0.4,0.2),
      'Nitrite (mg L-1 )': rand(0.15,0.05),
      'Phosphorus (mg L-1 )': rand(0.2,0.05),
      'H2S (mg L-1 )': rand(0.002,0.001),
      'Plankton (No. L-1)': Math.round(rand(3500,800)),
    }
  }

  const postSample = async (sensors, note)=>{
    try{
      const payload = { input: sensors }
      const res = await fetch('/dashboard/predict_all', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      const js = await res.json()
      setLatest(js)
      setLastSim({ sensors, result: js, ts: Date.now() })
      // push to accumulated samples for hourly avg
      samplesRef.current.push({ sensors, ts: Date.now() })
      // build recommendation based on RF and SVM
      return js
    }catch(e){ console.error('postSample error', e); return null }
  }

  // Server-controlled simulator endpoints
  const startServerSimulator = async (pond='POND_UI')=>{
    try{
      const body = { pond, min: 2, max: 4, mode: 'normal', hourly_agg_seconds: 0 }
      const r = await fetch('/dashboard/simulator/start', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const js = await r.json()
      await refreshServerSimStatus()
      return js
    }catch(e){ console.error('startServerSimulator', e); return null }
  }

  const stopServerSimulator = async (pond='POND_UI')=>{
    try{
      const r = await fetch('/dashboard/simulator/stop', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({pond}) })
      const js = await r.json()
      await refreshServerSimStatus()
      return js
    }catch(e){ console.error('stopServerSimulator', e); return null }
  }

  const refreshServerSimStatus = async ()=>{
    try{
      const r = await fetch('/dashboard/simulator/status')
      const js = await r.json()
      setServerSimStatus(js)
      return js
    }catch(e){ console.error('refreshServerSimStatus', e); setServerSimStatus(null); return null }
  }

  const startSimulation = ()=>{
    if(simulating) return
    setSimulating(true)
    // immediate sample then every 20s
    postSample(genReading())
    intervalRef.current = setInterval(()=> postSample(genReading()), 20000)
    // hourly aggregation: compute average every hour (3600s) and send averaged sample
    hourlyRef.current = setInterval(()=>{
      const arr = samplesRef.current.splice(0)
      if(arr.length===0) return
      // compute averages
      const sums = {}
      arr.forEach(x=>{
        Object.entries(x.sensors).forEach(([k,v])=>{ const n = Number(v)||0; sums[k]=(sums[k]||0)+n })
      })
      const avg = {}
      Object.keys(sums).forEach(k=> avg[k] = +(sums[k]/arr.length).toFixed(3))
      // include an indicator field
      avg['Aggregated'] = 1
      postSample(avg, 'hourly_average')
      console.log('Hourly average posted', avg)
    }, 3600 * 1000)
  }

  const stopSimulation = ()=>{
    setSimulating(false)
    if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current = null }
    if(hourlyRef.current){ clearInterval(hourlyRef.current); hourlyRef.current = null }
  }

  // quick immediate hourly trigger (for testing in UI)
  const triggerHourlyNow = ()=>{
    const arr = samplesRef.current.splice(0)
    if(arr.length===0) return alert('No samples yet')
    const sums = {}
    arr.forEach(x=>{ Object.entries(x.sensors).forEach(([k,v])=>{ const n = Number(v)||0; sums[k]=(sums[k]||0)+n }) })
    const avg = {}
    Object.keys(sums).forEach(k=> avg[k] = +(sums[k]/arr.length).toFixed(3))
    avg['Aggregated'] = 1
    postSample(avg, 'hourly_average')
    alert('Hourly average posted (test)')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <section className="col-span-2">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Water Quality Status</h2>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-slate-500">Overall</div>
              <div className="mt-2">{latest ? renderBadge(latest?.svm?.label ?? (latest?.svm?.label || 'Unknown')) : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Summary (last 200)</div>
              <div className="mt-2 text-sm">
                {summary ? (
                  <div>
                    <div>Total: {summary.total}</div>
                    <div>Good: {summary.counts.Good||0} · Warning: {summary.counts.Warning||0} · Dangerous: {summary.counts.Dangerous||0}</div>
                    <div>Avg DO: {summary.avgDO ?? '—'} mg/L · Avg pH: {summary.avgPH ?? '—'} · Avg Ammonia: {summary.avgAm ?? '—'}</div>
                  </div>
                ) : '—'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="DO (mg/L)" value={latest?.rf?.['DO(mg/L)'] ?? latest?.sensors?.['DO(mg/L)'] ?? lastSim?.sensors?.['DO(mg/L)'] ?? '—'} />
              <Stat label="pH" value={latest?.rf?.pH ?? latest?.sensors?.pH ?? lastSim?.sensors?.pH ?? '—'} />
              <Stat label="Ammonia (mg/L)" value={latest?.rf?.['Ammonia (mg L-1 )'] ?? latest?.sensors?.['Ammonia (mg L-1 )'] ?? lastSim?.sensors?.['Ammonia (mg L-1 )'] ?? '—'} />
              <Stat label="Temp (°C)" value={latest?.sensors?.Temp ?? lastSim?.sensors?.Temp ?? '—'} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h3 className="font-semibold">Recommendation</h3>
          <p className="mt-2 text-sm text-slate-700">{generateRecommendation(latest)}</p>
        </div>
      </section>

      <aside>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Simulation</h3>
          <div className="mt-3 space-y-2">
            <div className="text-sm">Simulation status: <strong>{simulating ? 'Running' : 'Stopped'}</strong></div>
            <div className="text-sm">Last simulated sample:</div>
            <pre className="bg-slate-50 p-2 rounded text-xs h-36 overflow-auto">{lastSim ? JSON.stringify(lastSim.sensors,null,2) : 'No simulated samples yet'}</pre>
            <div className="flex gap-2">
              <button className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded" onClick={startSimulation}>Start Simulation</button>
              <button className="flex-1 bg-rose-600 text-white px-3 py-2 rounded" onClick={stopSimulation}>Stop</button>
            </div>
            <button className="w-full bg-amber-500 text-white px-3 py-2 rounded" onClick={triggerHourlyNow}>Trigger hourly aggregation now</button>
            <div className="mt-3">
              <div className="text-sm">Server simulator status: <strong>{serverSimStatus ? JSON.stringify(serverSimStatus) : 'unknown'}</strong></div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>startServerSimulator('POND_UI')}>Start Server Simulator</button>
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded" onClick={()=>stopServerSimulator('POND_UI')}>Stop Server Simulator</button>
              </div>
              <button className="w-full mt-2 bg-slate-200 text-slate-800 px-3 py-2 rounded" onClick={refreshServerSimStatus}>Refresh Status</button>
            </div>
            <a href="/dashboard/static/index.html" className="block text-center text-sm text-slate-600 mt-2">Open legacy dashboard</a>
          </div>
        </div>
      </aside>
    </div>
  )
}

function generateRecommendation(latest){
  if(!latest) return 'No data'
  try{
    const rf = latest.rf || {}
    const svm = latest.svm || {}
    const recs = []
    if(rf['DO(mg/L)'] !== undefined && Number(rf['DO(mg/L)']) < 4.0) recs.push('⚠ Low DO — start aerators and increase surface agitation')
    if(rf['Ammonia (mg L-1 )'] !== undefined && Number(rf['Ammonia (mg L-1 )']) > 0.5) recs.push('🚨 High Ammonia — perform partial water exchange and check feed rates')
    if(svm.label === 'Dangerous') recs.push('🚨 Water classified as Dangerous — immediate intervention required')
    if(recs.length===0) return 'OK — continue routine monitoring'
    return recs.join(' · ')
  }catch(e){ return 'No recommendation available' }
}

function Stat({label, value}){
  return (
    <div className="p-3 bg-slate-50 rounded">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
