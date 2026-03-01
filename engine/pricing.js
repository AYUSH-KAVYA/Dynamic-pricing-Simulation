/**
 * Dynamic Pricing Strategy Module
 * Implements:
 *   §9:  Rule-Based Price Adjustment
 *   §10: Cost-Plus Pricing Floor  →  Pmin = C × (1 + m)
 *   §11: StableProfit Strategy
 */

/**
 * Compute the Cost-Plus Pricing Floor
 * Pmin = C × (1 + targetMargin)
 *
 * @param {number} unitCost      - Unit cost (C)
 * @param {number} targetMargin  - Desired margin, e.g. 0.20 for 20%
 * @returns {number} Minimum acceptable price
 */
function computePriceFloor(unitCost, targetMargin = 0.20) {
    return unitCost * (1 + targetMargin);
}

/**
 * Enforce price floor unless strategy is 'penetration'
 * Pt = max(Pt, Pmin)   [skipped for market penetration]
 *
 * @param {number} price        - Candidate price
 * @param {number} priceFloor   - Minimum price from computePriceFloor
 * @param {string} strategy     - Active strategy name
 * @returns {number} Guardrailed price
 */
function applyPriceFloor(price, priceFloor, strategy = '') {
    if (strategy === 'penetration') return price;
    return Math.max(price, priceFloor);
}

/**
 * StableProfit pricing rule
 *
 * If inventory healthy (>= 20% of initial)  → keep price
 * If inventory low   (<  20% of initial)     → raise by k  (scarcity premium)
 * If demand weak     (<= demandLow)          → lower by k  (stimulate demand)
 *
 * Floor is always applied afterwards via applyPriceFloor()
 *
 * @param {number} price           - Current price
 * @param {number} inventory       - Current inventory
 * @param {number} initialInventory - Starting inventory (for % check)
 * @param {number} demand          - Current demand
 * @param {number} demandLow       - Threshold below which demand is "weak"
 * @param {number} k               - Price adjustment rate (e.g. 0.03)
 * @returns {number} Adjusted price (before floor is applied)
 */
function stableProfitPrice(price, inventory, initialInventory, demand, demandLow, k) {
    const inventoryHealthThreshold = 0.20 * initialInventory;

    if (inventory < inventoryHealthThreshold) {
        // Scarcity — raise price
        return price * (1 + k);
    }

    if (demand <= demandLow) {
        // Weak demand — lower price to attract buyers
        return price * (1 - k);
    }

    // Inventory healthy + demand normal → hold price
    return price;
}

/**
 * Legacy rule-based price adjustment (kept for 'dynamic' strategy compatibility)
 *
 * If inventory low  → raise price:  P_next = P * (1 + k)
 * If demand low     → lower price:  P_next = P * (1 - k)
 * Otherwise         → keep price
 *
 * @param {number} price       - Current price
 * @param {number} inventory   - Current inventory
 * @param {number} demand      - Current demand
 * @param {object} thresholds  - { inventoryLow, demandLow }
 * @param {number} k           - Adjustment rate
 * @returns {number} Adjusted price
 */
function adjustPrice(price, inventory, demand, thresholds, k) {
    const { inventoryLow = 20, demandLow = 10 } = thresholds || {};

    if (inventory <= inventoryLow) {
        return price * (1 + k);
    }

    if (demand <= demandLow) {
        return price * (1 - k);
    }

    return price;
}

module.exports = {
    computePriceFloor,
    applyPriceFloor,
    stableProfitPrice,
    adjustPrice,
};
