# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mane Street Mayor** is an interactive browser-based city builder game where players act as the mayor of Tiger Central, making political decisions that affect city happiness, funds, special interests, and personal profit. The game combines narrative storytelling with strategic building placement mechanics.

## Technology Stack

- **Frontend**: Pure HTML/CSS/JavaScript - No frameworks or build tools required
- **Backend**: Node.js with Express, PostgreSQL database
- **Deployment**: Can run client-side only OR with backend for persistence
- **Mobile-responsive** - Touch and desktop support with haptic feedback

## File Structure

```
html/
├── index.html          # Main HTML structure with start screen
├── styles.css          # All CSS styles and animations (~1,450 lines)
├── game.js             # Core game logic (~1,750+ lines)
├── start-screen.js     # Start screen, player setup, settings
├── api-client.js       # Backend API integration and auto-save
└── abc.html            # Original single-file backup version

backend/
└── server.js           # Express server with PostgreSQL integration

package.json            # Node dependencies and scripts
BACKEND_FEATURES.md     # Complete backend API documentation
```

Active development occurs in `html/` (frontend) and `backend/` (server) directories.

## Running the Game

### Option 1: Frontend Only (No Backend)
No build process required! Simply open `html/index.html` in any modern browser:

```bash
# Open directly in browser
open html/index.html

# OR use a simple HTTP server
cd html
python3 -m http.server 8000
# Then visit http://localhost:8000
```

Note: Without backend, game progress won't persist and leaderboard features won't work.

### Option 2: Full Stack (With Backend)
Run the complete application with persistence and leaderboard features:

```bash
# Install dependencies (first time only)
npm install

# Start the backend server (serves frontend + API)
npm start
# OR
node backend/server.js

# Server runs on http://localhost:5000
```

The backend automatically serves the frontend from the `html/` directory and provides REST API endpoints at `/api/*`.

**Environment Requirements:**
- Node.js (for backend)
- PostgreSQL database (configured via `DATABASE_URL` env variable)
- See `package.json` for dependencies: express, cors, pg, uuid, dotenv

## Architecture Overview

### Application Architecture

The game has a **dual-mode architecture**:

1. **Client-Side Mode**: Fully functional standalone game in browser
2. **Full-Stack Mode**: Client + Express backend + PostgreSQL for persistence

**Frontend Flow:**
```
Start Screen (start-screen.js)
    → Player Setup Modal
    → Difficulty Selection
    → API Client Session Creation (api-client.js)
    → Main Game (game.js)
    → Auto-save every 30s
    → Leaderboard on completion
```

**Backend Flow:**
```
Express Server (backend/server.js)
    ↓
Routes: /api/game/*, /api/leaderboard, /api/stats
    ↓
PostgreSQL Database (game_sessions, game_saves)
    ↓
Returns JSON responses to frontend
```

### Game State Management

The entire game state is managed through a single `gameState` object in `game.js`:

```javascript
const gameState = {
    happiness: 75,
    cityFunds: 60,          // Adjusted by difficulty mode
    specialInterest: 50,
    personalProfit: 0,
    currentScene: 'intro',
    timerSeconds: 30,
    timeBank: 0,            // Adjusted by decisions
    cityGrid: [],           // 60 cells (10×6 grid, responsive on mobile)
    unlockedBuildings: [],  // Progressive unlock system
    detectedZones: [],      // Adjacency-based zone detection
    // ... more state properties
};
```

When backend is available, `gameState` is persisted via `gameAPI.saveGame()` and can be restored via `gameAPI.loadGame()`.

### Core Systems

1. **Story/Decision Engine** (`gameData` object)
   - Branching narrative stored in `gameData` object (line ~1866 in game.js)
   - Each scene has: title, story text, choices array
   - Choices lead to `next` scene keys, apply `effects`, and can `unlock` buildings
   - Key functions: `renderScene()`, `makeChoice()`, `loadScene()`

