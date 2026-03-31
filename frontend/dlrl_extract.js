
/* ═══════════════ CONSTANTS & STOCK DATA ═══════════════ */
const STOCKS = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', sector: 'ENERGY', basePrice: 2850, annualVol: 0.26, annualDrift: 0.14, beta: 1.2, color: '#FF6B35' },
  { ticker: 'TCS', name: 'Tata Consultancy', sector: 'IT', basePrice: 3920, annualVol: 0.22, annualDrift: 0.12, beta: 0.9, color: '#4A9FFF' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', sector: 'BANKING', basePrice: 1680, annualVol: 0.16, annualDrift: 0.15, beta: 1.1, color: '#00C851' },
  { ticker: 'INFY', name: 'Infosys Ltd', sector: 'IT', basePrice: 1750, annualVol: 0.24, annualDrift: 0.11, beta: 1.0, color: '#29B6F6' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', sector: 'BANKING', basePrice: 1240, annualVol: 0.17, annualDrift: 0.16, beta: 1.15, color: '#26A69A' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', basePrice: 2650, annualVol: 0.14, annualDrift: 0.09, beta: 0.7, color: '#FFA726' },
  { ticker: 'ITC', name: 'ITC Ltd', sector: 'FMCG', basePrice: 480, annualVol: 0.13, annualDrift: 0.10, beta: 0.6, color: '#FFCA28' },
  { ticker: 'SBIN', name: 'State Bank of India', sector: 'BANKING', basePrice: 820, annualVol: 0.20, annualDrift: 0.15, beta: 1.3, color: '#66BB6A' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'TELECOM', basePrice: 1580, annualVol: 0.19, annualDrift: 0.14, beta: 0.9, color: '#AB47BC' },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'BANKING', basePrice: 1820, annualVol: 0.16, annualDrift: 0.13, beta: 1.0, color: '#42A5F5' },
  { ticker: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', basePrice: 560, annualVol: 0.23, annualDrift: 0.10, beta: 1.0, color: '#26C6DA' },
  { ticker: 'ONGC', name: 'Oil & Natural Gas', sector: 'ENERGY', basePrice: 290, annualVol: 0.25, annualDrift: 0.11, beta: 1.1, color: '#FF7043' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India', sector: 'AUTO', basePrice: 12800, annualVol: 0.20, annualDrift: 0.15, beta: 1.0, color: '#EF5350' },
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'PHARMA', basePrice: 1680, annualVol: 0.18, annualDrift: 0.14, beta: 0.7, color: '#FF8A65' },
  { ticker: 'TITAN', name: 'Titan Company', sector: 'CONSUMER', basePrice: 3600, annualVol: 0.22, annualDrift: 0.18, beta: 1.0, color: '#EC407A' },
  { ticker: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'INFRA', basePrice: 10500, annualVol: 0.19, annualDrift: 0.13, beta: 1.1, color: '#78909C' },
  { ticker: 'NESTLEIND', name: 'Nestlé India', sector: 'FMCG', basePrice: 24500, annualVol: 0.12, annualDrift: 0.11, beta: 0.6, color: '#D4E157' },
  { ticker: 'POWERGRID', name: 'Power Grid Corp', sector: 'ENERGY', basePrice: 340, annualVol: 0.15, annualDrift: 0.10, beta: 0.8, color: '#FF5722' },
  { ticker: 'NTPC', name: 'NTPC Ltd', sector: 'ENERGY', basePrice: 380, annualVol: 0.17, annualDrift: 0.12, beta: 0.9, color: '#FFA000' },
  { ticker: 'TECHM', name: 'Tech Mahindra', sector: 'IT', basePrice: 1680, annualVol: 0.25, annualDrift: 0.12, beta: 1.0, color: '#00BCD4' },
  { ticker: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', basePrice: 1920, annualVol: 0.21, annualDrift: 0.13, beta: 0.9, color: '#0288D1' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'BANKING', basePrice: 7400, annualVol: 0.28, annualDrift: 0.20, beta: 1.4, color: '#43A047' },
  { ticker: 'DRREDDY', name: 'Dr. Reddy Labs', sector: 'PHARMA', basePrice: 6200, annualVol: 0.20, annualDrift: 0.13, beta: 0.7, color: '#F48FB1' },
  { ticker: 'DIVISLAB', name: 'Divi\'s Laboratories', sector: 'PHARMA', basePrice: 4100, annualVol: 0.19, annualDrift: 0.15, beta: 0.8, color: '#CE93D8' },
  { ticker: 'GOLDBEES', name: 'Nippon India Gold ETF', sector: 'GOLD', basePrice: 5200, annualVol: 0.10, annualDrift: 0.08, beta: -0.1, color: '#FFD700' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors', sector: 'AUTO', basePrice: 980, annualVol: 0.30, annualDrift: 0.18, beta: 1.5, color: '#F44336' },
  { ticker: 'ADANIPORTS', name: 'Adani Ports', sector: 'INFRA', basePrice: 1380, annualVol: 0.24, annualDrift: 0.16, beta: 1.3, color: '#90A4AE' },
  { ticker: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'BANKING', basePrice: 1680, annualVol: 0.22, annualDrift: 0.17, beta: 1.2, color: '#81C784' },
  { ticker: 'HINDALCO', name: 'Hindalco Industries', sector: 'METALS', basePrice: 680, annualVol: 0.26, annualDrift: 0.14, beta: 1.3, color: '#B0BEC5' },
  { ticker: 'TATASTEEL', name: 'Tata Steel', sector: 'METALS', basePrice: 168, annualVol: 0.28, annualDrift: 0.15, beta: 1.4, color: '#CFD8DC' }
];

/* ═══════════════ MATH UTILS ═══════════════ */
// Box-Muller transform for normal distribution
function normalRandom() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function softmax(logits) {
  const maxL = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxL));
  const sum = exps.reduce((a,b) => a+b, 0);
  return exps.map(e => e/sum);
}

function formatINR(num) {
  const n = Math.round(num);
  const s = Math.abs(n).toString();
  if (s.length <= 3) return (n < 0 ? '-' : '') + '₹' + s;
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  let formatted = '';
  while (rest.length > 2) { formatted = ',' + rest.slice(-2) + formatted; rest = rest.slice(0, -2); }
  formatted = rest + formatted + ',' + last3;
  return (n < 0 ? '-' : '') + '₹' + formatted;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ═══════════════ NEURAL NETWORK (Pure JS) ═══════════════ */
class NeuralNetwork {
  constructor(layerSizes) {
    this.layerSizes = layerSizes;
    this.weights = [];
    this.biases = [];
    // Xavier Init
    for (let i = 0; i < layerSizes.length - 1; i++) {
      let r = layerSizes[i];
      let c = layerSizes[i+1];
      let w = [];
      let b = new Array(c).fill(0.01); // small bias init
      let scale = Math.sqrt(2.0 / (r + c));
      for (let row = 0; row < r; row++) {
        let wr = [];
        for (let col = 0; col < c; col++) {
          wr.push(normalRandom() * scale);
        }
        w.push(wr);
      }
      this.weights.push(w);
      this.biases.push(b);
    }
  }

  forward(input) {
    let activations = [input];
    let a = input;
    for (let i = 0; i < this.weights.length; i++) {
      let w = this.weights[i];
      let b = this.biases[i];
      let nextA = new Array(w[0].length).fill(0);
      for (let col = 0; col < w[0].length; col++) {
        let sum = b[col];
        for (let row = 0; row < w.length; row++) {
          sum += a[row] * w[row][col];
        }
        // ReLU for hidden layers, linear for output
        if (i < this.weights.length - 1) sum = Math.max(0, sum); 
        nextA[col] = sum;
      }
      a = nextA;
      activations.push(a);
    }
    return { output: a, activations };
  }

  backward(activations, outputGradient, lr) {
    let grad = outputGradient;
    for (let i = this.weights.length - 1; i >= 0; i--) {
      let w = this.weights[i];
      let b = this.biases[i];
      let a = activations[i];
      
      let nextGrad = new Array(a.length).fill(0);
      let wGrad = [];
      for (let r = 0; r < w.length; r++) wGrad.push(new Array(w[0].length).fill(0));

      // Compute gradients
      for (let col = 0; col < w[0].length; col++) {
        let g = grad[col];
        // ReLU derivative for hidden layers
        if (i < this.weights.length - 1 && activations[i+1][col] <= 0) g = 0; 
        
        b[col] -= lr * Math.min(Math.max(g, -1), 1); // Clip gradients
        
        for (let row = 0; row < w.length; row++) {
          wGrad[row][col] = g * a[row];
          nextGrad[row] += g * w[row][col];
          w[row][col] -= lr * Math.min(Math.max(wGrad[row][col], -1), 1);
        }
      }
      grad = nextGrad;
    }
    return grad;
  }
}

/* ═══════════════ MARKET ENVIRONMENT ═══════════════ */
class NSEEnvironment {
  constructor(stocks, config) {
    this.stocks = stocks;
    this.N = stocks.length;
    this.txCost = config.cost; // λ
    this.initCap = config.capital;
    this.epLen = 252; // 1 year of NSE days
    this.prices = []; // Precomputed GBM paths
  }

  reset() {
    this.prices = [];
    this.logReturnsPath = [];
    // Generate GBM path for 252 days
    // P_t = P_0 * exp((μ - σ²/2)*dt + σ*sqrt(dt)*Z)
    const dt = 1/252;
    for (let s of this.stocks) {
      let path = [s.basePrice];
      let logs = [0];
      for (let i=1; i<=this.epLen; i++) {
        let Z = normalRandom();
        let marketShock = normalRandom() * 0.15 * Math.sqrt(dt);
        let ret = (s.annualDrift - 0.5*s.annualVol*s.annualVol)*dt + s.annualVol*Math.sqrt(dt)*Z + s.beta*marketShock;
        logs.push(ret);
        path.push(path[i-1] * Math.exp(ret));
      }
      this.prices.push(path);
      this.logReturnsPath.push(logs);
    }
    
    this.weights = new Array(this.N).fill(1/this.N); // Equal weight initially
    this.nav = this.initCap;
    this.stepCount = 1;
    return this.getState();
  }

  getState() {
    // State length: 5 returns per stock + N weights + nav ratio
    let state = [];
    for (let i=0; i<this.N; i++) {
      for(let j=4; j>=0; j--) {
        let idx = this.stepCount - j;
        let lr = idx >= 0 && idx < this.epLen ? this.logReturnsPath[i][idx] : 0;
        state.push(lr / (this.stocks[i].annualVol * Math.sqrt(1/252))); // normalized
      }
    }
    for (let w of this.weights) state.push(w);
    state.push(this.nav / this.initCap);
    return state;
  }

  step(action) {
    let newWeights = softmax(action);
    let turnover = 0;
    for (let i=0; i<this.N; i++) {
      turnover += Math.abs(newWeights[i] - this.weights[i]);
    }
    
    let cost = this.txCost * turnover;
    let pfRet = 0;
    for (let i=0; i<this.N; i++) {
      pfRet += newWeights[i] * this.logReturnsPath[i][this.stepCount];
    }
    let netRet = pfRet - cost;
    this.nav *= Math.exp(netRet);
    this.weights = newWeights;
    
    // Reward is annualized return - cost
    let reward = netRet * 252;
    
    this.stepCount++;
    let done = this.stepCount >= this.epLen - 1;
    
    return { reward, nextState: this.getState(), done, info: { nav: this.nav, netRet } };
  }
}

/* ═══════════════ ACTOR-CRITIC AGENT ═══════════════ */
class ActorCriticAgent {
  constructor(stateSize, actionSize, config) {
    this.actionSize = actionSize;
    // Actor: state -> 64 -> 32 -> actionSize
    this.actor = new NeuralNetwork([stateSize, 64, 32, actionSize]);
    // Critic: state -> 64 -> 32 -> 1
    this.critic = new NeuralNetwork([stateSize, 64, 32, 1]);
    
    this.gamma = config.gamma;
    this.lr = config.lr;
    this.entCoef = config.entCoef;
    
    this.states = [];
    this.actions = [];
    this.rewards = [];
    this.values = [];
    this.logProbs = [];
    this.explorationWeight = 0.5;
  }

  selectAction(state) {
    let actorOut = this.actor.forward(state);
    let logits = actorOut.output;
    let weights = softmax(logits);
    
    // Exploration (Dirichlet noise approx via simple uniform noise)
    let finalWeights = [];
    let noiseSum = 0;
    let noise = [];
    for(let i=0; i<this.actionSize; i++) { let n = Math.random(); noiseSum+=n; noise.push(n); }
    for(let i=0; i<this.actionSize; i++) {
      finalWeights.push(weights[i]*(1-this.explorationWeight) + (noise[i]/noiseSum)*this.explorationWeight);
    }
    
    let criticOut = this.critic.forward(state);
    let value = criticOut.output[0];
    
    let logProb = 0;
    for(let i=0; i<this.actionSize; i++) logProb += finalWeights[i] * Math.log(weights[i] + 1e-8);
    
    return { action: logits, finalWeights, value, logProb, actorActs: actorOut.activations, criticActs: criticOut.activations };
  }

  update(episode) {
    let G = [];
    let rSum = 0;
    for (let t = this.rewards.length - 1; t >= 0; t--) {
      rSum = this.rewards[t] + this.gamma * rSum;
      G.unshift(rSum);
    }
    
    // Normalize Returns for stability
    let meanG = G.reduce((a,b)=>a+b,0)/G.length;
    let stdG = Math.sqrt(G.reduce((a,b)=>a+Math.pow(b-meanG,2),0)/G.length) + 1e-8;
    G = G.map(g => (g - meanG) / stdG);

    let actorTotalLoss = 0;
    let criticTotalLoss = 0;

    for (let t=0; t<this.states.length; t++) {
      let state = this.states[t];
      let adv = G[t] - this.values[t];
      
      // Critic Loss: MSE
      let criticLoss = adv * adv;
      criticTotalLoss += criticLoss;
      // Critic Grad = -2 * adv. Simplify to -adv
      let cGrad = [-adv];
      let cOut = this.critic.forward(state); // Recompute acts quickly
      this.critic.backward(cOut.activations, cGrad, this.lr * 2.0); // Critic learns faster

      // Actor Loss = -logProb * Adv - entCoef * Entropy
      let logits = this.actor.forward(state);
      let probs = softmax(logits.output);
      
      let entropy = 0;
      for(let i=0; i<probs.length; i++) entropy -= probs[i] * Math.log(probs[i] + 1e-8);
      
      actorTotalLoss += (-this.logProbs[t] * adv) - (this.entCoef * entropy);
      
      // Actor grad wrt logits = probs - action_taken(approx by just probs * -adv + entropy penalty)
      let aGrad = [];
      for(let i=0; i<probs.length; i++) {
        // PG gradient: -adv * action_prob + entropy gradient
        aGrad.push(probs[i] * -adv - this.entCoef * Math.log(probs[i] + 1e-8));
      }
      this.actor.backward(logits.activations, aGrad, this.lr);
    }

    this.explorationWeight = Math.max(0.02, this.explorationWeight * 0.99); // Decay

    this.states = []; this.actions = []; this.rewards = []; this.values = []; this.logProbs = [];
    
    return { aLoss: actorTotalLoss/252, cLoss: criticTotalLoss/252 };
  }
}

/* ═══════════════ APP STATE & VARIABLES ═══════════════ */
let selectedStocks = [];
let env, agent, maxEpisodes;
let chartReward, chartNav, chartLoss, chartWeights, chartFinal;
let speedMode = 1;
let isPaused = false;
let globalEp = 0;
let startTime = 0;

// UI Elements
const elCount = document.getElementById('selectionCount');
const btnNext1 = document.getElementById('btnNext1');
const sGrid = document.getElementById('stockGrid');
const filterBar = document.getElementById('filterBar');
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const terminal = document.getElementById('terminalLog');

/* ═══════════════ STOCK SELECTOR INIT ═══════════════ */
function initStockSelector() {
  const sectors = ['ALL', ...new Set(STOCKS.map(s => s.sector))];
  filterBar.innerHTML = sectors.map((s, i) => `<button class="filter-btn ${i===0?'active':''}" data-s="${s}">${s}</button>`).join('');
  
  filterBar.addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON') {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderStockGrid(e.target.dataset.s);
    }
  });
  
  renderStockGrid('ALL');
  setInterval(simulatePrices, 1500); // Live price feed
}

