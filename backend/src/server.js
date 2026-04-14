require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Warm up connection pool by doing a simple query
    // This ensures connections are initialized before first user request
    const Question = require('./models/Question');
    await Question.findOne({ isActive: true }).lean().exec();
    logger.info('✅ Connection pool warmed up');

    const server = app.listen(PORT, () => {
      logger.info('Server running on port ' + PORT + ' [' + process.env.NODE_ENV + ']');
      logger.info('API -> http://localhost:' + PORT + '/api/' + (process.env.API_VERSION || 'v1'));
      logger.info('Health -> http://localhost:' + PORT + '/health');
    });

    const shutdown = (signal) => {
      logger.info(signal + ' received. Shutting down...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection: ' + err.message);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception: ' + err.message);
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
