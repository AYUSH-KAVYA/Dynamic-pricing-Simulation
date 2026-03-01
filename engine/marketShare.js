/**
 * Market Share & Lost Demand Module
 * Implements:
 *   §6:  Market Share Estimation
 *   §14: Lost Sales & Lost Revenue Tracking
 *
 * Market share:
 *   MS_t = S_t / (S_t + Qc_t)
 *
 * Lost Sales:
 *   LostSales_t   = max(0, D_t - S_t)
 *
 * Lost Revenue:
 *   LostRevenue_t = LostSales_t × P_t
 */

/**
 * Market share assuming two-player market
 * MS = S / (S + Qc)
 *
 * @param {number} ourSales          - Our actual sales (S)
 * @param {number} competitorDemand  - Competitor's estimated demand (Qc)
 * @returns {number} Market share (0 to 1)
 */
function computeMarketShare(ourSales, competitorDemand) {
    const totalMarket = ourSales + competitorDemand;
    if (totalMarket <= 0) return 0;
    return ourSales / totalMarket;
}

/**
 * Estimate competitor demand using the same linear model
 * (mirror of our demand model from the competitor's perspective)
 *
 * @param {number} baseDemand      - Base market demand (D0)
 * @param {number} alpha           - Price elasticity coefficient
 * @param {number} competitorPrice - Competitor's price
 * @param {number} refPrice        - Reference price (Pref)
 * @returns {number} Estimated competitor demand (floored at 0)
 */
function estimateCompetitorDemand(baseDemand, alpha, competitorPrice, refPrice) {
    const Q = baseDemand - alpha * (competitorPrice - refPrice);
    return Math.max(0, Q);
}

/**
 * Compute lost sales — unmet demand due to inventory shortage
 * LostSales_t = max(0, D_t - S_t)
 *
 * @param {number} demand - Total demand computed for this day
 * @param {number} sales  - Actual units sold (constrained by inventory)
 * @returns {number} Lost sales quantity
 */
function computeLostSales(demand, sales) {
    return Math.max(0, demand - sales);
}

/**
 * Compute revenue lost due to unmet demand
 * LostRevenue_t = LostSales_t × P_t
 *
 * @param {number} lostSales - Units of unmet demand
 * @param {number} price     - Current price
 * @returns {number} Lost revenue value
 */
function computeLostRevenue(lostSales, price) {
    return lostSales * price;
}

module.exports = {
    computeMarketShare,
    estimateCompetitorDemand,
    computeLostSales,
    computeLostRevenue,
};