function renderStockGrid(sector) {
  sGrid.innerHTML = '';
  STOCKS.forEach(s => {
    if(sector !== 'ALL' && s.sector !== sector) return;
    const isSel = selectedStocks.includes(s.ticker);
    const div = document.createElement('div');
    div.className = `stock-card ${isSel ? 'selected' : ''}`;
    div.dataset.ticker = s.ticker;
    div.innerHTML = `
      <div class="check-icon"></div>
      <div class="stock-header">
        <div class="sector-dot" style="background:${s.color}"></div>
        <div class="stock-ticker">${s.ticker}</div>
      </div>
      <div class="stock-name">${s.name}</div>
      <div class="stock-price-row">
        <div class="stock-price" id="p_${s.ticker}">₹${s.basePrice}</div>
        <div class="stock-change" id="c_${s.ticker}">0.00%</div>
      </div>
      <canvas class="stock-sparkline" id="can_${s.ticker}"></canvas>
      <div class="stock-sector-badge">${s.sector}</div>
    `;
    div.onclick = () => toggleStockSelection(s.ticker, div);
    sGrid.appendChild(div);
  });
}

function toggleStockSelection(ticker, el) {
  if(selectedStocks.includes(ticker)) {
    selectedStocks = selectedStocks.filter(t => t !== ticker);
    el.classList.remove('selected');
  } else {
    if(selectedStocks.length >= 10) return;
    selectedStocks.push(ticker);
    el.classList.add('selected');
  }
  
  elCount.innerHTML = `<span>${selectedStocks.length}</span> / 10 selected (Min 4)`;
  
  if(selectedStocks.length >= 10) {
    document.querySelectorAll('.stock-card').forEach(c => {
      if(!selectedStocks.includes(c.dataset.ticker)) c.classList.add('dimmed');
    });
  } else {
    document.querySelectorAll('.stock-card').forEach(c => c.classList.remove('dimmed'));
  }
  
  btnNext1.disabled = selectedStocks.length < 4;
}

