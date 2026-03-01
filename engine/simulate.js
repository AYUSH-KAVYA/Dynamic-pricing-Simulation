/**
 * Simulation Engine — Main Time-Step Loop
 * Implements §8: Full simulation orchestration
 *
 * Upgraded to Cyclical Inventory + Profit-Constrained Economic Engine:
 *
 * For each day t = 1..T:
 *   1. Compute demand           Qt = max(0, D0 - α*(Pt - Pref))
 *   2. Apply competitor effect  Qt_adj = Qt * (1 + β*(Pc - P)/Pc)
 *   3. Inventory constraint     St = min(Qt_adj, It)
 *   4. Lost Sales & Revenue     LS = Dt - St,  LR = LS * Pt
 *   5. Revenue & Profit         R = P*S,  Π = (P - C)*S
 *   6. Market share             MS = S / (S + Qc)
 *   7. Update inventory         I_{t+1} = max(0, It - St + Rt)
 *   8. Trigger restock (ROP)    If It+1 < ROP → schedule arrival on t+L
 *   9. Price floor              Pmin = C*(1+m),  Pt = max(Pt, Pmin)
 *  10. Apply strategy           StableProfit / dynamic / fixed
 *  11. Update competitor price  Pc_next = Pc + γ*(P - Pc), clamped ±20%
 */

const { computeDemand, computeLogDemand, computeElasticity } = require('./demand');
const { applyCompetitorEffect, updateCompetitorPrice, aggressiveCompetitorPrice } = require('./competitor');
const { computeSales, updateInventory, triggerReorderIfNeeded, getArrivingRestock } = require('./inventory');
const { computeRevenue, computeProfit } = require('./revenue');
const { computeMarketShare, estimateCompetitorDemand, computeLostSales, computeLostRevenue } = require('./marketShare');
const { adjustPrice, computePriceFloor, applyPriceFloor, stableProfitPrice } = require('./pricing');

/**
 * Run a full simulation
 *
 * @param {object} config - Simulation configuration
 * @returns {object} { timeSeries, kpis }
 */
