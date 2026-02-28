const express = require('express');
const router = express.Router();
const { trainFromHistoricalData } = require('../learning/trainer');

/**
 * POST /api/learn
 * Train model parameters from Flipkart historical data
 *
 * Body (all optional):
 *   category  - Filter by category keyword (e.g. "Clothing", "Electronics")
 *   brand     - Filter by brand name (e.g. "Alisha", "Samsung")
 *   filter    - Raw MongoDB filter object for advanced queries
 *
 * Returns: learned α, β, γ, suggested simulation config, and quality metrics
 */
router.post('/', async (req, res, next) => {
    try {
        const {
            category = null,
            brand = null,
            filter = {},
        } = req.body;

        const learnedParams = await trainFromHistoricalData({
            category,
            brand,
            filter,
        });

        res.json({
            success: true,
            message: 'Parameters learned from Flipkart historical data',
            data: learnedParams,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/learn/categories
 * List available product categories in the dataset
 */
router.get('/categories', async (req, res, next) => {
    try {
        const HistoricalData = require('../models/HistoricalData');
        const categories = await HistoricalData.distinct('product_category_tree');

        // Extract top-level categories
        const topCategories = new Set();
        for (const cat of categories) {
            if (cat) {
                const match = cat.match(/\["([^">>]+)/);
                if (match) topCategories.add(match[1].trim());
            }
        }

        res.json({
            success: true,
            data: {
                total: categories.length,
                topCategories: [...topCategories].sort(),
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/learn/brands
 * List available brands (optionally filtered by category)
 */
router.get('/brands', async (req, res, next) => {
    try {
        const HistoricalData = require('../models/HistoricalData');
        const query = {};
        if (req.query.category) {
            query.product_category_tree = { $regex: req.query.category, $options: 'i' };
        }
        const brands = await HistoricalData.distinct('brand', query);
        res.json({
            success: true,
            data: brands.filter(Boolean).sort(),
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/learn/stats
 * Quick stats about the dataset
 */
router.get('/stats', async (req, res, next) => {
    try {
        const HistoricalData = require('../models/HistoricalData');
        const totalProducts = await HistoricalData.countDocuments();
        const withRetailPrice = await HistoricalData.countDocuments({ retail_price: { $gt: 0 } });
        const withDiscountedPrice = await HistoricalData.countDocuments({ discounted_price: { $gt: 0 } });
        const uniqueBrands = (await HistoricalData.distinct('brand')).filter(Boolean).length;

        res.json({
            success: true,
            data: {
                totalProducts,
                withRetailPrice,
                withDiscountedPrice,
                uniqueBrands,
            },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