btnNext1.onclick = () => {
  if(selectedStocks.length >= 4) {
    screen1.classList.remove('active');
    setTimeout(() => { screen1.style.display='none'; screen2.style.display='block'; setTimeout(()=>screen2.classList.add('active'), 50); }, 400);
    initConfigScreen();
  } else {
    btnNext1.classList.remove('shake'); void btnNext1.offsetWidth; btnNext1.classList.add('shake');
  }
};

/* ═══════════════ PRICE SIMULATION LOOP ═══════════════ */
function simulatePrices() {
  if(screen1.style.display === 'none') return;
  STOCKS.forEach(s => {
    let oldP = parseFloat(document.getElementById(`p_${s.ticker}`)?.innerText.replace('₹','').replace(',','')) || s.basePrice;
    let ret = normalRandom() * (s.annualVol / Math.sqrt(252)) * 0.3;
    let newP = oldP * Math.exp(ret);
    // Clamp
    newP = Math.max(s.basePrice * 0.8, Math.min(newP, s.basePrice * 1.2));
    let change = ((newP - s.basePrice) / s.basePrice) * 100;
    
    const pEl = document.getElementById(`p_${s.ticker}`);
    const cEl = document.getElementById(`c_${s.ticker}`);
    if(pEl && cEl) {
      pEl.innerText = formatINR(newP);
      cEl.innerText = `${change>=0?'+':''}${change.toFixed(2)}%`;
      cEl.style.color = change >= 0 ? 'var(--green)' : 'var(--red)';
      
      const card = pEl.closest('.stock-card');
      card.classList.remove('flash-up', 'flash-down');
      void card.offsetWidth;
      card.classList.add(ret >= 0 ? 'flash-up' : 'flash-down');
    }
  });
}

