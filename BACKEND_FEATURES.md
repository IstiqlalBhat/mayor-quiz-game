# 🏛️ ManeStreet Backend Features

## Overview
This project now includes a full-featured Node.js/Express backend with PostgreSQL database integration for persistent game state, user sessions, and leaderboards.

## 🚀 Backend Server

**Location**: `backend/server.js`  
**Port**: 5000  
**Database**: PostgreSQL (Replit-hosted)

The backend provides REST API endpoints for complete game state management.

## 📡 API Endpoints

### 1. Health Check
```
GET /api/health
```
Returns server status and confirms backend is running.

**Response**:
```json
{
  "status": "ok",
  "message": "ManeStreet Backend API is running!"
}
```

### 2. Create New Game Session
```
POST /api/game/new
```
Creates a new game session with unique session ID.

**Request Body**:
```json
{
  "playerName": "John Doe",
  "difficulty": "normal"
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "session_id": "uuid-here",
    "player_name": "John Doe",
    "difficulty": "normal",
    "created_at": "2025-10-31T03:00:00.000Z"
  }
}
```

### 3. Save Game State
```
POST /api/game/save
```
Saves current game state (auto-save enabled every 30 seconds).

**Request Body**:
```json
{
  "sessionId": "uuid-here",
  "gameState": {
    "happiness": 75,
    "cityFunds": 60,
    "specialInterest": 50,
    "personalProfit": 0,
    "decisions": [],
    "buildings": ["city-hall", "house"],
    "cityGrid": [...]
  },
  "score": 65,
  "currentScene": "choice_budget"
}
```

### 4. Load Game State
```
GET /api/game/load/:sessionId
```
Load a previously saved game.

**Response**:
```json
{
  "success": true,
  "save": {
    "session_id": "uuid-here",
    "game_state": {...},
    "score": 65,
    "current_scene": "choice_budget",
    "player_name": "John Doe",
    "difficulty": "normal"
  }
}
```

### 5. Complete Game
```
POST /api/game/complete
```
Submit final score when game ends.

**Request Body**:
```json
{
  "sessionId": "uuid-here",
  "finalScore": 85,
  "happiness": 80,
  "cityFunds": 75,
  "specialInterest": 60,
  "personalProfit": 10,
  "decisions": 12,
  "playTime": 300
}
```

### 6. Get Leaderboard
```
GET /api/leaderboard?difficulty=normal&limit=10
```
Fetch top scores globally or by difficulty.

**Response**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "player_name": "Jane Doe",
      "difficulty": "normal",
      "final_score": 95,
      "happiness": 90,
      "city_funds": 85,
      "decisions_made": 15,
      "completed_at": "2025-10-31T03:00:00.000Z"
    }
  ]
}
```

### 7. Get Player Stats
```
GET /api/stats/:sessionId
```
Get detailed stats for a specific game session.

### 8. Get Analytics
```
GET /api/analytics/summary
```
Get aggregate statistics across all games.

**Response**:
```json
{
  "success": true,
  "analytics": [
    {
      "difficulty": "normal",
      "total_games": 50,
      "completed_games": 42,
      "avg_score": 72.5,
      "avg_happiness": 68.2,
      "avg_play_time": 420
    }
  ]
}
```

## 💾 Database Schema

### Tables

**game_sessions**
- `session_id` (VARCHAR, PRIMARY KEY) - Unique session identifier
- `player_name` (VARCHAR) - Player's name
- `difficulty` (VARCHAR) - Game difficulty level
- `final_score` (INTEGER) - Final game score
- `happiness` (INTEGER) - Final happiness stat
- `city_funds` (INTEGER) - Final funds stat
- `special_interest` (INTEGER) - Final special interest stat
- `personal_profit` (INTEGER) - Final personal profit
- `decisions_made` (INTEGER) - Number of decisions
- `play_time_seconds` (INTEGER) - Time spent playing
- `created_at` (TIMESTAMP) - Session start time
- `completed_at` (TIMESTAMP) - Session end time

**game_saves**
- `session_id` (VARCHAR, PRIMARY KEY) - Foreign key to game_sessions
- `game_state` (JSONB) - Complete game state object
- `score` (INTEGER) - Current score
- `current_scene` (VARCHAR) - Current scene ID
- `saved_at` (TIMESTAMP) - Last save time

## 🎮 Frontend Integration

### API Client Usage

The `api-client.js` file provides a simple interface:

```javascript
// Global instance
const gameAPI = new GameAPI();