2. **Timer System** (4 visual states)
   - Green (30-15s) → Yellow (15-10s) → Red (10-5s) → Critical (<5s with shake)
   - Time bonuses: +2 points per second remaining after decision
   - Time bank: Good choices add +10s, bad choices subtract -5s
   - Timer pauses during consequence display and mandatory placement
   - **Timeout penalty**: If timer expires before decision is made:
     - Penalties applied: -10 happiness, -5 funds, -8 special interest
     - -10 seconds removed from time bank (next timer starts 10s shorter)
     - No time bonus awarded
     - Game continues on default path (first choice's next scene)
     - User cannot click choices after timer expires
   - Functions: `startTimer()`, `updateTimer()`, `stopTimer()`, `handleTimeout()`

3. **Building/Grid System**
   - 5 building types defined in `buildingTypes` object (line ~150)
   - Each building has: cost, baseEffects, adjacencyBonuses/penalties
   - Grid system: 10×6 desktop (60 cells), 8×4 tablet (32), 6×4 mobile (24)
   - Buildings stored in `gameState.cityGrid` array indexed by cell number
   - Key functions: `createCityGrid()`, `placeBuilding()`, `renderCityGrid()`

4. **Drag-and-Drop System**
   - Dual support: Mouse (desktop) and Touch (mobile)
   - Drag from building palette → preview on grid → drop to place
   - Real-time adjacency preview with green/red cell highlights
   - Cost validation and funds deduction on placement
   - Functions: `initializeDragAndDrop()`, `handleDragStart()`, `handleDrop()`

5. **Adjacency & Zone System**
   - Each building has adjacency rules (e.g., houses get +2 happiness near parks)
   - Zones form when 3+ same buildings are adjacent (e.g., 3+ houses = "Neighborhood")
   - Real-time efficiency calculation (0-100%) based on strategic placement
   - Functions: `calculateAdjacencyBonus()`, `detectZones()`, `calculateEfficiency()`

6. **Progressive Unlock System**
   - Buildings start locked, unlock through story choices
   - Each choice has an `unlocks: ['building1', 'building2']` array
   - Mandatory placement: some choices require immediate building placement
   - Visual unlock animations and palette updates
   - Functions: `unlockBuildings()`, `handleMandatoryPlacement()`

7. **Difficulty Modes** (line ~72)
   - Easy: 90s timer, $80M starting funds, 5 relocations, 5 undos
   - Normal: 60s timer, $60M starting funds, 3 relocations, 3 undos
   - Hard: 40s timer, $40M starting funds, 2 relocations, 2 undos
   - Mayor: 25s timer, $30M starting funds, 1 relocation, 1 undo
   - Affects `gameState` initialization in `selectDifficulty()`

8. **Backend Integration** (api-client.js)
   - Session management with UUID-based session IDs
   - Auto-save system (every 30 seconds when enabled)
   - Game state persistence to PostgreSQL
   - Leaderboard retrieval and ranking
   - Functions: `createNewSession()`, `saveGame()`, `loadGame()`, `completeGame()`, `getLeaderboard()`

9. **Start Screen System** (start-screen.js)
   - Player name input and setup modal
   - Difficulty selection UI
   - Settings management (music/sound toggles, stored in localStorage)
   - Leaderboard display modal
   - Initializes backend session before game starts
   - Functions: `handleConfirmStart()`, `showLeaderboard()`, `updateSettingsUI()`

### Building Types Reference

| Building | Icon | Cost | Base Effect | Adjacency Rules |
|----------|------|------|-------------|-----------------|
| House | 🏠 | $10M | Happiness +5 | +2 happiness near parks |
| Shop | 🏪 | $15M | Funds +5 | +2 funds near houses/offices |
| Factory | 🏭 | $20M | Funds +10, Happiness -5 | -4 happiness near houses/parks |
| Park | 🌳 | $12M | Happiness +8 | +3 happiness near houses/shops |
| Office | 🏢 | $18M | Interest +8 | +2 interest near shops/parks |

### Story Flow

1. **Intro scene** → Difficulty selection
2. **Chapter 1-4**: Branching narrative with choices
3. Each choice:
   - Starts timer (30s base + time bank)
   - Player makes decision
   - Consequence displayed (timer paused)
   - Stats updated, time bonus awarded
   - Buildings unlocked (with animations)
   - Mandatory placement if required (overlay blocks game)
4. **Ending scene**: Final scoring and rating

The story tree branches based on choices (e.g., `choice1` → `choice2A` or `choice2B`). See `gameData` object starting at line 1866 for complete narrative structure.

## Code Organization

### game.js (Core Game Logic)

The file is organized into clearly commented sections:

1. **Mobile Detection** (lines 1-30): `isMobileDevice()`, `getGridSize()`, `triggerHaptic()`
2. **Particle Background** (lines 32-47): Animated background particles
3. **Tooltip System** (lines 49-69): Hover information
4. **Difficulty Modes** (lines 71-118): Mode definitions
5. **Game State** (lines 120-148): Central state object
6. **Building Types** (lines 150-196): Building definitions
7. **Building Palette** (lines 198-245): Sidebar rendering
8. **City Grid** (lines 247-700+): Grid creation, drag-drop, adjacency logic
9. **Timer System** (lines ~800-950): Countdown logic
10. **Zone Detection** (lines ~1000-1150): Adjacency and zone calculations
11. **Efficiency Scoring** (lines ~1150-1330): City planning rating
12. **Achievement System** (lines ~1400-1600): 7 unlockable achievements
13. **Game Data** (lines 1866-2100+): All story content
14. **Scene Rendering** (lines 2104-2198): Display logic
15. **Stats Management** (lines 2074-2103): `updateStats()`, progress bars
16. **Initialization** (end of file): `createParticles()`, `initGame()`

### start-screen.js (Pre-Game UI)

Handles the initial player experience:
- Settings initialization and persistence (localStorage)
- Player name input and validation
- Difficulty button selection and state management
- Modal management (player setup, leaderboard)
- Integration with backend session creation
- Game start transition logic

### api-client.js (Backend Communication)

Provides a clean API wrapper for backend interactions:
- `GameAPI` class with session management
- RESTful endpoint wrappers (POST, GET)
- Auto-save interval management
- LocalStorage integration for session persistence
- Error handling and fallback for offline mode
- All methods return promises for async operations

### backend/server.js (Express Server)

Backend API implementation:
- Express middleware setup (CORS, JSON, static file serving)
- Database connection pooling with pg
- 8 REST endpoints for game operations
- Database schema creation on startup
- Static file serving from `html/` directory
- Cache control headers for development

## Common Development Tasks

### Adding a New Building Type

1. Add to `buildingTypes` object (~line 150):
```javascript
new_building: {
    name: "Building Name",
    icon: "🏛️",
    cost: 20,
    description: "Description here",
    baseEffects: { happiness: 5, cityFunds: 0, specialInterest: 0 },
    adjacencyBonus: {
        near: ['park', 'house'],
        effect: { happiness: 3 }
    },
    adjacencyPenalty: {
        near: ['factory'],
        effect: { happiness: -2 }
    }
}
```

2. Update `renderBuildingPalette()` if needed (auto-generates from buildingTypes)
3. Add unlock logic to relevant story choice in `gameData`

### Adding a New Story Scene

Add to `gameData` object (~line 1866):
```javascript
new_scene_key: {
    chapter: "Chapter X: Title",
    title: "Scene Title",
    story: `<p>Your story HTML here</p>`,
    choices: [
        {
            text: "Choice text",
            icon: "✅",
            effects: { happiness: 10, cityFunds: -5, specialInterest: 0, personalProfit: 0 },
            next: 'next_scene_key',
            consequence: "What happens after this choice",
            unlocks: ['building1', 'building2'],  // Optional
            building: 'factory'  // Optional: mandatory placement
        }
    ]
}
```

Connect to story flow by setting a previous choice's `next` property to your new scene key.

### Modifying Timer Behavior

- Base timer: Change `difficultyModes` object (line 72) → `timerPerScene` property
- Time bonuses: Modify `TIME_BONUS_PER_SECOND` constant in `makeChoice()` function
- Time bank adjustments: Edit `adjustTimeBank()` calls in choice consequence logic
- Visual states: Update threshold checks in `updateTimer()` function

### Adjusting Grid Size

Grid size is responsive based on screen width (see `getGridSize()` at line 7):
- Desktop: 10×6 (60 cells)
- Tablet: 8×4 (32 cells)
- Mobile: 6×4 (24 cells)

To change, modify the `getGridSize()` function return values.

### Modifying Difficulty Modes

Edit `difficultyModes` object (line 72). Properties:
- `timerPerScene`: Seconds per decision
- `startingFunds`: Initial city funds
- `buildingRelocations`: Max building moves
- `undoLimit`: Max undo operations

### Working with Backend API

**Creating a new API endpoint:**

1. Add route in `backend/server.js`:
```javascript
app.post('/api/your-endpoint', async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    const result = await pool.query('SELECT * FROM table WHERE ...', [param1]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

2. Add method in `api-client.js`:
```javascript
async yourMethod(param1, param2) {
  try {
    const response = await fetch(`${API_BASE_URL}/your-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ param1, param2 })
    });
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

3. Call from game code:
```javascript
const result = await gameAPI.yourMethod(value1, value2);
```

**Testing backend endpoints:**
```bash
# Health check
curl http://localhost:5000/api/health

# Create session
curl -X POST http://localhost:5000/api/game/new \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test","difficulty":"normal"}'

# Get leaderboard
curl http://localhost:5000/api/leaderboard?limit=5
```

## Important Functions Reference

### Game Logic (game.js)
- `updateStats()`: Updates all stat displays and progress bars (line 2074)
- `renderScene(sceneKey)`: Loads and displays a story scene (line 2104)
- `makeChoice(sceneKey, choiceIndex)`: Processes player decision (line 2199)
- `calculateEfficiency()`: Computes city planning score 0-100% (line 1331)
- `detectZones()`: Identifies formed zones from adjacency (line ~1000)
- `unlockBuildings(buildingIds)`: Unlocks buildings with animations (in choice processing)
- `startTimer()`, `stopTimer()`, `handleTimeout()`: Timer lifecycle management

### Start Screen (start-screen.js)
- `initializeStartScreen()`: Sets up event listeners and UI state
- `handleConfirmStart()`: Validates input, creates backend session, starts game
- `showLeaderboard()`: Fetches and displays top scores via API
- `updateSettingsUI()`: Syncs UI with localStorage settings
- `toggleMusic()`, `toggleSound()`: Settings management

### Backend API (api-client.js)
- `createNewSession(playerName, difficulty)`: Creates game session, returns session ID
- `saveGame(gameState, score, currentScene)`: Persists current game state
- `loadGame(sessionId)`: Retrieves saved game data
- `completeGame(finalStats)`: Submits final score and stats
- `getLeaderboard(difficulty, limit)`: Fetches top scores
- `startAutoSave(stateFn, scoreFn, sceneFn)`: Begins 30s auto-save interval
- `stopAutoSave()`: Clears auto-save interval

## Debugging Tips

### Frontend Debugging
1. **Check browser console** for all game events (extensive logging built-in)
2. **Inspect `gameState`**: Type `gameState` in console to see full state
3. **Manual scene navigation**: Use `loadScene('scene_key')` in console
4. **Check grid state**: `gameState.cityGrid` shows all placed buildings
5. **Unlock all buildings**: `gameState.unlockedBuildings = ['house', 'shop', 'factory', 'park', 'office']`
6. **Check session**: `gameAPI.sessionId` to see current session ID
7. **Check localStorage**: `localStorage.getItem('manestreet_session_id')`

### Backend Debugging
1. **Check server status**: `curl http://localhost:5000/api/health`
2. **View server logs**: Console output shows all API requests and database queries
3. **Query database directly**: Use PostgreSQL client or Replit database console
4. **Test endpoints**: Use curl or Postman (see BACKEND_FEATURES.md for examples)
5. **Check environment vars**: Ensure `DATABASE_URL` is set correctly
6. **View recent sessions**:
   ```sql
   SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 10;
   ```
7. **View saved games**:
   ```sql
   SELECT session_id, score, current_scene FROM game_saves ORDER BY saved_at DESC;
   ```

## Mobile Considerations

- Touch events handled separately from mouse events (see `initializeDragAndDrop()`)
- Haptic feedback on supported devices via `triggerHaptic()`
- Reduced particles on mobile for performance (15 vs 30)
- Grid resizes responsively (6×4 on phones)
- All buttons and touch targets are large enough (min 44×44px)

## Achievement System

7 achievements unlock based on gameplay:
1. First building placed
2. 5 buildings of same type
3. Form a zone
4. 10+ buildings total
5. Make 10 decisions
6. 80%+ efficiency rating
7. (See achievement definitions in game.js ~line 1400)

Check via `gameState.unlockedAchievements` array.

## Backend API Endpoints

The backend provides 8 REST endpoints (see BACKEND_FEATURES.md for complete documentation):

1. `GET /api/health` - Health check
2. `POST /api/game/new` - Create new game session
3. `POST /api/game/save` - Save game state
4. `GET /api/game/load/:sessionId` - Load saved game
5. `POST /api/game/complete` - Submit final score
6. `GET /api/leaderboard?difficulty=X&limit=Y` - Get top scores
7. `GET /api/stats/:sessionId` - Get session statistics
8. `GET /api/analytics/summary` - Get aggregate analytics

**Database Schema:**
- `game_sessions` table: Player sessions, scores, stats, timestamps
- `game_saves` table: JSONB game state snapshots for save/load

## Notes for AI Development

- **Dual-mode architecture**: Game works standalone (client-only) or with backend (full-stack)
- **No transpilation needed**: Frontend runs directly in browser, backend is plain Node.js
- **State is centralized**: Almost all game logic reads/writes `gameState` object
- **Modular functions**: Each system (game, start-screen, api-client) has clear boundaries
- **Visual feedback**: Every action has toast notifications, animations, or color changes
- **Extensive comments**: All JS files have section headers and inline documentation
- **API-first backend**: Clean REST API with consistent JSON responses
- **Graceful degradation**: Frontend handles backend unavailability (offline mode)
- **Educational purpose**: Game teaches civic engagement and decision-making tradeoffs
- **Session persistence**: Backend stores full game state as JSONB for flexible queries
- **Auto-save system**: Transparent to gameplay, runs every 30s when enabled
