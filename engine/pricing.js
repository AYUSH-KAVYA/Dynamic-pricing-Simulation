/**
 * Dynamic Pricing Strategy Module
 * Implements §9: Rule-Based Price Adjustment
 */

/**
 * Adjust price based on inventory and demand levels
 *
 * If inventory low  → raise price:  P_next = P * (1 + k)
 * If demand low     → lower price:  P_next = P * (1 - k)
 * Otherwise         → keep price
 *
 * @param {number} price - Current price
 * @param {number} inventory - Current inventory
 * @param {number} demand - Current demand
 * @param {object} thresholds - { inventoryLow, demandLow }
 * @param {number} k - Adjustment rate
 * @returns {number} Adjusted price
 */
function adjustPrice(price, inventory, demand, thresholds, k) {
    const { inventoryLow = 20, demandLow = 10 } = thresholds || {};

    if (inventory <= inventoryLow) {
        // Scarcity → raise price
        return price * (1 + k);
    }

    if (demand <= demandLow) {
        // Low demand → lower price to attract buyers
        return price * (1 - k);
    }

    return price;
}

module.exports = { adjustPrice };
