const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static dashboard files from this directory
app.use('/', express.static(path.join(__dirname)));

// Mock endpoints under /dashboard/* to match the in-browser app
app.post('/dashboard/predict_rf', (req, res) => {
  const input = req.body?.input || {};
  const currentDO = Number(input['DO(mg/L)']) || 5.2;
  // Simple mock: predict DO drops slightly over horizon
  const drop = Math.min(2.5, Math.max(0.1, Math.random() * 1.5 + 0.2));
  const predictedDO = Math.max(0, currentDO - drop);
  const predictedPH = Number(input.pH) ? Number(input.pH) + (Math.random() - 0.5) * 0.2 : 8.0 + (Math.random() - 0.5) * 0.2;
  const predictedAmmonia = Number(input['Ammonia (mg L-1 )']) || 0.03;

  const out = {
    'DO(mg/L)': Number(predictedDO.toFixed(3)),
    'pH': Number(predictedPH.toFixed(3)),
    'Ammonia (mg L-1 )': Number(predictedAmmonia),
  };

  if (predictedDO < 4.0) {
    // Estimate simple minutes to threshold
    const minutes = Math.max(1, Math.round(((currentDO - 4.0) / (currentDO - predictedDO)) * 30));
    out.alert = `Predicted DO ${predictedDO.toFixed(2)} mg/L — expected below 4 mg/L in approx ${minutes} minutes`;
    out.action = 'Turn ON aerator now';
  } else {
    out.alert = `Predicted DO ${predictedDO.toFixed(2)} mg/L — within safe range`;
    out.action = 'None';
  }

  return res.json(out);
});

app.post('/dashboard/predict_svm', (req, res) => {
  const input = req.body?.input || {};
  const doVal = Number(input['DO(mg/L)']) || 5.2;
  const ammonia = Number(input['Ammonia (mg L-1 )']) || 0.03;

  let cls = 0; // Good
  if (doVal < 4 || ammonia > 0.5) cls = 2; // Dangerous
  else if (doVal < 5 || ammonia > 0.2) cls = 1; // Warning

  const probs = cls === 0 ? [0.85, 0.10, 0.05] : cls === 1 ? [0.10, 0.75, 0.15] : [0.01, 0.19, 0.80];

  return res.json({ class: cls, label: cls === 0 ? 'Good' : cls === 1 ? 'Warning' : 'Dangerous', probabilities: probs });
});

app.post('/dashboard/predict_knn', (req, res) => {
  const input = req.body?.input || {};
  const currentDO = Number(input['DO(mg/L)']) || 5.2;
  const predicted = Math.max(0, currentDO - (Math.random() * 0.8 + 0.1));
  return res.json({ 'DO(mg/L)': Number(predicted.toFixed(3)) });
});

app.listen(PORT, () => {
  console.log(`Mock dashboard server running at http://localhost:${PORT}/index.html`);
});
