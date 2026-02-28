const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars from .env file (optional — on Vercel, env vars come from dashboard)
try { require('dotenv').config(); } catch (e) { /* dotenv not needed in production */ }

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Dynamic Pricing Simulation API is running',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/simulate', require('./routes/simulation'));
app.use('/api/learn', require('./routes/learning'));
app.use('/api/products', require('./routes/products'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server first, then attempt MongoDB connection (non-blocking)
app.listen(PORT, async () => {
    console.log(`\n🚀 Dynamic Pricing Simulator running on port ${PORT}`);
    console.log(`   Dashboard:   http://localhost:${PORT}`);
    console.log(`   API Health:   http://localhost:${PORT}/api/health`);
    console.log(`   Simulate:    POST http://localhost:${PORT}/api/simulate`);
    console.log(`   Learn:       POST http://localhost:${PORT}/api/learn\n`);

    // Connect to MongoDB (non-blocking — server stays up even if DB is down)
    await connectDB();
});

module.exports = app;
