const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/products
 * List all products
 */
router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/products/:id
 * Get a product by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            const err = new Error('Product not found');
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
