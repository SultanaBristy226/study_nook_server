const mongoose = require('mongoose');

let cached = global._mongoConn || null;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return;

  try {
    cached = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    global._mongoConn = cached;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Do NOT call process.exit(1) — it crashes Vercel serverless functions
  }
};

module.exports = connectDB;