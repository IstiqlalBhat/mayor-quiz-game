// Standalone health check endpoint
const { Pool } = require('pg');

module.exports = async (req, res) => {
  const connectionString = process.env.POSTGRES_URL ||
                           process.env.POSTGRES_URL_NON_POOLING ||
                           process.env.DATABASE_URL;

  if (!connectionString) {
    return res.status(200).json({
      status: 'ok',
      database: 'no connection string',
      env_vars: {
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    });
  }

  try {
    // Allow self-signed certs
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query('SELECT NOW()');
    await pool.end();

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    return res.status(200).json({
      status: 'ok',
      database: 'error',
      error: error.message
    });
  }
};
