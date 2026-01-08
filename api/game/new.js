// Create new game session
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Allow self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const getPool = () => {
  const connectionString = process.env.POSTGRES_URL ||
                           process.env.POSTGRES_URL_NON_POOLING ||
                           process.env.DATABASE_URL;
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
};

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pool = getPool();

  try {
    const { playerName, difficulty } = req.body;
    const sessionId = uuidv4();

    const query = `
      INSERT INTO game_sessions (session_id, player_name, difficulty, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING session_id, player_name, difficulty, created_at
    `;

    const result = await pool.query(query, [sessionId, playerName || 'Anonymous', difficulty || 'normal']);

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
};
