const fs = require('fs');
const STOCKS = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', sector: 'ENERGY', basePrice: 2850, annualVol: 0.26, annualDrift: 0.14, beta: 1.2, color: '#FF6B35' },
  { ticker: 'TCS', name: 'Tata Consultancy', sector: 'IT', basePrice: 3920, annualVol: 0.22, annualDrift: 0.12, beta: 0.9, color: '#4A9FFF' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', sector: 'BANKING', basePrice: 1680, annualVol: 0.16, annualDrift: 0.15, beta: 1.1, color: '#00C851' },
  { ticker: 'INFY', name: 'Infosys Ltd', sector: 'IT', basePrice: 1750, annualVol: 0.24, annualDrift: 0.11, beta: 1.0, color: '#29B6F6' }
];

let html = fs.readFileSync('dalal_live_rl.html', 'utf8');
let start = html.indexOf('/* ═══════════════ MATH UTILS ═══════════════ */');
let end = html.indexOf('/* ═══════════════ APP STATE & VARIABLES ═══════════════ */');
let coreRL = html.substring(start, end);

const mockUI = `
const STOCKS = ${JSON.stringify(STOCKS)};
const config = { capital: 1000000, cost: 0.002, lr: 0.02, gamma: 0.97, entCoef: 0.02 };
const env = new NSEEnvironment(STOCKS, config);
const stateSize = STOCKS.length * 5 + STOCKS.length + 1;
const agent = new ActorCriticAgent(stateSize, STOCKS.length, config);

for (let ep = 1; ep <= 200; ep++) {
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
`;

fs.writeFileSync('debug_rl2.js', coreRL + '\n\n' + mockUI);
