let serverless, app, initDatabase, handler;
let loadError = null;

// Wrap module loading in try-catch to prevent crashes
try {
  serverless = require('serverless-http');
  const server = require('../backend/server');
  app = server.app;
  initDatabase = server.initDatabase;
  handler = serverless(app);
} catch (err) {
  console.error('Module load error:', err);
  loadError = err;
}

let initialized = false;
let initError = null;

module.exports = async (req, res) => {
  // If module failed to load, return error
  if (loadError) {
    return res.status(500).json({
      success: false,
      error: 'Module load error',
      message: loadError.message
    });
  }

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

    // Handle the request
    return handler(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
      initError: initError ? initError.message : null
    });
  }
};
