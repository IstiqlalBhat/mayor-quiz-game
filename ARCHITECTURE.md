# ManeStreet Mayor - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [File Structure](#file-structure)
4. [Game Architecture](#game-architecture)
5. [Module System](#module-system)
6. [game.js Deep Dive](#gamejs-deep-dive)
7. [Game State](#game-state)
8. [Difficulty Modes](#difficulty-modes)
9. [Building System](#building-system)
10. [Grid & Feature System](#grid--feature-system)
11. [Decision Tree System](#decision-tree-system)
12. [Timer System](#timer-system)
13. [Drag and Drop Mechanics](#drag-and-drop-mechanics)
14. [Advisor & Narrative System](#advisor--narrative-system)
15. [Audio System](#audio-system)
16. [Achievement System](#achievement-system)
17. [Scoring System](#scoring-system)
18. [Backend Architecture](#backend-architecture)
19. [Data Flow](#data-flow)
20. [Complete Story Content](#complete-story-content)

---

## Overview

**ManeStreet** is an interactive city-building narrative game where players act as the mayor of Tiger Central, making political decisions that affect city happiness, funds, special interests, and personal profit. The game combines narrative storytelling with strategic building placement mechanics across **two chapters**.

**Core Gameplay Loop:**
```
Story Scene -> Make Decision (timed) -> See Consequences ->
-> Unlock Buildings -> Place Buildings on Grid ->
-> Apply Adjacency Effects -> Next Story Scene
```

**Chapter Structure:**
- **Chapter 1: Economic Opportunity** - 14 reachable endings, focuses on factory decision and unemployment
- **Chapter 2: The Great Storm** - 16 endings, focuses on disaster response and crisis management
- Chapter 2 unlocks only if score >= 45 with no critical failures in Chapter 1

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Pure HTML5 / CSS3 / JavaScript (ES6+) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL with JSONB |
| Styling | CSS3 with animations, gradients, flexbox/grid |
| Audio | Web Audio API with audio pooling |
| Mobile | Touch events + Haptic feedback API |

**No build tools required** - game runs directly in browser or via Node.js server.

---

## File Structure

```
mayor-quiz-game/
├── html/                           # Frontend Application
│   ├── index.html                  # Main HTML structure
│   ├── styles.css                  # All CSS styles and animations (~2000 lines)
│   ├── game.js                     # Core game logic (5,313 lines)
│   ├── start-screen.js             # Start screen, player setup, settings
│   ├── api-client.js               # Backend API integration
│   ├── audio-manager.js            # Music and sound effects system
│   ├── narrative-manager.js        # Advisor dialogues and typewriter effects
│   ├── audio/                      # Audio assets
│   │   ├── music/                  # Background music tracks
│   │   └── sfx/                    # Sound effects
│   └── assets/                     # Visual assets
│       ├── characters/             # Advisor portraits
│       └── pngs/                   # Achievement images
│
├── backend/
│   ├── server.js                   # Express server with PostgreSQL
│   └── init-db.sql                 # Database initialization
│
├── server.js                       # Entry point (redirects to backend/server.js)
├── package.json                    # Node dependencies
├── CLAUDE.md                       # AI assistant instructions
├── Architecture.MD                 # This file
└── BACKEND_FEATURES.md             # Complete API documentation
```

---

## Game Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │  start-screen.js │   │  audio-manager.js │   │  api-client.js   │        │
│  │  - Player setup  │   │  - Music playback │   │  - Session mgmt  │        │
│  │  - Difficulty    │   │  - SFX with pool  │   │  - Auto-save     │        │
│  │  - Leaderboard   │   │  - Audio queue    │   │  - Leaderboard   │        │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘        │
│           │                      │                       │                   │
│           └──────────────────────┼───────────────────────┘                   │
│                                  │                                           │
│                                  ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         game.js (Core Engine)                        │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                      gameState Object                         │   │   │
│  │  │  - happiness, cityFunds, specialInterest, personalProfit     │   │   │
│  │  │  - cityGrid[] (60/32/24 cells), gridFeatures[]               │   │   │
│  │  │  - decisions[], achievements[], unlockedBuildings[]           │   │   │
│  │  │  - timerSeconds, timeBankSeconds, difficulty                  │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐    │   │
│  │  │  buildingTypes │  │  gridFeatures  │  │     gameData       │    │   │
│  │  │  (12 types)    │  │  (10 types)    │  │  (story scenes)    │    │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │narrative-manager │                                                       │
│  │  - 3 Advisors    │                                                       │
│  │  - Typewriter FX │                                                       │
│  │  - Dialogue queue│                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            BACKEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Express Server (backend/server.js)                │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │  REST API Endpoints                                           │   │   │
│  │  │  - POST /api/game/new       - Create session                  │   │   │
│  │  │  - POST /api/game/save      - Save game state                 │   │   │
│  │  │  - GET  /api/game/load/:id  - Load saved game                 │   │   │
│  │  │  - POST /api/game/complete  - Submit final score              │   │   │
│  │  │  - GET  /api/leaderboard    - Get top scores                  │   │   │
│  │  │  - GET  /api/stats/:id      - Get session stats               │   │   │
│  │  │  - GET  /api/analytics      - Get game analytics              │   │   │
│  │  │  - GET  /api/health         - Health check                    │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                       │   │
│  │                              ▼                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                      PostgreSQL Database                      │   │   │
│  │  │  - game_sessions (player data, scores, achievements)          │   │   │
│  │  │  - game_saves (JSONB game state snapshots)                    │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module System

### JavaScript Modules (Load Order)

```html
<script src="api-client.js"></script>      <!-- 1. Backend communication -->
<script src="audio-manager.js"></script>   <!-- 2. Audio system -->
<script src="narrative-manager.js"></script><!-- 3. Advisor dialogues -->
<script src="start-screen.js"></script>    <!-- 4. Pre-game UI -->
<script src="game.js"></script>            <!-- 5. Core game engine -->
```

### Module Responsibilities

| Module | Global Object | Purpose |
|--------|---------------|---------|
| api-client.js | `gameAPI` | REST API wrapper, session management, auto-save |
| audio-manager.js | `audioManager` | Music playback, SFX with audio pooling, volume control |
| narrative-manager.js | `narrativeManager` | Advisor dialogues, typewriter effects, stat warnings |
| start-screen.js | `gameSettings` | Start screen UI, difficulty selection, leaderboard modal |
| game.js | `gameState`, `gameData` | Core game logic, state management, rendering |

---

## game.js Deep Dive

The `game.js` file is the heart of the application at **5,313 lines**. It is organized into clearly commented sections for maintainability.

### File Structure Map

```
game.js (5,313 lines)
│
├── SECTION 1: MOBILE & DEVICE DETECTION (Lines 1-30)
│   ├── isMobileDevice()          - Detect mobile browsers
│   ├── getGridSize()             - Return responsive grid dimensions
│   └── triggerHaptic(type)       - Vibration feedback API
│
├── SECTION 2: VISUAL EFFECTS (Lines 32-69)
│   ├── createParticles()         - Animated background particles
│   └── initializeTooltips()      - Hover tooltip system
│
├── SECTION 3: DIFFICULTY MODES (Lines 71-117)
│   └── difficultyModes {}        - 4 difficulty configurations
│
├── SECTION 4: GAME STATE (Lines 119-159)
│   └── gameState {}              - Central state object (30+ properties)
│
├── SECTION 5: BUILDING SYSTEM (Lines 161-554)
│   ├── buildingTypes {}          - 12 building definitions
│   ├── gridFeatures {}           - 10 environmental features
│   ├── buildingPalette []        - Renderable building list
│   └── adjacencyRules {}         - Bonus/penalty configurations
│
├── SECTION 6: GRID FEATURES (Lines 556-763)
│   ├── placeGridFeature()        - Add features to grid
│   ├── replaceGridFeature()      - Swap features (river → polluted)
│   ├── getCellsAdjacentToFeature() - Find cells near features
│   └── Pattern generators:
│       ├── generateRiverPattern()
│       ├── generateForestPattern()
│       ├── generateMountainPattern()
│       └── generateHighwayPattern()
│
├── SECTION 7: BUILDING PALETTE (Lines 765-937)
│   ├── renderBuildingPalette()   - Display available buildings
│   ├── updateBuildingPalette()   - Refresh affordability states
│   └── Drag event setup for building cards
│
├── SECTION 8: CITY GRID SYSTEM (Lines 939-1154)
│   ├── createCityGrid()          - Generate responsive grid
│   ├── renderCityGrid()          - Display grid with buildings
│   ├── placeInitialCityHall()    - Pre-place city hall feature
│   ├── placeInitialRiver()       - Pre-place river feature
│   └── placeInitialNeighborhood() - Pre-place neighborhood
│
├── SECTION 9: TOUCH SUPPORT (Lines 1155-1388)
│   ├── handleTouchStart()        - Begin touch drag
│   ├── handleTouchMove()         - Track finger movement
│   ├── handleTouchEnd()          - Complete touch placement
│   └── Touch-specific adjacency preview
│
├── SECTION 10: GRID DRAG/DROP (Lines 1390-1633)
│   ├── handleGridDragOver()      - Hover preview
│   ├── handleGridDragLeave()     - Clear preview
│   ├── handleGridDrop()          - Complete placement
│   └── Building move/relocation logic
│
├── SECTION 11: BUILDING PLACEMENT (Lines 1635-1701)
│   ├── placeBuilding()           - Add building to grid
│   ├── removeBuilding()          - Remove building from grid
│   └── buildingHistory management for undo
│
├── SECTION 12: ADJACENCY SYSTEM (Lines 1703-1882)
│   ├── getAdjacentCells()        - Get 4-directional neighbors
│   ├── calculateAdjacency()      - Compute all bonuses/penalties
│   ├── applyAdjacencyEffects()   - Apply to game state
│   ├── reverseAdjacencyEffects() - Undo when removing
│   ├── previewAdjacency()        - Non-applying preview
│   ├── getAdjacencyHighlights()  - Visual feedback cells
│   └── applyBuildingEffects()    - Base stat changes
│
├── SECTION 13: UI FEEDBACK (Lines 1884-2090)
│   ├── showToast()               - Notification popups
│   ├── repositionToasts()        - Stack multiple toasts
│   ├── showCelebration()         - Placement particles
│   ├── showConfetti()            - Achievement/zone celebration
│   ├── showFloatingNumber()      - Money change indicators
│   └── updateWeather()           - Rain/sunshine based on happiness
│
├── SECTION 14: BUILDING MANAGEMENT (Lines 2092-2298)
│   ├── openActionMenu()          - Building context menu
│   ├── closeActionMenu()         - Hide context menu
│   ├── sellBuilding()            - 50% refund removal
│   ├── reverseBuildingEffects()  - Undo base effects
│   ├── showBuildingTooltip()     - Hover info display
│   ├── showFeatureTooltip()      - Feature hover info
│   ├── undoLastPlacement()       - Revert last placement
│   └── updateUndoButton()        - Undo UI state
│
├── SECTION 15: MANDATORY PLACEMENT (Lines 2300-2441)
│   ├── showUnlockNotification()  - Building unlock toast
│   ├── showMandatoryPlacementOverlay() - Force placement UI
│   ├── hideMandatoryPlacementOverlay() - Clear overlay
│   ├── completeMandatoryPlacement() - Continue after placement
│   ├── renderBankruptcyEnding()  - Handle insufficient funds
│   └── handleOccupiedDragStart/End() - Move existing buildings
│
├── SECTION 16: ZONES & EFFICIENCY (Lines 2443-2610)
│   ├── detectZones()             - Find 3+ adjacent same buildings
│   ├── calculateEfficiency()     - 0-100% planning score
│   ├── applyZoneBonuses()        - Zone stat bonuses
│   └── updateEfficiencyDisplay() - Update UI indicator
│
├── SECTION 17: ACHIEVEMENTS (Lines 2612-2812)
│   ├── achievementDefinitions {} - 10 achievement configs
│   ├── checkAchievements()       - Evaluate all conditions
│   ├── unlockAchievement()       - Award achievement
│   └── updateAchievementCounter() - UI counter update
│
├── SECTION 18: TIMER SYSTEM (Lines 2870-3111)
│   ├── getTimerDuration()        - Get difficulty-based duration
│   ├── startTimer()              - Begin countdown
│   ├── stopTimer()               - Halt countdown
│   ├── pauseTimer()              - Temporary pause
│   ├── resumeTimer()             - Continue from pause
│   ├── updateTimerDisplay()      - Visual updates + audio hooks
│   ├── handleTimeout()           - Penalty for indecision
│   ├── getCurrentSceneKey()      - Current scene accessor
│   └── setCurrentSceneKey()      - Current scene setter
│
├── SECTION 19: GAME DATA (Lines 3113-3625)
│   └── gameData {}               - Complete story content
│       ├── intro                 - Welcome scene
│       ├── choice1               - First decision (factory)
│       ├── choice2A/2B           - Branch paths
│       ├── choice3A1/3B1/3B2     - Third layer
│       ├── choice4A11-4B22       - Fourth layer
│       ├── chapter1_ending       - Chapter 1 summary
│       ├── chapter2_intro        - Storm warning
│       ├── ch2_* scenes          - Chapter 2 branches (15 scenes)
│       └── ending                - Final scene
│
├── SECTION 20: STATS MANAGEMENT (Lines 3627-3683)
│   ├── updateStats()             - Clamp and display stats
│   └── applyEffects()            - Apply choice effects with animation
│
├── SECTION 21: SCENE RENDERING (Lines 3685-3950)
│   ├── renderScene()             - Display story scene
│   ├── makeChoice()              - Process player decision
│   │   ├── Time bonus calculation
│   │   ├── Decision tracking
│   │   ├── Building unlocks
│   │   ├── Feature placement
│   │   ├── Feature replacement
│   │   └── Achievement tags
│   └── Tutorial integration hook
│
├── SECTION 22: CONSEQUENCES (Lines 3950-4300)
│   ├── showConsequence()         - Display choice results
│   ├── handleContinueAfterConsequence() - Next scene logic
│   └── Time bank adjustments
│
├── SECTION 23: ENDING SCREENS (Lines 4300-4800)
│   ├── renderChapter1Ending()    - Chapter 1 results + chapter 2 gate
│   ├── renderEnding()            - Final game results
│   ├── calculateFinalScore()     - Score computation
│   ├── checkFinalAchievements()  - End-game achievement check
│   └── Results tabs (stats, achievements, zones)
│
├── SECTION 24: TUTORIAL SYSTEM (Lines 4800-5038)
│   ├── tutorialSteps []          - 7 tutorial step definitions
│   ├── checkFirstTime()          - LocalStorage check
│   ├── startTutorial()           - Begin tutorial flow
│   ├── showTutorialStep()        - Display step with highlight
│   ├── nextTutorialStep()        - Advance tutorial
│   ├── skipTutorial()            - Skip option
│   └── completeTutorial()        - End tutorial, give bonus
│
├── SECTION 25: GAME CONTROLS (Lines 5040-5080)
│   ├── startGame()               - Legacy game start
│   ├── toggleQuiz()              - Show/hide decision overlay
│   └── initializeQuizToggle()    - Quiz toggle setup
│
├── SECTION 26: RESPONSIVE HANDLING (Lines 5082-5197)
│   ├── handleOrientationChange() - Debounced resize handler
│   ├── Grid recreation on resize
│   └── Feature re-placement for new dimensions
│
├── SECTION 27: PALETTE CONTROLS (Lines 5199-5264)
│   ├── togglePaletteSize()       - Collapse/expand building palette
│   └── switchResultsTab()        - End screen tab switching
│
└── SECTION 28: INITIALIZATION (Lines 5266-5313)
    ├── DOMContentLoaded handler  - UI setup
    │   ├── createParticles()
    │   ├── initializeTooltips()
    │   ├── placeInitialCityHall()
    │   ├── placeInitialRiver()
    │   ├── placeInitialNeighborhood()
    │   ├── renderBuildingPalette()
    │   └── renderCityGrid()
    └── initializeGame()          - Called from start-screen.js
```

### Key Objects Reference

#### `gameState` (Central State)
```javascript
gameState = {
    // Stats (0-100)
    happiness, cityFunds, specialInterest, personalProfit,

    // Scene tracking
    currentScene, decisions[],

    // Timer
    timerSeconds, isTimerRunning, timerInterval,
    timerExpired, choiceMade, timeBonus, timeBankSeconds,

    // Grid (60/32/24 cells)
    cityGrid[], gridFeatures[], buildingHistory[],

    // Buildings
    unlockedBuildings[], pendingBuildingPlacement,
    awaitingPlacement, placementConstraints,

    // Planning
    undoCount, maxRelocations, relocationsUsed,
    planningEfficiency, detectedZones[],

    // Achievements
    achievements[], achievementTracking{},

    // Difficulty & timing
    difficulty, gameStartTime, gameEndTime
}
```

#### `buildingTypes` (12 Buildings)
```javascript
buildingTypes = {
    // Chapter 1 (5)
    house:   { cost: 10, effects: {happiness: +5} },
    shop:    { cost: 15, effects: {happiness: +3, funds: +5, interest: +3} },
    factory: { cost: 20, effects: {funds: +10, happiness: -5, interest: +15} },
    park:    { cost: 12, effects: {happiness: +8} },
    office:  { cost: 18, effects: {funds: +5, interest: +8} },

    // Chapter 2 (7)
    shelter: { cost: 12, effects: {happiness: +8, interest: +5} },
    police:  { cost: 15, effects: {happiness: +5, funds: -5, interest: +10} },
    hospital:{ cost: 22, effects: {happiness: +15, funds: -10} },
    school:  { cost: 18, effects: {happiness: +12, funds: -8, interest: -5} },
    event_venue: { cost: 20, effects: {happiness: +10, funds: +5, interest: +8} },
    water_pump:  { cost: 14, effects: {happiness: +5, funds: -5, interest: +3} },
    skyscraper:  { cost: 25, effects: {happiness: -5, funds: +15, interest: +15} }
}
```

#### `gridFeatures` (10 Features)
```javascript
gridFeatures = {
    river:          { icon: '🌊', buildable: false },
    polluted_river: { icon: '🌊', buildable: false, polluted: true },
    mountain:       { icon: '⛰️', buildable: false },
    highway:        { icon: '🛣️', buildable: false },
    protected_forest: { icon: '🌲', buildable: false },
    city_hall:      { icon: '🏛️', buildable: false },
    existing_neighborhood: { icon: '🏘️', buildable: false, isBuilding: true },
    flooded_area:   { icon: '🌊', buildable: false },
    storm_damage:   { icon: '💥', buildable: true }
}
```

#### `gameData` (Story Scenes)
```javascript
gameData = {
    // Chapter 1 (15 scenes, 14 endings)
    intro, choice1,
    choice2A, choice2B,
    choice3A1, choice3A2, choice3B1, choice3B2,
    choice4A11, choice4A12, choice4A21, choice4A22, choice4A23,
    choice4B11, choice4B12, choice4B21, choice4B22,
    chapter1_ending,

    // Chapter 2 (15 scenes, 16 endings)
    chapter2_intro,
    ch2_evacuated_flood, ch2_stayed_flood,
    ch2_recovery_budget, ch2_pr_victims_waiting,
    ch2_active_response, ch2_neglect_worsens,
    ch2_donor_pressure, ch2_federal_oversight,
    ch2_late_redemption, ch2_corruption_exposed,
    ch2_thorough_finish, ch2_incomplete_recovery,
    ch2_too_little_late, ch2_recall_petition,
    ending
}
```

### Function Call Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAME INITIALIZATION                               │
├─────────────────────────────────────────────────────────────────────┤
│ DOMContentLoaded                                                     │
│     ├── createParticles()                                           │
│     ├── initializeTooltips()                                        │
│     ├── placeInitialCityHall() → placeGridFeature()                 │
│     ├── placeInitialRiver()    → placeGridFeature()                 │
│     ├── placeInitialNeighborhood() → placeGridFeature()             │
│     ├── renderBuildingPalette()                                     │
│     ├── renderCityGrid()                                            │
│     └── updateUndoButton()                                          │
│                                                                      │
│ User clicks "Start Game" in start-screen.js                         │
│     └── initializeGame()                                            │
│             └── renderScene('intro')                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SCENE RENDERING FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│ renderScene(sceneKey)                                                │
│     ├── stopTimer()                                                 │
│     ├── setCurrentSceneKey()                                        │
│     ├── narrativeManager.clearDialogueQueue()                       │
│     ├── Build HTML for story + choices                              │
│     │     └── narrativeManager.generateChoiceCardWithAdvisors()     │
│     ├── narrativeManager.reactToScene()                             │
│     └── startTimer()                                                │
│                                                                      │
│ startTimer()                                                         │
│     ├── getTimerDuration()                                          │
│     ├── setInterval for countdown                                   │
│     └── updateTimerDisplay() each second                            │
│             └── audioManager.playTimerWarning/Danger/Critical()     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    CHOICE MAKING FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│ makeChoice(sceneKey, choiceIndex)                                    │
│     ├── stopTimer()                                                 │
│     ├── Calculate time bonus                                        │
│     ├── Track decision in gameState.decisions[]                     │
│     ├── Handle building unlocks                                     │
│     │     ├── Add to gameState.unlockedBuildings[]                  │
│     │     ├── showUnlockNotification()                              │
│     │     └── renderBuildingPalette()                               │
│     ├── Handle feature placement                                    │
│     │     └── placeGridFeature() with pattern                       │
│     ├── Handle feature replacement                                  │
│     │     └── replaceGridFeature()                                  │
│     ├── showConsequence()                                           │
│     │                                                               │
│ showConsequence()                                                    │
│     ├── Pause for 2.5s reading time                                 │
│     ├── narrativeManager.reactToChoice()                            │
│     └── Show "Continue" button                                      │
│                                                                      │
│ handleContinueAfterConsequence()                                     │
│     ├── If mandatory building:                                      │
│     │     ├── showMandatoryPlacementOverlay()                       │
│     │     └── Wait for building placement                           │
│     └── Else: renderScene(nextScene)                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    BUILDING PLACEMENT FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│ User drags building from palette                                     │
│     ├── handleDragStart() / handleTouchStart()                      │
│     └── Set currentDraggedBuilding                                  │
│                                                                      │
│ User hovers over grid cell                                           │
│     ├── handleGridDragOver() / handleTouchMove()                    │
│     ├── Check if valid placement                                    │
│     │     ├── Cell empty?                                           │
│     │     ├── Sufficient funds?                                     │
│     │     └── Meets constraints?                                    │
│     └── getAdjacencyHighlights() for preview                        │
│                                                                      │
│ User drops building                                                  │
│     ├── handleGridDrop() / handleTouchEnd()                         │
│     ├── Deduct cost from cityFunds                                  │
│     ├── applyBuildingEffects()                                      │
│     ├── placeBuilding()                                             │
│     │     ├── Add to cityGrid[]                                     │
│     │     ├── Add to buildingHistory[]                              │
│     │     └── audioManager.playBuildingPlace()                      │
│     ├── applyAdjacencyEffects()                                     │
│     ├── showCelebration()                                           │
│     ├── detectZones()                                               │
│     │     └── If new zone: showToast() + applyZoneBonuses()         │
│     ├── updateStats()                                               │
│     ├── updateEfficiencyDisplay()                                   │
│     ├── checkAchievements()                                         │
│     └── If mandatory: completeMandatoryPlacement()                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    ENDING FLOW                                       │
├─────────────────────────────────────────────────────────────────────┤
│ renderChapter1Ending() / renderEnding()                              │
│     ├── calculateFinalScore()                                       │
│     │     ├── Base score (stats average × 0.70)                     │
│     │     ├── Time bonus (× 0.15)                                   │
│     │     ├── Achievement bonus (× 0.10)                            │
│     │     ├── Efficiency bonus (× 0.05)                             │
│     │     └── Corruption penalty                                    │
│     ├── checkFinalAchievements()                                    │
│     ├── Determine rating tier                                       │
│     ├── gameAPI.completeGame()                                      │
│     └── Display results with tabs                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Game State

The central `gameState` object manages all game data:

```javascript
const gameState = {
    // ==================== CORE STATS ====================
    happiness: 50,           // Citizen happiness (0-100)
    cityFunds: 50,           // Available money (adjusted by difficulty)
    specialInterest: 50,     // Business/stakeholder support (0-100)
    personalProfit: 0,       // Mayor's personal gain (affects score)

    // ==================== SCENE MANAGEMENT ====================
    currentScene: 'intro',   // Current story scene key
    decisions: [],           // Array of decisions made

    // ==================== TIMER SYSTEM ====================
    timerSeconds: 30,        // Current countdown value
    isTimerRunning: false,   // Timer active state
    timerInterval: null,     // Interval reference
    timerExpired: false,     // Did timer run out?
    choiceMade: false,       // Prevent double-clicks
    timeBonus: 0,            // Total time bonus accumulated
    timeBankSeconds: 0,      // Bonus seconds (affects scoring)
    currentDecisionTime: 0,  // Starting time for current decision

    // ==================== GRID SYSTEM ====================
    cityGrid: Array(60).fill(null),  // Responsive: 60/32/24 cells
    gridFeatures: [],                 // Placed environmental features
    buildingHistory: [],              // Last placements for undo

    // ==================== BUILDING SYSTEM ====================
    unlockedBuildings: [],            // Buildings available to place
    pendingBuildingPlacement: null,   // Mandatory placement data
    awaitingPlacement: false,         // Waiting for mandatory placement?
    placementConstraints: null,       // Placement restrictions

    // ==================== PLANNING SYSTEM ====================
    undoCount: 3,                     // Undo operations remaining
    maxRelocations: 3,                // Max relocations allowed
    relocationsUsed: 0,               // Relocations used
    planningEfficiency: 0,            // City efficiency score (0-100)
    detectedZones: [],                // Formed zones

    // ==================== ACHIEVEMENTS ====================
    achievements: [],                 // Unlocked achievement IDs
    achievementTracking: {
        builtNearRiver: false,
        rejectedFactory: false,
        neverTimedOut: true,
        usedNoUndos: true,
        usedNoRelocations: true
    },

    // ==================== DIFFICULTY ====================
    difficulty: null,        // Selected difficulty mode object
    gameStartTime: null,     // Game start timestamp
    gameEndTime: null        // Game end timestamp
};
```

---

## Difficulty Modes

Four difficulty modes affect gameplay parameters:

| Mode | Icon | Timer | Starting Funds | Relocations | Undos |
|------|------|-------|----------------|-------------|-------|
| **Relaxed Mayor** | 🌱 | 45s | $100M | 5 | 5 |
| **Working Mayor** | ⚖️ | 30s | $80M | 3 | 3 |
| **Under Pressure** | 🔥 | 20s | $70M | 1 | 2 |
| **Mayor Speedrun** | ⚡ | 15s | $60M | 0 | 1 |

```javascript
const difficultyModes = {
    easy: {
        id: 'easy',
        name: "Relaxed Mayor",
        icon: "🌱",
        color: "#4caf50",
        timerPerScene: 45,
        startingFunds: 100,
        buildingRelocations: 5,
        undoLimit: 5,
        description: "Take your time and experiment"
    },
    normal: {
        id: 'normal',
        name: "Working Mayor",
        icon: "⚖️",
        color: "#2196f3",
        timerPerScene: 30,
        startingFunds: 80,
        buildingRelocations: 3,
        undoLimit: 3,
        description: "Balanced challenge"
    },
    hard: {
        id: 'hard',
        name: "Under Pressure",
        icon: "🔥",
        color: "#ff9800",
        timerPerScene: 20,
        startingFunds: 70,
        buildingRelocations: 1,
        undoLimit: 2,
        description: "Quick decisions, tough choices"
    },
    expert: {
        id: 'expert',
        name: "Mayor Speedrun",
        icon: "⚡",
        color: "#f44336",
        timerPerScene: 15,
        startingFunds: 60,
        buildingRelocations: 0,
        undoLimit: 1,
        description: "No mistakes allowed!"
    }
};
```

---

## Building System

### Building Types (12 Total)

#### Chapter 1 Buildings (5)

| Building | Icon | Cost | Base Effects | Adjacency Bonus | Adjacency Penalty |
|----------|------|------|--------------|-----------------|-------------------|
| House | 🏠 | $10M | Happiness +5 | +2 near park/shop/school | -4 near factory/skyscraper |
| Shop | 🏪 | $15M | Happiness +3, Funds +5, Interest +3 | +2 funds near house/office | - |
| Factory | 🏭 | $20M | Happiness -5, Funds +10, Interest +15 | +5 funds near river | -4 happiness near house/park |
| Park | 🌳 | $12M | Happiness +8 | +3 near house/school/hospital | -3 near factory/skyscraper |
| Office | 🏢 | $18M | Funds +5, Interest +8 | +2 interest near shop/park | - |

#### Chapter 2 Buildings (7)

| Building | Icon | Cost | Base Effects | Adjacency Bonus |
|----------|------|------|--------------|-----------------|
| Shelter | 🏕️ | $12M | Happiness +8, Interest +5 | +6 near house/hospital/flooded |
| Police | 🚓 | $15M | Happiness +5, Funds -5, Interest +10 | +4 near house/shop/flooded |
| Hospital | 🏥 | $22M | Happiness +15, Funds -10 | +10 near house/shelter/flooded |
| School | 🏫 | $18M | Happiness +12, Funds -8, Interest -5 | +6 near house/park |
| Event Venue | 🎪 | $20M | Happiness +10, Funds +5, Interest +8 | +4/+5 near park/shop/office |
| Water Pump | 💧 | $14M | Happiness +5, Funds -5, Interest +3 | +8/+5 near flooded/river |
| Skyscraper | 🏙️ | $25M | Happiness -5, Funds +15, Interest +15 | +7/+5 near office/shop/flooded |

### Progressive Unlock System

Buildings are locked by default and unlocked through story choices:

```javascript
// Story choice example
{
    text: "Accept the factory deal",
    effects: { happiness: 10, cityFunds: 20 },
    unlocks: ['factory', 'house'],  // Unlock these buildings
    next: 'choice2A'
}
```

### Mandatory Placement

Some choices require immediate building placement:

```javascript
if (choice.building) {
    gameState.pendingBuildingPlacement = {
        building: buildingTypes[choice.building],
        nextScene: choice.next
    };
    gameState.awaitingPlacement = true;
    showMandatoryPlacementOverlay();
}
```

---

## Grid & Feature System

### Responsive Grid Sizes

```javascript
function getGridSize() {
    if (window.innerWidth <= 480) {
        return { cols: 6, rows: 4, total: 24 };   // Mobile
    } else if (window.innerWidth <= 768) {
        return { cols: 8, rows: 4, total: 32 };   // Tablet
    } else {
        return { cols: 10, rows: 6, total: 60 };  // Desktop
    }
}
```

### Grid Features (10 Types)

Environmental features that appear based on story choices:

#### Chapter 1 Features

| Feature | Icon | Buildable | Description |
|---------|------|-----------|-------------|
| River | 🌊 | No | Natural water source, boosts factories |
| Polluted River | 🌊 | No | Contaminated water, penalizes nearby buildings |
| Mountain | ⛰️ | No | Scenic highlands, boosts parks/houses |
| Highway | 🛣️ | No | Major road, boosts commerce, penalizes houses |
| Protected Forest | 🌲 | No | Environmental preserve, boosts parks |
| City Hall | 🏛️ | No | Government center (pre-placed) |
| Existing Neighborhood | 🏘️ | No | Pre-existing homes (acts like building) |

#### Chapter 2 Features

| Feature | Icon | Buildable | Description |
|---------|------|-----------|-------------|
| Flooded Area | 🌊 | No | Flood zone, penalizes houses/shops |
| Storm Damage | 💥 | Yes | Damaged area, can rebuild |

### Feature Placement

Features are placed based on story choices:

```javascript
// Place river when factory is accepted
placeGridFeature('river', generateRiverPattern());

// Replace river with polluted version
replaceGridFeature('river', 'polluted_river');
```

---

## Decision Tree System

### Scene Structure

```javascript
gameData = {
    scene_key: {
        chapter: "Chapter 1: Title",    // Chapter header
        title: "Scene Title",           // Scene title
        story: "<p>HTML content</p>",   // Story text
        choices: [
            {
                text: "Choice text",
                icon: "✅",
                effects: {
                    happiness: 10,
                    cityFunds: -5,
                    specialInterest: 0,
                    personalProfit: 0
                },
                next: 'next_scene_key',
                consequence: "What happens after",
                unlocks: ['building1', 'building2'],
                building: 'factory',           // Mandatory placement
                placeFeature: 'river',         // Place feature
                replaceFeature: { old: 'river', new: 'polluted_river' },
                placementConstraints: { adjacentToFeature: 'river' },
                achievementTag: 'reject_factory'
            }
        ]
    }
}
```

### Decision Flow

```
1. renderScene(sceneKey) - Display story and choices
2. startTimer() - Begin countdown
3. Player clicks choice OR timer expires
4. stopTimer()
5. Calculate time bonus (if choice made in time)
6. Apply stat effects
7. Show consequence (2.5s pause)
8. Unlock buildings / Place features
9. Check mandatory placement
10. Navigate to next scene
11. Check achievements
12. Auto-save (every 30s)
```

---

## Timer System

### Timer States (Visual Feedback)

| Time Range | State | Visual |
|------------|-------|--------|
| 50-100% | Calm | Green bar |
| 33-50% | Warning | Yellow bar + pulse |
| 17-33% | Danger | Red bar + faster pulse |
| 0-17% | Critical | Red bar + shake + flash |

### Timeout Handling

```javascript
function handleTimeout() {
    stopTimer();
    gameState.timerExpired = true;
    gameState.achievementTracking.neverTimedOut = false;

    // Apply penalties
    gameState.happiness -= 10;
    gameState.cityFunds -= 5;
    gameState.specialInterest -= 8;

    // No time bonus awarded
    // Auto-select first choice
    makeChoice(currentSceneKey, 0, true);
}
```

### Time Bank System

Good choices add to time bank (used for bonus scoring):

```javascript
const totalImpact = effects.happiness + effects.cityFunds + effects.specialInterest;

if (totalImpact > 5) {
    gameState.timeBankSeconds += 10;  // Good choice
} else if (totalImpact < -5) {
    gameState.timeBankSeconds -= 5;   // Bad choice
}
```

---

## Drag and Drop Mechanics

### Dual Input Support

The game supports both mouse (desktop) and touch (mobile) input:

#### Desktop Events
- `dragstart` - Begin dragging building card
- `dragover` - Hover over grid cell
- `drop` - Place building on cell

#### Mobile Events
- `touchstart` - Begin touch drag
- `touchmove` - Track finger movement
- `touchend` - Place building at touch position

### Placement Flow

```
1. User drags building from palette
2. Hover over grid -> Show adjacency preview (green/red highlights)
3. Validate placement:
   - Cell is empty?
   - Sufficient funds?
   - Meets constraints?
4. Drop on valid cell
5. Deduct cost from cityFunds
6. Place in cityGrid[index]
7. Calculate adjacency effects
8. Add to buildingHistory (for undo)
9. Detect zones
10. Calculate efficiency
11. Update stats display
12. Check achievements
13. Play placement sound
14. Trigger advisor reaction
```

### Zone Detection

When 3+ same buildings are adjacent, they form a zone:

| Zone Type | Building | Min Count | Bonus |
|-----------|----------|-----------|-------|
| Neighborhood | House | 3 | Happiness +5 |
| Commercial District | Shop | 3 | Funds +8 |
| Industrial Zone | Factory | 3 | Funds +12, Happiness -10 |
| Park System | Park | 3 | Happiness +10 |
| Business Park | Office | 3 | Interest +12 |

---

## Advisor & Narrative System

### Three Advisors

The `NarrativeManager` provides contextual commentary through three advisor characters:

| Advisor | Name | Portrait | Specialty | Personality |
|---------|------|----------|-----------|-------------|
| banks | Mr. Banks | banks.png | cityFunds, personalProfit | Capitalist |
| ivy | Ivy Green | ivygreen.png | happiness, environment | Activist |
| engineer | Chief Builder | engineer.png | specialInterest, zoning | Engineer |

### Dialogue Queue System

```javascript
// Add dialogue to queue
narrativeManager.showAdvisorInPanel('banks', "Excellent financial decision!");

// Process queue with typewriter effect
processDialogueQueue() {
    // Show advisor portrait
    // Typewriter text at 40ms/character
    // Wait 2.5s
    // Process next in queue
}
```

### Reaction Triggers

- **reactToScene()** - Analyze scene keywords to choose advisor
- **reactToChoice()** - Comment on choice effects
- **reactToBuilding()** - Comment on building placement
- **reactToZone()** - Celebrate zone formation
- **reactToAchievement()** - Announce achievement unlock
- **checkStatThresholds()** - Warn about low stats

---

## Audio System

### AudioManager Features

```javascript
class AudioManager {
    // Music tracks
    musicTracks: {
        menu: 'audio/music/menu.mp3',
        gameplay: 'audio/music/gameplay.mp3',
        victory: 'audio/music/victory.mp3',
        defeat: 'audio/music/defeat.mp3'
    }

    // Sound effects with audio pooling
    soundEffects: {
        buttonClick: [3 instances],  // Pool for rapid clicks
        choiceSelect: [2 instances],
        buildingPlace: [2 instances],
        // ... 20+ sound effects
    }

    // Audio queue system
    audioQueue: []  // Prevents overlapping sounds
}
```

### Convenience Methods

```javascript
audioManager.playButtonClick();
audioManager.playBuildingPlace();
audioManager.playChoiceSelect();
audioManager.playAchievement();
audioManager.playTimerWarning();
```

---

## Achievement System

### 10 Achievements Across 4 Categories

#### Story Achievements
| ID | Name | Condition |
|----|------|-----------|
| riverside_industrial | Riverside Industrial | Built factory adjacent to river |
| green_guardian | Green Guardian | Rejected factory and built 4+ parks |

#### Balance Achievements
| ID | Name | Condition |
|----|------|-----------|
| balanced_leader | Balanced Leader | All stats within 15 points at game end |
| peoples_champion | People's Champion | Happiness > 80 at game end |
| economic_powerhouse | Economic Powerhouse | City funds > 80 at game end |
| master_diplomat | Master Diplomat | Special interest > 80 at game end |

#### Planning Achievements
| ID | Name | Condition |
|----|------|-----------|
| master_planner | Master Planner | City planning efficiency > 85% |
| swift_decisor | Swift Decisor | Never let timer expire |
| no_regrets | No Regrets | Complete without undo or relocation |

#### Perfect Achievement
| ID | Name | Condition |
|----|------|-----------|
| perfect_mayor | Perfect Mayor | All stats > 75, efficiency > 80, no timeouts |

---

## Scoring System

### Final Score Calculation

```javascript
finalScore = (baseScore * 0.70) + (timeBonusScore * 0.15) +
             (achievementBonus * 0.10) + (efficiencyBonus * 0.05) +
             profitPenalty
```

### Score Components

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Base Score | 70% | (happiness + cityFunds + specialInterest) / 3 |
| Time Bonus | 15% | 2 points per second remaining |
| Achievement Bonus | 10% | 5 points per achievement |
| Efficiency Bonus | 5% | Planning efficiency percentage |
| Corruption Penalty | -5 to -20 | Based on personalProfit |

### Rating Thresholds

| Score Range | Rating |
|-------------|--------|
| Critical failure | City in Crisis |
| 90+ | Perfect Mayor |
| 70-89 | Outstanding Mayor |
| 60-69 | Excellent Mayor |
| 45-59 | Decent Mayor |
| 30-44 | Struggling Mayor |
| 0-29 | Failed Mayor |

### Efficiency Calculation

```javascript
function calculateEfficiency() {
    let score = 0;

    // 1. Grid Coverage (30 points max)
    score += (buildingsPlaced / totalCells) * 30;

    // 2. Adjacency Optimization (40 points max)
    score += (positiveAdjacencies / buildingsPlaced) * 40;

    // 3. Zone Formation (30 points max)
    score += Math.min(zonesFormed * 10, 30);

    return Math.min(score, 100);
}
```

---

## Backend Architecture

### Database Schema

```sql
CREATE TABLE game_sessions (
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

CREATE TABLE game_saves (
    session_id VARCHAR(36) PRIMARY KEY REFERENCES game_sessions(session_id),
    game_state JSONB NOT NULL,
    score INTEGER DEFAULT 0,
    current_scene VARCHAR(100),
    saved_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/game/new | Create new session |
| POST | /api/game/save | Save game state |
| GET | /api/game/load/:id | Load saved game |
| POST | /api/game/complete | Submit final score |
| GET | /api/leaderboard | Get top scores |
| GET | /api/stats/:id | Get session stats |
| GET | /api/analytics/summary | Get aggregate analytics |

---

## Data Flow

### Game Initialization

```
1. User opens index.html
2. Modules load in order
3. Start screen displays
4. User enters name, selects difficulty
5. api-client.js creates backend session
6. game.js initializes:
   - Set gameState.difficulty
   - Set starting funds
   - Create responsive grid
   - Place initial features (city hall, neighborhood)
   - Render intro scene
7. Menu music plays
```

### Decision-Making Flow

```
1. renderScene(sceneKey)
2. startTimer()
3. Player clicks choice OR timeout
4. stopTimer()
5. Calculate time bonus
6. Apply stat effects
7. Show consequence (2.5s)
8. Unlock buildings
9. Place features
10. Check mandatory placement
11. Navigate to next scene
12. Check achievements
13. Auto-save (every 30s)
14. Play sound effects
15. Show advisor reaction
```

### Game Completion Flow

```
1. Reach 'ending' scene
2. Stop auto-save
3. Calculate final score
4. Check final achievements
5. Determine rating
6. Submit to backend
7. Display results:
   - Final score & rating
   - Score breakdown
   - Statistics
   - Achievements earned
   - Zones formed
8. Show leaderboard position
9. Offer replay
```

---

## Complete Story Content

### Chapter 1: Economic Opportunity

**Decision Tree Overview:**
```
intro
  └─→ choice1 (Accept/Reject Factory)
       ├─→ choice2A (Factory Path)
       │    └─→ choice3A1 (Pollution)
       │         ├─→ choice4A11 (Labor) → ending (2 paths)
       │         └─→ choice4A12 (Revolt) → ending (2 paths)
       │
       └─→ choice2B (Reject Path)
            ├─→ choice3B1 (Tensions)
            │    ├─→ choice4B11 (Privacy) → ending (2 paths)
            │    └─→ choice4B12 (Hiring) → ending (2 paths)
            │
            └─→ choice3B2 (Accidents)
                 ├─→ choice4B21 (Progress) → ending (2 paths)
                 └─→ choice4B22 (Lawsuits) → ending (2 paths)
```

**Chapter 1 Statistics:**
- Total scenes: 15
- Unique endings: 14
- Decision points: 35 total choices

### Chapter 2: The Great Storm

**Decision Tree Overview:**
```
chapter2_intro (Evacuate/Stay)
├─→ ch2_evacuated_flood (Recovery/PR)
│    ├─→ ch2_recovery_budget (Tax/Federal) → endings
│    └─→ ch2_pr_victims_waiting → endings
│
└─→ ch2_stayed_flood (Deploy/Wait)
     ├─→ ch2_active_response (Full/Cut) → endings
     └─→ ch2_neglect_worsens (Late/Ignore) → endings
```

**Chapter 2 Statistics:**
- Total scenes: 15
- Unique endings: 16
- Decision points: 32 total choices
- Unlock requirement: Score >= 45, no critical failures

### Scene Reference

See the inline comments in `game.js` starting at line ~3114 for complete story content.

---

## Key Functions Reference

### game.js

| Function | Purpose |
|----------|---------|
| `initializeGame()` | Set up game, create grid, render intro |
| `renderScene(key)` | Display story scene and choices |
| `makeChoice(scene, index)` | Process player decision |
| `startTimer()` / `stopTimer()` | Timer lifecycle |
| `handleTimeout()` | Process timer expiration |
| `placeBuilding(id, cell)` | Place building on grid |
| `calculateAdjacencyBonus()` | Compute building bonuses |
| `detectZones()` | Find zone formations |
| `calculateEfficiency()` | Compute planning score |
| `checkAchievements()` | Award achievements |
| `calculateFinalScore()` | Compute end-game score |
| `renderBuildingPalette()` | Display available buildings |
| `placeGridFeature()` | Add environmental feature |

### api-client.js

| Function | Purpose |
|----------|---------|
| `createNewSession()` | Start new game session |
| `saveGame()` | Persist current state |
| `loadGame()` | Restore saved state |
| `completeGame()` | Submit final score |
| `getLeaderboard()` | Fetch top scores |
| `startAutoSave()` | Begin 30s auto-save |

### narrative-manager.js

| Function | Purpose |
|----------|---------|
| `showAdvisorInPanel()` | Queue advisor dialogue |
| `reactToChoice()` | Comment on decision |
| `reactToBuilding()` | Comment on placement |
| `reactToZone()` | Celebrate zone |
| `checkStatThresholds()` | Warn about low stats |

---

## Mobile Considerations

- **Touch events** handled separately from mouse
- **Haptic feedback** via `navigator.vibrate()`
- **Reduced particles** on mobile (15 vs 30)
- **Responsive grid** (6x4 on phones)
- **Large touch targets** (min 44x44px)

---

## Debugging Tips

### Frontend

```javascript
// Check game state
console.log(gameState);

// Navigate to specific scene
loadScene('choice2A');

// Unlock all buildings
gameState.unlockedBuildings = ['house', 'shop', 'factory', 'park', 'office'];

// Check session
console.log(gameAPI.sessionId);

// Check audio queue
console.log(audioManager.getQueueInfo());
```

### Backend

```bash
# Health check
curl http://localhost:5000/api/health

# View session
curl http://localhost:5000/api/stats/{session_id}
```

---

**Version:** 3.0
**Last Updated:** 2025-12-06
**Major Changes in v3.0:**
- Added complete module system documentation
- Updated difficulty modes with correct values
- Added advisor/narrative system documentation
- Added audio system documentation
- Updated building costs and effects
- Added grid features documentation
- Fixed gameState object structure
- Added complete function reference
