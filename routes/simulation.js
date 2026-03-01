const express = require('express');
const router = express.Router();
const { runSimulation } = require('../engine/simulate');
const Simulation = require('../models/Simulation');

/**
 * POST /api/simulate
 * Run a new pricing simulation
 */
router.post('/', async (req, res, next) => {
    try {
        const {
            product,
            productName,
            initialPrice,
            competitorPrice,
            baseDemand,
            referencePrice,
            unitCost,
            initialInventory,
            simulationDays,
            alpha = 2.0,
            beta = 0.5,
            gamma = 0.3,
            strategy = 'fixed',
            adjustmentRate = 0.05,
            inventoryThreshold = 20,
            demandThreshold = 10,
            restockEnabled = false,
            restockAmount = 0,
            restockInterval = 7,
            // ── NEW: Cyclical Inventory Policy ──
            reorderPoint = 0,
            restockQuantity = 0,
            leadTime = 3,
            // ── NEW: Cost-Plus Floor ──
            targetMargin = 0.20,
            competitorModel = 'reactive',
            competitorDelta = 5,
            demandModel = 'linear',
            logDemandA = 10000,
            logDemandE = 1.5,
        } = req.body;

        // Validate required fields
        const required = { initialPrice, competitorPrice, baseDemand, referencePrice, unitCost, initialInventory, simulationDays };
        const missing = Object.entries(required)
            .filter(([, v]) => v === undefined || v === null)
            .map(([k]) => k);

        if (missing.length > 0) {
            const err = new Error(`Missing required fields: ${missing.join(', ')}`);
            err.statusCode = 400;
            throw err;
        }

        const config = {
            initialPrice,
            competitorPrice,
            baseDemand,
            referencePrice,
            unitCost,
            initialInventory,
            simulationDays,
            alpha,
            beta,
            gamma,
            strategy,
            adjustmentRate,
            inventoryThreshold,
            demandThreshold,
            restockEnabled,
            restockAmount,
            restockInterval,
            reorderPoint,
            restockQuantity,
            leadTime,
            targetMargin,
            competitorModel,
            competitorDelta,
            demandModel,
            logDemandA,
            logDemandE,
        };

        const { timeSeries, kpis } = runSimulation(config);

        // Try to persist to MongoDB (non-blocking)
        let simulationId = null;
        try {
            const simulation = await Simulation.create({
                ...config,
                product,
                productName,
                timeSeries,
                ...kpis,
            });
            simulationId = simulation._id;
        } catch (dbErr) {
            console.warn('⚠️  Could not save simulation to DB:', dbErr.message);
        }

        res.status(201).json({
            success: true,
            data: { simulationId, timeSeries, kpis },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/simulate
 * List all past simulations (summary only)
 */
router.get('/', async (req, res, next) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const simulations = await Simulation.find()
            .select('-timeSeries')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Simulation.countDocuments();

        res.json({
            success: true,
            data: simulations,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/simulate/:id
 * Get a specific simulation with full time-series
 */
router.get('/:id', async (req, res, next) => {
    try {
        const simulation = await Simulation.findById(req.params.id);
        if (!simulation) {
            const err = new Error('Simulation not found');
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, data: simulation });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/simulate/:id
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const simulation = await Simulation.findByIdAndDelete(req.params.id);
        if (!simulation) {
            const err = new Error('Simulation not found');
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, message: 'Simulation deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
