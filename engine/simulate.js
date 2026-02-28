/**
 * Simulation Engine — Main Time-Step Loop
 * Implements §8: Full simulation orchestration
 *
 * For each day t = 1..T:
 *   1. Compute demand (linear or log)
 *   2. Apply competitor effect
 *   3. Apply inventory constraint → actual sales
 *   4. Calculate revenue & profit
 *   5. Compute market share
 *   6. Update inventory (+ optional restocking)
 *   7. Apply dynamic pricing strategy (if enabled)
 *   8. Update competitor price
 */

const { computeDemand, computeLogDemand, computeElasticity } = require('./demand');
const { applyCompetitorEffect, updateCompetitorPrice, aggressiveCompetitorPrice } = require('./competitor');
const { computeSales, updateInventory } = require('./inventory');
const { computeRevenue, computeProfit } = require('./revenue');
const { computeMarketShare, estimateCompetitorDemand } = require('./marketShare');
const { adjustPrice } = require('./pricing');

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

        restockEnabled = false,
        restockAmount = 0,
        restockInterval = 7,

        competitorModel = 'reactive',
        competitorDelta = 5,

        demandModel = 'linear',
        logDemandA = 10000,
        logDemandE = 1.5,
    } = config;

    let price = initialPrice;
    let compPrice = initCompPrice;
    let inventory = initialInventory;

    const timeSeries = [];

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalUnitsSold = 0;
    let peakDemand = -1;
    let peakDemandDay = 1;
    let peakRevenue = -1;
    let peakRevenueDay = 1;

    for (let t = 1; t <= T; t++) {
        // 1. Compute raw demand
        let demand;
        if (demandModel === 'log') {
            demand = computeLogDemand(logDemandA, logDemandE, price);
        } else {
            demand = computeDemand(D0, alpha, price, Pref);
        }

        // 2. Apply competitor influence
        demand = applyCompetitorEffect(demand, beta, compPrice, price);

        // Round demand to integer
        demand = Math.round(demand);

        // 3. Inventory constraint → actual sales
        const sales = computeSales(demand, inventory);

        // 4. Revenue & profit
        const revenue = computeRevenue(price, sales);
        const profit = computeProfit(price, C, sales);

        // 5. Market share
        const compDemand = estimateCompetitorDemand(D0, alpha, compPrice, Pref);
        const marketShare = computeMarketShare(sales, compDemand);

        // Elasticity
        const elasticity = computeElasticity(alpha, price, demand || 1);

        // Track peaks
        if (demand > peakDemand) {
            peakDemand = demand;
            peakDemandDay = t;
        }
        if (revenue > peakRevenue) {
            peakRevenue = revenue;
            peakRevenueDay = t;
        }

        // Record day data
        timeSeries.push({
            day: t,
            price: Math.round(price * 100) / 100,
            competitorPrice: Math.round(compPrice * 100) / 100,
            demand,
            sales,
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

        // 6. Update inventory
        let restock = 0;
        if (restockEnabled && t % restockInterval === 0) {
            restock = restockAmount;
        }
        inventory = updateInventory(inventory, sales, restock);

        // 7. Dynamic pricing (for next period)
        if (strategy === 'dynamic') {
            price = adjustPrice(price, inventory, demand, {
                inventoryLow: inventoryThreshold,
                demandLow: demandThreshold,
            }, k);
        }

        // 8. Update competitor price
        if (competitorModel === 'aggressive') {
            compPrice = aggressiveCompetitorPrice(price, competitorDelta);
        } else if (competitorModel === 'reactive') {
            compPrice = updateCompetitorPrice(compPrice, gamma, price);
        }
        // 'static' → compPrice stays unchanged
    }

    const kpis = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalUnitsSold,
        finalInventory: inventory,
        avgMarketShare:
            Math.round(
                (timeSeries.reduce((sum, d) => sum + d.marketShare, 0) / T) * 10000
            ) / 10000,
        peakDemandDay,
        peakRevenueDay,
    };

    return { timeSeries, kpis };
}

module.exports = { runSimulation };