function runSimulation(config) {
    const {
        initialPrice,
        competitorPrice: initCompPrice,
        baseDemand: D0,
        referencePrice: Pref,
        unitCost: C,
        initialInventory,
        simulationDays: T,

        alpha,
        beta,
        gamma,

        strategy = 'fixed',
        adjustmentRate: k = 0.05,
        inventoryThreshold = 20,
        demandThreshold = 10,

        // Legacy restock (kept for backward compat)
        restockEnabled = false,
        restockAmount = 0,
        restockInterval = 7,

        // ── NEW: Cyclical Inventory Policy ──
        reorderPoint = 0,       // ROP  — trigger threshold
        restockQuantity = 0,    // Q_order — units to restock per order
        leadTime = 3,           // L — days until restock arrives

        // ── NEW: Cost-Plus Pricing Floor ──
        targetMargin = 0.20,    // m — default 20%

        competitorModel = 'reactive',
        competitorDelta = 5,

        demandModel = 'linear',
        logDemandA = 10000,
        logDemandE = 1.5,
    } = config;

    let price = initialPrice;
    let compPrice = initCompPrice;
    let inventory = initialInventory;

    // Pre-compute price floor (constant across simulation)
    const priceFloor = computePriceFloor(C, targetMargin);

    // Enforce floor on initial price immediately
    price = applyPriceFloor(price, priceFloor, strategy);

    // Pending restock queue: { day → quantity }
    const restockQueue = {};
    let openOrderPending = false; // prevent multiple simultaneous orders

    const timeSeries = [];

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalUnitsSold = 0;
    let totalLostSales = 0;
    let totalLostRevenue = 0;
    let peakDemand = -1;
    let peakDemandDay = 1;
    let peakRevenue = -1;
    let peakRevenueDay = 1;

    for (let t = 1; t <= T; t++) {
        // ── 1. Compute raw demand ──────────────────────────────────────
        let demand;
        if (demandModel === 'log') {
            demand = computeLogDemand(logDemandA, logDemandE, price);
        } else {
            demand = computeDemand(D0, alpha, price, Pref);
        }

        // ── 2. Apply competitor influence ─────────────────────────────
        demand = applyCompetitorEffect(demand, beta, compPrice, price);
        demand = Math.round(demand);

        // ── 3. Inventory constraint → actual sales ────────────────────
        const sales = computeSales(demand, inventory);

        // ── 4. Lost Sales & Lost Revenue ──────────────────────────────
        const lostSales = computeLostSales(demand, sales);
        const lostRevenue = computeLostRevenue(lostSales, price);

        // ── 5. Revenue & Profit ───────────────────────────────────────
        const revenue = computeRevenue(price, sales);
        const profit = computeProfit(price, C, sales);

        // ── 6. Market share ───────────────────────────────────────────
        const compDemand = estimateCompetitorDemand(D0, alpha, compPrice, Pref);
        const marketShare = computeMarketShare(sales, compDemand);

        // Elasticity
        const elasticity = computeElasticity(alpha, price, demand || 1);

        // Track peaks
        if (demand > peakDemand) { peakDemand = demand; peakDemandDay = t; }
        if (revenue > peakRevenue) { peakRevenue = revenue; peakRevenueDay = t; }

        // ── Record day ────────────────────────────────────────────────
        timeSeries.push({
            day: t,
            price: Math.round(price * 100) / 100,
            competitorPrice: Math.round(compPrice * 100) / 100,
            demand,
            sales,
            lostSales,
            lostRevenue: Math.round(lostRevenue * 100) / 100,
            revenue: Math.round(revenue * 100) / 100,
            profit: Math.round(profit * 100) / 100,
            inventory,
            marketShare: Math.round(marketShare * 10000) / 10000,
            elasticity: Math.round(elasticity * 1000) / 1000,
        });

        // Accumulate totals
        totalRevenue += revenue;
        totalProfit += profit;
        totalUnitsSold += sales;
        totalLostSales += lostSales;
        totalLostRevenue += lostRevenue;

        // ── 7. Update inventory (consume sales + arriving restock) ────
        const arrivingRestock = getArrivingRestock(restockQueue, t);
        if (arrivingRestock > 0) {
            openOrderPending = false; // order fulfilled
        }
        inventory = updateInventory(inventory, sales, arrivingRestock);

        // Legacy interval-based restock (backward compat)
        if (restockEnabled && reorderPoint === 0 && t % restockInterval === 0) {
            inventory = updateInventory(inventory, 0, restockAmount);
        }

        // ── 8. Trigger new reorder if below ROP ───────────────────────
        if (reorderPoint > 0 && restockQuantity > 0) {
            const ordered = triggerReorderIfNeeded(
                restockQueue, t, openOrderPending,
                inventory, reorderPoint, restockQuantity, leadTime
            );
            if (ordered) openOrderPending = true;
        }

        // ── 9 & 10. Price adjustment for next period ──────────────────
        if (strategy === 'StableProfit') {
            price = stableProfitPrice(price, inventory, initialInventory, demand, demandThreshold, k);
            price = applyPriceFloor(price, priceFloor, strategy);
        } else if (strategy === 'dynamic') {
            price = adjustPrice(price, inventory, demand, {
                inventoryLow: inventoryThreshold,
                demandLow: demandThreshold,
            }, k);
            price = applyPriceFloor(price, priceFloor, strategy);
        }
        // 'fixed' / 'penetration' → price unchanged (floor skipped for penetration)

        // ── 11. Update competitor price ───────────────────────────────
        if (competitorModel === 'aggressive') {
            compPrice = aggressiveCompetitorPrice(price, competitorDelta);
        } else if (competitorModel === 'reactive') {
            compPrice = updateCompetitorPrice(compPrice, gamma, price);
        }
        // 'static' → compPrice unchanged
    }

    const kpis = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalUnitsSold,
        totalLostSales,
        totalLostRevenue: Math.round(totalLostRevenue * 100) / 100,
        finalInventory: inventory,
        avgMarketShare:
            Math.round(
                (timeSeries.reduce((sum, d) => sum + d.marketShare, 0) / T) * 10000
            ) / 10000,
        peakDemandDay,
        peakRevenueDay,
        priceFloor: Math.round(priceFloor * 100) / 100,
    };

    return { timeSeries, kpis };
}

module.exports = { runSimulation };
