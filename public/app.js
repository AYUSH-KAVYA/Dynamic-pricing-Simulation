/* ======================================================
   Dynamic Pricing Simulator — Frontend App
   Auto-trains parameters from Flipkart data on page load
   ====================================================== */

const API_BASE = '';

// --- Chart instances ---
let revenueChart = null;
let inventoryChart = null;
let priceChart = null;
let marketShareChart = null;

// --- Last simulation data (for CSV export) ---
let lastTimeSeries = null;

// --- Chart.js defaults ---
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.animation.duration = 800;
Chart.defaults.animation.easing = 'easeInOutQuart';

// ========================
// THEME
// ========================
function toggleTheme() {
    const html = document.documentElement;
    const next = (html.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
    updateChartColors();
}

(function restoreTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        document.getElementById('themeIcon').textContent = saved === 'dark' ? '🌙' : '☀️';
    }
})();

// ========================
// SIDEBAR
// ========================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('sidebarToggle');
    sidebar.classList.toggle('collapsed');
    btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
}

// ========================
// STATUS BAR
// ========================
function showStatus(message, type = 'loading') {
    const bar = document.getElementById('statusBar');
    const text = document.getElementById('statusText');
    bar.style.display = 'block';
    bar.className = `status-bar status-bar--${type}`;
    text.textContent = message;
}
function hideStatus() { document.getElementById('statusBar').style.display = 'none'; }

// ========================
// DATA BADGE
// ========================
function showDataBadge(text, loading = false) {
    const badge = document.getElementById('dataBadge');
    const badgeText = document.getElementById('dataBadgeText');
    badge.style.display = 'flex';
    badge.className = `data-badge${loading ? ' data-badge--loading' : ''}`;
    badgeText.textContent = text;
}

