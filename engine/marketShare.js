/**
 * Market Share Module
 * Implements §6: Market Share Estimation
 */

/**
 * Market share assuming two competitors
 * MS = S / (S + Qc)
 *
 * @param {number} ourSales - Our actual sales
 * @param {number} competitorDemand - Competitor's estimated demand
 * @returns {number} Market share (0 to 1)
 */
function computeMarketShare(ourSales, competitorDemand) {
    const totalMarket = ourSales + competitorDemand;
    if (totalMarket <= 0) return 0;
    return ourSales / totalMarket;
}

/**
 * Estimate competitor demand using the same linear model
 * (mirror of our demand model but from competitor's perspective)
 *
 * @param {number} baseDemand - Base market demand
 * @param {number} alpha - Price elasticity coefficient
 * @param {number} competitorPrice - Competitor's price
 * @param {number} refPrice - Reference price
 * @returns {number} Estimated competitor demand
 */
function estimateCompetitorDemand(baseDemand, alpha, competitorPrice, refPrice) {
    const Q = baseDemand - alpha * (competitorPrice - refPrice);
    return Math.max(0, Q);
}

module.exports = { computeMarketShare, estimateCompetitorDemand };
