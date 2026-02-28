const mongoose = require('mongoose');

const dayDataSchema = new mongoose.Schema(
    {
        day: Number,
        price: Number,
        competitorPrice: Number,
        demand: Number,
        sales: Number,
        revenue: Number,
        profit: Number,
        inventory: Number,
        marketShare: Number,
        elasticity: Number,
    },
    { _id: false }
);

const simulationSchema = new mongoose.Schema(
    {
        // --- Input configuration ---
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        productName: String,

        // Core params
        initialPrice: { type: Number, required: true },
        competitorPrice: { type: Number, required: true },
        baseDemand: { type: Number, required: true },
        referencePrice: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        initialInventory: { type: Number, required: true },
        simulationDays: { type: Number, required: true, min: 1 },

        // Model coefficients
        alpha: { type: Number, required: true },
        beta: { type: Number, required: true },
        gamma: { type: Number, required: true },

        // Strategy
        strategy: {
            type: String,
            enum: ['fixed', 'dynamic'],
            default: 'fixed',
        },
        adjustmentRate: { type: Number, default: 0.05 },
        inventoryThreshold: { type: Number, default: 20 },
        demandThreshold: { type: Number, default: 10 },

        // Restocking
        restockEnabled: { type: Boolean, default: false },
        restockAmount: { type: Number, default: 0 },
        restockInterval: { type: Number, default: 7 },

        // Competitor model
        competitorModel: {
            type: String,
            enum: ['reactive', 'aggressive', 'static'],
            default: 'reactive',
        },
        competitorDelta: { type: Number, default: 5 },

        // Demand model
        demandModel: {
            type: String,
            enum: ['linear', 'log'],
            default: 'linear',
        },
        logDemandA: { type: Number, default: 10000 },
        logDemandE: { type: Number, default: 1.5 },

        // --- Output results ---
        timeSeries: [dayDataSchema],

        // Aggregate KPIs
        totalRevenue: Number,
        totalProfit: Number,
        totalUnitsSold: Number,
        finalInventory: Number,
        avgMarketShare: Number,
        peakDemandDay: Number,
        peakRevenueDay: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Simulation', simulationSchema);
