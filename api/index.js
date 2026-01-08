const serverless = require('serverless-http');
const { app, initDatabase } = require('../backend/server');

let initialized = false;
let initError = null;
const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    // Initialize database on first request
    if (!initialized && !initError) {
      try {
        await initDatabase();
        initialized = true;
        console.log('Database initialized successfully');
      } catch (err) {
        console.error('Database initialization failed:', err);
        initError = err;
      }
    }

    // If init failed, still try to handle the request (some routes may not need DB)
    return handler(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
      initError: initError ? initError.message : null
    });
  }
};