// Create new session
await gameAPI.createNewSession('Player Name', 'normal');

// Save game
await gameAPI.saveGame(gameState, score, currentScene);

// Load game
const save = await gameAPI.loadGame(sessionId);

// Complete game
await gameAPI.completeGame({
  finalScore: 85,
  happiness: 80,
  cityFunds: 75,
  specialInterest: 60,
  personalProfit: 10,
  decisions: 12,
  playTime: 300
});

// Get leaderboard
const leaderboard = await gameAPI.getLeaderboard('normal', 10);

// Enable auto-save (every 30 seconds)
gameAPI.startAutoSave(
  () => gameState,
  () => calculateScore(),
  () => currentScene
);
```

## 🔄 Auto-Save Feature

The game automatically saves progress every 30 seconds when enabled:

```javascript
gameAPI.startAutoSave(
  () => gameState,           // Function that returns current game state
  () => calculateScore(),     // Function that returns current score
  () => currentScene          // Function that returns current scene
);

// Stop auto-save
gameAPI.stopAutoSave();
```

## 🏆 Leaderboard System

Players are ranked by:
1. Final score (primary)
2. Difficulty level (categorized)
3. Completion time (secondary)

Query examples:
```javascript
// Top 10 overall
await gameAPI.getLeaderboard(null, 10);

// Top 10 for 'hard' difficulty
await gameAPI.getLeaderboard('hard', 10);
```

## 🛠️ Development

### Running the Server

The backend starts automatically via the Replit workflow:
```bash
node backend/server.js
```

### Database Initialization

The database schema is automatically created on first run. To manually reset:

```sql
-- Run in Replit database console
DROP TABLE IF EXISTS game_saves;
DROP TABLE IF EXISTS game_sessions;

-- Then restart the server to recreate tables
```

### Environment Variables

The server uses these environment variables (automatically set by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (5432)
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

## 📊 Monitoring & Analytics

### Check Backend Status
```bash
curl http://localhost:5000/api/health
```

### View Analytics
```bash
curl http://localhost:5000/api/analytics/summary
```

### Query Database Directly
```sql
-- See all active sessions
SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 10;

-- See top scores
SELECT player_name, final_score, difficulty 
FROM game_sessions 
WHERE completed_at IS NOT NULL 
ORDER BY final_score DESC 
LIMIT 10;

-- See recent saves
SELECT session_id, score, current_scene, saved_at 
FROM game_saves 
ORDER BY saved_at DESC;
```

## 🔐 Security Features

- Session IDs use UUID v4 for uniqueness
- Game state stored as JSONB for flexible queries
- Foreign key constraints maintain data integrity
- Indexes optimize leaderboard queries
- CORS enabled for frontend access

## 🚀 Future Enhancements

Possible additions:
1. **User Authentication** - Add login/signup system
2. **Multiplayer** - Real-time multiplayer mayors
3. **Achievements** - Track and sync achievements
4. **Social Features** - Share cities, compare with friends
5. **Admin Dashboard** - View analytics, moderate content
6. **Cloud Saves** - Cross-device game progress
7. **Replay System** - Replay game decisions
8. **AI Opponents** - Compete against AI mayors

## 📝 Testing the Backend

### Test Script
```bash
# Health check
curl http://localhost:5000/api/health

# Create session
curl -X POST http://localhost:5000/api/game/new \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test Player","difficulty":"normal"}'

# Get leaderboard
curl http://localhost:5000/api/leaderboard?limit=5
```

## 📚 Additional Resources

- **Express.js**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Node-Postgres**: https://node-postgres.com/
- **REST API Design**: https://restfulapi.net/

---

**Made with ❤️ for ManeStreet Mayor Game**
