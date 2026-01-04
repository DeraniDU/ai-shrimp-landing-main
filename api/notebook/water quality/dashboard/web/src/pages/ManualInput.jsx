import React, {useState} from 'react'

export default function ManualInput(){
  const [form, setForm] = useState({Temp:'', 'DO(mg/L)':'', pH:'', 'Ammonia (mg L-1 )':''})
  const [result, setResult] = useState(null)
  const [model, setModel] = useState('all')

  const onChange = (k,v)=> setForm(prev=> ({...prev,[k]:v}))
  const submit = async ()=>{
    const payload = { input: {}}
    Object.keys(form).forEach(k=>{ const v = parseFloat(form[k]); if(!isNaN(v)) payload.input[k]=v })
    let path = '/dashboard/predict_all'
    if(model === 'rf') path = '/dashboard/predict_rf'
    if(model === 'svm') path = '/dashboard/predict_svm'
    if(model === 'knn') path = '/dashboard/predict_knn'

    const res = await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    const js = await res.json();
    // normalize final output for UI: only show final predictions & recommended action
    let final = {}
    if(model === 'rf'){
      final.do = js['DO(mg/L)'] ?? js['DO(mg/L)']
      final.pH = js.pH ?? js['pH']
      final.ammonia = js['Ammonia (mg L-1 )'] ?? js['Ammonia (mg L-1 )']
      if(js.alert) final.alert = js.alert
      if(js.action) final.action = js.action
    } else if(model === 'svm'){
      final.class = js.label || js['label'] || js.class
      if(js.probabilities) final.probabilities = js.probabilities
    } else if(model === 'knn'){
      final.do = js['DO(mg/L)'] ?? js['DO(mg/L)']
    } else { // all
      final.do = js.rf?.['DO(mg/L)'] ?? js.rf?.['DO(mg/L)']
      final.pH = js.rf?.pH
      final.ammonia = js.rf?.['Ammonia (mg L-1 )']
      final.class = js.svm?.label || js.svm?.class
      if(js.rf?.alert) final.alert = js.rf.alert
      if(js.rf?.action) final.action = js.rf.action
      final.knn_fallback_used = js.knn_fallback_used
    }
    setResult(final)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Manual Data Input</h2>
        <div className="space-y-2">
          <InputRow label="Temperature (°C)" value={form.Temp} onChange={v=>onChange('Temp',v)} />
          <InputRow label="pH" value={form.pH} onChange={v=>onChange('pH',v)} />
          <InputRow label="Dissolved Oxygen (mg/L)" value={form['DO(mg/L)']} onChange={v=>onChange('DO(mg/L)',v)} />
          <InputRow label="Ammonia (mg/L)" value={form['Ammonia (mg L-1 )']} onChange={v=>onChange('Ammonia (mg L-1 )',v)} />
          <div>
            <label className="block text-sm text-slate-600">Model</label>
            <select className="mt-1 w-full border rounded p-2" value={model} onChange={e=>setModel(e.target.value)}>
              <option value="all">All (RF + SVM + KNN)</option>
              <option value="rf">Random Forest (RF) — DO/pH/Ammonia</option>
              <option value="svm">SVM Classifier — Water Quality Label</option>
              <option value="knn">KNN DO Estimate</option>
            </select>
          </div>
          <div><button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={submit}>Predict</button></div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Prediction Result</h3>
        <div className="mt-2 text-sm bg-slate-50 p-3 rounded h-64 overflow-auto">
          {result ? (
            <div>
              {result.alert && <div className="mb-2 text-rose-700">{result.alert}</div>}
              {result.action && <div className="mb-2 font-semibold">Action: {result.action}</div>}
              {result.class && <div>Water Quality: <strong>{result.class}</strong></div>}
              {result.do !== undefined && <div>Predicted DO (mg/L): <strong>{Number(result.do).toFixed(2)}</strong></div>}
              {result.pH !== undefined && <div>Predicted pH: <strong>{Number(result.pH).toFixed(2)}</strong></div>}
              {result.ammonia !== undefined && <div>Predicted Ammonia (mg/L): <strong>{Number(result.ammonia).toFixed(3)}</strong></div>}
              {result.probabilities && <div>Probabilities: {JSON.stringify(result.probabilities)}</div>}
              {result.knn_fallback_used !== undefined && <div>KNN fallback used: {result.knn_fallback_used ? 'Yes' : 'No'}</div>}
            </div>
          ) : 'No prediction yet'}
        </div>
      </div>
    </div>
  )
}

function InputRow({label,value,onChange}){
  return (
    <div>
      <label className="block text-sm text-slate-600">{label}</label>
      <input className="mt-1 w-full border rounded p-2" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}
