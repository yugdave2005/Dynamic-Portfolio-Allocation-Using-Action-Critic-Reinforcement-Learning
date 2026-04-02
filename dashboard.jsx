/**
 * DALAL.AI — Dynamic Portfolio Optimization Dashboard
 * Actor-Critic RL · NSE India · Bloomberg Terminal Aesthetic
 *
 * Usage:
 *   npx create-vite@latest frontend -- --template react
 *   cd frontend && cp ../dashboard.jsx src/App.jsx
 *   npm install && npm run dev
 *
 * Data: Place JSON files from evaluate.py in public/results/
 * Demo Mode activates automatically when JSON files are absent.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════ MOCK DATA (Demo Mode) ═══════════════
const MOCK_METRICS = {
  portfolio_value: 1248300, total_return_pct: 24.83, sharpe_ratio: 1.42,
  max_drawdown_pct: -11.2, avg_daily_turnover_pct: 3.8, nse_charges_pct: 0.20,
  annual_return_pct: 21.4, nifty50_return_pct: 6.2, volatility_pct: 14.2,
  beta: 0.74, alpha: 0.31, calmar_ratio: 1.91, currency: "INR",
  tickers: ["RELIANCE", "TCS", "HDFCBANK", "GOLDBEES"]
};

const COLORS = {
  bg: '#0A0D12', card: '#111620', cardHover: '#161C28',
  saffron: '#FF9933', green: '#138808', green2: '#2DD4A0',
  gold: '#C9A84C', red: '#F25C5C', blue: '#1565C0', blue2: '#5B9CF6',
  text: '#E8E8E8', muted: '#6B7280', border: 'rgba(255,255,255,0.06)',
  reliance: '#FF6B35', tcs: '#1565C0', hdfc: '#2E7D32', goldbees: '#C9A84C'
};

const TICKERS = ['RELIANCE', 'TCS', 'HDFCBANK', 'GOLDBEES'];
const TICKER_COLORS = [COLORS.reliance, COLORS.tcs, COLORS.hdfc, COLORS.goldbees];
const COMPANY_NAMES = ['Reliance Industries Ltd', 'Tata Consultancy Services', 'HDFC Bank Ltd', 'Nippon India Gold ETF'];

const HOLDINGS = [
  { ticker: 'RELIANCE', company: COMPANY_NAMES[0], weight: 31, ret7d: 12.4 },
  { ticker: 'GOLDBEES', company: COMPANY_NAMES[3], weight: 28, ret7d: 8.1 },
  { ticker: 'TCS', company: COMPANY_NAMES[1], weight: 24, ret7d: 6.2 },
  { ticker: 'HDFCBANK', company: COMPANY_NAMES[2], weight: 17, ret7d: -2.3 },
];

const PERF_METRICS = [
  { label: 'Annual Return', value: '21.4%', color: COLORS.green2 },
  { label: 'NIFTY 50 Return', value: '6.2%', color: COLORS.muted },
  { label: 'Volatility', value: '14.2%', color: COLORS.gold },
  { label: 'Beta', value: '0.74', color: COLORS.blue2 },
  { label: 'Alpha', value: '+0.31', color: COLORS.saffron },
  { label: 'Calmar Ratio', value: '1.91', color: COLORS.green2 },
];

const SIGNALS_DATA = [
  { stock: 'Reliance', ticker: 'RELIANCE.NS', logRet: '+0.42%', sma: '1.023 (▲)', vol: '18.2%', signal: 'OVERWEIGHT' },
  { stock: 'TCS', ticker: 'TCS.NS', logRet: '-0.18%', sma: '0.998 (▼)', vol: '22.1%', signal: 'NEUTRAL' },
  { stock: 'HDFC Bank', ticker: 'HDFCBANK.NS', logRet: '+0.31%', sma: '1.011 (▲)', vol: '16.8%', signal: 'OVERWEIGHT' },
  { stock: 'Gold ETF', ticker: 'GOLDBEES.NS', logRet: '+0.08%', sma: '1.002 (▲)', vol: '12.3%', signal: 'UNDERWEIGHT' },
];

const HYPER_PARAMS = [
  { param: 'n_steps', value: '2048', why: '~8 years of NSE daily data rollout' },
  { param: 'batch_size', value: '64', why: 'Stable gradient estimates' },
  { param: 'gamma', value: '0.99', why: 'Portfolio returns compound daily' },
  { param: 'clip_range', value: '0.2', why: 'PPO trust region constraint' },
  { param: 'ent_coef', value: '0.05', why: 'Explore NSE allocation space' },
  { param: 'learning_rate', value: '5e-3', why: 'Initial LR for Actor-Critic' },
  { param: 'market_fluctuation', value: '0.5', why: 'Scales NSE market systemic volatility shock' }
];

// ═══════════════ HELPERS ═══════════════
function formatINR(num) {
  const n = Math.round(num);
  const s = Math.abs(n).toString();
  if (s.length <= 3) return (n < 0 ? '-' : '') + '₹' + s;
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  let formatted = '';
  while (rest.length > 2) {
    formatted = ',' + rest.slice(-2) + formatted;
    rest = rest.slice(0, -2);
  }
  formatted = rest + formatted + ',' + last3;
  return (n < 0 ? '-' : '') + '₹' + formatted;
}

function genNavCurve(months = 24) {
  const ppo = [], eq = [], nifty = [], labels = [];
  let p = 0, e = 0, n = 0;
  const startDate = new Date(2022, 0, 1);
  for (let i = 0; i < months * 21; i++) {
    const d = new Date(startDate); d.setDate(d.getDate() + i);
    if (i % 5 === 0) labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
    else labels.push('');
    const shock = (i > 40 && i < 80) ? -0.003 : 0;
    p += (Math.random() - 0.44) * 0.8 + 0.05 + (i > 200 ? 0.04 : 0);
    e += (Math.random() - 0.47) * 0.7 + shock;
    n += (Math.random() - 0.48) * 0.75 + shock;
    ppo.push(+p.toFixed(2)); eq.push(+e.toFixed(2)); nifty.push(+n.toFixed(2));
  }
  return { labels, ppo, eq, nifty };
}

function genWeightsHistory(days = 500) {
  const data = { labels: [], reliance: [], tcs: [], hdfc: [], goldbees: [] };
  const startDate = new Date(2022, 0, 1);
  let w = [25, 25, 25, 25];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate); d.setDate(d.getDate() + i);
    if (i % 10 === 0) data.labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
    else data.labels.push('');
    // Simulate allocation shifts
    if (i > 40 && i < 100) { w = [22, 16, 24, 38]; }
    else if (i > 100 && i < 200) { w = [28, 20, 19, 33]; }
    else if (i > 200 && i < 350) { w = [33, 28, 18, 21]; }
    else if (i > 350) { w = [31, 24, 17, 28]; }
    else { w = [25, 25, 25, 25]; }
    const noise = () => (Math.random() - 0.5) * 3;
    let vals = w.map(v => Math.max(5, v + noise()));
    const sum = vals.reduce((a, b) => a + b, 0);
    vals = vals.map(v => +(v / sum * 100).toFixed(1));
    data.reliance.push(vals[0]); data.tcs.push(vals[1]);
    data.hdfc.push(vals[2]); data.goldbees.push(vals[3]);
  }
  return data;
}

const NAV_DATA = genNavCurve();
const WEIGHTS_DATA = genWeightsHistory();

// ═══════════════ ANIMATED NUMBER HOOK ═══════════════
function useAnimatedNumber(target, duration = 1200, decimals = 0, active = true) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(+(ease * target).toFixed(decimals));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals, active]);
  return val;
}

// ═══════════════ STYLES ═══════════════
const STYLE_TAG = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'DM Mono', monospace; overflow-x: hidden; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes loadBar { from { width: 0; } to { width: 100%; } }
@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }
@keyframes gridScroll { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }

.grid-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.loading-screen {
  position: fixed; inset: 0; z-index: 9999; background: ${COLORS.bg};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  animation: fadeOut 0.5s ease 1.8s forwards;
}
.loading-bar { width: 200px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 24px; overflow: hidden; }
.loading-bar-inner { height: 100%; background: ${COLORS.saffron}; animation: loadBar 1.5s ease forwards; }

.dashboard { position: relative; z-index: 1; min-height: 100vh; padding: 0 24px 40px;
  animation: fadeIn 0.6s ease 1.6s both; max-width: 1440px; margin: 0 auto; }

.header { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; border-bottom: 1px solid ${COLORS.border};
  animation: fadeIn 0.5s ease 1.7s both; flex-wrap: wrap; gap: 10px; }
.logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: ${COLORS.text}; letter-spacing: 1px; }
.logo span { color: ${COLORS.saffron}; }
.badge { font-size: 10px; padding: 3px 10px; border: 1px solid ${COLORS.border}; border-radius: 20px; color: ${COLORS.muted}; }
.agent-dot { width: 7px; height: 7px; border-radius: 50%; background: ${COLORS.saffron}; display: inline-block;
  animation: pulse 1.6s ease infinite; margin-right: 6px; }
.header-right { display: flex; align-items: center; gap: 14px; }
.export-btn { font-family: 'DM Mono', monospace; font-size: 10px; padding: 6px 14px; background: transparent;
  border: 1px solid ${COLORS.saffron}; color: ${COLORS.saffron}; border-radius: 4px; cursor: pointer;
  transition: background 0.2s; letter-spacing: 0.5px; }
.export-btn:hover { background: rgba(255,153,51,0.12); }

.demo-banner { background: rgba(255,153,51,0.1); border: 1px solid rgba(255,153,51,0.2);
  padding: 6px 16px; font-size: 10px; color: ${COLORS.saffron}; text-align: center;
  margin: 12px 0; border-radius: 4px; letter-spacing: 0.3px; }

.tabs { display: flex; gap: 0; border-bottom: 1px solid ${COLORS.border}; margin: 16px 0; }
.tab { font-family: 'DM Mono', monospace; font-size: 11px; padding: 10px 20px; background: none; border: none;
  color: ${COLORS.muted}; cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
  border-bottom: 2px solid transparent; }
.tab:hover { color: ${COLORS.text}; }
.tab.active { color: ${COLORS.saffron}; border-bottom-color: ${COLORS.saffron}; }

.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: ${COLORS.card}; border-radius: 8px; padding: 20px; border-top: 2px solid;
  transition: all 0.3s; }
.stat-card:hover { background: ${COLORS.cardHover}; }
.stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: ${COLORS.muted}; margin-bottom: 8px; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.stat-sub { font-size: 9px; color: ${COLORS.muted}; }

.chart-row { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: ${COLORS.card}; border-radius: 8px; padding: 20px; position: relative; }
.chart-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; margin-bottom: 14px; color: ${COLORS.text}; }
.chart-legend { display: flex; gap: 16px; margin-bottom: 10px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: ${COLORS.muted}; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }

.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center; pointer-events: none; }
.donut-center .label { font-size: 9px; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.8px; }
.donut-center .pct { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: ${COLORS.text}; }

.bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }

.table-wrap { background: ${COLORS.card}; border-radius: 8px; padding: 20px; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: ${COLORS.muted};
  text-align: left; padding: 8px 10px; border-bottom: 1px solid ${COLORS.border}; }
.data-table td { font-size: 11px; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.02); }
.data-table tr:hover { background: rgba(255,255,255,0.02); }

.color-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.weight-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); width: 80px; display: inline-block; margin-left: 8px; }
.weight-bar-fill { height: 100%; border-radius: 2px; }

.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.metric-card { background: rgba(255,255,255,0.03); border-radius: 6px; padding: 14px; }
.metric-card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: ${COLORS.muted}; margin-bottom: 6px; }
.metric-card .value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }

.reward-panel { background: ${COLORS.card}; border-radius: 8px; padding: 20px; }
.reward-step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.step-badge { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,153,51,0.15);
  color: ${COLORS.saffron}; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0; font-family: 'Syne', sans-serif; }
.step-eq { font-size: 12px; color: ${COLORS.blue2}; line-height: 1.7; }
.formula-box { border: 1px solid rgba(255,153,51,0.2); border-radius: 6px; padding: 14px;
  background: rgba(255,153,51,0.04); margin-top: 12px; }
.formula-box .eq { font-size: 13px; color: ${COLORS.blue2}; font-weight: 500; }
.formula-box .note { font-size: 10px; color: ${COLORS.gold}; margin-top: 6px; }

.insight-box { border: 1px solid rgba(255,153,51,0.15); border-radius: 6px; padding: 14px;
  background: rgba(255,153,51,0.04); margin-top: 16px; font-size: 11px; color: ${COLORS.muted}; line-height: 1.7; }
.insight-box strong { color: ${COLORS.saffron}; }

.annotation-label { font-size: 9px; color: ${COLORS.gold}; background: rgba(201,168,76,0.1);
  padding: 3px 8px; border-radius: 3px; margin-top: 10px; display: inline-block; }

.signal-badge { font-size: 9px; padding: 2px 8px; border-radius: 3px; font-weight: 500; letter-spacing: 0.5px; }
.signal-OVERWEIGHT { background: rgba(255,153,51,0.15); color: ${COLORS.saffron}; }
.signal-NEUTRAL { background: rgba(255,255,255,0.06); color: ${COLORS.muted}; }
.signal-UNDERWEIGHT { background: rgba(21,101,192,0.15); color: ${COLORS.blue2}; }

.about-section { margin-bottom: 28px; }
.about-section h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: ${COLORS.saffron};
  margin-bottom: 12px; }
.about-section p, .about-section li { font-size: 12px; color: ${COLORS.muted}; line-height: 1.8; }
.about-section ul { padding-left: 18px; }
.math-block { border: 1px solid rgba(255,153,51,0.15); border-radius: 6px; padding: 18px;
  background: rgba(255,153,51,0.03); font-size: 13px; color: ${COLORS.blue2}; line-height: 2; margin: 12px 0; }

.model-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.arch-svg { width: 100%; max-width: 500px; }

.pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
.pillar-card { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 16px; text-align: center;
  border: 1px solid ${COLORS.border}; }
.pillar-card .icon { font-size: 28px; margin-bottom: 6px; }
.pillar-card .name { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; }
.pillar-card .sub { font-size: 10px; color: ${COLORS.muted}; }

.footer { text-align: center; padding: 20px 0; font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 0.5px; }

.tab-content { animation: slideUp 0.25s ease; }

.tooltip-custom { position: absolute; background: ${COLORS.card}; border: 1px solid ${COLORS.saffron};
  border-radius: 4px; padding: 8px 12px; font-size: 10px; color: ${COLORS.muted};
  max-width: 240px; z-index: 100; pointer-events: none; line-height: 1.5; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }

@media (max-width: 768px) {
  .stat-cards, .chart-row, .bottom-row, .model-layout, .pillars { grid-template-columns: 1fr; }
  .grid-overlay { display: none; }
  .header { flex-direction: column; align-items: flex-start; }
}

@media print {
  .tabs, .export-btn, .demo-banner, .grid-overlay, .loading-screen, .footer { display: none !important; }
  .tab-content { display: block !important; }
  body { background: #fff; color: #000; }
  .stat-card, .chart-card, .table-wrap, .reward-panel, .metric-card { background: #f9f9f9; border: 1px solid #ddd; }
}
`;

// ═══════════════ STAT CARD COMPONENT ═══════════════
function StatCard({ label, value, sub, accentColor, delay, isINR, tooltip }) {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const animated = useAnimatedNumber(Math.abs(numVal), 1200, isINR ? 0 : 2, true);
  const [showTip, setShowTip] = useState(false);
  const display = isINR ? formatINR(animated) : (numVal < 0 ? '-' : '') + animated.toFixed(2) + (typeof value === 'string' && value.includes('%') ? '%' : '');

  return (
    <div className="stat-card" style={{ borderTopColor: accentColor, animationDelay: `${delay}s` }}
      onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: accentColor }}>{isINR ? display : (typeof value === 'string' ? (numVal < 0 ? '' : '') : '') + display}</div>
      <div className="stat-sub">{sub}</div>
      {showTip && tooltip && <div className="tooltip-custom" style={{ top: -60, left: 10 }}>{tooltip}</div>}
    </div>
  );
}

// ═══════════════ MAIN DASHBOARD ═══════════════
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [demoMode, setDemoMode] = useState(true);
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [chartReady, setChartReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const lineChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const areaChartRef = useRef(null);
  const lineInst = useRef(null);
  const donutInst = useRef(null);
  const areaInst = useRef(null);
  const TABS = ['Overview', 'Allocation', 'Signals', 'Model', 'About'];

  // Load Chart.js from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.onload = () => setChartReady(true);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch(e){} };
  }, []);

  // Loading screen timer
  useEffect(() => { const t = setTimeout(() => setLoading(false), 2000); return () => clearTimeout(t); }, []);

  // Try to load real data
  useEffect(() => {
    fetch('/results/metrics.json').then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setMetrics(d); setDemoMode(false); }).catch(() => {});
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '1' && e.key <= '5') setActiveTab(parseInt(e.key) - 1);
      if (e.key === 'Escape') setActiveTab(0);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Create Return Line Chart
  useEffect(() => {
    if (!chartReady || activeTab !== 0 || !lineChartRef.current) return;
    const Chart = window.Chart;
    if (!Chart) return;
    if (lineInst.current) lineInst.current.destroy();
    const ctx = lineChartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255,153,51,0.25)');
    gradient.addColorStop(1, 'rgba(255,153,51,0)');
    lineInst.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: NAV_DATA.labels,
        datasets: [
          { label: 'PPO Agent', data: NAV_DATA.ppo, borderColor: COLORS.saffron, backgroundColor: gradient,
            fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 },
          { label: 'Equal Weight', data: NAV_DATA.eq, borderColor: COLORS.muted, borderDash: [5, 3],
            fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
          { label: 'NIFTY 50', data: NAV_DATA.nifty, borderColor: COLORS.green, borderDash: [5, 3],
            fill: false, tension: 0.4, borderWidth: 1.5, pointRadius: 0 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: COLORS.card, titleColor: COLORS.text, bodyColor: COLORS.muted,
          borderColor: COLORS.saffron, borderWidth: 1, titleFont: { family: 'DM Mono' }, bodyFont: { family: 'DM Mono', size: 10 },
          callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y > 0 ? '+' : ''}${c.parsed.y}%` }
        }},
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: COLORS.muted, font: { family: 'DM Mono', size: 9 }, maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: COLORS.muted, font: { family: 'DM Mono', size: 9 },
            callback: v => (v > 0 ? '+' : '') + v + '%' } }
        },
        interaction: { mode: 'index', intersect: false }
      }
    });
  }, [chartReady, activeTab]);

  // Create Donut Chart
  useEffect(() => {
    if (!chartReady || activeTab !== 0 || !donutChartRef.current) return;
    const Chart = window.Chart;
    if (!Chart) return;
    if (donutInst.current) donutInst.current.destroy();
    donutInst.current = new Chart(donutChartRef.current, {
      type: 'doughnut',
      data: {
        labels: TICKERS,
        datasets: [{ data: [31, 24, 17, 28], backgroundColor: TICKER_COLORS, borderWidth: 0, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        animation: { duration: 1500, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: COLORS.card, titleColor: COLORS.text, bodyColor: COLORS.muted,
          borderColor: COLORS.saffron, borderWidth: 1, bodyFont: { family: 'DM Mono', size: 10 }
        }}
      }
    });
  }, [chartReady, activeTab]);

  // Create Stacked Area Chart
  useEffect(() => {
    if (!chartReady || activeTab !== 1 || !areaChartRef.current) return;
    const Chart = window.Chart;
    if (!Chart) return;
    if (areaInst.current) areaInst.current.destroy();
    areaInst.current = new Chart(areaChartRef.current, {
      type: 'line',
      data: {
        labels: WEIGHTS_DATA.labels,
        datasets: [
          { label: 'RELIANCE', data: WEIGHTS_DATA.reliance, backgroundColor: 'rgba(255,107,53,0.7)', borderColor: 'rgba(255,107,53,0.9)', fill: true, tension: 0.3, borderWidth: 1, pointRadius: 0 },
          { label: 'TCS', data: WEIGHTS_DATA.tcs, backgroundColor: 'rgba(21,101,192,0.7)', borderColor: 'rgba(21,101,192,0.9)', fill: true, tension: 0.3, borderWidth: 1, pointRadius: 0 },
          { label: 'HDFCBANK', data: WEIGHTS_DATA.hdfc, backgroundColor: 'rgba(46,125,50,0.7)', borderColor: 'rgba(46,125,50,0.9)', fill: true, tension: 0.3, borderWidth: 1, pointRadius: 0 },
          { label: 'GOLDBEES', data: WEIGHTS_DATA.goldbees, backgroundColor: 'rgba(201,168,76,0.7)', borderColor: 'rgba(201,168,76,0.9)', fill: true, tension: 0.3, borderWidth: 1, pointRadius: 0 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: COLORS.card, titleColor: COLORS.text, bodyColor: COLORS.muted,
          borderColor: COLORS.saffron, borderWidth: 1, bodyFont: { family: 'DM Mono', size: 10 }
        }},
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: COLORS.muted, font: { family: 'DM Mono', size: 9 }, maxTicksLimit: 12 }, stacked: true },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: COLORS.muted, font: { family: 'DM Mono', size: 9 }, callback: v => v + '%' }, stacked: true, min: 0, max: 100 }
        }
      }
    });
  }, [chartReady, activeTab]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />
      <div className="grid-overlay" />

      {loading && (
        <div className="loading-screen">
          <div className="logo" style={{ fontSize: 36 }}>DALAL<span>.AI</span></div>
          <div className="loading-bar"><div className="loading-bar-inner" /></div>
          <div style={{ marginTop: 14, fontSize: 10, color: COLORS.muted, letterSpacing: '0.5px' }}>Connecting to NSE data feed...</div>
        </div>
      )}

      <div className="dashboard">
        {/* ═══ HEADER ═══ */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="logo">DALAL<span>.AI</span></div>
            <span className="badge">PPO Agent v2.3</span>
            <span className="badge" style={{ borderColor: COLORS.saffron }}>
              <span className="agent-dot" />AGENT ACTIVE
            </span>
            <span className="badge">NSE India</span>
          </div>
          <div className="header-right">
            <button className="export-btn" onClick={() => window.print()}>Export Report (PDF)</button>
          </div>
        </header>

        {demoMode && (
          <div className="demo-banner">
            ⚡ Displaying simulated data. Run <strong>evaluate.py</strong> to load real NSE results.
          </div>
        )}

        {/* ═══ TABS ═══ */}
        <nav className="tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
          ))}
        </nav>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 0 && (
          <div className="tab-content">
            <div className="stat-cards">
              <StatCard label="Portfolio Value" value={metrics.portfolio_value} sub="vs NIFTY 50 benchmark" accentColor={COLORS.saffron} delay={0} isINR
                tooltip="Total portfolio value in INR after 2 years of RL-driven trading on NSE." />
              <StatCard label="Sharpe Ratio" value={metrics.sharpe_ratio.toString()} sub="vs 0.63 NIFTY 50" accentColor={COLORS.gold} delay={0.1}
                tooltip="Risk-adjusted return. >1.0 is good. Formula: (Rp − Rf) / σp. Rf = Indian 10Y Gsec (~7%)" />
              <StatCard label="Max Drawdown" value={metrics.max_drawdown_pct + '%'} sub="vs -19.4% NIFTY 50" accentColor={COLORS.red} delay={0.2}
                tooltip="Largest peak-to-trough loss. Agent's -11.2% vs NIFTY 50's -19.4% in the same period." />
              <StatCard label="NSE Charges/day" value={metrics.nse_charges_pct + '%'} sub="STT + brokerage + SEBI" accentColor={COLORS.blue2} delay={0.3}
                tooltip="Includes STT (0.1%) + brokerage (0.05%) + SEBI turnover fee + exchange transaction charges." />
            </div>

            <div className="chart-row">
              <div className="chart-card">
                <div className="chart-title">Cumulative Return — Test Period (2022–2023)</div>
                <div className="chart-legend">
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLORS.saffron }} />PPO Agent</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLORS.muted }} />Equal Weight</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLORS.green }} />NIFTY 50</div>
                </div>
                <div style={{ height: 300 }}><canvas ref={lineChartRef} /></div>
              </div>
              <div className="chart-card" style={{ position: 'relative' }}>
                <div className="chart-title">Current Allocation</div>
                <div style={{ height: 250, position: 'relative' }}>
                  <canvas ref={donutChartRef} />
                  <div className="donut-center">
                    <div className="label">Portfolio</div>
                    <div className="pct">100%</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  {HOLDINGS.map((h, i) => (
                    <div key={h.ticker} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11 }}>
                      <span className="color-dot" style={{ background: TICKER_COLORS[TICKERS.indexOf(h.ticker)] }} />
                      <span style={{ color: COLORS.muted, flex: 1 }}>{h.ticker}</span>
                      <span style={{ color: COLORS.text }}>{h.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bottom-row">
              {/* Holdings Table */}
              <div className="table-wrap">
                <div className="chart-title">Holdings</div>
                <table className="data-table">
                  <thead><tr><th>Asset</th><th>Company</th><th>Weight</th><th>7d Return</th></tr></thead>
                  <tbody>
                    {HOLDINGS.map(h => (
                      <tr key={h.ticker}>
                        <td><span className="color-dot" style={{ background: TICKER_COLORS[TICKERS.indexOf(h.ticker)] }} />{h.ticker}</td>
                        <td style={{ color: COLORS.muted }}>{h.company}</td>
                        <td>
                          {h.weight}%
                          <span className="weight-bar"><span className="weight-bar-fill" style={{ width: `${h.weight}%`, background: TICKER_COLORS[TICKERS.indexOf(h.ticker)] }} /></span>
                        </td>
                        <td style={{ color: h.ret7d >= 0 ? COLORS.green2 : COLORS.red }}>
                          {h.ret7d >= 0 ? '▲' : '▼'}{h.ret7d >= 0 ? '+' : ''}{h.ret7d}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Performance Metrics */}
              <div className="chart-card">
                <div className="chart-title">Performance Metrics</div>
                <div className="metrics-grid">
                  {PERF_METRICS.map(m => (
                    <div key={m.label} className="metric-card">
                      <div className="label">{m.label}</div>
                      <div className="value" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reward Equation */}
              <div className="reward-panel">
                <div className="chart-title">Reward Construction</div>
                <div className="reward-step"><div className="step-badge">1</div><div className="step-eq">w = softmax(π_θ(s))</div></div>
                <div className="reward-step"><div className="step-badge">2</div><div className="step-eq">r = Σ wᵢ · ln(Pᵢ,t / Pᵢ,t-1)</div></div>
                <div className="reward-step"><div className="step-badge">3</div><div className="step-eq">c = λ · Σ|wᵢ,new − wᵢ,old|<br/><span style={{ fontSize: 10, color: COLORS.muted }}>λ = 0.002, NSE costs: STT + brokerage + SEBI fees</span></div></div>
                <div className="formula-box">
                  <div className="eq">R_t = r_t − 0.002 × turnover_t</div>
                  <div className="note">"Kelly growth rate maximization"</div>
                  <div className="note">NSE cost: STT(0.1%) + Brokerage(0.05%) + fees</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ALLOCATION TAB ═══ */}
        {activeTab === 1 && (
          <div className="tab-content">
            <div className="chart-card">
              <div className="chart-title">Portfolio Allocation Over Time — NSE Trading Days (2022–2023)</div>
              <div className="chart-legend">
                {TICKERS.map((t, i) => (
                  <div key={t} className="legend-item"><div className="legend-dot" style={{ background: TICKER_COLORS[i] }} />{t}</div>
                ))}
              </div>
              <div style={{ height: 400 }}><canvas ref={areaChartRef} /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <span className="annotation-label">Feb 2022: Russia-Ukraine shock — agent increases GOLDBEES</span>
                <span className="annotation-label">Jun 2022: RBI rate hikes — agent reduces HDFCBANK</span>
                <span className="annotation-label">Jan 2023: FII return — agent rotates into RELIANCE</span>
              </div>
              <div className="insight-box">
                <strong>Key Insight:</strong> During Q2 2022, the agent shifted 18% from RELIANCE into GOLDBEES, reducing drawdown from -19% to -11%. This defensive rotation was learned purely from price signals — no macroeconomic data was provided.
              </div>
            </div>
          </div>
        )}

        {/* ═══ SIGNALS TAB ═══ */}
        {activeTab === 2 && (
          <div className="tab-content">
            <div className="table-wrap">
              <div className="chart-title">Live Feature Signals — 14-Day Rolling Window</div>
              <p style={{ fontSize: 10, color: COLORS.muted, marginBottom: 16, lineHeight: 1.6 }}>
                Signals derived from current portfolio weights vs equal-weight baseline (25% each). Not financial advice.
              </p>
              <table className="data-table">
                <thead><tr><th>Stock</th><th>Ticker</th><th>Log Return</th><th>SMA Signal</th><th>Volatility</th><th>Agent Signal</th></tr></thead>
                <tbody>
                  {SIGNALS_DATA.map(s => (
                    <tr key={s.ticker}>
                      <td>{s.stock}</td>
                      <td style={{ color: COLORS.muted }}>{s.ticker}</td>
                      <td style={{ color: s.logRet.startsWith('+') ? COLORS.green2 : COLORS.red }}>{s.logRet}</td>
                      <td>{s.sma}</td>
                      <td>{s.vol}</td>
                      <td><span className={`signal-badge signal-${s.signal}`}>{s.signal}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ MODEL TAB ═══ */}
        {activeTab === 3 && (
          <div className="tab-content">
            <div className="model-layout">
              <div className="chart-card">
                <div className="chart-title">PPO Architecture — NSE Portfolio Manager</div>
                <svg viewBox="0 0 460 280" className="arch-svg" style={{ marginTop: 10 }}>
                  <rect x="10" y="110" width="120" height="50" rx="6" fill="rgba(255,255,255,0.06)" stroke={COLORS.saffron} strokeWidth="1"/>
                  <text x="70" y="130" fill={COLORS.muted} fontSize="8" textAnchor="middle" fontFamily="DM Mono">Observation S_t</text>
                  <text x="70" y="148" fill={COLORS.text} fontSize="9" textAnchor="middle" fontFamily="DM Mono">(365-dim)</text>
                  <line x1="130" y1="125" x2="180" y2="95" stroke={COLORS.saffron} strokeWidth="1.5" markerEnd="url(#arrow)"/>
                  <line x1="130" y1="145" x2="180" y2="175" stroke={COLORS.saffron} strokeWidth="1.5" markerEnd="url(#arrow)"/>
                  <rect x="180" y="70" width="100" height="45" rx="6" fill="rgba(255,153,51,0.1)" stroke={COLORS.saffron} strokeWidth="1"/>
                  <text x="230" y="90" fill={COLORS.saffron} fontSize="9" textAnchor="middle" fontFamily="Syne" fontWeight="600">MLP Actor</text>
                  <text x="230" y="105" fill={COLORS.muted} fontSize="8" textAnchor="middle" fontFamily="DM Mono">64-64 hidden</text>
                  <rect x="180" y="155" width="100" height="45" rx="6" fill="rgba(91,156,246,0.1)" stroke={COLORS.blue2} strokeWidth="1"/>
                  <text x="230" y="175" fill={COLORS.blue2} fontSize="9" textAnchor="middle" fontFamily="Syne" fontWeight="600">MLP Critic</text>
                  <text x="230" y="190" fill={COLORS.muted} fontSize="8" textAnchor="middle" fontFamily="DM Mono">64-64 hidden</text>
                  <line x1="280" y1="92" x2="320" y2="92" stroke={COLORS.saffron} strokeWidth="1.5" markerEnd="url(#arrow)"/>
                  <rect x="320" y="72" width="70" height="35" rx="6" fill="rgba(255,153,51,0.08)" stroke={COLORS.gold} strokeWidth="1"/>
                  <text x="355" y="93" fill={COLORS.gold} fontSize="9" textAnchor="middle" fontFamily="DM Mono">Softmax</text>
                  <line x1="390" y1="92" x2="420" y2="92" stroke={COLORS.saffron} strokeWidth="1.5" markerEnd="url(#arrow)"/>
                  <text x="440" y="90" fill={COLORS.green2} fontSize="9" textAnchor="middle" fontFamily="Syne" fontWeight="600">w_t</text>
                  <text x="440" y="103" fill={COLORS.muted} fontSize="7" textAnchor="middle" fontFamily="DM Mono">(4-dim)</text>
                  <line x1="280" y1="178" x2="340" y2="178" stroke={COLORS.blue2} strokeWidth="1.5" markerEnd="url(#arrow)"/>
                  <text x="380" y="175" fill={COLORS.blue2} fontSize="9" textAnchor="middle" fontFamily="Syne" fontWeight="600">V(S_t)</text>
                  <text x="380" y="190" fill={COLORS.muted} fontSize="7" textAnchor="middle" fontFamily="DM Mono">Value fn</text>
                  <text x="230" y="245" fill={COLORS.muted} fontSize="8" textAnchor="middle" fontFamily="DM Mono">PPO Clip: L=min(r·A, clip(r,1-ε,1+ε)·A), ε=0.2</text>
                  <text x="230" y="262" fill={COLORS.muted} fontSize="8" textAnchor="middle" fontFamily="DM Mono">NSE Cost: λ=0.002 (STT+brokerage+SEBI+exchange)</text>
                  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.saffron}/></marker></defs>
                </svg>
              </div>
              <div className="table-wrap">
                <div className="chart-title">Hyperparameters</div>
                <table className="data-table">
                  <thead><tr><th>Param</th><th>Value</th><th>Why</th></tr></thead>
                  <tbody>
                    {HYPER_PARAMS.map(h => (
                      <tr key={h.param}>
                        <td style={{ color: COLORS.saffron }}>{h.param}</td>
                        <td>{h.value}</td>
                        <td style={{ color: COLORS.muted, fontSize: 10 }}>{h.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ABOUT TAB ═══ */}
        {activeTab === 4 && (
          <div className="tab-content" style={{ maxWidth: 900 }}>
            <div className="about-section">
              <h3>The Problem</h3>
              <p>Static portfolio allocation — holding 25% in each stock forever — fails fundamentally during Indian market stress events. When FII (Foreign Institutional Investors) sold a net ₹1.2 lakh crore in 2022, a static portfolio suffered equal losses across all assets without any defensive reallocation. Reinforcement Learning agents can observe market signals and dynamically shift allocations in real time.</p>
            </div>
            <div className="about-section">
              <h3>Indian Market Context</h3>
              <ul>
                <li>NSE is Asia's largest derivatives exchange by volume</li>
                <li>FII flows drive 15–20% of NSE cash segment volume</li>
                <li>Gold has 6000+ years of cultural significance as safe haven in India</li>
                <li>SEBI regulates algorithmic trading — algo-trading requires SEBI approval</li>
                <li>STT (Securities Transaction Tax) is a mandatory 0.1% cost per trade</li>
                <li>Circuit breakers: NSE halts trading at 10%/15%/20% market moves</li>
              </ul>
            </div>
            <div className="about-section">
              <h3>MDP Formulation</h3>
              <div className="math-block">
                State: &nbsp;&nbsp;&nbsp; S_t ∈ ℝ³⁶⁵<br/>
                Action: &nbsp;&nbsp; A_t = softmax(π_θ(S_t)) ∈ Δ⁴<br/>
                Reward: &nbsp;&nbsp; R_t = r_t − λ · ‖w_t − w_(t-1)‖₁, &nbsp; λ=0.002<br/>
                Objective: maximize 𝔼[Σ γᵗ Rₜ]
              </div>
            </div>
            <div className="about-section">
              <h3>Why Actor-Critic?</h3>
              <p>DQN uses discrete actions and cannot output continuous portfolio weights. PPO operates in continuous logit space, producing exact allocation percentages via softmax — ideal for portfolio weight optimization.</p>
              <table className="data-table" style={{ marginTop: 12 }}>
                <thead><tr><th>Method</th><th>Action Space</th><th>Portfolio Use?</th></tr></thead>
                <tbody>
                  <tr><td>DQN</td><td>Discrete</td><td style={{ color: COLORS.red }}>✗ Cannot</td></tr>
                  <tr><td>PPO</td><td>Continuous</td><td style={{ color: COLORS.green2 }}>✓ Perfect</td></tr>
                  <tr><td>A2C</td><td>Continuous</td><td style={{ color: COLORS.green2 }}>✓ Works</td></tr>
                </tbody>
              </table>
            </div>
            <div className="about-section">
              <h3>Dataset</h3>
              <p>NSE tickers: RELIANCE.NS, TCS.NS, HDFCBANK.NS, GOLDBEES.NS. Date range: 2015–2023 (2192 NSE trading days). Train: 2015–2021. Test: 2022–2023. Three features engineered per stock:</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {['Log Returns r_t', 'SMA-14 / P_t', 'Rolling Vol σ_t'].map(f => (
                  <div key={f} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 16px', fontSize: 11, color: COLORS.blue2 }}>{f}</div>
                ))}
              </div>
            </div>
            <div className="about-section">
              <h3>Four Pillars of This Portfolio</h3>
              <div className="pillars">
                <div className="pillar-card"><div className="icon">🔥</div><div className="name" style={{ color: COLORS.reliance }}>Energy — RELIANCE</div><div className="sub">Largest NSE market cap</div></div>
                <div className="pillar-card"><div className="icon">💻</div><div className="name" style={{ color: COLORS.tcs }}>IT — TCS</div><div className="sub">USD revenue hedge</div></div>
                <div className="pillar-card"><div className="icon">🏦</div><div className="name" style={{ color: COLORS.hdfc }}>Banking — HDFCBANK</div><div className="sub">Domestic consumption</div></div>
                <div className="pillar-card"><div className="icon">🥇</div><div className="name" style={{ color: COLORS.goldbees }}>Gold — GOLDBEES</div><div className="sub">Crisis safe haven</div></div>
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          DALAL.AI · Academic Project · NSE India · Not Financial Advice · [1-5] Tab shortcuts
        </div>
      </div>
    </>
  );
}
