const { useState } = React;

function NumberInput({label, name, value, onChange, placeholder}){
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" step="any" name={name} value={value} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}

function Dashboard(){
  const defaultValues = {
    Temp: 29,
    'Turbidity (cm)': 50,
    'BOD (mg/L)': 1.5,
    CO2: 5,
    pH: 8.0,
    'Alkalinity (mg L-1 )': 60,
    'Hardness (mg L-1 )': 120,
    'Calcium (mg L-1 )': 40,
    'Nitrite (mg L-1 )': 0.02,
    'Phosphorus (mg L-1 )': 0.5,
    'H2S (mg L-1 )': 0.01,
    'Plankton (No. L-1)': 3000,
    'DO(mg/L)': 5.2
  };

  const [inputs, setInputs] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  function onChange(e){
    const k = e.target.name;
    const v = e.target.value === '' ? '' : Number(e.target.value);
    setInputs(s => ({...s, [k]: v}));
  }

  async function runPredictions(){
    setLoading(true); setResults(null); setError(null);
    const payload = { input: inputs };
    try{
      const [rf, svm, knn] = await Promise.all([
        axios.post('/dashboard/predict_rf', payload),
        axios.post('/dashboard/predict_svm', payload),
        axios.post('/dashboard/predict_knn', payload)
      ]);

      setResults({rf: rf.data, svm: svm.data, knn: knn.data});
    }catch(err){
      console.error(err);
      setError(err?.response?.data || err.message || String(err));
    }finally{setLoading(false)}
  }

  return (
    <div className="wrap">
      <header>
        <h1>Shrimp Farm — AI Dashboard</h1>
        <p className="muted">Real-time inputs, model predictions and recommended actions</p>
      </header>

      <section className="grid">
        <div className="card">
          <h3>Sensor Inputs</h3>
          <div className="form">
            {Object.keys(defaultValues).map((k) => (
              <NumberInput key={k} name={k} label={k} value={inputs[k]} onChange={onChange} />
            ))}
            <div className="actions">
              <button onClick={runPredictions} disabled={loading}>{loading ? 'Predicting...' : 'Run Predictions'}</button>
              <button onClick={() => { setInputs(defaultValues); setResults(null); setError(null); }}>Reset</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Predictions & Actions</h3>
          {error && <pre className="error">{JSON.stringify(error, null, 2)}</pre>}
          {!results && !error && <p className="muted">No predictions yet. Click "Run Predictions".</p>}

          {results && (
            <div className="results">
              <div className="result-block">
                <h4>Random Forest — DO / pH / Ammonia</h4>
                <pre>{JSON.stringify(results.rf, null, 2)}</pre>
              </div>

              <div className="result-block">
                <h4>SVM — Water Quality Class</h4>
                <pre>{JSON.stringify(results.svm, null, 2)}</pre>
              </div>

              <div className="result-block">
                <h4>KNN — DO (nearest neighbours)</h4>
                <pre>{JSON.stringify(results.knn, null, 2)}</pre>
              </div>

              <div className="recommend">
                <h4>Recommended Action</h4>
                <p>
                  {results.rf?.action ? (
                    <strong>{results.rf.action} — {results.rf.alert}</strong>
                  ) : (
                    <em>No immediate action required.</em>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer>
        <small>Lightweight dashboard served from the API. For production, build a full React app (Vite/Next) and secure endpoints.</small>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard/>);
