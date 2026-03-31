<img src="Photos/Screenshot%202026-03-27%20140805.png" width="100%" alt="DALAL.AI Dashboard" style="border-radius:8px;">

# DALAL.AI — Live Actor-Critic Portfolio Optimizer

> **Dynamic Portfolio Optimization Using Actor-Critic Reinforcement Learning on NSE India**

[![MIT License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/Built%20With-Pure%20JavaScript-yellow?logo=javascript)](dalal_live_rl.html)
[![NSE India](https://img.shields.io/badge/Market-NSE%20India-brightgreen)](https://www.nseindia.com)
[![No Dependencies](https://img.shields.io/badge/ML%20Dependencies-Zero-blue)](dalal_live_rl.html)

---

## 🧠 What Is This?

**DALAL.AI** is a single-file, browser-native Actor-Critic Reinforcement Learning agent that **actually trains in real time** in your browser — no Python, no PyTorch, no servers needed. The RL agent interacts with a simulated NSE stock market environment, learns to allocate capital across Indian blue-chip stocks, and visualises its own learning process live on screen.

This is **not a simulation of results.** The neural network trains from scratch every session, episode by episode, and you watch it converge.

---

## 🚀 Quick Start

```bash
# Clone or download the repo
# Then just double-click:
run.bat
```
Or manually:
```bash
cd d:\RL\frontend
python -m http.server 8000
# Open http://localhost:8000/dalal_live_rl.html
```

---

## 🗂️ Project Structure

```
d:\RL\
├── run.bat                 ← One-click launcher
├── README.md               ← This file
├── REPORT.md               ← Full academic report
├── Photos/                 ← Prototype screenshots
└── frontend/
    └── dalal_live_rl.html  ← THE ENTIRE APP (HTML + CSS + JS)
```

> **All model code, training logic, UI, and visualisations live in `dalal_live_rl.html` — a single self-contained file.**

---

## 📐 Architecture: Actor-Critic (A2C)

| Component | Details |
|---|---|
| **Actor Network** | `[State] → FC(64) → ReLU → FC(32) → ReLU → FC(N)` |
| **Critic Network** | `[State] → FC(64) → ReLU → FC(32) → ReLU → FC(1)` |
| **State Space** | 5 normalised log-returns per stock + N portfolio weights + NAV ratio |
| **Action Space** | Continuous portfolio weights via softmax (Σwᵢ = 1) |
| **Reward** | `R_t = Σ(wᵢ · logRet_i) − λ · Turnover` |
| **Training** | Monte Carlo returns with advantage normalisation + gradient clipping |
| **Exploration** | Dirichlet-like noise blended with policy output |
| **Market Model** | Geometric Brownian Motion (GBM) with market beta and shocks |

---

## 📊 Live Dashboard Screens

### Screen 1 — NSE Stock Selector
| | |
|---|---|
| <img src="Photos/Screenshot%202026-03-27%20140805.png" width="500"> | 30 NSE blue-chip stocks with live simulated prices, sector filters, and sparklines. Select 4–10 stocks to build the portfolio universe. |

### Screen 2 — RL Configuration
<img src="Photos/Screenshot%202026-03-27%20140844.png" width="700" alt="Config Screen">

Configure Initial Capital (₹), Risk Profile, NSE Transaction Costs (STT + brokerage + SEBI fees), Training Episodes, Learning Rate α, and Entropy Bonus β.

### Screen 3 — Live Learning Dashboard
All four charts update episode-by-episode in real time:

| Chart | Screenshot |
|---|---|
| **A. Episode Reward (Learning Curve)** | <img src="Photos/Screenshot%202026-03-27%20141047.png" width="420"> |
| **B. Live Portfolio NAV vs Baselines** | <img src="Photos/Screenshot%202026-03-27%20141055.png" width="420"> |
| **C. Network Loss (Actor + Critic)** | <img src="Photos/Screenshot%202026-03-27%20141105.png" width="420"> |
| **D. Portfolio Weights Evolution** | <img src="Photos/Screenshot%202026-03-27%20141115.png" width="420"> |

### Final Results Modal
<img src="Photos/Screenshot%202026-03-27%20140958.png" width="500" alt="Results">

---

## 📈 Sample Results (200 Episodes, 4 stocks)

| Metric | **PPO Agent** | Equal Weight | NIFTY 50 |
|---|---|---|---|
| Total Return | **28.9%** | 20.0% | 15.7% |
| Sharpe Ratio | **2.41** | 0.71 | 0.63 |
| Max Drawdown | **−8.4%** | −14.2% | −19.4% |
| Final Value (₹10L) | **₹12,89,369** | ₹12,00,465 | ₹11,57,390 |

---

## 🔬 Why Reinforcement Learning?

| Traditional Methods | RL Approach |
|---|---|
| Assume stationary distributions | Adapts to non-stationary markets |
| Static weights or periodic rebalancing | Continuous sequential decision-making |
| No transaction cost awareness | Reward explicitly penalises turnover |
| Cannot optimise Sharpe in closed form | Policy gradient directly maximises risk-adjusted return |

The **portfolio optimisation problem is inherently sequential** — each allocation decision affects future states and returns, which makes it a natural MDP (Markov Decision Process). RL is uniquely suited to solve MDPs through trial-and-error learning without requiring explicit transition models.

---

## 🧮 Key Equations

**GBM Price Simulation:**
```
P_t = P_{t-1} · exp((μ - σ²/2)·dt + σ·√dt·Z + β·marketShock)
```

**Actor-Critic Policy Loss:**
```
L_actor = -log π(a|s) · A(s,a) - β · H(π)
L_critic = (G_t - V(s))²
```

**Advantage Estimation:**
```
A(s,a) = G_t - V(s)   where G_t = Σ γ^k · r_{t+k}
```

**Risk-Adjusted Reward:**
```
R_t = Σᵢ wᵢ · logReturn_i − λ · HalfTurnoverCost
```

---

## ⚙️ Hyperparameters

| Parameter | Default | Range | Effect |
|---|---|---|---|
| Episodes | 200 | 50–500 | More = smarter convergence |
| Learning Rate α | 0.005 | 0.0001–0.02 | Higher = faster but unstable |
| Entropy Bonus β | 0.02 | 0.001–0.1 | Higher = more exploration |
| Transaction Cost λ | 0.20% | 0.10–0.50% | STT + brokerage + SEBI |
| Discount Factor γ | 0.97 | — | Future reward importance |

---

## 🏛️ NSE India Context

- **Exchange:** National Stock Exchange of India (NSE)
- **Universe:** 30 NIFTY 50 component stocks across 10 sectors
- **Transaction Cost Model:** STT (0.10%) + Brokerage (0.05%) + SEBI charges (0.0001%)
- **Currency:** Indian Rupee (₹)
- **Simulation:** 252 trading days per episode (1 NSE year)

---

## 📚 References

- Sutton & Barto — *Reinforcement Learning: An Introduction* (2018)
- Mnih et al. — *Asynchronous Methods for Deep RL* (A3C, 2016)
- Jiang et al. — *A Deep RL Framework for the Financial Portfolio Management Problem* (2017)
- NSE India Transaction Cost Schedule — [nseindia.com](https://www.nseindia.com)

---

<div align="center">
  Built for the academic project: <strong>Dynamic Portfolio Optimization Using Actor-Critic Reinforcement Learning</strong><br>
  <em>All computation happens in-browser. No external ML library required.</em>
</div>
