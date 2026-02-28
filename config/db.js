const mongoose = require('mongoose');

// Cache connection across serverless invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, reuse
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || 'mongodb+srv://ayush-kr:NkPC2pOY4r61eMz9@cluster0.9ai6fwr.mongodb.net/flipkart';

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });
    }
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn('   Server will run but database operations will fail.');
    return false;
  }
};

module.exports = connectDB;
