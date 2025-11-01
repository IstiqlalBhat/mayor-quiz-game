-- Drop tables and views for ManeStreet Mayor Game
-- Run this script to completely remove all game data

-- Drop the view first
DROP VIEW IF EXISTS leaderboard_view;

-- Drop the child table first (due to foreign key constraint)
DROP TABLE IF EXISTS game_saves;

-- Drop the parent table
DROP TABLE IF EXISTS game_sessions;

-- Note: Indexes are automatically dropped when tables are dropped


