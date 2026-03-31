const fs = require('fs');

// Mocks
global.document = {
  getElementById: (id) => ({
    innerText: '',
    value: id === 'inpCapital' ? '1000000' : 
           id === 'inpCost' ? '0.20' : 
           id === 'inpLR' ? '0.005' : 
           id === 'inpEnt' ? '0.02' : 
           id === 'inpEp' ? '5' : '0',
    classList: { remove:()=>{}, add:()=>{} },
    querySelector: () => ({ innerText: '' }),
    style: {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({})
};
global.window = {};
global.Chart = { defaults: { font: {} } };

// Read code
let js = fs.readFileSync('dlrl_extract.js', 'utf8');
// Remove UI stuff that throws errors without DOM
js = js.replace(/chart[A-Za-z]+\./g, '//');
js = js.replace(/new Chart\(/g, '//');
// Stop UI loop
js = js.replace(/setInterval.*?simulatePrices.*?;/g, '');

eval(js);

async function test() {
  selectedStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  speedMode = 0; // fast
  
  const activeStocks = selectedStocks.map(t => STOCKS.find(s=>s.ticker===t));
  const config = {
    capital: 1000000, cost: 0.002, lr: 0.005, gamma: 0.97, entCoef: 0.02
  };
  maxEpisodes = 5;
  env = new NSEEnvironment(activeStocks, config);
  const stateSize = activeStocks.length * 5 + activeStocks.length + 1;
  agent = new ActorCriticAgent(stateSize, activeStocks.length, config);
  
  for (let ep = 1; ep <= 5; ep++) {
    let state = env.reset();
    let epReward = 0;
    
    for (let step = 0; step < 252; step++) {
      const { action, finalWeights, value, logProb } = agent.selectAction(state);
      for(let w of finalWeights) if(isNaN(w)) console.error('NaN Weight at step', step, action);
      const { reward, nextState, done, info } = env.step(action);
      if(isNaN(reward)) console.error('NaN Reward at step', step, 'stepCount:', env.stepCount);
      
      agent.states.push(state);
      agent.actions.push(action);
      agent.rewards.push(reward);
      agent.values.push(value);
      agent.logProbs.push(logProb);
      epReward += reward;
      state = nextState;
    }
    const { aLoss, cLoss } = agent.update(ep);
    console.log(`Episode ${ep} Reward: ${epReward.toFixed(2)} | Actor loss: ${aLoss} | Critic loss: ${cLoss}`);
  }
}

test().catch(console.error);
