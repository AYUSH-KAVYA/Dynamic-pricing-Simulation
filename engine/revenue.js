/**
 * Revenue & Profit Module
 * Implements §4: Revenue and §5: Profit
 */

/**
 * Revenue = Price × Sales
 * R = P * S
 *
 * @param {number} price - Selling price
 * @param {number} sales - Units sold
 * @returns {number} Revenue
 */
function computeRevenue(price, sales) {
    return price * sales;
}

/**
 * Profit = (Price - Cost) × Sales
 * Π = (P - C) * S
 *
 * @param {number} price - Selling price
 * @param {number} cost - Unit cost
 * @param {number} sales - Units sold
 * @returns {number} Profit
 */
function computeProfit(price, cost, sales) {
    return (price - cost) * sales;
}

module.exports = { computeRevenue, computeProfit };