// ========================
// AUTO-TRAIN ON PAGE LOAD
// ========================
async function autoTrain() {
    showDataBadge('Training from Flipkart data...', true);

    try {
        const res = await fetch(`${API_BASE}/api/learn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),  // no filter = train from all data
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        const d = json.data;

        // Auto-fill form with learned parameters
        if (d.suggestedConfig) {
            const sc = d.suggestedConfig;
            document.getElementById('initialPrice').value = sc.initialPrice;
            document.getElementById('baseDemand').value = sc.baseDemand;
            document.getElementById('referencePrice').value = sc.referencePrice;
            document.getElementById('unitCost').value = sc.unitCost;
            document.getElementById('initialInventory').value = sc.initialInventory;
            document.getElementById('alpha').value = sc.alpha;
            document.getElementById('beta').value = sc.beta;
            document.getElementById('gamma').value = sc.gamma;
            document.getElementById('competitorPrice').value = sc.competitorPrice;
            document.getElementById('simulationDays').value = sc.simulationDays;
        }

        showDataBadge(`✅ Trained on ${d.quality.dataPoints.toLocaleString()} products`);
    } catch (err) {
        showDataBadge('⚠️ Using default params', false);
        console.warn('Auto-train failed:', err.message);
    }
}

// ========================
// FORM VALUES
// ========================
function getFormValues() {
    return {
        initialPrice: Number(document.getElementById('initialPrice').value),
        unitCost: Number(document.getElementById('unitCost').value),
        initialInventory: Number(document.getElementById('initialInventory').value),
        baseDemand: Number(document.getElementById('baseDemand').value),
        alpha: Number(document.getElementById('alpha').value),
        referencePrice: Number(document.getElementById('referencePrice').value),
        competitorPrice: Number(document.getElementById('competitorPrice').value),
        gamma: Number(document.getElementById('gamma').value),
        beta: Number(document.getElementById('beta').value),
        simulationDays: Number(document.getElementById('simulationDays').value),
        strategy: document.getElementById('strategy').value,
        competitorModel: document.getElementById('competitorModel').value,
        adjustmentRate: Number(document.getElementById('adjustmentRate').value) / 100,
    };
}

function resetForm() {
    document.getElementById('initialPrice').value = 999;
    document.getElementById('unitCost').value = 400;
    document.getElementById('initialInventory').value = 500;
    document.getElementById('baseDemand').value = 200;
    document.getElementById('alpha').value = 2.0;
    document.getElementById('referencePrice').value = 999;
    document.getElementById('competitorPrice').value = 950;
    document.getElementById('gamma').value = 0.3;
    document.getElementById('beta').value = 0.5;
    document.getElementById('simulationDays').value = 30;
    document.getElementById('strategy').value = 'dynamic';
    document.getElementById('competitorModel').value = 'reactive';
    document.getElementById('adjustmentRate').value = 5;
    ['kpiRevenueValue', 'kpiProfitValue', 'kpiUnitsValue', 'kpiInventoryValue', 'kpiMarketShareValue']
        .forEach(id => document.getElementById(id).textContent = '—');
    document.getElementById('analysisSection').style.display = 'none';
    lastTimeSeries = null;
    hideStatus();
}

// ========================
// RUN SIMULATION
// ========================
async function runSimulation() {
    const btn = document.getElementById('runBtn');
    btn.classList.add('loading');
    btn.querySelector('.btn__icon').textContent = '⏳';
    showStatus('Running simulation...', 'loading');

    try {
        const params = getFormValues();
        const res = await fetch(`${API_BASE}/api/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Simulation failed');

        const { timeSeries, kpis } = json.data;
        lastTimeSeries = timeSeries;

        // Animate KPIs
        animateValue('kpiRevenueValue', kpis.totalRevenue, '₹');
        animateValue('kpiProfitValue', kpis.totalProfit, '₹');
        animateValue('kpiUnitsValue', kpis.totalUnitsSold);
        animateValue('kpiInventoryValue', kpis.finalInventory);
        animateValue('kpiMarketShareValue', kpis.avgMarketShare * 100, '', '%');

        // Update charts
        updateCharts(timeSeries);

        // Update analysis table
        updateAnalysisTable(timeSeries);

        // Refresh history
        loadHistory();

        showStatus(`✅ Simulation complete — ${timeSeries.length} days simulated`, 'success');
    } catch (err) {
        showStatus(`❌ ${err.message}`, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.querySelector('.btn__icon').textContent = '▶';
    }
}

// ========================
// ANIMATED KPI COUNTER
// ========================
function animateValue(elementId, endValue, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    const isDecimal = suffix === '%';
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = endValue * eased;

        if (isDecimal) {
            el.textContent = `${prefix}${current.toFixed(1)}${suffix}`;
        } else {
            el.textContent = `${prefix}${formatNumber(Math.round(current))}`;
        }
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function formatNumber(n) {
    if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
}

// ========================
// ANALYSIS TABLE
// ========================
function updateAnalysisTable(timeSeries) {
    const section = document.getElementById('analysisSection');
    const tbody = document.getElementById('analysisBody');
    section.style.display = 'block';

    tbody.innerHTML = timeSeries.map(d => {
        const profitClass = d.profit > 0 ? 'positive' : (d.profit < 0 ? 'negative' : 'zero');
        const invClass = d.inventory === 0 ? 'negative' : '';
        return `<tr>
      <td>${d.day}</td>
      <td>₹${d.price.toLocaleString()}</td>
      <td>₹${d.competitorPrice.toLocaleString()}</td>
      <td>${d.demand.toLocaleString()}</td>
      <td>${d.sales.toLocaleString()}</td>
      <td>₹${d.revenue.toLocaleString()}</td>
      <td class="${profitClass}">₹${d.profit.toLocaleString()}</td>
      <td class="${invClass}">${d.inventory.toLocaleString()}</td>
      <td>${(d.marketShare * 100).toFixed(1)}%</td>
      <td>${d.elasticity?.toFixed(2) || '—'}</td>
    </tr>`;
    }).join('');
}

function exportCSV() {
    if (!lastTimeSeries) return;

    const headers = ['Day', 'Price', 'Competitor Price', 'Demand', 'Sales', 'Revenue', 'Profit', 'Inventory', 'Market Share', 'Elasticity'];
    const rows = lastTimeSeries.map(d =>
        [d.day, d.price, d.competitorPrice, d.demand, d.sales, d.revenue, d.profit, d.inventory, (d.marketShare * 100).toFixed(1), d.elasticity?.toFixed(2) || '']
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================
// CHARTS
// ========================
function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        text: isDark ? '#94a3b8' : '#64748b',
        revenue: { line: '#6366f1', fill: 'rgba(99, 102, 241, 0.15)' },
        inventory: { line: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)' },
        ourPrice: { line: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)' },
        compPrice: { line: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' },
        marketShare: { line: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)' },
    };
}

function createChart(canvasId, label, color, yPrefix = '') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const colors = getChartColors();
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label, data: [], borderColor: color.line, backgroundColor: color.fill, borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: color.line }] },
        options: {
            responsive: true, maintainAspectRatio: true,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,17,23,0.9)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => ` ${label}: ${yPrefix}${ctx.parsed.y.toLocaleString()}` } } },
            scales: { x: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, maxTicksLimit: 10 } }, y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, callback: (v) => yPrefix + v.toLocaleString() } } },
        },
    });
}

function createPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const colors = getChartColors();
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], datasets: [
                { label: 'Our Price', data: [], borderColor: colors.ourPrice.line, backgroundColor: colors.ourPrice.fill, borderWidth: 2.5, fill: false, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
                { label: 'Competitor Price', data: [], borderColor: colors.compPrice.line, backgroundColor: colors.compPrice.fill, borderWidth: 2.5, borderDash: [6, 4], fill: false, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: true, labels: { color: colors.text, usePointStyle: true, padding: 16 } }, tooltip: { backgroundColor: 'rgba(15,17,23,0.9)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
            scales: { x: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, maxTicksLimit: 10 } }, y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, callback: (v) => '₹' + v.toLocaleString() } } },
        },
    });
}

function initCharts() {
    const c = getChartColors();
    revenueChart = createChart('revenueChart', 'Revenue', c.revenue, '₹');
    inventoryChart = createChart('inventoryChart', 'Inventory', c.inventory);
    priceChart = createPriceChart();
    marketShareChart = createChart('marketShareChart', 'Market Share', c.marketShare);
}

function updateCharts(timeSeries) {
    const days = timeSeries.map(d => `Day ${d.day}`);
    revenueChart.data.labels = days;
    revenueChart.data.datasets[0].data = timeSeries.map(d => d.revenue);
    revenueChart.update();
    inventoryChart.data.labels = days;
    inventoryChart.data.datasets[0].data = timeSeries.map(d => d.inventory);
    inventoryChart.update();
    priceChart.data.labels = days;
    priceChart.data.datasets[0].data = timeSeries.map(d => d.price);
    priceChart.data.datasets[1].data = timeSeries.map(d => d.competitorPrice);
    priceChart.update();
    marketShareChart.data.labels = days;
    marketShareChart.data.datasets[0].data = timeSeries.map(d => Math.round(d.marketShare * 100));
    marketShareChart.update();
}

function updateChartColors() {
    if (revenueChart) revenueChart.destroy();
    if (inventoryChart) inventoryChart.destroy();
    if (priceChart) priceChart.destroy();
    if (marketShareChart) marketShareChart.destroy();
    initCharts();
    // Re-render last data if available
    if (lastTimeSeries) updateCharts(lastTimeSeries);
}

// ========================
// HISTORY
// ========================
async function loadHistory() {
    try {
        const res = await fetch(`${API_BASE}/api/simulate?limit=10`);
        const json = await res.json();
        if (!json.success) return;

        const tbody = document.getElementById('historyBody');
        if (!json.data || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No simulations yet. Run your first one! 🚀</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(sim => {
            const date = new Date(sim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            const strategy = sim.strategy === 'dynamic' ? '📊 Dynamic' : '📌 Static';
            return `<tr>
        <td>${date}</td>
        <td>${strategy}</td>
        <td>${sim.simulationDays} days</td>
        <td>₹${formatNumber(sim.totalRevenue || 0)}</td>
        <td>₹${formatNumber(sim.totalProfit || 0)}</td>
        <td class="actions-cell">
          <button class="btn btn--small btn--view" onclick="viewSimulation('${sim._id}')">View</button>
          <button class="btn btn--small btn--danger" onclick="deleteSimulation('${sim._id}')">✕</button>
        </td>
      </tr>`;
        }).join('');
    } catch (err) {
        console.error('Failed to load history:', err);
    }
}

async function viewSimulation(id) {
    showStatus('Loading simulation...', 'loading');
    try {
        const res = await fetch(`${API_BASE}/api/simulate/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        const sim = json.data;
        lastTimeSeries = sim.timeSeries;

        animateValue('kpiRevenueValue', sim.totalRevenue, '₹');
        animateValue('kpiProfitValue', sim.totalProfit, '₹');
        animateValue('kpiUnitsValue', sim.totalUnitsSold);
        animateValue('kpiInventoryValue', sim.finalInventory);
        animateValue('kpiMarketShareValue', sim.avgMarketShare * 100, '', '%');

        updateCharts(sim.timeSeries);
        updateAnalysisTable(sim.timeSeries);

        showStatus(`✅ Viewing simulation from ${new Date(sim.createdAt).toLocaleString()}`, 'success');
        document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        showStatus(`❌ ${err.message}`, 'error');
    }
}

async function deleteSimulation(id) {
    try { await fetch(`${API_BASE}/api/simulate/${id}`, { method: 'DELETE' }); loadHistory(); } catch (err) { console.error('Delete failed:', err); }
}

// ========================
// INIT — Auto-train + load history
// ========================
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    autoTrain();   // Learn from Flipkart data and auto-fill the form
    loadHistory();
});
