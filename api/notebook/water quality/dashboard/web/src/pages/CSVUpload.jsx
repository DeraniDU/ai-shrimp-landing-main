import React, {useState} from 'react'

export default function CSVUpload(){
  const [file, setFile] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [summary, setSummary] = useState(null)

  const upload = async ()=>{
    if(!file) return alert('Choose a CSV')
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/dashboard/predict_batch', { method: 'POST', body: fd })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setResultUrl(url)
    // We cannot easily parse summary without reading file; inform user they can download
    setSummary('Download generated CSV to inspect predictions; server also persisted samples to history')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Upload CSV (sensor simulation)</h2>
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} />
        <div className="mt-3"><button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={upload}>Upload & Predict</button></div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Results</h3>
        <p className="mt-2 text-sm text-slate-600">{summary || 'No results yet'}</p>
        {resultUrl && <a className="inline-block mt-3 text-sm text-sky-600" href={resultUrl} download>Download predictions CSV</a>}
      </div>
    </div>
  )
}
