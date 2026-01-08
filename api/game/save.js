// Save game state
const { Pool } = require('pg');

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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pool = getPool();

  try {
    const { sessionId, gameState, score, currentScene } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID required' });
    }

    const query = `
      INSERT INTO game_saves (session_id, game_state, score, current_scene, saved_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (session_id)
      DO UPDATE SET
        game_state = $2,
        score = $3,
        current_scene = $4,
        saved_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [
      sessionId,
      JSON.stringify(gameState),
      score || 0,
      currentScene || 'start'
    ]);

    res.json({
      success: true,
      save: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
};
