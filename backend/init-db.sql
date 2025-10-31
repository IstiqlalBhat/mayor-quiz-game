-- ManeStreet Mayor Game Database Schema

-- Table for game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'normal',
    final_score INTEGER DEFAULT 0,
    happiness INTEGER,
    city_funds INTEGER,
    special_interest INTEGER,
    personal_profit INTEGER,
    decisions_made INTEGER DEFAULT 0,
    play_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Table for game saves (one save per session)
CREATE TABLE IF NOT EXISTS game_saves (
    session_id VARCHAR(255) PRIMARY KEY REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    game_state JSONB NOT NULL,
    score INTEGER DEFAULT 0,
    current_scene VARCHAR(100),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_score ON game_sessions(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_difficulty ON game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON game_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON game_sessions(created_at);

-- View for leaderboard
CREATE OR REPLACE VIEW leaderboard_view AS
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
    completed_at,
    ROW_NUMBER() OVER (PARTITION BY difficulty ORDER BY final_score DESC) as rank
FROM game_sessions
WHERE completed_at IS NOT NULL
ORDER BY difficulty, final_score DESC;

-- Sample analytics query (commented out)
-- SELECT difficulty, 
--        COUNT(*) as games_played,
--        AVG(final_score) as avg_score,
--        MAX(final_score) as high_score,
--        AVG(happiness) as avg_happiness
-- FROM game_sessions
-- WHERE completed_at IS NOT NULL
-- GROUP BY difficulty;
