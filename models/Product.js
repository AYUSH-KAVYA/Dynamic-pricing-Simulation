const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        baseDemand: {
            type: Number,
            required: [true, 'Base demand (D0) is required'],
            min: 0,
        },
        unitCost: {
            type: Number,
            required: [true, 'Unit cost (C) is required'],
            min: 0,
        },
        referencePrice: {
            type: Number,
            required: [true, 'Reference price (Pref) is required'],
            min: 0,
        },
        alpha: {
            type: Number,
            default: 2.0,
            min: 0,
            description: 'Price elasticity coefficient (α)',
        },
        beta: {
            type: Number,
            default: 0.5,
            min: 0,
            description: 'Competitive sensitivity factor (β)',
        },
        gamma: {
            type: Number,
            default: 0.3,
            min: 0,
            max: 1,
            description: 'Competitor reaction rate (γ)',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