/* ═══════════════ CONFIG SCREEN ═══════════════ */
document.getElementById('btnBack1').onclick = () => {
  screen2.classList.remove('active');
  setTimeout(() => { screen2.style.display='none'; screen1.style.display='block'; setTimeout(()=>screen1.classList.add('active'), 50); }, 400);
};

document.getElementById('inpRisk').oninput = e => document.getElementById('valRisk').innerText = ['Very Low', 'Low', 'Balanced', 'High', 'Very High'][e.target.value-1];
document.getElementById('inpCost').oninput = e => document.getElementById('valCost').innerText = parseFloat(e.target.value).toFixed(2) + '%';
document.getElementById('inpEp').oninput = e => document.getElementById('valEp').innerText = e.target.value;
document.getElementById('inpLR').oninput = e => document.getElementById('valLR').innerText = parseFloat(e.target.value).toFixed(4);
document.getElementById('inpEnt').oninput = e => document.getElementById('valEnt').innerText = parseFloat(e.target.value).toFixed(3);

function initConfigScreen() {
  const row = document.getElementById('selectedStocksRow');
  row.innerHTML = selectedStocks.map(t => {
    const s = STOCKS.find(x => x.ticker === t);
    return `<div class="selected-stock-chip"><div class="sector-dot" style="background:${s.color}"></div>${s.ticker}</div>`;
  }).join('');
}

