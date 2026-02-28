/**
 * Learning Module — Train model parameters from Flipkart historical data
 *
 * The Flipkart dataset contains product catalog data:
 *   - retail_price (MRP / listed price)
 *   - discounted_price (actual selling price)
 *   - product_category_tree (category hierarchy)
 *   - brand
 *   - product_rating / overall_rating
 *
 * Since there is no direct demand (units_sold) data, we derive elasticity
 * parameters using pricing patterns:
 *
 *   α — from discount-depth vs rating relationship (discount as demand proxy)
 *   β — from price variance across brands in the same category
 *   γ — competitor reaction rate from brand pricing spread
 *   D0 — base demand estimate from category size
 *
 * Also computes log-demand parameters via:
 *   ln(discount_ratio) = ln(A) - e * ln(retail_price)
 */

const ss = require('simple-statistics');
const HistoricalData = require('../models/HistoricalData');

/**
 * Train parameters from Flipkart data
 *
 * @param {object} options
 * @param {string} options.category - Filter by category keyword (optional)
 * @param {string} options.brand - Filter by brand (optional)
 * @param {object} options.filter - Raw Mongoose filter (optional)
 * @param {string} options.collectionName - Override collection name (optional)
 * @returns {object} Learned parameters + quality metrics
 */
async function trainFromHistoricalData(options = {}) {
    const {
        category = null,
        brand = null,
        filter = {},
    } = options;

    // Build query
    const query = { ...filter };
    if (category) {
        query.product_category_tree = { $regex: category, $options: 'i' };
    }
    if (brand) {
        query.brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    // Must have valid prices
    query.retail_price = { $gt: 0 };
    query.discounted_price = { $gt: 0 };

    // Fetch data
    const rawData = await HistoricalData.find(query)
        .select('retail_price discounted_price product_name product_category_tree brand product_rating overall_rating')
        .lean();

    if (!rawData || rawData.length < 5) {
        throw new Error(
            `Insufficient data. Found ${rawData ? rawData.length : 0} records, need at least 5. ` +
            `Try broadening your category/brand filter.`
        );
    }

    // -----------------------------------------------------------------
    // Extract clean arrays
    // -----------------------------------------------------------------
    const retailPrices = [];
    const discountedPrices = [];
    const discountDepths = [];      // (retail - discounted) / retail
    const ratings = [];
    const brands = [];
    const categories = [];

    for (const row of rawData) {
        const rp = Number(row.retail_price);
        const dp = Number(row.discounted_price);
        if (isNaN(rp) || isNaN(dp) || rp <= 0 || dp <= 0 || dp > rp) continue;

        retailPrices.push(rp);
        discountedPrices.push(dp);
        discountDepths.push((rp - dp) / rp);
        brands.push(row.brand || 'Unknown');
        categories.push(row.product_category_tree || '');

        // Parse rating (handle "No rating available")
        const rating = parseFloat(row.overall_rating || row.product_rating);
        ratings.push(isNaN(rating) ? null : rating);
    }

    if (retailPrices.length < 5) {
        throw new Error(
            `After cleaning, only ${retailPrices.length} valid records found. Need at least 5.`
        );
    }

    // -----------------------------------------------------------------
    // 1. Estimate α (price elasticity) from discount depth
    //
    //    Logic: Higher discount ≈ needed to drive demand → higher sensitivity.
    //    Regression: discount_depth = intercept + slope * retail_price
    //    α ≈ |slope| * scale_factor (normalized to demand units)
    // -----------------------------------------------------------------
    const priceDiscountPairs = retailPrices.map((p, i) => [p, discountDepths[i]]);
    const discountReg = ss.linearRegression(priceDiscountPairs);
    const discountRegLine = ss.linearRegressionLine(discountReg);
    const discountRSquared = ss.rSquared(priceDiscountPairs, discountRegLine);

    // α: scale the slope to meaningful demand units
    // The slope tells us: for each ₹1 increase in retail price, how much more discount is needed
    // We convert this to demand sensitivity by multiplying by mean demand estimate
    const avgRetailPrice = ss.mean(retailPrices);
    const avgDiscountDepth = ss.mean(discountDepths);
    const estimatedBaseDemand = Math.round(retailPrices.length * (1 - avgDiscountDepth) * 10);
    const alpha = Math.abs(discountReg.m) * estimatedBaseDemand * 100;

    // -----------------------------------------------------------------
    // 2. Estimate β (competitive sensitivity) from brand price variance
    //
    //    Logic: Group products by brand, compute price spread within
    //    similar categories. High inter-brand variance → high β.
    // -----------------------------------------------------------------
    const brandPrices = {};
    for (let i = 0; i < brands.length; i++) {
        const b = brands[i];
        if (!brandPrices[b]) brandPrices[b] = [];
        brandPrices[b].push(discountedPrices[i]);
    }

    const brandMeans = [];
    for (const [b, prices] of Object.entries(brandPrices)) {
        if (prices.length >= 2) {
            brandMeans.push(ss.mean(prices));
        }
    }

    let beta = 0.5; // default
    if (brandMeans.length >= 2) {
        const priceCV = ss.standardDeviation(brandMeans) / ss.mean(brandMeans);
        // Higher coefficient of variation → more competitive sensitivity
        beta = Math.min(2.0, Math.max(0.1, priceCV * 2));
    }

    // -----------------------------------------------------------------
    // 3. Estimate γ (competitor reaction rate) from discount patterns
    //
    //    Logic: If discounts are tightly clustered → competitors react quickly (high γ)
    //    If discounts are spread out → slower reaction (low γ)
    // -----------------------------------------------------------------
    let gamma = 0.3; // default
    if (discountDepths.length >= 5) {
        const discountStd = ss.standardDeviation(discountDepths);
        // Low std → brands match each other → high gamma
        // High std → varied strategies → low gamma
        gamma = Math.max(0.05, Math.min(0.95, 1 - discountStd * 3));
    }

    // -----------------------------------------------------------------
    // 4. Reference price & Base demand
    // -----------------------------------------------------------------
    const referencePrice = Math.round(ss.median(retailPrices) * 100) / 100;
    const D0 = Math.max(50, estimatedBaseDemand);

    // -----------------------------------------------------------------
    // 5. Log-demand regression: ln(discount_ratio) vs ln(price)
    //
    //    Proxy: discount_ratio = discounted/retail ∝ demand fraction
    //    ln(Q_proxy) = ln(A) - e * ln(P)
    // -----------------------------------------------------------------
    let logDemandA = null;
    let logDemandE = null;
    let logRSquared = null;

    const logPairs = [];
    for (let i = 0; i < retailPrices.length; i++) {
        const ratio = discountedPrices[i] / retailPrices[i]; // 0 to 1
        if (ratio > 0 && ratio <= 1 && retailPrices[i] > 0) {
            // Use (1 - discount_depth) as demand proxy
            logPairs.push([Math.log(retailPrices[i]), Math.log(ratio * 100)]);
        }
    }

    if (logPairs.length >= 5) {
        const logReg = ss.linearRegression(logPairs);
        logDemandE = Math.abs(logReg.m);
        logDemandA = Math.exp(logReg.b);
        const logRegLine = ss.linearRegressionLine(logReg);
        logRSquared = ss.rSquared(logPairs, logRegLine);
    }

    // -----------------------------------------------------------------
    // 6. Rating-based demand boost (if ratings available)
    // -----------------------------------------------------------------
    const validRatings = ratings.filter((r) => r !== null);
    let ratingInsight = null;
    if (validRatings.length >= 5) {
        const ratingPricePairs = [];
        for (let i = 0; i < ratings.length; i++) {
            if (ratings[i] !== null) {
                ratingPricePairs.push([discountedPrices[i], ratings[i]]);
            }
        }
        const ratingReg = ss.linearRegression(ratingPricePairs);
        const ratingRegLine = ss.linearRegressionLine(ratingReg);
        ratingInsight = {
            avgRating: Math.round(ss.mean(validRatings) * 100) / 100,
            ratingCount: validRatings.length,
            priceRatingCorrelation: Math.round(ss.rSquared(ratingPricePairs, ratingRegLine) * 10000) / 10000,
        };
    }

    // -----------------------------------------------------------------
    // Build result
    // -----------------------------------------------------------------
    return {
        // Core simulation parameters
        alpha: Math.round(alpha * 10000) / 10000,
        baseDemand: D0,
        referencePrice,
        beta: Math.round(beta * 10000) / 10000,
        gamma: Math.round(gamma * 10000) / 10000,
        unitCost: Math.round(ss.mean(discountedPrices) * 0.6 * 100) / 100, // rough estimate: 60% of selling price

        // Log model params
        logDemandA: logDemandA ? Math.round(logDemandA * 100) / 100 : null,
        logDemandE: logDemandE ? Math.round(logDemandE * 10000) / 10000 : null,

        // Quality metrics
        quality: {
            dataPoints: retailPrices.length,
            discountRSquared: Math.round(discountRSquared * 10000) / 10000,
            logRSquared: logRSquared !== null ? Math.round(logRSquared * 10000) / 10000 : null,
        },

        // Statistics
        priceRange: {
            min: Math.round(ss.min(retailPrices) * 100) / 100,
            max: Math.round(ss.max(retailPrices) * 100) / 100,
            median: referencePrice,
            mean: Math.round(avgRetailPrice * 100) / 100,
        },
        discountStats: {
            avgDiscountPercent: Math.round(avgDiscountDepth * 10000) / 100,
            minDiscountPercent: Math.round(ss.min(discountDepths) * 10000) / 100,
            maxDiscountPercent: Math.round(ss.max(discountDepths) * 10000) / 100,
        },
        brandCount: Object.keys(brandPrices).length,
        ratingInsight,

        // Suggested simulation config (ready to plug into /api/simulate)
        suggestedConfig: {
            initialPrice: Math.round(ss.median(discountedPrices) * 100) / 100,
            competitorPrice: Math.round(ss.quantile(discountedPrices, 0.4) * 100) / 100,
            baseDemand: D0,
            referencePrice,
            unitCost: Math.round(ss.mean(discountedPrices) * 0.6 * 100) / 100,
            initialInventory: D0 * 3,
            simulationDays: 30,
            alpha: Math.round(alpha * 10000) / 10000,
            beta: Math.round(beta * 10000) / 10000,
            gamma: Math.round(gamma * 10000) / 10000,
            strategy: 'dynamic',
            demandModel: 'linear',
        },
    };
}

module.exports = { trainFromHistoricalData };
