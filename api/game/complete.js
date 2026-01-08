// Complete game and submit final score
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
    const {
      sessionId,
      finalScore,
      happiness,
      cityFunds,
      specialInterest,
      personalProfit,
      decisions,
      playTime,
      achievements,
      buildingsPlaced,
      avgDecisionTime,
      planningEfficiency,
      timeBonus,
      zonesFormed
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID required' });
    }

    const query = `
      UPDATE game_sessions
      SET
        final_score = $1,
        happiness = $2,
        city_funds = $3,
        special_interest = $4,
        personal_profit = $5,
        decisions_made = $6,
        play_time_seconds = $7,
        achievements = $8,
        buildings_placed = $9,
        avg_decision_time = $10,
        planning_efficiency = $11,
        time_bonus = $12,
        zones_formed = $13,
        completed_at = NOW()
      WHERE session_id = $14
      RETURNING *
    `;

    const result = await pool.query(query, [
      finalScore,
      happiness,
      cityFunds,
      specialInterest,
      personalProfit,
      decisions,
      playTime,
      JSON.stringify(achievements || []),
      buildingsPlaced || 0,
      avgDecisionTime || 0,
      planningEfficiency || 0,
      timeBonus || 0,
      JSON.stringify(zonesFormed || []),
      sessionId
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or already completed'
      });
    }

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Error completing game:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
};