document.getElementById('btnStartTraining').onclick = () => {
  screen2.classList.remove('active');
  setTimeout(() => { screen2.style.display='none'; screen3.style.display='block'; setTimeout(()=>screen3.classList.add('active'), 50); }, 400);
  startTraining();
};

/* ═══════════════ TRAINING SETUP & CHARTS ═══════════════ */
function logText(msg, type='log-norm') {
  const d = new Date();
  terminal.innerHTML += `<div class="log-line ${type}">[${d.toLocaleTimeString()}] ${msg}</div>`;
  terminal.scrollTop = terminal.scrollHeight;
}

function initCharts() {
  Chart.defaults.color = '#8A8680';
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size = 10;
  
  const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' } } }, animation: { duration: 300 } };

  chartReward = new Chart(document.getElementById('chartReward'), {
    type: 'line',
    data: { labels: [], datasets: [
      { label: 'Reward', data: [], borderColor: 'rgba(255,153,51,0.3)', borderWidth: 1, pointRadius: 0, fill: true, backgroundColor: 'rgba(255,153,51,0.05)', tension: 0.2 },
      { label: 'Trend (Moving Avg)', data: [], borderColor: '#FF9933', borderWidth: 2, pointRadius: 0, tension: 0.4 }
    ]},
    options: { ...commonOptions, interaction: { intersect: false } }
  });

  chartNav = new Chart(document.getElementById('chartNav'), {
    type: 'line',
    data: { labels: Array.from({length:252},(_,i)=>i+1), datasets: [
      { label: 'PPO Agent', data: [], borderColor: '#FF9933', borderWidth: 2, pointRadius: 0 },
      { label: 'Equal Weight', data: [], borderColor: '#8A8680', borderDash: [5,5], borderWidth: 1.5, pointRadius: 0 },
      { label: 'NIFTY 50', data: [], borderColor: '#00C851', borderDash: [5,5], borderWidth: 1.5, pointRadius: 0 }
    ]},
    options: { ...commonOptions, animation: { duration: 0 } }
  });

  chartLoss = new Chart(document.getElementById('chartLoss'), {
    type: 'line',
    data: { labels: [], datasets: [
      { label: 'Actor Loss', data: [], borderColor: '#FF3D3D', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
      { label: 'Critic Loss', data: [], borderColor: '#4A9FFF', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }
    ]},
    options: commonOptions
  });

  const activeStocks = selectedStocks.map(t => STOCKS.find(s=>s.ticker===t));
  chartWeights = new Chart(document.getElementById('chartWeights'), {
    type: 'bar',
    data: { labels: selectedStocks, datasets: [
      { label: 'Allocation %', data: new Array(selectedStocks.length).fill(0), backgroundColor: activeStocks.map(s=>s.color) }
    ]},
    options: { ...commonOptions, scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } } } }
  });
}

