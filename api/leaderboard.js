// Get leaderboard
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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pool = getPool();

  try {
    const { difficulty, limit = 10 } = req.query;

    let query = `
      SELECT
        player_name,
        difficulty,
        final_score,
        happiness,
        city_funds,
        special_interest,
        personal_profit,
        decisions_made,
        play_time_seconds,
        achievements,
        buildings_placed,
        avg_decision_time,
        planning_efficiency,
        time_bonus,
        zones_formed,
        completed_at
      FROM game_sessions
      WHERE completed_at IS NOT NULL
    `;

    const params = [];
    if (difficulty) {
      query += ` AND difficulty = $1`;
      params.push(difficulty);
      query += ` ORDER BY final_score DESC LIMIT $2`;
      params.push(parseInt(limit));
    } else {
      query += ` ORDER BY final_score DESC LIMIT $1`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);

    const leaderboard = result.rows.map(row => ({
      ...row,
      achievements: row.achievements ? (typeof row.achievements === 'string' ? JSON.parse(row.achievements) : row.achievements) : [],
      zones_formed: row.zones_formed ? (typeof row.zones_formed === 'string' ? JSON.parse(row.zones_formed) : row.zones_formed) : []
    }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
};
