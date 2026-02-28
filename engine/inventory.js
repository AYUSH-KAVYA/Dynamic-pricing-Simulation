/**
 * Inventory Constraint Module
 * Implements §3: Inventory Constraint & Update
 */

/**
 * Actual sales = min(demand, available inventory)
 * S = min(Q, I)
 *
 * @param {number} demand - Computed demand
 * @param {number} inventory - Available inventory
 * @returns {number} Actual sales
 */
function computeSales(demand, inventory) {
    return Math.min(Math.max(0, demand), Math.max(0, inventory));
}

/**
 * Update inventory after sales and optional restocking
 * I_next = I - S + R
 *
 * @param {number} inventory - Current inventory
 * @param {number} sales - Units sold
 * @param {number} restock - Units restocked (default 0)
 * @returns {number} Updated inventory (floored at 0)
 */
function updateInventory(inventory, sales, restock = 0) {
    return Math.max(0, inventory - sales + restock);
}

module.exports = { computeSales, updateInventory };
