import React, {useEffect, useState} from 'react'
import { Line, Pie, Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function Analytics(){
  const [history, setHistory] = useState([])
  useEffect(()=>{
    let mounted = true
    const fetchHistory = ()=> fetch('/dashboard/history?limit=500').then(r=>r.json()).then(d=>{ if(mounted) setHistory(d) }).catch(()=>{ if(mounted) setHistory([]) })
    fetchHistory()
    const id = setInterval(fetchHistory, 10000)
    return ()=>{ mounted=false; clearInterval(id) }
  },[])

  const times = history.map(h=> new Date(h.ts*1000).toLocaleString())
  const doSeries = history.map(h=> h.rf?.['DO(mg/L)'] ?? h.sensors?.['DO(mg/L)'] ?? 0)
  const pHSeries = history.map(h=> h.rf?.pH ?? h.sensors?.pH ?? 0)
  const ammonia = history.map(h=> h.rf?.['Ammonia (mg L-1 )'] ?? h.sensors?.['Ammonia (mg L-1 )'] ?? 0)

  const classes = history.reduce((acc,h)=>{ const c = (h.svm?.class ?? h.svm?.class ?? null); if(c!==null) acc[c]=(acc[c]||0)+1; return acc },{})

  const pieData = { labels:['Poor (0)','Moderate (1)','Good (2)'], datasets:[{ data:[classes[0]||0,classes[1]||0,classes[2]||0], backgroundColor:['#ef4444','#f59e0b','#10b981'] } ] }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">DO / pH / Ammonia Trends</h3>
        <Line data={{ labels: times, datasets: [ { label:'DO', data: doSeries, borderColor:'#06b6d4', tension:0.2 }, { label:'pH', data: pHSeries, borderColor:'#f97316', tension:0.2 }, { label:'Ammonia', data: ammonia, borderColor:'#ef4444', tension:0.2 } ] }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Class Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Parameter Averages</h3>
          <Bar data={{ labels:['DO','pH','Ammonia'], datasets:[{ label:'Average', data:[ average(doSeries), average(pHSeries), average(ammonia) ], backgroundColor:['#06b6d4','#f97316','#ef4444'] }] }} />
        </div>
      </div>
    </div>
  )
}

function average(arr){ if(!arr || arr.length===0) return 0; return +(arr.reduce((a,b)=>a+(Number(b)||0),0)/arr.length).toFixed(3) }
