# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mane Street Mayor** is an interactive browser-based city builder game where players act as the mayor of Tiger Central, making political decisions that affect city happiness, funds, special interests, and personal profit. The game combines narrative storytelling with strategic building placement mechanics.

## Technology Stack

- **Pure HTML/CSS/JavaScript** - No frameworks or build tools
- **Runs entirely client-side** - Static files, no server required
- **Mobile-responsive** - Touch and desktop support with haptic feedback

## File Structure

```
html/
├── index.html       # Main HTML structure (179 lines)
├── styles.css       # All CSS styles and animations (~1,450 lines)
├── game.js          # Complete game logic (~1,750+ lines)
└── abc.html         # Original single-file backup version
```

All active development occurs in the `html/` directory with the three-file structure.

## Running the Game

**No build process required!** Simply open `html/index.html` in any modern browser:

```bash
# Option 1: Open directly
open html/index.html

# Option 2: Use a local server (optional)
cd html
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Architecture Overview

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

## Code Organization in game.js

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

## Important State Functions

- `updateStats()`: Updates all stat displays and progress bars (line 2074)
- `renderScene(sceneKey)`: Loads and displays a story scene (line 2104)
- `makeChoice(sceneKey, choiceIndex)`: Processes player decision (line 2199)
- `calculateEfficiency()`: Computes city planning score 0-100% (line 1331)
- `detectZones()`: Identifies formed zones from adjacency (line ~1000)
- `unlockBuildings(buildingIds)`: Unlocks buildings with animations (in choice processing)

## Debugging Tips

1. **Check browser console** for all game events (extensive logging built-in)
2. **Inspect `gameState`**: Type `gameState` in console to see full state
3. **Manual scene navigation**: Use `loadScene('scene_key')` in console
4. **Check grid state**: `gameState.cityGrid` shows all placed buildings
5. **Unlock all buildings**: `gameState.unlockedBuildings = ['house', 'shop', 'factory', 'park', 'office']`

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

## Notes for AI Development

- **No transpilation needed**: All code runs directly in browser
- **State is centralized**: Almost all game logic reads/writes `gameState`
- **Modular functions**: Each system has clear function boundaries
- **Visual feedback**: Every action has toast notifications, animations, or color changes
- **Extensive comments**: game.js has section headers and inline documentation
- **Educational purpose**: Game teaches civic engagement and decision-making tradeoffs
