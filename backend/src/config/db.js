const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool optimization
      maxPoolSize: 10,           // Default is 10, increase for better concurrency
      minPoolSize: 5,            // Keep minimum connections ready
      maxIdleTimeMS: 45000,      // Close idle connections after 45s
      
      // Timeout optimization
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Retry policy for transient network issues
      retryWrites: true,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Handle connection events after initial connect
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      logger.info(`🔄 Retrying connection... (${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY_MS);
    } else {
      logger.error('💀 Max retries reached. Shutting down.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;