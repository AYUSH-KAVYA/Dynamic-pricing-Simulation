/**
 * Demand Function Module
 * Implements §1: Demand with Price Elasticity
 *
 * Linear:  Q = D0 - α * (P - Pref)
 * Log:     Q = A * P^(-e)
 */

/**
 * Linear demand model
 * @param {number} D0    - Base demand
 * @param {number} alpha - Price elasticity coefficient
 * @param {number} price - Current price
 * @param {number} refPrice - Reference market price
 * @returns {number} Demand quantity (floored at 0)
 */
function computeDemand(D0, alpha, price, refPrice) {
    const Q = D0 - alpha * (price - refPrice);
    return Math.max(0, Q);
}

/**
 * Log (constant-elasticity) demand model
 * Q = A * P^(-e)
 * @param {number} A - Scale parameter
 * @param {number} e - Constant elasticity
 * @param {number} price - Current price
 * @returns {number} Demand quantity
 */
function computeLogDemand(A, e, price) {
    if (price <= 0) return 0;
    const Q = A * Math.pow(price, -e);
    return Math.max(0, Q);
}

/**
 * Point elasticity for linear model
 * E = -α * P / Q
 * @param {number} alpha - Price elasticity coefficient
 * @param {number} price - Current price
 * @param {number} quantity - Current demand
 * @returns {number} Elasticity value
 */
function computeElasticity(alpha, price, quantity) {
    if (quantity === 0) return -Infinity;
    return -alpha * (price / quantity);
}

module.exports = { computeDemand, computeLogDemand, computeElasticity };
