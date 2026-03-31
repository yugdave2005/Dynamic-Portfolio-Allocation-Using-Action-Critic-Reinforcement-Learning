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




const STOCKS = [{"ticker":"RELIANCE","name":"Reliance Industries","sector":"ENERGY","basePrice":2850,"annualVol":0.26,"annualDrift":0.14,"beta":1.2,"color":"#FF6B35"},{"ticker":"TCS","name":"Tata Consultancy","sector":"IT","basePrice":3920,"annualVol":0.22,"annualDrift":0.12,"beta":0.9,"color":"#4A9FFF"},{"ticker":"HDFCBANK","name":"HDFC Bank","sector":"BANKING","basePrice":1680,"annualVol":0.16,"annualDrift":0.15,"beta":1.1,"color":"#00C851"},{"ticker":"INFY","name":"Infosys Ltd","sector":"IT","basePrice":1750,"annualVol":0.24,"annualDrift":0.11,"beta":1,"color":"#29B6F6"}];
const config = { capital: 1000000, cost: 0.002, lr: 0.02, gamma: 0.97, entCoef: 0.02 };
const env = new NSEEnvironment(STOCKS, config);
const stateSize = STOCKS.length * 5 + STOCKS.length + 1;
const agent = new ActorCriticAgent(stateSize, STOCKS.length, config);

for (let ep = 1; ep <= 1500; ep++) {
  let state = env.reset();
  if (state.some(isNaN)) { console.log('NaN in reset state', state); process.exit(1); }
  
  let epReward = 0;
  for (let step = 0; step < 252; step++) {
    const { action, finalWeights, value, logProb } = agent.selectAction(state);
    if (finalWeights.some(isNaN)) { console.log('NaN weight found step', step, 'EP', ep); process.exit(1); }
    
    const { reward, nextState, done, info } = env.step(action);
    if (isNaN(reward)) { console.log('NaN reward step', step, 'EP', ep); process.exit(1); }
    if (nextState.some(isNaN)) { console.log('NaN nextState step', step, 'EP', ep); process.exit(1); }
    
    agent.states.push(state); agent.actions.push(action); agent.rewards.push(reward); agent.values.push(value); agent.logProbs.push(logProb);
    epReward += reward; state = nextState;
  }
  const { aLoss, cLoss } = agent.update(ep);
  if (ep % 10 === 0) console.log('EP', ep, 'Reward:', epReward.toFixed(2), 'aLoss:', aLoss.toFixed(4), 'cLoss:', cLoss.toFixed(4));
  if (isNaN(aLoss) || isNaN(cLoss)) {
     console.log('NaN Loss at EP', ep, 'aLoss', aLoss, 'cLoss', cLoss);
     process.exit(1);
  }
}
