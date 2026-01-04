// Lightweight vanilla JS dashboard (no React)

const fields = [
  'Temp',
  'Turbidity (cm)',
  'BOD (mg/L)',
  'CO2',
  'pH',
  'Alkalinity (mg L-1 )',
  'Hardness (mg L-1 )',
  'Calcium (mg L-1 )',
  'Ammonia (mg L-1 )',
  'Nitrite (mg L-1 )',
  'Phosphorus (mg L-1 )',
  'H2S (mg L-1 )',
  'Plankton (No. L-1)',
  'DO(mg/L)'
];

function el(tag, attrs = {}, children = []){
  const e = document.createElement(tag);
  for(const k in attrs){
    if(k === 'class') e.className = attrs[k];
    else if(k === 'text') e.textContent = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children)?children:[children]).forEach(c => {
    if(!c) return;
    if(typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

function buildUI(){
  const root = document.getElementById('root');
  root.innerHTML = '';

  const wrap = el('div', {class: 'wrap'});
  const header = el('header', {}, [el('h1',{text:'Shrimp Farm — AI Dashboard'}), el('p',{class:'muted', text:'Real-time inputs, model predictions and recommended actions'})]);
  wrap.appendChild(header);

  // layout: main grid + side panel
  const grid = el('section', {class: 'grid'});
  const cardForm = el('div', {class: 'card main-card'});
  cardForm.appendChild(el('h3',{text:'Sensor Inputs'}));

  const form = el('div', {class: 'form'});
  const inputs = {};
  fields.forEach((k) => {
    const field = el('div',{class:'field'});
    field.appendChild(el('label',{text:k}));
    const input = el('input', {type:'number', step:'any', name:k});
    input.addEventListener('input', (e)=>{ inputs[k] = e.target.value; });
    field.appendChild(input);
    form.appendChild(field);
  });

  const actions = el('div',{class:'actions'});
  const runBtn = el('button',{text:'Run Predictions'});
  const resetBtn = el('button',{text:'Reset'});
    const downloadBtn = el('button',{text:'Download CSV'});
  const latestBtn = el('button',{text:'Use Latest Reading'});
  const fileInput = el('input',{type:'file', accept:'.csv', style:'margin-left:8px'});
  const uploadBtn = el('button',{text:'Upload CSV'});
  actions.appendChild(runBtn); actions.appendChild(resetBtn);
    actions.appendChild(downloadBtn);
  actions.appendChild(latestBtn);
  actions.appendChild(fileInput);
  actions.appendChild(uploadBtn);
  form.appendChild(actions);
  // Prediction type selector (RF / SVM / KNN / All)
  const predTypeRow = el('div',{class:'pred-type'});
  predTypeRow.appendChild(el('label',{text:'Prediction Type:'}));
  ['all','rf','svm','knn'].forEach(v => {
    const id = 'pred_' + v;
    const r = el('input',{type:'radio', name:'predType', id, value:v});
    if(v === 'all') r.checked = true;
    const lab = el('label',{text: v.toUpperCase(), for:id});
    predTypeRow.appendChild(r); predTypeRow.appendChild(lab);
  });
  form.appendChild(predTypeRow);
  cardForm.appendChild(form);
  // Auto-preview controls: run predictions periodically
  const autoRow = el('div',{class:'auto-row'});
  autoRow.appendChild(el('label',{text:'Auto Preview every'}));
  const intervalInput = el('input',{type:'number', min:1, value:30, style:'width:70px;margin-left:8px'});
  autoRow.appendChild(intervalInput);
  autoRow.appendChild(el('span',{text:'seconds', style:'margin-left:8px'}));
  const autoToggle = el('input',{type:'checkbox', style:'margin-left:12px'});
  autoRow.appendChild(autoToggle);
  cardForm.appendChild(autoRow);

  grid.appendChild(cardForm);

  const cardResults = el('div',{class:'card'});
  cardResults.appendChild(el('h3',{text:'Predictions & Actions'}));
  const resultContainer = el('div');
  cardResults.appendChild(resultContainer);

  // Summary / overall quality box
  const summaryBox = el('div',{class:'summary'});
  summaryBox.appendChild(el('h4',{text:'Overall Water Quality'}));
  const scoreBox = el('div',{class:'score'}, el('div',{class:'score-value', text: '-' }));
  summaryBox.appendChild(scoreBox);
  const labelBox = el('div',{class:'quality-label', text: 'Unknown'});
  summaryBox.appendChild(labelBox);
  cardResults.appendChild(summaryBox);

  grid.appendChild(cardResults);

  // Side panel for charts and decision controls
  const sidePanel = el('aside',{class:'side-panel card'});
  sidePanel.appendChild(el('h3',{text:'Live Charts & Decisions'}));
  // sensor outputs list
  const sensorList = el('div',{class:'sensor-list'});
  sidePanel.appendChild(el('h4',{text:'Latest Sensor Readings'}));
  sidePanel.appendChild(sensorList);

  // canvas for charts
  const chartWrap = el('div',{class:'chart-wrap'});
  const canvas = el('canvas',{id:'mainChart', width:800, height:320});
  chartWrap.appendChild(canvas);
  // small dashboard charts: pie (class distribution) and parameter averages
  const smallCharts = el('div',{class:'small-charts'});
  const pieCanvas = el('canvas',{id:'pieChart', width:320, height:160});
  const barCanvas = el('canvas',{id:'barChart', width:320, height:160});
  smallCharts.appendChild(pieCanvas);
  smallCharts.appendChild(barCanvas);
  sidePanel.appendChild(chartWrap);
  sidePanel.appendChild(smallCharts);

  // Decision / action box
  const decisionBox = el('div',{class:'decision-box'});
  decisionBox.appendChild(el('h4',{text:'Actions & Schedule'}));
  const actionText = el('div',{class:'action-text', text:'No action recommended.'});
  decisionBox.appendChild(actionText);
  const urgencyText = el('div',{class:'urgency-text', text:''});
  decisionBox.appendChild(urgencyText);

  // schedule controls
  const scheduleRow = el('div',{class:'schedule-row'});
  scheduleRow.appendChild(el('label',{text:'Suggest change in (minutes):'}));
  const suggestInput = el('input',{type:'number', min:1, value:30, style:'width:80px;margin-left:8px'});
  scheduleRow.appendChild(suggestInput);
  const scheduleBtn = el('button',{text:'Schedule Water Change'});
  scheduleRow.appendChild(scheduleBtn);
  decisionBox.appendChild(scheduleRow);

  const scheduledInfo = el('div',{class:'scheduled-info', text:''});
  decisionBox.appendChild(scheduledInfo);

  sidePanel.appendChild(decisionBox);

  grid.appendChild(sidePanel);

  wrap.appendChild(grid);
  wrap.appendChild(el('footer',{}, el('small',{text:'Lightweight dashboard served from the API. For production, build a full React app and secure endpoints.'}))); 

  root.appendChild(wrap);

  function showJSON(obj){
    resultContainer.innerHTML = '';
    const pre = el('pre',{class:'results'});
    pre.textContent = JSON.stringify(obj, null, 2);
    resultContainer.appendChild(pre);
  }

  function computeWQI(rf, svm){
    const doVal = Number(rf?.['DO(mg/L)']) || 0;
    const pH = Number(rf?.pH) || 8.0;
    const ammonia = Number(rf?.['Ammonia (mg L-1 )']) || 0;

    const doScore = Math.max(0, Math.min(100, ((doVal - 2) / (7 - 2)) * 100));
    const phDiff = Math.max(0, Math.abs(pH - 8.0) - 0.5);
    const phScore = Math.max(0, 100 - (phDiff / 2.0) * 100);
    const ammoniaScore = Math.max(0, Math.min(100, (1 - (ammonia / 0.5)) * 100));

    const score = Math.round(doScore * 0.5 + phScore * 0.3 + ammoniaScore * 0.2);

    let label = 'Unknown';
    if(svm && svm.label) label = svm.label;
    else if(score >= 80) label = 'Good';
    else if(score >= 50) label = 'Warning';
    else label = 'Dangerous';

    return { score, label };
  }

  async function run(){
    runBtn.disabled = true; runBtn.textContent = 'Predicting...';
    resultContainer.innerHTML = '';
    const payload = { input: {} };
    fields.forEach(k => { payload.input[k] = inputs[k] ? Number(inputs[k]) : 0; });

    try{
        // Determine which prediction endpoint to call based on user selection
        const predType = document.querySelector('input[name="predType"]:checked')?.value || 'all';
        let endpoint = '/dashboard/predict_all';
        if(predType === 'rf') endpoint = '/dashboard/predict_rf';
        if(predType === 'svm') endpoint = '/dashboard/predict_svm';
        if(predType === 'knn') endpoint = '/dashboard/predict_knn';

        const combined = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(r=>r.json());
        // Normalize returned pieces
        const rf = combined.rf ?? (combined['DO(mg/L)'] ? combined : null);
        const svm = combined.svm ?? combined;
        const knn = combined.knn ?? (combined['DO(mg/L)'] ? { 'DO(mg/L)': combined['DO(mg/L)'] } : null);

      showJSON(combined);
      const w = computeWQI(rf, svm);
      const sv = scoreBox.querySelector('.score-value');
      if(sv) sv.textContent = w.score;
      labelBox.textContent = w.label;
      scoreBox.className = 'score ' + (w.score >= 80 ? 'good' : w.score >=50 ? 'warn' : 'bad');
      labelBox.className = 'quality-label ' + (w.label === 'Good' ? 'good' : w.label === 'Warning' ? 'warn' : 'bad');

        // update sensor list (latest readings)
        sensorList.innerHTML = '';
        Object.keys(payload.input).forEach(k => {
          const v = payload.input[k];
          const row = el('div',{class:'sensor-row'});
          row.appendChild(el('span',{class:'sensor-key', text:k}));
          row.appendChild(el('span',{class:'sensor-val', text: String(v)}));
          sensorList.appendChild(row);
        });

        // decide water exchange requirement
        const exchange = decideExchange(rf, svm);
        actionText.textContent = exchange.recommendation;
        urgencyText.textContent = 'Urgency: ' + exchange.urgency;

        // schedule button action
        scheduleBtn.onclick = () => {
          const minutes = Math.max(1, Number(suggestInput.value) || 30);
          const when = new Date(Date.now() + minutes*60000);
          scheduledInfo.textContent = `Scheduled water change at ${when.toLocaleString()} (in ${minutes} minutes)`;
        };

        // add sample to history chart (server also persisted)
        pushSampleToHistory({ts: Date.now(), rf, svm, knn, sensors: payload.input});
        updateChartFromHistory();

    }catch(err){
      resultContainer.innerHTML = '';
      resultContainer.appendChild(el('div',{class:'error', text: String(err)}));
    }finally{
      runBtn.disabled = false; runBtn.textContent = 'Run Predictions';
    }
  }

  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', ()=>{ window.location.reload(); });
  latestBtn.addEventListener('click', async ()=>{
    try{
      const js = await fetch('/dashboard/latest').then(r=>r.json());
      const sensors = js.sensors || {};
      // populate inputs
      Object.keys(sensors).forEach(k => {
        const v = sensors[k];
        // find input element by name
        const inp = document.querySelector(`input[name="${k}"]`);
        if(inp) inp.value = (v === null || v === undefined) ? '' : v;
      });
    }catch(e){ alert('Could not load latest reading: '+e); }
  });

  uploadBtn.addEventListener('click', async ()=>{
    const f = fileInput.files[0];
    if(!f){ alert('Choose a CSV file first'); return; }
    // submit as form to open returned CSV in new tab (download)
    const form = document.createElement('form');
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    form.action = '/dashboard/predict_batch';
    form.target = '_blank';
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'file';
    // attach the files to a DataTransfer so we can move it into the form input
    const dt = new DataTransfer();
    dt.items.add(f);
    input.files = dt.files;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    setTimeout(()=>{ document.body.removeChild(form); }, 1000);
  });

  // Auto-preview behavior
  let timer = null;
  autoToggle.addEventListener('change', ()=>{
    if(autoToggle.checked){
      const s = Math.max(1, Number(intervalInput.value) || 30);
      // run immediately then every s seconds
      run();
      timer = setInterval(run, s * 1000);
    }else{
      if(timer){ clearInterval(timer); timer = null; }
    }
  });

  // ----- sample history and charting -----
  const history = []; // keep last N samples
  const MAX_HISTORY = 120;

  function pushSampleToHistory(sample){
    history.push(sample);
    if(history.length > MAX_HISTORY) history.shift();
  }

  // initialize Chart.js
  const ctx = document.getElementById('mainChart').getContext('2d');
  const chartData = {
    labels: [],
    datasets: [
      { label: 'DO (mg/L)', data: [], borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.08)', tension:0.3 },
      { label: 'pH', data: [], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', tension:0.3 },
      { label: 'Ammonia (mg/L)', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', tension:0.3 }
    ]
  };
  const mainChart = new Chart(ctx, { type:'line', data: chartData, options: { responsive:true, maintainAspectRatio:false, scales:{ x:{ display:true }, y:{ beginAtZero:true } } } });

  // small charts contexts
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  const barCtx = document.getElementById('barChart').getContext('2d');
  const pieChart = new Chart(pieCtx, { type:'pie', data:{ labels:['Poor','Moderate','Good'], datasets:[{ data:[0,0,0], backgroundColor:['#e74c3c','#f39c12','#27ae60'] }] }, options:{ responsive:true } });
  const barChart = new Chart(barCtx, { type:'bar', data:{ labels:[], datasets:[{ label:'Average', data:[], backgroundColor:'#6a9c78' }] }, options:{ responsive:true } });

  function updateChartFromHistory(){
    // main time-series
    chartData.labels = history.map(s => new Date(s.ts).toLocaleTimeString());
    chartData.datasets[0].data = history.map(s => Number(s.rf?.['DO(mg/L)'] || s.sensors?.['DO(mg/L)'] || 0));
    chartData.datasets[1].data = history.map(s => Number(s.rf?.pH || s.sensors?.pH || 0));
    chartData.datasets[2].data = history.map(s => Number(s.rf?.['Ammonia (mg L-1 )'] || s.sensors?.['Ammonia (mg L-1 )'] || 0));
    mainChart.update();

    // pie: class distribution from svm outputs
    const counts = [0,0,0];
    history.forEach(h => { const cls = Number(h.svm?.class ?? h.svm?.class || h.rf?.class); if(!isNaN(cls) && cls >=0 && cls<=2) counts[cls]++; });
    pieChart.data.datasets[0].data = counts;
    pieChart.update();

    // bar: parameter averages (take most common numeric keys from sensors/rf)
    const sums = {};
    const cnts = {};
    history.forEach(h => {
      const src = Object.assign({}, h.sensors || {}, h.rf || {});
      Object.keys(src).forEach(k => {
        const v = Number(src[k]);
        if(!isNaN(v)) { sums[k] = (sums[k]||0)+v; cnts[k] = (cnts[k]||0)+1; }
      });
    });
    const keys = Object.keys(sums).sort((a,b)=> (sums[b]/cnts[b]) - (sums[a]/cnts[a])).slice(0,8);
    const avgs = keys.map(k => +(sums[k]/cnts[k]).toFixed(3));
    barChart.data.labels = keys;
    barChart.data.datasets[0].data = avgs;
    barChart.update();
  }

  // load initial server history to populate chart
  async function loadInitialHistory(){
    try{
      const rows = await fetch('/dashboard/history?limit=200').then(r=>r.json());
      // server returns newest first; reverse to chronological
      rows.reverse().forEach(r => pushSampleToHistory({ts: r.ts * 1000, rf: r.rf, svm: r.svm, knn: r.knn, sensors: r.sensors}));
      updateChartFromHistory();
    }catch(e){ console.warn('Could not load history', e); }
  }

  // WebSocket live updates
  let ws = null;
  function startWebSocket(){
    try{
      const proto = (location.protocol === 'https:') ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/ws/sensors`);
      ws.onopen = ()=>console.log('WS connected');
      ws.onmessage = (ev)=>{
        try{
          const msg = JSON.parse(ev.data);
          // server ts is seconds; convert to ms
          const s = { ts: (msg.ts || Date.now()/1000) * 1000, rf: msg.rf, svm: msg.svm, knn: msg.knn, sensors: msg.sensors };
          pushSampleToHistory(s);
          updateChartFromHistory();
        }catch(err){ console.warn('Invalid ws message', err); }
      };
      ws.onclose = ()=>{ console.log('WS closed, retry in 5s'); setTimeout(startWebSocket, 5000); };
    }catch(e){ console.warn('WS not available', e); }
  }

  // CSV download
  downloadBtn.addEventListener('click', ()=>{
    const url = '/dashboard/history.csv';
    // open in new tab to trigger download
    window.open(url, '_blank');
  });

  // start background pieces
  loadInitialHistory();
  startWebSocket();

  // decision logic for water exchange
  function decideExchange(rf, svm){
    // returns {recommendation, urgency}
    const doPred = Number(rf?.['DO(mg/L)']) || 0;
    const ammoniaPred = Number(rf?.['Ammonia (mg L-1 )']) || 0;
    const label = svm?.label || '';

    let recommendation = 'No water exchange required';
    let urgency = 'Low';

    if(label === 'Dangerous' || doPred < 4.0 || ammoniaPred > 0.5){
      recommendation = 'Water exchange required: YES';
      urgency = 'High';
    } else if(label === 'Warning' || doPred < 5.0 || ammoniaPred > 0.2){
      recommendation = 'Water exchange required: Consider';
      urgency = 'Medium';
    }

    return { recommendation, urgency };
  }
}

window.addEventListener('DOMContentLoaded', buildUI);
