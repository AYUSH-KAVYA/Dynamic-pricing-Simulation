/**
 * Competitor Influence Module
 * Implements §2: Competitor Influence & §7: Competitor Reaction
 */

/**
 * Apply competitor relative-price effect on demand
 * Q_adj = Q * (1 + β * (Pc - P) / Pc)
 *
 * If competitor cheaper → demand decreases
 * If competitor expensive → demand increases
 *
 * @param {number} quantity - Raw demand
 * @param {number} beta - Competitive sensitivity factor
 * @param {number} competitorPrice - Competitor's price
 * @param {number} ourPrice - Our price
 * @returns {number} Adjusted demand (floored at 0)
 */
function applyCompetitorEffect(quantity, beta, competitorPrice, ourPrice) {
    if (competitorPrice <= 0) return quantity;
    const factor = 1 + beta * ((competitorPrice - ourPrice) / competitorPrice);
    return Math.max(0, quantity * factor);
}

/**
 * Simple reactive competitor model
 * Pc_next = Pc + γ * (P - Pc)
 *
 * @param {number} compPrice - Current competitor price
 * @param {number} gamma - Reaction rate (0 to 1)
 * @param {number} ourPrice - Our current price
 * @returns {number} Updated competitor price
 */
function updateCompetitorPrice(compPrice, gamma, ourPrice) {
    return compPrice + gamma * (ourPrice - compPrice);
}

/**
 * Aggressive competitor model
 * Pc_next = P - δ  (undercut by δ)
 *
 * @param {number} ourPrice - Our current price
 * @param {number} delta - Undercut amount
 * @returns {number} Updated competitor price
 */
function aggressiveCompetitorPrice(ourPrice, delta) {
    return Math.max(0, ourPrice - delta);
}

module.exports = {
    applyCompetitorEffect,
    updateCompetitorPrice,
    aggressiveCompetitorPrice,
};
