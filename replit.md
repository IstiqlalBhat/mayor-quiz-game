# ManeStreet - Interactive Mayor Game

## 🎯 Project Overview

A political decision-making game where players act as mayor of Tiger Central, making tough choices that affect city happiness, funds, and special interests. The game features an interactive city-building interface with drag-and-drop building placement, timed decisions, and dynamic consequences.

## 🏗️ Architecture

### Frontend
- **Location**: `html/` directory
- **Technology**: Vanilla JavaScript, HTML5, CSS3
- **Main Files**:
  - `index.html` - Game UI structure
  - `game.js` - Game logic (2700+ lines)
  - `styles.css` - All styling and animations
  - `api-client.js` - Backend API integration

### Backend
- **Location**: `backend/` directory
- **Technology**: Node.js + Express.js
- **Database**: PostgreSQL (Replit-hosted)
- **Main Files**:
  - `backend/server.js` - Express API server
  - `backend/init-db.sql` - Database schema

### Database Schema
- `game_sessions` - Player sessions with final scores
- `game_saves` - Game state snapshots (JSONB)
- Indexes on score, difficulty, completion time

## 🎮 Game Features

### Core Gameplay
1. **Story-Driven Decisions** - Make choices that shape the city
2. **Building System** - Drag-and-drop city planning
3. **Resource Management** - Balance happiness, funds, and special interests
4. **Timed Challenges** - Decision countdown timers
5. **Difficulty Modes** - Easy, Normal, Hard, Expert
6. **Achievement System** - 13 unlockable achievements
7. **Tutorial System** - Step-by-step guidance

### Building Mechanics
- **Grid System**: 10x6 grid (responsive: 8x4 on tablet, 6x4 on mobile)
- **Building Types**: Houses, Shops, Factories, Parks, Offices
- **Strategic Placement**: Adjacency bonuses/penalties
- **City Planning Efficiency**: Scored based on layout
- **Undo System**: Limited undo moves per difficulty

### Backend Features
1. **Session Management** - Unique game sessions with UUID
2. **Auto-Save** - Saves every 30 seconds
3. **Leaderboards** - Top scores by difficulty
4. **Analytics** - Aggregate game statistics
5. **Load/Save Games** - Resume progress anytime

## 📡 API Endpoints

```
GET  /api/health                    - Health check
POST /api/game/new                  - Create session
POST /api/game/save                 - Save game state
GET  /api/game/load/:sessionId      - Load game
POST /api/game/complete             - Submit final score
GET  /api/leaderboard               - Top scores
GET  /api/stats/:sessionId          - Player stats
GET  /api/analytics/summary         - Game analytics
```

## 🔧 Tech Stack

**Frontend**:
- Vanilla JavaScript (ES6+)
- CSS3 with animations
- Responsive design (mobile-first)

**Backend**:
- Node.js 20
- Express.js 4.x
- PostgreSQL (Neon)
- node-postgres (pg)
- UUID v4 for sessions

**Packages**:
- express
- cors
- pg (PostgreSQL driver)
- dotenv
- uuid

## 🚀 Development

### Running Locally
```bash
node backend/server.js
```
Server runs on `http://0.0.0.0:5000`

### Database Access
```sql
-- View sessions
SELECT * FROM game_sessions ORDER BY created_at DESC;

-- View leaderboard
SELECT player_name, final_score, difficulty 
FROM game_sessions 
WHERE completed_at IS NOT NULL 
ORDER BY final_score DESC;
```

## 📂 Project Structure

```
.
├── html/
│   ├── index.html          # Main game page
│   ├── game.js             # Game logic (2738 lines)
│   ├── styles.css          # All styles (2168 lines)
│   ├── api-client.js       # Backend API client
│   ├── abc.html            # Original single-file version
│   └── README.md           # Frontend documentation
├── backend/
│   ├── server.js           # Express API server
│   └── init-db.sql         # Database schema
├── BACKEND_FEATURES.md     # Backend API documentation
├── package.json            # Node dependencies
├── server.js               # Legacy server (deprecated)
└── README.md               # Project overview
```

## 🎨 Game Statistics Tracked

1. **Happiness** (0-100) - Citizen satisfaction
2. **City Funds** (0-100) - Available money
3. **Special Interest** (0-100) - Business support
4. **Personal Profit** - Ethical vs corrupt choices
5. **Decisions Made** - Total choices
6. **Play Time** - Time spent playing
7. **Planning Efficiency** - City layout quality

## 🏆 Difficulty Modes

| Mode | Timer | Starting Funds | Relocations | Undo Limit |
|------|-------|----------------|-------------|------------|
| Easy (🌱) | 90s | 80 | 5 | 5 |
| Normal (⚖️) | 60s | 60 | 3 | 3 |
| Hard (🔥) | 40s | 50 | 1 | 1 |
| Expert (⚡) | 25s | 40 | 0 | 0 |

## 📝 Recent Changes

### 2025-10-31: Backend Integration
- ✅ Created Express.js API server
- ✅ Integrated PostgreSQL database
- ✅ Added session management system
- ✅ Implemented auto-save (30s intervals)
- ✅ Built leaderboard system
- ✅ Added analytics endpoints
- ✅ Created API client for frontend
- ✅ Documented all API endpoints

## 🔐 Environment Variables

Automatically provided by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

## 🎯 Future Enhancements

Potential additions:
1. User authentication system
2. Multiplayer competitive mode
3. Social sharing features
4. Admin dashboard
5. AI opponent mayors
6. Replay system
7. Custom scenario editor

## 📚 Documentation

- `BACKEND_FEATURES.md` - Complete backend API guide
- `html/README.md` - Frontend game documentation
- Various guide files in `html/` directory

## 🎓 Educational Purpose

This game teaches:
- Critical thinking and trade-offs
- Civic engagement and political decisions
- Systems thinking
- Ethical leadership
- Resource management

---

**Status**: ✅ Fully functional with backend integration  
**Last Updated**: October 31, 2025