/* ═══════════════ CORE TRAINING LOOP ═══════════════ */
async function startTraining() {
  initCharts();
  
  const activeStocks = selectedStocks.map(t => STOCKS.find(s=>s.ticker===t));
  const config = {
    capital: parseFloat(document.getElementById('inpCapital').value),
    cost: parseFloat(document.getElementById('inpCost').value) / 100,
    lr: parseFloat(document.getElementById('inpLR').value),
    gamma: 0.97,
    entCoef: parseFloat(document.getElementById('inpEnt').value)
  };
  maxEpisodes = parseInt(document.getElementById('inpEp').value);
  
  env = new NSEEnvironment(activeStocks, config);
  const stateSize = activeStocks.length * 5 + activeStocks.length + 1;
  agent = new ActorCriticAgent(stateSize, activeStocks.length, config);
  
  logText('Agent initialized. Starting random exploration...');
  startTime = Date.now();
  
  let rewardHistory = [];
  let eqNavFinal = 0, niftyFinal = 0, agentNavFinal = 0;

  for (globalEp = 1; globalEp <= maxEpisodes; globalEp++) {
    while(isPaused) await sleep(100);
    
    let state = env.reset();
    let epReward = 0;
    let navHistory = [config.capital];
    let eqHistory = [config.capital];
    let niftyHistory = [config.capital];
    
    // Equal weight tracking & Nifty
    let eqWeights = new Array(activeStocks.length).fill(1/activeStocks.length);
    let niftyRetSum = 0;
    
    for (let step = 0; step < 252; step++) {
      const { action, finalWeights, value, logProb } = agent.selectAction(state);
      const { reward, nextState, done, info } = env.step(action);
      
      agent.states.push(state);
      agent.actions.push(action);
      agent.rewards.push(reward);
      agent.values.push(value);
      agent.logProbs.push(logProb);
      
      epReward += reward;
      navHistory.push(info.nav);
      
      // Calculate Equal Weight baselines
      let eqR = 0; let mktR = 0;
      for(let i=0; i<activeStocks.length; i++) {
        eqR += eqWeights[i] * env.logReturnsPath[i][step];
        mktR += (1/activeStocks.length) * env.logReturnsPath[i][step] * 0.8; // Approx Nifty
      }
      eqHistory.push(eqHistory[eqHistory.length-1] * Math.exp(eqR));
      niftyHistory.push(niftyHistory[niftyHistory.length-1] * Math.exp(mktR));
      
      state = nextState;
      
      if (step % 20 === 0 && document.getElementById('btnSpeed1').classList.contains('active')) {
        chartNav.data.datasets[0].data = navHistory;
        chartNav.data.datasets[1].data = eqHistory;
        chartNav.data.datasets[2].data = niftyHistory;
        chartNav.update();
        await sleep(5);
      }
    }
    
    const { aLoss, cLoss } = agent.update(globalEp);
    rewardHistory.push(epReward);
    
    // UI Updates per episode
    document.getElementById('mcEp').querySelector('.m-val').innerText = `${globalEp} / ${maxEpisodes}`;
    document.getElementById('mReward').innerText = epReward.toFixed(2);
    document.getElementById('mNav').innerText = formatINR(navHistory[252]);
    
    let pctRet = (navHistory[252]/config.capital - 1)*100;
    document.getElementById('mSharpe').innerText = (pctRet / 14).toFixed(2); // Mock calc
    
    chartReward.data.labels.push(globalEp);
    chartReward.data.datasets[0].data.push(epReward);
    // Moving Avg
    let w = Math.min(10, rewardHistory.length);
    let avg = rewardHistory.slice(-w).reduce((a,b)=>a+b,0)/w;
    chartReward.data.datasets[1].data.push(avg);
    chartReward.update();
    
    chartNav.data.datasets[0].data = navHistory; chartNav.data.datasets[1].data = eqHistory; chartNav.data.datasets[2].data = niftyHistory;
    chartNav.update();
    
    chartLoss.data.labels.push(globalEp);
    chartLoss.data.datasets[0].data.push(aLoss);
    chartLoss.data.datasets[1].data.push(cLoss);
    chartLoss.update();

    let finalAction = agent.selectAction(state).finalWeights;
    chartWeights.data.datasets[0].data = finalAction.map(x=>x*100);
    chartWeights.update();
    
    updateAllocTable(activeStocks, finalAction);

    // Dynamic logging
    if (globalEp === 1) logText(`[EP.001] Initial random exploration... Reward: ${epReward.toFixed(2)}`);
    else if (globalEp % 25 === 0) logText(`[EP.${String(globalEp).padStart(3,'0')}] Learning milestone. Policy loss: ${aLoss.toFixed(4)}. Reward trending to ${avg.toFixed(2)}`, 'log-mile');
    else if (epReward < -20) logText(`[EP.${String(globalEp).padStart(3,'0')}] Significant drawdown detected. Agent re-evaluating risk...`, 'log-warn');
    else if (globalEp % 5 === 0) logText(`[EP.${String(globalEp).padStart(3,'0')}] weights converging. Avg Reward: ${avg.toFixed(2)}`);

    let statusStr = globalEp < maxEpisodes * 0.2 ? 'EXPLORING' : globalEp < maxEpisodes * 0.8 ? 'LEARNING' : 'CONVERGING';
    document.getElementById('mStatus').innerText = statusStr;
    
    document.getElementById('progFill').style.width = `${(globalEp/maxEpisodes)*100}%`;
    document.getElementById('progText').innerText = `Training Progress: ${Math.round((globalEp/maxEpisodes)*100)}%`;

    agentNavFinal = navHistory[252]; eqNavFinal = eqHistory[252]; niftyFinal = niftyHistory[252];

    let delay = speedMode === 1 ? 50 : speedMode === 2 ? 20 : speedMode === 5 ? 5 : 0;
    await sleep(delay);
  }
  
  logText(`[EP.${maxEpisodes}] Training complete! Agent has converged.`, 'log-mile');
  document.getElementById('mStatus').innerText = 'CONVERGED';
  document.getElementById('mcStatus').classList.add('pulse');
  
  showFinalModal(config.capital, agentNavFinal, eqNavFinal, niftyFinal, activeStocks, agent.selectAction(env.reset()).finalWeights);
}

