/**
 * Competitor Influence Module
 * Implements:
 *   §2:  Competitor Influence on demand
 *   §7:  Competitor Reaction model
 *   §13: Competitor Alignment — clamp Pc within ±20% of our price
 *
 * Alignment constraint:
 *   Pc ∈ [0.8 × P, 1.2 × P]
 *
 * Reactive model:
 *   Pc_{t+1} = Pc_t + γ × (P_t − Pc_t)   →  then clamped
 */

/**
 * Apply competitor relative-price effect on demand
 * Q_adj = Q * (1 + β * (Pc - P) / Pc)
 *
 * If competitor cheaper → our demand decreases
 * If competitor expensive → our demand increases
 *
 * @param {number} quantity       - Raw demand
 * @param {number} beta           - Competitive sensitivity factor
 * @param {number} competitorPrice - Competitor's price
 * @param {number} ourPrice       - Our price
 * @returns {number} Adjusted demand (floored at 0)
 */
function applyCompetitorEffect(quantity, beta, competitorPrice, ourPrice) {
    if (competitorPrice <= 0) return quantity;
    const factor = 1 + beta * ((competitorPrice - ourPrice) / competitorPrice);
    return Math.max(0, quantity * factor);
}

/**
 * Clamp competitor price within ±20% of our price
 * Pc ∈ [0.8 × P, 1.2 × P]
 *
 * @param {number} compPrice - Competitor price to clamp
 * @param {number} ourPrice  - Our current price
 * @returns {number} Clamped competitor price
 */
function clampCompetitorPrice(compPrice, ourPrice) {
    const low = 0.80 * ourPrice;
    const high = 1.20 * ourPrice;
    return Math.min(high, Math.max(low, compPrice));
}

/**
 * Simple reactive competitor model
 * Pc_next = Pc + γ × (P - Pc)
 * Result is clamped within ±20% of our price.
 *
 * @param {number} compPrice - Current competitor price
 * @param {number} gamma     - Reaction rate (0 to 1)
 * @param {number} ourPrice  - Our current price
 * @returns {number} Updated competitor price (clamped)
 */
function updateCompetitorPrice(compPrice, gamma, ourPrice) {
    const raw = compPrice + gamma * (ourPrice - compPrice);
    return clampCompetitorPrice(raw, ourPrice);
}

/**
 * Aggressive competitor model
 * Pc_next = P - δ  (undercut by δ), then clamped
 *
 * @param {number} ourPrice - Our current price
 * @param {number} delta    - Undercut amount
 * @returns {number} Updated competitor price (clamped)
 */
function aggressiveCompetitorPrice(ourPrice, delta) {
    const raw = Math.max(0, ourPrice - delta);
    return clampCompetitorPrice(raw, ourPrice);
}

module.exports = {
    applyCompetitorEffect,
    clampCompetitorPrice,
    updateCompetitorPrice,
    aggressiveCompetitorPrice,
};
