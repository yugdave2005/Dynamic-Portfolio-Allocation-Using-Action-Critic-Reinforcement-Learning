import fs from 'fs';

let js = fs.readFileSync('dlrl_extract.js', 'utf8');

// Strip out UI and DOM dependencies string parsing
js = js.replace(/function initCharts\(\) \{[\s\S]*?\}/, '');
js = js.replace(/function startTraining\(\) \{[\s\S]*/, '');
js = js.replace(/document\.getElementById\('.*?'\)/g, '{}');
js = js.replace(/chartReward|chartNav|chartLoss|chartWeights|chartFinal|terminal/g, '({})');

const mockUI = `
let selectedStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
const activeStocks = selectedStocks.map(t => STOCKS.find(s=>s.ticker===t));
const config = { capital: 1000000, cost: 0.002, lr: 0.005, gamma: 0.97, entCoef: 0.02 };
const env = new NSEEnvironment(activeStocks, config);
const stateSize = activeStocks.length * 5 + activeStocks.length + 1;
const agent = new ActorCriticAgent(stateSize, activeStocks.length, config);

for (let ep = 1; ep <= 5; ep++) {
  let state = env.reset();
  let epReward = 0;
  for (let step = 0; step < 252; step++) {
    const { action, finalWeights, value, logProb } = agent.selectAction(state);
    if (isNaN(finalWeights[0])) { console.log('NaN Weight at step', step, 'EP', ep); process.exit(1); }
    const { reward, nextState, done, info } = env.step(action);
    if (isNaN(reward)) { console.log('NaN Reward at step', step, 'EP', ep, 'stepCount:', env.stepCount); process.exit(1); }
    agent.states.push(state); agent.actions.push(action); agent.rewards.push(reward); agent.values.push(value); agent.logProbs.push(logProb);
    epReward += reward; state = nextState;
  }
  const { aLoss, cLoss } = agent.update(ep);
  if (isNaN(aLoss) || isNaN(cLoss)) {
     console.log('NaN Loss at EP', ep, 'aLoss', aLoss, 'cLoss', cLoss);
     process.exit(1);
  }
  console.log('EP', ep, 'Reward:', epReward.toFixed(2), 'aLoss:', aLoss, 'cLoss:', cLoss);
}
`;

fs.writeFileSync('test_headless.js', js + '\n\n' + mockUI);