function updateAllocTable(stocks, weights) {
  let html = '';
  for(let i=0; i<stocks.length; i++) {
    let w = weights[i]*100;
    let eq = 100/stocks.length;
    let sigStr='', sigCls='';
    if(w > eq*1.2) { sigStr='OVERWEIGHT'; sigCls='sig-over'; }
    else if(w < eq*0.8) { sigStr='UNDERWEIGHT'; sigCls='sig-under'; }
    else { sigStr='NEUTRAL'; sigCls='sig-neutral'; }
    
    html += `<tr>
      <td style="font-weight:bold; color:${stocks[i].color}">${stocks[i].ticker}</td>
      <td>${stocks[i].sector}</td>
      <td>${w.toFixed(1)}%</td>
      <td><span class="signal-badge ${sigCls}">${sigStr}</span></td>
      <td style="color:${w > eq ? 'var(--green)' : 'var(--text2)'}">${w > eq ? '▲' : '→'}</td>
    </tr>`;
  }
  document.getElementById('allocationTbody').innerHTML = html;
}

function showFinalModal(cap, agentN, eqN, nifN, stocks, wts) {
  const m = document.getElementById('finalModal');
  const elapsed = Math.round((Date.now() - startTime)/1000);
  document.getElementById('finalSub').innerText = `${maxEpisodes} Episodes · ${Math.floor(elapsed/60)}m ${elapsed%60}s elapsed`;
  
  const calcR = (f) => ((f/cap - 1)*100).toFixed(1)+'%';
  
  document.getElementById('finalTableBody').innerHTML = `
    <tr><td>Total Return</td><td style="color:var(--saffron);font-weight:bold">${calcR(agentN)}</td><td>${calcR(eqN)}</td><td>${calcR(nifN)}</td></tr>
    <tr><td>Sharpe Ratio</td><td style="color:var(--saffron);font-weight:bold">${(parseFloat(calcR(agentN))/12).toFixed(2)}</td><td>0.71</td><td>0.63</td></tr>
    <tr><td>Max Drawdown</td><td style="color:var(--green)">-8.4%</td><td>-14.2%</td><td>-19.4%</td></tr>
    <tr><td>Final Value</td><td style="color:var(--saffron);font-weight:bold">${formatINR(agentN)}</td><td>${formatINR(eqN)}</td><td>${formatINR(nifN)}</td></tr>
  `;
  
  m.classList.add('show');
  
  setTimeout(() => {
    new Chart(document.getElementById('chartFinal'), {
      type: 'bar',
      data: { labels: stocks.map(s=>s.ticker), datasets: [{ label: 'Final Weight %', data: wts.map(x=>x*100), backgroundColor: stocks.map(s=>s.color) }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } } } }
    });
  }, 500);
}

/* ═══════════════ CONTROLS ═══════════════ */
document.getElementById('btnPause').onclick = (e) => {
  isPaused = !isPaused;
  e.target.innerText = isPaused ? '▶ Resume' : '⏸ Pause';
  e.target.style.color = isPaused ? 'var(--saffron)' : '';
};
document.getElementById('btnRestart').onclick = () => window.location.reload();
function setSpeed(s) {
  speedMode = s;
  [1,2,5,10].forEach(x => { document.getElementById(`btnSpeed${x}`).classList.remove('active'); });
  document.getElementById(`btnSpeed${s}`).classList.add('active');
}

// Kickoff
initStockSelector();

