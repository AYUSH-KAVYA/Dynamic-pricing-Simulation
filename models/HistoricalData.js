const mongoose = require('mongoose');

// Schema matching the Flipkart e-commerce dataset
const historicalDataSchema = new mongoose.Schema(
    {
        uniq_id: { type: String },
        crawl_timestamp: { type: String },
        product_url: { type: String },
        product_name: { type: String },
        product_category_tree: { type: String },
        pid: { type: String },
        retail_price: { type: Number },         // Listed / MRP price
        discounted_price: { type: Number },     // Actual selling price
        image: { type: String },
        is_FK_Advantage_product: { type: String },
        description: { type: String },
        product_rating: { type: String },
        overall_rating: { type: String },
        brand: { type: String },
        product_specifications: { type: String },
    },
    {
        timestamps: false,
        strict: false,  // allow extra fields from raw data
        collection: process.env.COLLECTION_NAME || 'products',
    }
);

module.exports = mongoose.model('HistoricalData', historicalDataSchema);
