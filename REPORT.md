# Technical Report: Dynamic Portfolio Optimization using Actor-Critic Reinforcement Learning

## 1. Introduction

The traditional Markowitz Mean-Variance framework approaches portfolio optimization as a single-period problem, heavily relying on static, backward-looking covariance matrices. However, modern financial markets are complex, continuous, and dynamic. They involve friction (transaction costs, slippages) and shifting regimes (bull/bear cycles) that strict mathematical theories often ignore.

**DALAL.AI** abandons these static formulas in favor of an **Actor-Critic Reinforcement Learning (RL)** agent. Rather than predicting the market's future (Supervised Learning), the RL agent directly learns a mapping between market states and the most profitable portfolio allocations, explicitly optimizing for long-term risk-adjusted returns while penalizing excessive trading.

This report documents the custom-built, pure JavaScript implementation of the RL pipeline embedded entirely within the browser.

---

## 2. Mathematical Market Simulation (The Environment)

Since RL agents require thousands of episodes of trial-and-error to learn, we cannot train purely on real-time live data—it flows too slowly. Instead, we generate synthetic daily market paths based on the real characteristics (Historical Volatility, Annualized Drift, Beta) of NSE India blue-chip stocks.

### Geometric Brownian Motion (GBM)
We simulate the prices using a discretized Geometric Brownian Motion enriched with a systemic market shock:

```math
P_{i, t} = P_{i, t-1} \cdot \exp \left[ \left( \mu_i - \frac{\sigma_i^2}{2} \right) \Delta t + \sigma_i \sqrt{\Delta t} Z + \beta_i \cdot \text{MarketShock} \right]
```

Where:
- $\mu_i$ : The annualized historical return (drift) of stock $i$.
- $\sigma_i$ : The annualized volatility of stock $i$.
- $\Delta t$ : $1 / 252$ (One trading day in an NSE year).
- $Z \sim \mathcal{N}(0, 1)$ : A random draw from the standard normal distribution (Box-Muller transform).
- $\text{MarketShock} \sim \mathcal{N}(0, 0.15\sqrt{\Delta t})$ : Systemic correlation enforcing covariance between stocks via beta ($\beta_i$).

Because the entire price path for a 252-day year is generated instantly, the reinforcement learning agent can "simulate a year of trading" in milliseconds.

---

## 3. The Markov Decision Process (MDP) Definition

For Reinforcement Learning to work, the trading scenario must be framed as a Markov Decision Process $(S, A, R, \gamma)$.

### 3.1. State Space ($S_t$)
The agent needs to know what has recently happened in the market and what it currently owns to make a decision. The State vector consists of:
1. **Recent Returns:** The normalized log-returns of the last 5 days for each selected stock (providing momentum context).
2. **Current Portfolio Weights:** The agent needs to know its current allocation to avoid unnecessary rebalancing costs.
3. **Current NAV Ratio:** Tracking how much capital is left relative to the initial deposit.

### 3.2. Action Space ($A_t$)
The action is the target portfolio allocation. This is a continuous vector where values must sum strictly to 1.0 (representing 100% of available capital). We guarantee this property by passing the raw neural network output (logits) through a **Softmax Function**. 

### 3.3. Reward Function ($R_t$)
The RL optimizer is useless if it simply chases high returns by churning the portfolio (which incurs massive NSE STT & brokerage costs). The reward is the **Net Transaction-Cost Adjusted Log Return**:

```math
R_t = \sum_{i=1}^N \left( W_{i, t} \cdot \log(\text{Return}_{i, t}) \right) - \lambda \sum_{i=1}^N \left| W_{i, t} - W_{i, t-1} \right|
```

Where $\lambda$ represents the combined transaction friction ($\approx 0.20\%$).
If the agent changes its portfolio weights wildly, the absolute difference turnover penalty $\lambda|W_{t} - W_{t-1}|$ destroys its return, forcing it to learn "buy and hold" stability where possible.

---

## 4. The Actor-Critic Architecture

Unlike Q-learning (which only works for discrete actions) or raw Policy Gradients (which suffer from extremely high variance), **DALAL.AI uses a synchronous Advantage Actor-Critic (A2C)** architecture custom-written in JavaScript.

It consists of two deeply integrated Neural Networks:

### 4.1. The Actor Network (Policy $\pi_\theta(a|s)$)
**Goal:** Outputs the portfolio weights.
- **Input:** $S_t$ (State vector).
- **Hidden Layers:** `64 neurons -> ReLU -> 32 neurons -> ReLU`.
- **Output:** Raw logits passed through Softmax.
- **Exploration:** We inject Dirichlet-like noise $\mathcal{N}$ into the Softmax output to force the agent to "explore" random weight configurations early in training. This exploration noise decays linearly over time (`explorationWeight *= 0.99`).

### 4.2. The Critic Network (Value Function $V_\phi(s)$)
**Goal:** Predicts the total discounted cumulative reward from state $S_t$ onward.
- **Input:** $S_t$ (State vector).
- **Hidden Layers:** `64 neurons -> ReLU -> 32 neurons -> ReLU`.
- **Output:** A single scalar value representing expected future profit (V).
- **Purpose:** By predicting how much profit a state *should* yield, it provides a stable baseline for the Actor.

---

## 5. The Learning Process (Backpropagation)

At the end of an episode (252 days), the agent reviews its memory buffer `[States, Actions, Rewards, Values]` and updates its neural weights to "learn" from its mistakes.

### Step 1: Compute Returns ($G_t$)
We calculate the actual accumulated reward (Discounted Return) from the end of the episode backwards:
```javascript
G_t = R_t + \gamma * G_{t+1}
```

### Step 2: Compute Advantage ($A(s,a)$)
The defining characteristic of an Actor-Critic model is the **Advantage function**.
```math
Adv = G_t - V_\phi(S_t)
```
If `Adv > 0`, the agent performed *better* than the Critic expected—so the Actor's action should be heavily encouraged.
If `Adv < 0`, the action resulted in terrible sub-par returns—so the action should be discouraged.

### Step 3: Critic Update (MSE Loss)
The Critic compares its prediction $V_\phi(S_t)$ against what actually happened $G_t$, and minimizes the Mean Squared Error loss via gradient descent.
```math
L_{critic} = (G_t - V_\phi(S_t))^2
```

### Step 4: Actor Update (Policy Gradient with Entropy)
The Actor uses the computed Advantage to know whether to increase or decrease the probability of the actions it took. We also subtract an **Entropy Bonus** ($\beta \cdot \mathcal{H}(\pi)$) to actively penalize the network if it becomes "too sure of itself" too quickly, thus preventing getting trapped in local optima.
```math
L_{actor} = - \log \pi(A_t|S_t) \cdot Adv - \beta \cdot \mathcal{H}(\pi)
```

Both networks then execute raw, standard backpropagation (`NeuralNetwork.backward()`) using a simple learning rate $\alpha$, manually chaining derivatives backward from output to hidden layers using the Chain Rule. We apply **Gradient Clipping** (`Math.max(-1, Math.min(x, 1))`) during this backpass to mathematically prevent "Exploding Gradients", a common fragility in pure reinforcement learning networks.

---

## 6. Conclusion 

By merging the **Geometric Brownian Motion** with a dual-headed **Actor-Critic Neural Network**, DALAL.AI creates a robust, zero-dependency trading AI. It successfully replicates sophisticated institutional portfolio optimization logic entirely within the CPU threads of a web browser, effectively solving the non-stationary, friction-laden constraints of the modern Indian Stock Market.
