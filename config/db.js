const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://ayush-kr:NkPC2pOY4r61eMz9@cluster0.9ai6fwr.mongodb.net/flipkart';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn('   Server will run but database operations will fail.');
    console.warn('   Set MONGO_URI in .env to connect.\n');
    return false;
  }
};

module.exports = connectDB;
