const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Database connection (reuse between invocations when possible)
// Vercel-Supabase integration uses POSTGRES_URL, fallback to DATABASE_URL for local dev
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Log which connection is being used (for debugging)
console.log('Using database connection:', connectionString ? 'Found' : 'NOT FOUND');
console.log('Available DB env vars:', {
  POSTGRES_URL: !!process.env.POSTGRES_URL,
  POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
  DATABASE_URL: !!process.env.DATABASE_URL
});

// Supabase/Vercel requires SSL in production
const sslConfig = (connectionString && connectionString.includes('supabase')) ||
                  (connectionString && connectionString.includes('pooler')) ||
                  process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false;

const pool = global.pgPool || new Pool({
  connectionString: connectionString,
  ssl: sslConfig
});
if (!global.pgPool) {
  global.pgPool = pool;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('html')); // Serve static files

// Cache control for development
app.use((req, res, next) => {
  if (req.path.match(/\.(html|css|js)$/)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'ManeStreet Backend API is running!',
      database: 'connected',
      timestamp: dbTest.rows[0].now
    });
  } catch (error) {
    res.json({
      status: 'ok',
      message: 'ManeStreet Backend API is running!',
      database: 'error',
      dbError: error.message
    });
  }
});

// Create new game session
app.post('/api/game/new', async (req, res) => {
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
    console.error('Error creating game session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save game state
app.post('/api/game/save', async (req, res) => {
  try {
    const {
      sessionId,
      gameState,
      score,
      currentScene
    } = req.body;
    
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
  }
});

// Load game state
app.get('/api/game/load/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT gs.*, gse.player_name, gse.difficulty
      FROM game_saves gs
      JOIN game_sessions gse ON gs.session_id = gse.session_id
      WHERE gs.session_id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    const save = result.rows[0];
    save.game_state = JSON.parse(save.game_state);
    
    res.json({
      success: true,
      save
    });
  } catch (error) {
    console.error('Error loading game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit final score
app.post('/api/game/complete', async (req, res) => {
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
      // New detailed stats
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
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
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

    // Parse JSON fields
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
  }
});

// Get player stats
app.get('/api/stats/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT * FROM game_sessions
      WHERE session_id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all sessions for analytics
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_games,
        AVG(final_score) as avg_score,
        AVG(happiness) as avg_happiness,
        AVG(city_funds) as avg_funds,
        AVG(play_time_seconds) as avg_play_time,
        difficulty,
        COUNT(*) as games_per_difficulty
      FROM game_sessions
      GROUP BY difficulty
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      analytics: result.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize database tables
async function initDatabase() {
  try {
    console.log('🔧 Initializing database tables...');

    // Create game_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        session_id VARCHAR(36) PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        final_score INTEGER,
        happiness INTEGER,
        city_funds INTEGER,
        special_interest INTEGER,
        personal_profit INTEGER,
        decisions_made INTEGER,
        play_time_seconds INTEGER,
        achievements JSONB,
        buildings_placed INTEGER,
        avg_decision_time REAL,
        planning_efficiency INTEGER,
        time_bonus INTEGER,
        zones_formed JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `);

    // Add new columns if they don't exist (for existing databases)
    const alterQueries = [
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS achievements JSONB`,
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS buildings_placed INTEGER`,
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS avg_decision_time REAL`,
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS planning_efficiency INTEGER`,
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS time_bonus INTEGER`,
      `ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS zones_formed JSONB`
    ];

    for (const query of alterQueries) {
      try {
        await pool.query(query);
      } catch (err) {
        // Ignore errors for columns that already exist
        if (!err.message.includes('already exists')) {
          console.warn('Warning:', err.message);
        }
      }
    }

    // Create game_saves table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_saves (
        session_id VARCHAR(36) PRIMARY KEY REFERENCES game_sessions(session_id) ON DELETE CASCADE,
        game_state JSONB NOT NULL,
        score INTEGER DEFAULT 0,
        current_scene VARCHAR(100),
        saved_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_score ON game_sessions(final_score DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_difficulty ON game_sessions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_sessions_completed ON game_sessions(completed_at);
    `);

    console.log('✅ Database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    // Don't exit - let the app try to continue
  }
}

if (!process.env.VERCEL) {
// Start server
app.listen(PORT, HOST, async () => {
  console.log('\n🏛️  ManeStreet Backend Server Started!');
  console.log(`📡 API Server: http://${HOST}:${PORT}`);
  console.log(`🎮 Game URL: http://${HOST}:${PORT}`);
  console.log(`💾 Database: Connected to PostgreSQL`);
  console.log('\n📋 Available API Endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/game/new - Create new game session');
  console.log('   POST /api/game/save - Save game state');
  console.log('   GET  /api/game/load/:sessionId - Load game state');
  console.log('   POST /api/game/complete - Submit final score');
  console.log('   GET  /api/leaderboard - Get top scores');
  console.log('   GET  /api/stats/:sessionId - Get player stats');
  console.log('   GET  /api/analytics/summary - Get game analytics\n');

  // Initialize database after server starts
  await initDatabase();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await pool.end();
  process.exit(0);
});
}

module.exports = { app, initDatabase, pool };
