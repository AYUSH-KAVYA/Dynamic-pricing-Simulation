/**
 * Inventory Constraint & Replenishment Module
 * Implements:
 *   §3:  Inventory Constraint & Update
 *   §12: Cyclical Replenishment Model (ROP + Lead Time queue)
 *
 * Reorder Policy:
 *   If  I_t < ROP  →  trigger restock; arrives on day (t + L)
 *
 * Inventory update:
 *   I_{t+1} = max(0, I_t - S_t + R_t)
 *   where R_t = restockQuantity if a restock was scheduled to arrive on day t
 */

/**
 * Actual sales = min(demand, available inventory)
 * S = min(Q, I)
 *
 * @param {number} demand    - Computed demand
 * @param {number} inventory - Available inventory
 * @returns {number} Actual sales
 */
function computeSales(demand, inventory) {
    return Math.min(Math.max(0, demand), Math.max(0, inventory));
}

/**
 * Check whether a reorder should be triggered
 * Condition: I_t < ROP
 *
 * @param {number} inventory    - Current inventory
 * @param {number} reorderPoint - ROP threshold
 * @returns {boolean}
 */
function shouldReorder(inventory, reorderPoint) {
    return inventory < reorderPoint;
}

/**
 * Update the pending-restock queue for lead-time-aware replenishment.
 * When a reorder is triggered on day t, it registers a restock of
 * restockQuantity units to arrive on day (t + leadTime).
 *
 * @param {object} restockQueue    - Map of { day: quantity } (mutated in place)
 * @param {number} currentDay      - Current simulation day (t)
 * @param {boolean} alreadyOrdered - Whether an open order is already pending
 * @param {number} inventory       - Current inventory
 * @param {number} reorderPoint    - ROP
 * @param {number} restockQuantity - Q_order
 * @param {number} leadTime        - L (days until delivery)
 * @returns {boolean} True if a new order was placed this tick
 */
function triggerReorderIfNeeded(restockQueue, currentDay, alreadyOrdered, inventory, reorderPoint, restockQuantity, leadTime) {
    if (!alreadyOrdered && shouldReorder(inventory, reorderPoint)) {
        const arrivalDay = currentDay + leadTime;
        restockQueue[arrivalDay] = (restockQueue[arrivalDay] || 0) + restockQuantity;
        return true; // order placed
    }
    return false;
}

/**
 * Get restock quantity arriving on a given day (0 if none scheduled)
 *
 * @param {object} restockQueue - Map of { day: quantity }
 * @param {number} day          - Simulation day
 * @returns {number}
 */
function getArrivingRestock(restockQueue, day) {
    return restockQueue[day] || 0;
}

/**
 * Update inventory after sales and optional restocking
 * I_next = max(0, I - S + R)
 *
 * @param {number} inventory - Current inventory
 * @param {number} sales     - Units sold
 * @param {number} restock   - Units restocked this day (default 0)
 * @returns {number} Updated inventory (floored at 0)
 */
function updateInventory(inventory, sales, restock = 0) {
    return Math.max(0, inventory - sales + restock);
}

module.exports = {
    computeSales,
    shouldReorder,
    triggerReorderIfNeeded,
    getArrivingRestock,
    updateInventory,
};
