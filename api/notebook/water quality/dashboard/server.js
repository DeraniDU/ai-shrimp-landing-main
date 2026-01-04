const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory storage for history (in production, use a database)
const history = [];
const MAX_HISTORY = 1000;

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

// Combined endpoint that returns all predictions
app.post('/dashboard/predict_all', async (req, res) => {
  const input = req.body?.input || {};
  
  // Get predictions from individual endpoints
  const rfInput = { input };
  const svmInput = { input };
  const knnInput = { input };
  
  // Calculate predictions (reusing logic from individual endpoints)
  const currentDO = Number(input['DO(mg/L)']) || 5.2;
  const drop = Math.min(2.5, Math.max(0.1, Math.random() * 1.5 + 0.2));
  const predictedDO = Math.max(0, currentDO - drop);
  const predictedPH = Number(input.pH) ? Number(input.pH) + (Math.random() - 0.5) * 0.2 : 8.0 + (Math.random() - 0.5) * 0.2;
  const predictedAmmonia = Number(input['Ammonia (mg L-1 )']) || 0.03;
  
  const rf = {
    'DO(mg/L)': Number(predictedDO.toFixed(3)),
    'pH': Number(predictedPH.toFixed(3)),
    'Ammonia (mg L-1 )': Number(predictedAmmonia),
  };
  
  if (predictedDO < 4.0) {
    const minutes = Math.max(1, Math.round(((currentDO - 4.0) / (currentDO - predictedDO)) * 30));
    rf.alert = `Predicted DO ${predictedDO.toFixed(2)} mg/L — expected below 4 mg/L in approx ${minutes} minutes`;
    rf.action = 'Turn ON aerator now';
  } else {
    rf.alert = `Predicted DO ${predictedDO.toFixed(2)} mg/L — within safe range`;
    rf.action = 'None';
  }
  
  const doVal = Number(input['DO(mg/L)']) || 5.2;
  const ammonia = Number(input['Ammonia (mg L-1 )']) || 0.03;
  let cls = 0;
  if (doVal < 4 || ammonia > 0.5) cls = 2;
  else if (doVal < 5 || ammonia > 0.2) cls = 1;
  const probs = cls === 0 ? [0.85, 0.10, 0.05] : cls === 1 ? [0.10, 0.75, 0.15] : [0.01, 0.19, 0.80];
  
  const svm = { class: cls, label: cls === 0 ? 'Good' : cls === 1 ? 'Warning' : 'Dangerous', probabilities: probs };
  const knn = { 'DO(mg/L)': Number(Math.max(0, currentDO - (Math.random() * 0.8 + 0.1)).toFixed(3)) };
  
  // Store in history
  const entry = {
    ts: Math.floor(Date.now() / 1000),
    rf,
    svm,
    knn,
    sensors: input
  };
  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();
  
  return res.json({ rf, svm, knn });
});

// Get latest reading
app.get('/dashboard/latest', (req, res) => {
  if (history.length === 0) {
    // Return default values if no history
    return res.json({
      sensors: {
        'Temp': 29,
        'Turbidity (cm)': 50,
        'BOD (mg/L)': 1.5,
        'CO2': 5,
        'pH': 8.0,
        'Alkalinity (mg L-1 )': 60,
        'Hardness (mg L-1 )': 120,
        'Calcium (mg L-1 )': 40,
        'Ammonia (mg L-1 )': 0.02,
        'Nitrite (mg L-1 )': 0.02,
        'Phosphorus (mg L-1 )': 0.5,
        'H2S (mg L-1 )': 0.01,
        'Plankton (No. L-1)': 3000,
        'DO(mg/L)': 5.2
      }
    });
  }
  const latest = history[history.length - 1];
  return res.json({ sensors: latest.sensors });
});

// Get history
app.get('/dashboard/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 200;
  const recent = history.slice(-limit).reverse(); // Newest first
  return res.json(recent);
});

// Download history as CSV
app.get('/dashboard/history.csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="history.csv"');
  
  // CSV header
  const headers = ['timestamp', 'DO(mg/L)', 'pH', 'Ammonia (mg L-1 )', 'Quality Class', 'Quality Label'];
  res.write(headers.join(',') + '\n');
  
  // CSV rows
  history.slice().reverse().forEach(entry => {
    const row = [
      new Date(entry.ts * 1000).toISOString(),
      entry.rf?.['DO(mg/L)'] || '',
      entry.rf?.pH || '',
      entry.rf?.['Ammonia (mg L-1 )'] || '',
      entry.svm?.class || '',
      entry.svm?.label || ''
    ];
    res.write(row.join(',') + '\n');
  });
  
  res.end();
});

// Batch prediction from CSV
app.post('/dashboard/predict_batch', upload.single('file'), (req, res) => {
  // Simple mock: return a CSV with predictions
  // In production, parse the CSV, run predictions, and return results
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="predictions.csv"');
  res.write('Row,DO(mg/L),pH,Ammonia,Quality\n');
  res.write('1,4.5,8.0,0.03,Good\n');
  res.write('2,3.8,7.9,0.15,Warning\n');
  res.end();
});

app.listen(PORT, () => {
  console.log(`Mock dashboard server running at http://localhost:${PORT}/index.html`);
});
