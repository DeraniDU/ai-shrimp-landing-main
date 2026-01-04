import React, {useState} from 'react'

export default function AdvancedPrediction(){
  const [form, setForm] = useState({Temp:'29', 'DO(mg/L)':'5', pH:'7.8', 'Ammonia (mg L-1 )':'0.4'})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const onChange = (k,v)=> setForm(prev=> ({...prev,[k]:v}))

  const submitAllModels = async ()=>{
    setLoading(true)
    try{
      const payload = { input: {} }
      Object.keys(form).forEach(k=>{ const v = parseFloat(form[k]); if(!isNaN(v)) payload.input[k]=v })

      const [rfRes, svmRes, knnRes] = await Promise.all([
        fetch('/dashboard/predict_rf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),
        fetch('/dashboard/predict_svm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),
        fetch('/dashboard/predict_knn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      ])

      const [rf, svm, knn] = await Promise.all([rfRes.json(), svmRes.json(), knnRes.json()])

      const riskLevel = analyzeRisk(rf, svm, knn)
      const recommendations = generateRecommendations(rf, svm, riskLevel)

      setResults({ input: {...form}, rf, svm, knn, riskLevel, recommendations })
    }catch(e){ console.error(e); alert('Prediction error: '+e.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Advanced Model Prediction & Analysis</h2>
        <p className="text-sm text-slate-600 mb-4">Compare Random Forest, SVM, and KNN predictions with risk scoring and recommended actions.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <InputField label="Temperature (°C)" value={form.Temp} onChange={v=>onChange('Temp',v)} />
          <InputField label="pH" value={form.pH} onChange={v=>onChange('pH',v)} />
          <InputField label="DO (mg/L)" value={form['DO(mg/L)']} onChange={v=>onChange('DO(mg/L)',v)} />
          <InputField label="Ammonia (mg/L)" value={form['Ammonia (mg L-1 )']} onChange={v=>onChange('Ammonia (mg L-1 )',v)} />
        </div>

        <button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
          onClick={submitAllModels}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Run Full Prediction Analysis'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <RiskCard riskLevel={results.riskLevel} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModelCard title="Random Forest (Regression)" model="rf" data={results.rf} />
            <ModelCard title="SVM Classifier" model="svm" data={results.svm} />
            <ModelCard title="KNN DO Estimate" model="knn" data={results.knn} />
          </div>

          <RecommendationsCard recommendations={results.recommendations} />

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-sm">Input Summary</h3>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Info label="Temp" value={`${results.input.Temp} °C`} />
              <Info label="pH" value={results.input.pH} />
              <Info label="DO" value={`${results.input['DO(mg/L)']} mg/L`} />
              <Info label="Ammonia" value={`${results.input['Ammonia (mg L-1 )']} mg/L`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RiskCard({riskLevel}){
  const colors = {critical: 'bg-red-100 text-red-900 border-red-300', high: 'bg-orange-100 text-orange-900 border-orange-300', medium: 'bg-amber-100 text-amber-900 border-amber-300', low: 'bg-green-100 text-green-900 border-green-300'}
  const icons = {critical: '🚨', high: '⚠️', medium: '⚡', low: '✅'}
  const label = {critical: 'CRITICAL', high: 'HIGH RISK', medium: 'MEDIUM RISK', low: 'LOW RISK'}[riskLevel]
  return (
    <div className={`p-6 rounded-lg shadow border-2 ${colors[riskLevel] || colors.medium}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icons[riskLevel] || '❓'}</span>
        <div>
          <h3 className="font-semibold text-lg">{label || 'UNKNOWN'}</h3>
          <p className="text-sm opacity-75">{riskLevel === 'critical' ? 'Immediate action required' : riskLevel === 'high' ? 'Intervention needed soon' : riskLevel === 'medium' ? 'Monitor closely and prepare actions' : 'Normal conditions, routine monitoring'}</p>
        </div>
      </div>
    </div>
  )
}

function ModelCard({title, model, data}){
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-sm mb-3 border-b pb-2">{title}</h3>
      <div className="space-y-2 text-sm">
        {model === 'rf' && (
          <>
            <Metric label="DO (mg/L)" value={data['DO(mg/L)']} unit="mg/L" color={Number(data['DO(mg/L)']) < 4 ? 'text-rose-600' : 'text-emerald-600'} />
            <Metric label="pH" value={data.pH} unit="" color={Math.abs(Number(data.pH) - 7.8) > 0.5 ? 'text-orange-600' : 'text-blue-600'} />
            <Metric label="Ammonia (mg/L)" value={data['Ammonia (mg L-1 )']} unit="mg/L" color={Number(data['Ammonia (mg L-1 )']) > 0.5 ? 'text-rose-600' : 'text-emerald-600'} />
            {data.alert && <div className="p-2 bg-amber-50 text-amber-900 rounded text-xs">{data.alert}</div>}
            {data.action && <div className="p-2 bg-blue-50 text-blue-900 rounded text-xs font-semibold">→ {data.action}</div>}
          </>
        )}
        {model === 'svm' && (
          <>
            <div className="p-2 bg-slate-100 rounded font-semibold">Label: {data.label || data.class || 'Unknown'}</div>
            {data.probabilities && (
              <div className="text-xs text-slate-600">
                <div>Good: {(data.probabilities[0]*100).toFixed(1)}%</div>
                <div>Warning: {(data.probabilities[1]*100).toFixed(1)}%</div>
                <div>Dangerous: {(data.probabilities[2]*100).toFixed(1)}%</div>
              </div>
            )}
          </>
        )}
        {model === 'knn' && (
          <>
            <Metric label="DO (mg/L)" value={data['DO(mg/L)']} unit="mg/L" color={Number(data['DO(mg/L)']) < 4 ? 'text-rose-600' : 'text-emerald-600'} />
            <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded">KNN DO fallback if sensor missing.</div>
          </>
        )}
      </div>
    </div>
  )
}

function RecommendationsCard({recommendations}){
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-sm mb-3 border-b pb-2">Recommended Actions</h3>
      <div className="space-y-2">
        {(!recommendations || recommendations.length === 0) ? (
          <p className="text-sm text-slate-600">No immediate actions required. Continue routine monitoring.</p>
        ) : (
          recommendations.map((rec, idx)=>(
            <div key={idx} className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-sm">
              {rec}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Metric({label, value, unit, color}){
  const val = value !== undefined && value !== null && !Number.isNaN(Number(value)) ? Number(value).toFixed(2) : '—'
  return (
    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
      <span className="text-slate-600 text-xs">{label}</span>
      <span className={`font-semibold ${color}`}>{val} {unit}</span>
    </div>
  )
}

function InputField({label, value, onChange}){
  return (
    <div>
      <label className="block text-xs text-slate-600">{label}</label>
      <input className="mt-1 w-full border rounded px-2 py-1 text-sm" value={value} onChange={e=>onChange(e.target.value)} type="number" />
    </div>
  )
}

function Info({label, value}){
  return (
    <div className="bg-slate-50 p-2 rounded">
      <div className="text-xs text-slate-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

function analyzeRisk(rf, svm, knn){
  const do_val = Number(rf['DO(mg/L)'] || 0)
  const ammonia = Number(rf['Ammonia (mg L-1 )'] || 0)
  const svm_label = svm.label || svm.class

  let score = 0
  if(do_val < 3) score += 3
  else if(do_val < 4) score += 2
  else if(do_val < 5) score += 1

  if(ammonia > 1.5) score += 3
  else if(ammonia > 0.8) score += 2
  else if(ammonia > 0.5) score += 1

  if(svm_label === 2 || svm_label === 'Dangerous') score += 3
  else if(svm_label === 1 || svm_label === 'Warning') score += 1

  if(score >= 6) return 'critical'
  if(score >= 4) return 'high'
  if(score >= 2) return 'medium'
  return 'low'
}

function generateRecommendations(rf, svm, riskLevel){
  const recs = []
  const do_val = Number(rf['DO(mg/L)'] || 0)
  const ammonia = Number(rf['Ammonia (mg L-1 )'] || 0)
  const ph_val = Number(rf.pH || 0)

  if(do_val < 3.5) recs.push('🚨 CRITICAL: Low DO detected. Start aerators immediately and increase surface agitation.')
  if(do_val < 5) recs.push('⚠️ Low DO (<5 mg/L): Turn on aerators and monitor closely.')
  if(ammonia > 1) recs.push('🚨 CRITICAL: High Ammonia (>1 mg/L). Perform 30-50% water exchange immediately.')
  if(ammonia > 0.5) recs.push('⚠️ Elevated Ammonia: Reduce feed rate and schedule partial water exchange.')
  if(ph_val < 6.5 || ph_val > 8.5) recs.push('⚠️ pH out of range: Consider aeration and check alkalinity buffer.')
  if(riskLevel === 'critical') recs.push('🚨 CRITICAL RISK: Notify farm manager and prepare emergency plan now.')

  return recs.length > 0 ? recs : ['✅ All parameters normal. Continue routine monitoring.']
}