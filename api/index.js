const serverless = require('serverless-http');
const { app, initDatabase } = require('../backend/server');

let initialized = false;
const handler = serverless(app);

module.exports = async (req, res) => {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
  return handler(req, res);
};
