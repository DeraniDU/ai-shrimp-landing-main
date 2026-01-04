import React, {useEffect, useState} from 'react'

export default function History(){
  const [rows, setRows] = useState([])
  useEffect(()=>{ fetch('/dashboard/history?limit=200').then(r=>r.json()).then(setRows).catch(()=>setRows([])) },[])

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">History</h2>
        <a className="text-sky-600" href="/dashboard/history.csv">Export CSV</a>
      </div>
      <div className="overflow-auto mt-3">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-600"><tr><th>Timestamp</th><th>DO</th><th>pH</th><th>Ammonia</th><th>Class</th></tr></thead>
          <tbody>
            {rows.map((r,i)=> (
              <tr key={i} className="border-t"><td>{new Date(r.ts*1000).toLocaleString()}</td><td>{r.rf?.['DO(mg/L)'] ?? r.sensors?.['DO(mg/L)']}</td><td>{r.rf?.pH ?? r.sensors?.pH}</td><td>{r.rf?.['Ammonia (mg L-1 )'] ?? r.sensors?.['Ammonia (mg L-1 )']}</td><td>{r.svm?.label ?? r.svm?.class}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
