// Simple test endpoint to verify Vercel functions work
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
};
