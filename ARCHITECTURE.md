# ManeStreet Mayor Quiz Game - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Game Architecture](#game-architecture)
3. [Difficulty Modes](#difficulty-modes)
4. [Decision Tree System](#decision-tree-system)
5. [Grid & Building System](#grid--building-system)
6. [Drag and Drop Mechanics](#drag-and-drop-mechanics)
7. [Achievement System](#achievement-system)
8. [Scoring System](#scoring-system)
9. [Data Flow](#data-flow)
10. [Technical Implementation](#technical-implementation)
11. [Complete Story Content](#complete-story-content)

---

## Overview

**ManeStreet** is an interactive city-building narrative game where players act as the mayor of Tiger Central, making political decisions that affect city happiness, funds, special interests, and personal profit. The game combines narrative storytelling with strategic building placement mechanics.

**Core Gameplay Loop:**
```
Story Scene → Make Decision (timed) → See Consequences →
→ Unlock Buildings → Place Buildings on Grid →
→ Apply Adjacency Effects → Next Story Scene
```

---

## Game Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     GAME ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ start-screen │      │  api-client  │                     │
│  │    .js       │──────│     .js      │                     │
│  └──────────────┘      └──────────────┘                     │
│         │                      │                              │
│         │                      │                              │
│         ▼                      ▼                              │
│  ┌──────────────────────────────────────┐                   │
│  │           game.js (Core)              │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │       gameState Object         │  │                   │
│  │  │  - happiness, funds, interest  │  │                   │
│  │  │  - cityGrid (60/32/24 cells)   │  │                   │
│  │  │  - decisions[], achievements[] │  │                   │
│  │  │  - timerSeconds, timeBonus     │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  │                                        │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │      gameData (Story Tree)     │  │                   │
│  │  │  - intro, choice1, choice2A... │  │                   │
│  │  │  - Each scene has choices      │  │                   │
│  │  │  - Choices have effects        │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  │                                        │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │   Building/Grid Systems        │  │                   │
│  │  │  - buildingPalette[]           │  │                   │
│  │  │  - gridFeatures{}              │  │                   │
│  │  │  - adjacencyRules{}            │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  └──────────────────────────────────────┘                   │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐                                           │
│  │  styles.css  │                                           │
│  │  index.html  │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Game State Object

The entire game state is managed through a single `gameState` object:

```javascript
const gameState = {
    // Core Stats (0-100)
    happiness: 50,
    cityFunds: 50,
    specialInterest: 50,
    personalProfit: 0,

    // Scene Management
    currentScene: 'intro',
    decisions: [],

    // Timer System
    timerSeconds: 30,
    isTimerRunning: false,
    timerInterval: null,
    timerExpired: false,
    choiceMade: false,
    timeBonus: 0,
    timeBankSeconds: 0,

    // Grid System
    cityGrid: Array(60).fill(null), // Responsive: 60/32/24
    gridFeatures: [],
    buildingHistory: [],

    // Building System
    unlockedBuildings: [],
    pendingBuildingPlacement: null,
    awaitingPlacement: false,
    placementConstraints: null,

    // Planning/Undo
    undoCount: 3,
    maxRelocations: 3,
    relocationsUsed: 0,
    planningEfficiency: 0,
    detectedZones: [],

    // Achievements
    achievements: [],
    achievementTracking: {
        builtNearRiver: false,
        rejectedFactory: false,
        neverTimedOut: true,
        usedNoUndos: true,
        usedNoRelocations: true
    },

    // Difficulty
    difficulty: null,
    gameStartTime: null,
    gameEndTime: null
};
```

---

## Difficulty Modes

Four difficulty modes affect timer duration, starting resources, and error tolerance:

| Mode | Timer | Starting Funds | Relocations | Undos | Description |
|------|-------|----------------|-------------|-------|-------------|
| **Easy (🌱 Relaxed Mayor)** | 45s | $80M | 5 | 5 | Take your time and experiment |
| **Normal (⚖️ Working Mayor)** | 30s | $60M | 3 | 3 | Balanced challenge |
| **Hard (🔥 Under Pressure)** | 20s | $50M | 1 | 1 | Quick decisions, tough choices |
| **Expert (⚡ Mayor Speedrun)** | 15s | $40M | 0 | 0 | No mistakes allowed! |

**Implementation:**
```javascript
const difficultyModes = {
    easy: { timerPerScene: 45, startingFunds: 80, ... },
    normal: { timerPerScene: 30, startingFunds: 60, ... },
    hard: { timerPerScene: 20, startingFunds: 50, ... },
    expert: { timerPerScene: 15, startingFunds: 40, ... }
};
```

---

## Decision Tree System

### Story Structure

The game uses a **branching narrative tree** where each scene contains:
- `chapter`: Chapter title (e.g., "Chapter 1: Economic Opportunity")
- `title`: Scene title
- `story`: HTML story content
- `choices[]`: Array of decision options

### Scene Format

```javascript
gameData = {
    intro: {
        title: "Welcome to Tiger Central",
        story: "<p>You've just won the election...</p>",
        choices: [{ text: "Start Journey", next: 'choice1' }]
    },

    choice1: {
        chapter: "Chapter 1: Economic Opportunity",
        title: "A Factory Proposal",
        story: "<p>TigerTech Industries wants to build...</p>",
        choices: [
            {
                text: "Accept the factory deal",
                icon: "✅",
                effects: {
                    happiness: 10,
                    cityFunds: 20,
                    specialInterest: 15,
                    personalProfit: 5
                },
                next: 'choice2A',
                consequence: "TigerTech is excited...",
                unlocks: ['factory', 'house'],
                placeFeature: 'river'
            },
            {
                text: "Reject the factory",
                icon: "❌",
                effects: {
                    happiness: -10,
                    cityFunds: -10,
                    specialInterest: -15
                },
                next: 'choice2B',
                consequence: "TigerTech is disappointed...",
                unlocks: ['park', 'house'],
                placeFeature: 'protected_forest',
                achievementTag: 'reject_factory'
            }
        ]
    }
    // ... continues branching
};
```

### Decision Tree Flow

```
intro
  │
  └─→ choice1 (Accept/Reject Factory)
       ├─→ choice2A (Factory Path)
       │    ├─→ choice3A1 (Pollution)
       │    │    ├─→ choice4A11
       │    │    └─→ choice4A12
       │    └─→ choice3A2 (Suburban)
       │         ├─→ choice4A21
       │         ├─→ choice4A22
       │         └─→ choice4A23
       │
       └─→ choice2B (Reject Path)
            ├─→ choice3B1 (Taxes)
            │    ├─→ choice4B11
            │    └─→ choice4B12
            └─→ choice3B2 (Infrastructure)
                 └─→ ...
```

### Choice Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Choice button text |
| `icon` | String | Emoji icon |
| `effects` | Object | Stat changes: {happiness, cityFunds, specialInterest, personalProfit} |
| `next` | String | Next scene key |
| `consequence` | String | Result message shown after choice |
| `unlocks` | Array | Building IDs to unlock |
| `placeFeature` | String | Grid feature to place (river, forest, etc.) |
| `replaceFeature` | Object | Replace feature: {oldFeature, newFeature} |
| `building` | String | Mandatory building placement |
| `placementConstraints` | Object | Placement rules: {adjacentToFeature: 'river'} |
| `achievementTag` | String | Achievement tracking tag |

---

## Grid & Building System

### Grid Sizes (Responsive)

```javascript
function getGridSize() {
    if (window.innerWidth <= 480) {
        return { cols: 6, rows: 4, total: 24 }; // Mobile
    } else if (window.innerWidth <= 768) {
        return { cols: 8, rows: 4, total: 32 }; // Tablet
    } else {
        return { cols: 10, rows: 6, total: 60 }; // Desktop
    }
}
```

### Building Types

```javascript
const buildingPalette = [
    { id: 'house', name: 'House', icon: '🏠',
      cost: 10, effect: 'Happiness +5' },
    { id: 'shop', name: 'Shop', icon: '🏪',
      cost: 15, effect: 'Funds +5' },
    { id: 'factory', name: 'Factory', icon: '🏭',
      cost: 20, effect: 'Funds +10, Happiness -5' },
    { id: 'park', name: 'Park', icon: '🌳',
      cost: 12, effect: 'Happiness +8' },
    { id: 'office', name: 'Office', icon: '🏢',
      cost: 18, effect: 'Interest +8' }
];
```

### Grid Features (Environmental)

Features are placed on the grid based on story choices:

```javascript
const gridFeatures = {
    river: {
        icon: '🌊',
        buildable: false,
        adjacencyEffects: {
            factory: { bonus: { cityFunds: 5 }, message: '🏭 Water access!' },
            park: { bonus: { happiness: 3 }, message: '🌳 Riverside park!' },
            house: { bonus: { happiness: 2 }, message: '🏠 Waterfront!' }
        }
    },
    polluted_river: { /* ... */ },
    protected_forest: { /* ... */ },
    mountain: { /* ... */ },
    highway: { /* ... */ }
};
```

### Adjacency Rules

Buildings gain bonuses/penalties based on neighbors:

```javascript
const adjacencyRules = {
    park: {
        near: ['house', 'shop'],
        bonus: { happiness: 3 },
        message: "🌳 Park near homes boosts happiness!"
    },
    factory: {
        near: ['house', 'park'],
        penalty: { happiness: -4 },
        message: "🏭 Factory pollution upsets nearby residents"
    },
    shop: {
        near: ['house', 'office'],
        bonus: { cityFunds: 2 },
        message: "🏪 More customers!"
    },
    office: {
        near: ['shop', 'park'],
        bonus: { specialInterest: 2 },
        message: "🏢 Offices value amenities"
    },
    house: {
        near: ['park'],
        bonus: { happiness: 2 },
        message: "🏠 Quality of life!"
    }
};
```

### Zone Detection

When 3+ same buildings are adjacent, they form a **zone** with bonus effects:

```javascript
const zoneDefinitions = {
    neighborhood: {
        buildingType: 'house',
        minCount: 3,
        bonus: { happiness: 5 },
        icon: '🏘️',
        message: 'Neighborhood formed!'
    },
    commercial_district: {
        buildingType: 'shop',
        minCount: 3,
        bonus: { cityFunds: 8 },
        icon: '🛍️'
    },
    industrial_zone: {
        buildingType: 'factory',
        minCount: 3,
        bonus: { cityFunds: 12 },
        penalty: { happiness: -10 },
        icon: '🏭'
    },
    park_system: {
        buildingType: 'park',
        minCount: 3,
        bonus: { happiness: 10 },
        icon: '🌳'
    },
    business_park: {
        buildingType: 'office',
        minCount: 3,
        bonus: { specialInterest: 12 },
        icon: '🏢'
    }
};
```

### Building-Choice Connection

**Flow:**
1. Player makes story choice
2. Choice has `unlocks: ['factory', 'house']`
3. Game adds buildings to `gameState.unlockedBuildings[]`
4. Building palette re-renders, showing newly unlocked buildings
5. If choice has `building: 'factory'`, mandatory placement overlay appears
6. If choice has `placementConstraints: {adjacentToFeature: 'river'}`, only river-adjacent cells are unlocked

**Mandatory Placement:**
```javascript
if (choice.building) {
    gameState.pendingBuildingPlacement = {
        building: building,
        nextScene: choice.next
    };
    gameState.awaitingPlacement = true;

    // Lock grid cells based on constraints
    if (choice.placementConstraints) {
        const allowedCells = getCellsAdjacentToFeature('river');
        gameState.placementConstraints = { allowedCells };
    }

    showMandatoryPlacementOverlay(building, constraints);
}
```

---

## Drag and Drop Mechanics

### Dual Input System

Supports both **mouse (desktop)** and **touch (mobile)** drag-and-drop:

#### Desktop (Mouse Events)

```javascript
// 1. Drag Start
card.addEventListener('dragstart', (e) => {
    currentDraggedBuilding = building;
    e.dataTransfer.setData('buildingId', building.id);
    card.classList.add('dragging');
});

// 2. Drag Over Grid Cell
cell.addEventListener('dragover', (e) => {
    e.preventDefault();
    const isValid = checkIfCanPlaceHere(cellIndex);
    cell.classList.add(isValid ? 'drag-over' : 'invalid-drop');

    // Show adjacency preview
    showAdjacencyHighlights(cellIndex, buildingType);
});

// 3. Drop
cell.addEventListener('drop', (e) => {
    e.preventDefault();
    const buildingId = e.dataTransfer.getData('buildingId');
    placeBuilding(buildingId, cellIndex);
});
```

#### Mobile (Touch Events)

```javascript
// 1. Touch Start
card.addEventListener('touchstart', (e) => {
    touchDragData = {
        building: building,
        startX: touch.clientX,
        startY: touch.clientY,
        isDragging: false
    };
    card.classList.add('dragging');
});

// 2. Touch Move
card.addEventListener('touchmove', (e) => {
    const elementUnderTouch = document.elementFromPoint(
        touch.clientX, touch.clientY
    );
    const cell = elementUnderTouch?.closest('.grid-cell');

    if (cell && canPlaceHere) {
        cell.classList.add('drag-over');
        showAdjacencyPreview(cellIndex);
    }
});

// 3. Touch End
card.addEventListener('touchend', (e) => {
    const cell = elementUnderTouch?.closest('.grid-cell');
    if (cell && gameState.cityFunds >= building.cost) {
        placeBuilding(building.id, cellIndex);
        triggerHaptic('success');
    }
});
```

### Placement Validation

```javascript
function canPlaceBuilding(cellIndex, buildingId) {
    // 1. Check if cell is empty
    if (gameState.cityGrid[cellIndex] !== null) return false;

    // 2. Check placement constraints
    if (gameState.placementConstraints) {
        if (!gameState.placementConstraints.allowedCells.includes(cellIndex)) {
            return false;
        }
    }

    // 3. Check funds
    const building = buildingPalette.find(b => b.id === buildingId);
    if (gameState.cityFunds < building.cost) return false;

    return true;
}
```

### Building Placement Flow

```
1. User drags building from palette
2. Hover over grid → Show adjacency preview (green/red cells)
3. Drop on valid cell
4. Deduct cost from cityFunds
5. Place building in gameState.cityGrid[index]
6. Calculate and apply adjacency effects
7. Update building history (for undo)
8. Re-render grid
9. Update stats display
10. Check for zone formation
11. Update efficiency score
12. Check achievements
```

### Adjacency Preview System

```javascript
function getAdjacencyHighlights(cellIndex, buildingType) {
    const beneficial = [];
    const harmful = [];
    const neighbors = getAdjacentCells(cellIndex);

    neighbors.forEach(neighborIndex => {
        const neighbor = gameState.cityGrid[neighborIndex];
        if (neighbor) {
            // Check if this placement helps/hurts
            const rule = adjacencyRules[buildingType];
            if (rule.near.includes(neighbor.type)) {
                if (rule.bonus) beneficial.push(neighborIndex);
                if (rule.penalty) harmful.push(neighborIndex);
            }
        }
    });

    return { beneficial, harmful };
}
```

---

## Achievement System

### Achievement Categories

1. **Story-based**: Tied to specific narrative choices
2. **Balance**: Based on final stat values
3. **Planning**: City planning efficiency
4. **Speed**: Time-based challenges

### Achievement Definitions

```javascript
const achievementDefinitions = {
    // Story Achievements
    riverside_industrial: {
        id: 'riverside_industrial',
        name: 'Riverside Industrial',
        description: 'Built factory adjacent to river',
        icon: '🏭',
        category: 'story'
    },
    green_guardian: {
        id: 'green_guardian',
        name: 'Green Guardian',
        description: 'Rejected factory and built 4+ parks',
        icon: '🌳',
        category: 'story'
    },

    // Balance Achievements
    balanced_leader: {
        id: 'balanced_leader',
        name: 'Balanced Leader',
        description: 'All stats within 15 points at game end',
        icon: '⚖️',
        category: 'balance'
    },
    peoples_champion: {
        id: 'peoples_champion',
        name: "People's Champion",
        description: 'Happiness > 80 at game end',
        icon: '😊',
        category: 'balance'
    },
    economic_powerhouse: {
        id: 'economic_powerhouse',
        name: 'Economic Powerhouse',
        description: 'City funds > 80 at game end',
        icon: '💰',
        category: 'balance'
    },
    master_diplomat: {
        id: 'master_diplomat',
        name: 'Master Diplomat',
        description: 'Special interest > 80 at game end',
        icon: '🤝',
        category: 'balance'
    },

    // Planning Achievements
    master_planner: {
        id: 'master_planner',
        name: 'Master Planner',
        description: 'City planning efficiency > 85%',
        icon: '📐',
        category: 'planning'
    },
    swift_decisor: {
        id: 'swift_decisor',
        name: 'Swift Decisor',
        description: 'Never let timer expire',
        icon: '⚡',
        category: 'planning'
    },
    no_regrets: {
        id: 'no_regrets',
        name: 'No Regrets',
        description: 'Never used undo',
        icon: '🎯',
        category: 'planning'
    },
    steady_hand: {
        id: 'steady_hand',
        name: 'Steady Hand',
        description: 'Never relocated a building',
        icon: '🏗️',
        category: 'planning'
    },

    // Perfect Achievement
    perfect_mayor: {
        id: 'perfect_mayor',
        name: 'Perfect Mayor',
        description: 'Score 90+ with 80+ in all stats',
        icon: '👑',
        category: 'perfect'
    }
};
```

### Achievement Checking

```javascript
function checkAchievements() {
    const newAchievements = [];

    // Story Achievements
    if (gameState.achievementTracking.builtNearRiver &&
        !gameState.achievements.includes('riverside_industrial')) {
        newAchievements.push(achievementDefinitions.riverside_industrial);
    }

    const parkCount = gameState.cityGrid.filter(c => c && c.type === 'park').length;
    if (gameState.achievementTracking.rejectedFactory && parkCount >= 4) {
        newAchievements.push(achievementDefinitions.green_guardian);
    }

    // Balance Achievements (checked at game end)
    const stats = [gameState.happiness, gameState.cityFunds, gameState.specialInterest];
    const maxDiff = Math.max(...stats) - Math.min(...stats);
    if (maxDiff <= 15) {
        newAchievements.push(achievementDefinitions.balanced_leader);
    }

    // Planning Achievements
    if (gameState.planningEfficiency > 85) {
        newAchievements.push(achievementDefinitions.master_planner);
    }

    if (gameState.achievementTracking.neverTimedOut) {
        newAchievements.push(achievementDefinitions.swift_decisor);
    }

    // Award achievements
    newAchievements.forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id)) {
            gameState.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
}
```

---

## Scoring System

### Final Score Calculation

The final score is a **weighted average** of multiple components:

```javascript
finalScore = (baseScore × 0.70) + (timeBonusScore × 0.15) +
             (achievementBonus × 0.10) + (efficiencyBonus × 0.05) +
             profitPenalty
```

### Score Components

#### 1. Base Score (70% weight)

Average of the three main stats:

```javascript
baseScore = (happiness + cityFunds + specialInterest) / 3;
```

**Critical Failure:** If any stat falls below 20, base score is capped at 40.

#### 2. Time Bonus (15% weight)

Earned by making quick decisions:

```javascript
// Per decision: 2 points per second remaining
earnedTimeBonus = secondsRemaining * 2;

// Final calculation
timeBonusScore = (totalTimeBonus / gameState.decisions.length) * 100;
```

**Example:**
- Decision 1: 15 seconds remaining → +30 points
- Decision 2: 8 seconds remaining → +16 points
- Decision 3: 22 seconds remaining → +44 points
- Total: 90 points / 3 decisions = 30 avg → 30% of max

#### 3. Achievement Bonus (10% weight)

```javascript
achievementBonus = gameState.achievements.length * 5;
// Max: 11 achievements × 5 = 55 points
```

#### 4. Efficiency Bonus (5% weight)

Based on city planning score:

```javascript
efficiencyBonus = gameState.planningEfficiency;
// Max: 100 points
```

#### 5. Corruption Penalty

Personal profit-taking reduces score:

```javascript
if (personalProfit > 20) {
    profitPenalty = -20; // Severe penalty
} else if (personalProfit > 10) {
    profitPenalty = -10; // Moderate penalty
} else if (personalProfit > 5) {
    profitPenalty = -5; // Light penalty
}
```

### Rating Thresholds

```javascript
if (hasCriticalFailure) {
    rating = '💀 City in Crisis';
} else if (finalScore >= 90) {
    rating = '👑 Perfect Mayor';
} else if (finalScore >= 70) {
    rating = '⭐ Outstanding Mayor';
} else if (finalScore >= 60) {
    rating = '🌟 Excellent Mayor';
} else if (finalScore >= 45) {
    rating = '👍 Decent Mayor';
} else if (finalScore >= 30) {
    rating = '😬 Struggling Mayor';
} else {
    rating = '❌ Failed Mayor';
}
```

### Planning Efficiency Calculation

```javascript
function calculateEfficiency() {
    let score = 0;
    const totalCells = gridSize.total;
    const buildingsPlaced = gameState.cityGrid.filter(c =>
        c !== null && c.type !== 'feature'
    ).length;

    // 1. Grid Coverage (30 points)
    const coverageRatio = buildingsPlaced / totalCells;
    score += coverageRatio * 30;

    // 2. Adjacency Optimization (40 points)
    let adjacencyScore = 0;
    gameState.cityGrid.forEach((cell, index) => {
        if (cell && cell.type !== 'feature') {
            const bonus = calculateAdjacencyBonus(index, cell.type);
            if (bonus.totalBonus > 0) adjacencyScore++;
        }
    });
    score += (adjacencyScore / buildingsPlaced) * 40;

    // 3. Zone Formation (30 points)
    const zonesFormed = gameState.detectedZones.length;
    score += Math.min(zonesFormed * 10, 30);

    return Math.min(score, 100);
}
```

---

## Data Flow

### Game Initialization Flow

```
1. User opens index.html
2. start-screen.js initializes
3. User enters name and selects difficulty
4. api-client.js creates backend session (if available)
5. game.js initializes:
   - Set gameState.difficulty
   - Set starting funds based on difficulty
   - Create responsive grid (60/32/24 cells)
   - Place initial features (city hall, neighborhood)
   - Render scene('intro')
```

### Decision-Making Flow

```
1. Scene renders with story and choices
2. Timer starts (duration based on difficulty + time bank)
3. User clicks choice OR timer expires
4. Timer stops
5. Calculate time bonus (if not expired)
6. Apply stat effects from choice
7. Show consequence message (2.5s)
8. Unlock buildings (if any)
9. Place grid features (if any)
10. Check for mandatory building placement
    - If yes: Show overlay, lock grid cells
    - Wait for building placement
    - Complete placement → continue
11. Navigate to next scene
12. Update achievements
13. Save game state (if backend enabled)
```

### Building Placement Flow

```
1. User drags building from palette
2. Hover over grid cell
3. Check placement validity:
   - Cell empty?
   - Sufficient funds?
   - Meets constraints?
4. Show adjacency preview
5. User drops building
6. Deduct cost
7. Place in cityGrid[index]
8. Calculate adjacency effects:
   - Check all 4 neighbors
   - Apply bonuses/penalties
9. Add to building history
10. Detect zones
11. Calculate efficiency
12. Update stats display
13. Check achievements
14. If mandatory placement: completeMandatoryPlacement()
```

### Game End Flow

```
1. Player reaches 'ending' scene
2. Calculate final score:
   - Base score (70%)
   - Time bonus (15%)
   - Achievement bonus (10%)
   - Efficiency bonus (5%)
   - Corruption penalty
3. Check final achievements
4. Determine rating
5. Render ending screen with:
   - Final score
   - Score breakdown
   - Statistics
   - Achievements
   - Zones formed
   - Leaderboard (if backend)
6. Submit score to backend (if available)
7. Display leaderboard
```

---

## Technical Implementation

### Timer System

```javascript
function startTimer() {
    // Base time + time bank bonus
    const totalTime = difficultyModes[gameState.difficulty].timerPerScene +
                      gameState.timeBankSeconds;
    gameState.timerSeconds = totalTime;
    gameState.currentDecisionTime = totalTime;

    // Update every 100ms for smooth animation
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds -= 0.1;
        updateTimerDisplay();

        if (gameState.timerSeconds <= 0) {
            handleTimeout();
        }
    }, 100);
}

function handleTimeout() {
    stopTimer();
    gameState.timerExpired = true;
    gameState.achievementTracking.neverTimedOut = false;

    // Apply penalties
    gameState.happiness -= 10;
    gameState.cityFunds -= 5;
    gameState.specialInterest -= 8;
    gameState.timeBankSeconds -= 10;

    // Auto-select first choice
    makeChoice(currentSceneKey, 0, true);
}
```

### Time Bank System

Good/bad choices affect future timer duration:

```javascript
const totalImpact = (choice.effects.happiness || 0) +
                   (choice.effects.cityFunds || 0) +
                   (choice.effects.specialInterest || 0);

if (totalImpact > 5) {
    gameState.timeBankSeconds += 10; // Good choice
} else if (totalImpact < -5) {
    gameState.timeBankSeconds -= 5; // Bad choice
}
```

### Auto-Save System

```javascript
// In api-client.js
function startAutoSave(getStateFn, getScoreFn, getSceneFn) {
    autoSaveInterval = setInterval(async () => {
        const gameState = getStateFn();
        const score = getScoreFn();
        const currentScene = getSceneFn();

        await saveGame(gameState, score, currentScene);
    }, 30000); // Every 30 seconds
}
```

### Responsive Grid System

```javascript
function createCityGrid() {
    const gridSize = getGridSize();
    const container = document.getElementById('city-grid');

    // Set CSS grid template
    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${gridSize.rows}, 1fr)`;

    // Resize gameState.cityGrid if needed
    if (gameState.cityGrid.length !== gridSize.total) {
        gameState.cityGrid = Array(gridSize.total).fill(null);
    }
}
```

---

## Summary

**ManeStreet** is a complex narrative-driven city builder that combines:

1. **Branching story system** with meaningful choices
2. **Timed decision-making** with time bonuses
3. **Strategic building placement** with adjacency rules
4. **Progressive unlock system** tied to story choices
5. **Zone formation** for advanced city planning
6. **Multi-component scoring** with weighted factors
7. **Achievement system** across multiple categories
8. **Responsive design** (desktop/tablet/mobile)
9. **Dual input support** (mouse and touch)
10. **Backend integration** for persistence and leaderboards

The game teaches civic engagement and decision-making trade-offs through interactive gameplay, showing how political choices have consequences that affect different stakeholder groups.

---

## Complete Story Content

This section contains EVERY story scene, question, choice, effect, and consequence with a complete visual branching tree showing all possible paths through the game.

### Complete Narrative Flow Diagram

```
                                    ┌──────────┐
                                    │  intro   │
                                    │ (Welcome)│
                                    └────┬─────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │   choice1    │
                                  │Factory Proposal│
                                  └──┬────────┬──┘
                         ┌───────────┘        └───────────┐
                         │ Accept Factory                 │ Reject Factory
                         ▼                                 ▼
                  ┌────────────┐                    ┌────────────┐
                  │  choice2A  │                    │  choice2B  │
                  │  Factory   │                    │Unemployment│
                  │Construction│                    │   Crisis   │
                  └─────┬──────┘                    └──┬──────┬──┘
                        │ (Only 1 choice)              │      │
                        ▼                              │      │
                  ┌────────────┐              ┌───────┘      └────────┐
                  │  choice3A1 │              │ Tax Benefits       Infrastructure
                  │   Water    │              ▼                       ▼
                  │Contamination│        ┌────────────┐        ┌────────────┐
                  └──┬──────┬──┘         │  choice3B1 │        │  choice3B2 │
         ┌───────────┘      └──────────┐ │   Rising   │        │  Workplace │
         │ Tax Company      Raise Bills │ │  Tensions  │        │ Accidents  │
         ▼                              ▼ └──┬──────┬──┘        └──┬──────┬──┘
   ┌────────────┐                ┌────────────┐│      │      ┌─────┘      └─────┐
   │ choice4A11 │                │ choice4A12 ││Surveillance Training  Safety    Ignore
   │   Labor    │                │  Citizens  │▼      ▼       ▼         ▼
   │  Dispute   │                │   Revolt   │┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
   └──┬──────┬──┘                └──┬──────┬──┘│4B11  │  │4B12  │  │4B21  │  │4B22  │
      │      │                      │      │   │Privacy│  │Hiring│  │Slow  │  │Lawsuit│
      │      │                      │      │   └──┬┬──┘  └──┬┬──┘  └──┬┬──┘  └──┬┬──┘
      ▼      ▼                      ▼      ▼      ││       ││        ││        ││
    ending ending                 ending ending   ││       ││        ││        ││
  (2 paths)                      (2 paths)        ▼▼       ▼▼        ▼▼        ▼▼
                                                 ending  ending    ending    ending
                                                (2 each)(2 each) (2 each)  (2 each)

   ┌────────────┐
   │  choice3A2 │ ◄── ORPHANED SCENE (Not connected in current game flow)
   │   Angry    │     This scene exists in code but is not reachable
   │ Neighbors  │
   └──┬──┬───┬──┘
      │  │   │
      ▼  ▼   ▼
   choice4A21
   choice4A22
   choice4A23
      │  │   │
      ▼  ▼   ▼
  (Each has 2 choices → ending)
```

**Total Reachable Paths:** 14 unique endings
**Orphaned Paths:** 6 additional endings (choice3A2 branch)
**Total Scenes in Code:** 21 scenes (including intro, ending, and orphaned branch)

---

### Detailed Scene-by-Scene Breakdown

### Introduction

**Scene: intro**
- **Title:** Welcome to Tiger Central
- **Story:** Congratulations! You've just won the election to become the mayor of Tiger Central, a city with a population of 300,000. The previous mayor was corrupt—embezzling money, stealing from residents, and ultimately disappearing without a trace, leaving Tiger Central in shambles. The city needs strong leadership to rebuild. Every decision you make will have consequences that affect different groups of people. There are no perfect solutions—only choices and their outcomes. Can you restore Tiger Central to its former glory while keeping everyone happy?
- **Choices:**
  - 🚀 **Start Your Mayoral Journey** → Leads to choice1

---

### Chapter 1: Economic Opportunity

**Scene: choice1**
- **Title:** A Factory Proposal
- **Story:** A large manufacturing company, TigerTech Industries, has approached the city with an interesting proposition. They want to build a factory in Tiger Central, promising to bring 500 jobs to the community and offering $10 million to the city as an incentive. The factory would be located near the river that flows through our city, giving them access to water for manufacturing. However, factories can bring pollution, traffic, and other concerns. What do you decide?

**Choices:**

| Choice | Icon | Effects | Next Scene | Unlocks | Features |
|--------|------|---------|------------|---------|----------|
| **Accept the factory deal** | ✅ | Happiness: +10<br>Funds: +20<br>Interest: +15<br>Profit: +5 | choice2A | factory, house | Places river |
| **Reject the factory** | ❌ | Happiness: -10<br>Funds: -10<br>Interest: -15<br>Profit: 0 | choice2B | park, house | Places protected forest |

**Consequences:**
- **Accept:** TigerTech Industries is excited to begin construction near the river. Citizens are hopeful about new job opportunities. The river will appear on your city map.
- **Reject:** TigerTech Industries is disappointed. Unemployment remains high, and residents are worried about job prospects. Environmental groups propose protecting the riverside forest instead.

---

### Path A: Factory Branch

#### Scene: choice2A - Factory Construction Begins

**Chapter:** Chapter 1: Location Matters
- **Story:** Now that you've approved the factory, TigerTech needs to place it on your city grid. Look at the 🌊 river flowing through your city - the factory must be placed adjacent to the river for water access. Note: Only cells next to the river will be available for placement. Choose wisely!

**Choices:**

| Choice | Icon | Effects | Next Scene | Unlocks | Special |
|--------|------|---------|------------|---------|---------|
| **Approve riverside construction** | 🏭 | Happiness: -5<br>Funds: +5<br>Interest: +10<br>Profit: +3 | choice3A1 | park, shop | Mandatory factory placement (river-adjacent only) |

**Consequence:** The factory is operational by the river. It has excellent water access for manufacturing.

---

#### Scene: choice3A1 - Water Contamination

**Chapter:** Chapter 1: Pollution Problems
- **Story:** The factory near the river is now operational, but there's a serious problem. Chemical waste from manufacturing is contaminating the water supply. The city needs expensive water treatment to keep it safe. Who should pay for this?

**Choices:**

| Choice | Icon | Effects | Next Scene | Unlocks |
|--------|------|---------|------------|---------|
| **Tax TigerTech Industries** | 🏭 | Happiness: +15<br>Funds: +10<br>Interest: -10<br>Profit: 0 | choice4A11 | office |
| **Raise water bills for citizens** | 💧 | Happiness: -20<br>Funds: +15<br>Interest: +10<br>Profit: +5 | choice4A12 | - |

**Consequences:**
- **Tax Company:** Citizens appreciate you holding the company accountable. The company agrees to install water treatment systems.
- **Raise Bills:** Citizens are outraged that they're paying for corporate pollution. The river becomes visibly polluted. (River → Polluted River)

---

#### Scene: choice4A11 - Labor Dispute

**Chapter:** Chapter 1: Corporate Backlash
- **Story:** TigerTech Industries is retaliating against the pollution taxes you imposed. They're threatening to cut wages and hours for their 500 employees. Do you intervene?

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Implement labor protection laws** | ⚖️ | Happiness: +15<br>Funds: 0<br>Interest: -15<br>Profit: 0 | ending |
| **Let the company cut wages** | 📉 | Happiness: -15<br>Funds: 0<br>Interest: +10<br>Profit: +3 | ending |

**Consequences:**
- **Protection Laws:** Workers are protected, but TigerTech considers leaving Tiger Central.
- **Cut Wages:** Workers face pay cuts. Families struggle.

---

#### Scene: choice4A12 - Citizens Revolt

**Chapter:** Chapter 1: Public Protest
- **Story:** Protests have erupted throughout Tiger Central! Citizens are furious that they're paying for water treatment while the polluting company faces no consequences.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Meet with protest leaders** | 🤝 | Happiness: +10<br>Funds: -5<br>Interest: -10<br>Profit: 0 | ending |
| **Send in police** | 🚔 | Happiness: -25<br>Funds: -5<br>Interest: +5<br>Profit: 0 | ending |

**Consequences:**
- **Meet Leaders:** You listen to citizens' concerns and promise reform. Trust begins to rebuild.
- **Police:** Protests are dispersed by force. Resentment grows.

---

#### Scene: choice3A2 - Angry Neighbors

**Chapter:** Chapter 1: Suburban Unrest
- **Story:** The factory near the suburban area has caused major problems for residents. Noise, traffic, and pollution have increased dramatically. Property values are dropping, and residents are demanding action.

**Choices:**

| Choice | Icon | Effects | Next Scene | Special |
|--------|------|---------|------------|---------|
| **Offer compensation to residents** | 💵 | Happiness: +5<br>Funds: -15<br>Interest: -5<br>Profit: 0 | choice4A21 | - |
| **Build new homes and relocate** | 🏠 | Happiness: +10<br>Funds: -20<br>Interest: 0<br>Profit: 0 | choice4A22 | Mandatory house placement |
| **Ignore their complaints** | 🙉 | Happiness: -25<br>Funds: +5<br>Interest: +15<br>Profit: +10 | choice4A23 | - |

**Consequences:**
- **Compensation:** Residents receive financial compensation. The city budget is stretched thin.
- **Relocate:** New homes are being constructed. Relocation plans are underway.
- **Ignore:** Residents feel abandoned. Trust in your leadership is declining rapidly.

---

#### Scene: choice4A21 - Financial Strain

**Chapter:** Chapter 1: Budget Crisis
- **Story:** Compensating residents has created a budget shortfall. You need to balance the budget somehow.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Raise local taxes** | 📊 | Happiness: -15<br>Funds: +15<br>Interest: -5<br>Profit: 0 | ending |
| **Cut education and parks funding** | ✂️ | Happiness: -20<br>Funds: +15<br>Interest: +5<br>Profit: 0 | ending |

**Consequences:**
- **Taxes:** Tax increases anger citizens, but the budget is stabilized.
- **Cuts:** Schools and parks suffer. Families with children are upset.

---

#### Scene: choice4A22 - Housing Crisis

**Chapter:** Chapter 1: Construction Delays
- **Story:** The new homes for relocated residents are behind schedule. The contractor is having trouble finding materials and costs are rising.

**Choices:**

| Choice | Icon | Effects | Next Scene | Special |
|--------|------|---------|------------|---------|
| **Rush with cheaper materials** | ⏰ | Happiness: -10<br>Funds: +5<br>Interest: +5<br>Profit: +3 | ending | - |
| **Spend extra for quality** | 💎 | Happiness: +15<br>Funds: -20<br>Interest: -5<br>Profit: 0 | ending | Mandatory house placement |

**Consequences:**
- **Rush:** Homes are completed quickly but quality is poor.
- **Quality:** Beautiful, safe homes are built. The budget takes a hit.

---

#### Scene: choice4A23 - Illegal Expansion

**Chapter:** Chapter 1: Corporate Overreach
- **Story:** TigerTech has taken advantage of your inaction! They've been illegally expanding their operations onto protected land.

**Choices:**

| Choice | Icon | Effects | Next Scene | Special |
|--------|------|---------|------------|---------|
| **Continue ignoring it** | 🙈 | Happiness: -30<br>Funds: 0<br>Interest: +20<br>Profit: +15 | ending | - |
| **Fine the company** | ⚡ | Happiness: +20<br>Funds: +10<br>Interest: -20<br>Profit: 0 | ending | Mandatory park placement |

**Consequences:**
- **Ignore:** Your inaction becomes a scandal. Citizens have lost all faith.
- **Fine:** You finally take a stand. Citizens applaud!

---

### Path B: Reject Factory Branch

#### Scene: choice2B - Addressing Joblessness

**Chapter:** Chapter 1: Unemployment Crisis
- **Story:** Without the factory, unemployment remains high in Tiger Central. People are struggling to make ends meet. You need to find a way to help unemployed citizens. What's your approach?

**Choices:**

| Choice | Icon | Effects | Next Scene | Unlocks |
|--------|------|---------|------------|---------|
| **Raise taxes for unemployment benefits** | 💰 | Happiness: -15<br>Funds: +10<br>Interest: -5<br>Profit: 0 | choice3B1 | shop |
| **Hire people for infrastructure projects** | 🛠️ | Happiness: +10<br>Funds: -15<br>Interest: +5<br>Profit: 0 | choice3B2 | office |

**Consequences:**
- **Taxes:** Unemployment benefits help struggling families, but working citizens feel the tax burden.
- **Infrastructure:** New infrastructure jobs are created. Roads and bridges are being renovated. (Mandatory office placement)

---

#### Scene: choice3B1 - Rising Tensions

**Chapter:** Chapter 1: Social Division
- **Story:** The unemployment tax has created serious social tensions in Tiger Central. Employed and unemployed citizens are clashing. Crime is increasing, and neighborhood disputes are common.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Increase surveillance** | 📹 | Happiness: -10<br>Funds: -10<br>Interest: +10<br>Profit: 0 | choice4B11 |
| **Fund job-training programs** | 📚 | Happiness: +15<br>Funds: -15<br>Interest: -5<br>Profit: 0 | choice4B12 |

**Consequences:**
- **Surveillance:** More cameras and police patrol the streets. Crime drops, but citizens feel watched.
- **Training:** Training programs begin. Unemployed citizens are learning new skills. (Mandatory office placement)

---

#### Scene: choice4B11 - Privacy Concerns

**Chapter:** Chapter 1: Surveillance State
- **Story:** Crime has dropped thanks to increased surveillance, but citizens are uneasy. People feel like they're always being watched.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Scale back surveillance** | 🔙 | Happiness: +10<br>Funds: +5<br>Interest: -10<br>Profit: 0 | ending |
| **Double down** | 🔒 | Happiness: -20<br>Funds: -10<br>Interest: +15<br>Profit: 0 | ending |

**Consequences:**
- **Scale Back:** Citizens breathe easier with less monitoring.
- **Double Down:** Tiger Central becomes a surveillance state.

---

#### Scene: choice4B12 - Hiring Hesitation

**Chapter:** Chapter 1: Employment Challenge
- **Story:** The job-training programs are producing qualified workers, but local businesses are hesitant to hire trainees.

**Choices:**

| Choice | Icon | Effects | Next Scene | Special |
|--------|------|---------|------------|---------|
| **Place hiring quotas** | 📋 | Happiness: +5<br>Funds: 0<br>Interest: -15<br>Profit: 0 | ending | - |
| **Offer tax breaks** | 💸 | Happiness: +10<br>Funds: -10<br>Interest: +10<br>Profit: 0 | ending | Mandatory shop placement |

**Consequences:**
- **Quotas:** Businesses must hire trainees. Some comply grudgingly.
- **Tax Breaks:** Tax incentives work! Employment rises.

---

#### Scene: choice3B2 - Workplace Accidents

**Chapter:** Chapter 1: Safety Concerns
- **Story:** The infrastructure projects have created jobs, but workplace accidents and injuries are increasing dramatically. What's your response?

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Increase safety regulations** | ⚠️ | Happiness: +10<br>Funds: -10<br>Interest: -5<br>Profit: 0 | choice4B21 |
| **Ignore safety concerns** | ⏩ | Happiness: -20<br>Funds: +10<br>Interest: +10<br>Profit: +5 | choice4B22 |

**Consequences:**
- **Safety:** New safety rules are implemented. Workers feel safer, but projects are slowing down.
- **Ignore:** Projects move forward quickly, but injuries continue to mount.

---

#### Scene: choice4B21 - Slowing Progress

**Chapter:** Chapter 1: Productivity Crisis
- **Story:** The new safety regulations are protecting workers, but productivity has dropped. Projects are behind schedule.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Fire underperforming employees** | ❌ | Happiness: -15<br>Funds: +5<br>Interest: +10<br>Profit: 0 | ending |
| **Extend deadlines** | ⏱️ | Happiness: +10<br>Funds: -5<br>Interest: -10<br>Profit: 0 | ending |

**Consequences:**
- **Fire:** Projects speed up, but workers live in fear.
- **Extend:** Quality and safety improve. Citizens appreciate patience.

---

#### Scene: choice4B22 - Lawsuits Mounting

**Chapter:** Chapter 1: Legal Trouble
- **Story:** Injury reports are piling up, and now the lawsuits are coming. Injured workers are demanding compensation.

**Choices:**

| Choice | Icon | Effects | Next Scene |
|--------|------|---------|------------|
| **Pay employees to keep quiet** | 💰 | Happiness: -20<br>Funds: -15<br>Interest: +10<br>Profit: -5 | ending |
| **Let them bring cases to court** | ⚖️ | Happiness: +5<br>Funds: -20<br>Interest: -15<br>Profit: 0 | ending |

**Consequences:**
- **Hush Money:** Hush money works temporarily, but rumors spread.
- **Court:** The truth comes out. You take responsibility and promise reform.

---

### Complete Path Mappings

This section maps out EVERY possible path from start to finish.

#### Path A Branch (Accept Factory) - 4 Endings

**Path A1:** Accept Factory → Approve Construction → Tax Company → Labor Protection Laws
```
intro → choice1 (Accept) → choice2A (Approve) → choice3A1 (Tax Company) → choice4A11 (Labor Laws) → ending
Effects Cumulative: H:+35, F:+35, I:+10, P:+8
```

**Path A2:** Accept Factory → Approve Construction → Tax Company → Let Company Cut Wages
```
intro → choice1 (Accept) → choice2A (Approve) → choice3A1 (Tax Company) → choice4A11 (Cut Wages) → ending
Effects Cumulative: H:+5, F:+35, I:+35, P:+11
```

**Path A3:** Accept Factory → Approve Construction → Raise Water Bills → Meet Protest Leaders
```
intro → choice1 (Accept) → choice2A (Approve) → choice3A1 (Raise Bills) → choice4A12 (Meet Leaders) → ending
Effects Cumulative: H:-5, F:+35, I:+15, P:+13
```

**Path A4:** Accept Factory → Approve Construction → Raise Water Bills → Send Police
```
intro → choice1 (Accept) → choice2A (Approve) → choice3A1 (Raise Bills) → choice4A12 (Police) → ending
Effects Cumulative: H:-40, F:+35, I:+30, P:+13
```

---

#### Path B Branch (Reject Factory) - 10 Endings

**Path B1:** Reject Factory → Tax Benefits → Surveillance → Scale Back
```
intro → choice1 (Reject) → choice2B (Tax) → choice3B1 (Surveillance) → choice4B11 (Scale Back) → ending
Effects Cumulative: H:-5, F:+5, I:-20, P:0
```

**Path B2:** Reject Factory → Tax Benefits → Surveillance → Double Down
```
intro → choice1 (Reject) → choice2B (Tax) → choice3B1 (Surveillance) → choice4B11 (Double Down) → ending
Effects Cumulative: H:-45, F:-5, I:-5, P:0
```

**Path B3:** Reject Factory → Tax Benefits → Training Programs → Hiring Quotas
```
intro → choice1 (Reject) → choice2B (Tax) → choice3B1 (Training) → choice4B12 (Quotas) → ending
Effects Cumulative: H:+10, F:-5, I:-25, P:0
```

**Path B4:** Reject Factory → Tax Benefits → Training Programs → Tax Breaks
```
intro → choice1 (Reject) → choice2B (Tax) → choice3B1 (Training) → choice4B12 (Tax Breaks) → ending
Effects Cumulative: H:+20, F:-15, I:-10, P:0
```

**Path B5:** Reject Factory → Infrastructure → Safety Regulations → Fire Employees
```
intro → choice1 (Reject) → choice2B (Infrastructure) → choice3B2 (Safety) → choice4B21 (Fire) → ending
Effects Cumulative: H:+5, F:-20, I:+10, P:0
```

**Path B6:** Reject Factory → Infrastructure → Safety Regulations → Extend Deadlines
```
intro → choice1 (Reject) → choice2B (Infrastructure) → choice3B2 (Safety) → choice4B21 (Extend) → ending
Effects Cumulative: H:+30, F:-30, I:-10, P:0
```

**Path B7:** Reject Factory → Infrastructure → Ignore Safety → Hush Money
```
intro → choice1 (Reject) → choice2B (Infrastructure) → choice3B2 (Ignore) → choice4B22 (Hush) → ending
Effects Cumulative: H:-20, F:-20, I:-10, P:0
```

**Path B8:** Reject Factory → Infrastructure → Ignore Safety → Court Cases
```
intro → choice1 (Reject) → choice2B (Infrastructure) → choice3B2 (Ignore) → choice4B22 (Court) → ending
Effects Cumulative: H:-5, F:-45, I:-25, P:0
```

---

#### Orphaned Path (choice3A2 Branch) - 6 Endings (NOT REACHABLE)

**Note:** These scenes exist in the code but are not connected to the main narrative flow.

**Orphan Path 1:** choice3A2 → Compensation → Raise Taxes
```
choice3A2 (Compensate) → choice4A21 (Taxes) → ending
Effects: H:-10, F:0, I:-10, P:0
```

**Orphan Path 2:** choice3A2 → Compensation → Cut Funding
```
choice3A2 (Compensate) → choice4A21 (Cuts) → ending
Effects: H:-15, F:0, I:0, P:0
```

**Orphan Path 3:** choice3A2 → Relocate → Rush Materials
```
choice3A2 (Relocate) → choice4A22 (Rush) → ending
Effects: H:0, F:-15, I:+5, P:+3
```

**Orphan Path 4:** choice3A2 → Relocate → Quality Materials
```
choice3A2 (Relocate) → choice4A22 (Quality) → ending
Effects: H:+25, F:-40, I:-5, P:0
```

**Orphan Path 5:** choice3A2 → Ignore → Continue Ignoring
```
choice3A2 (Ignore) → choice4A23 (Continue Ignore) → ending
Effects: H:-55, F:+5, I:+35, P:+25
```

**Orphan Path 6:** choice3A2 → Ignore → Fine Company
```
choice3A2 (Ignore) → choice4A23 (Fine) → ending
Effects: H:-5, F:+15, I:+10, P:+10
```

---

### Decision Tree Summary

**Total Scenes:** 21 (including intro and ending)
**Reachable Scenes:** 15 scenes (intro + 13 choice scenes + ending)
**Orphaned Scenes:** 4 scenes (choice3A2 and its 3 descendants)
**Total Unique Choice Points:** 35 decision points
**Reachable Endings:** 14 unique endings
**Orphaned Endings:** 6 unreachable endings
**Total Endings in Code:** 20 unique ending paths

**Choice Distribution:**
- Intro: 1 choice
- Chapter 1 Main: 2 choices
- Second Level: 4 scenes with 2-3 choices each
- Third Level: 8 scenes with 2 choices each
- Fourth Level: 8 scenes with 2 choices each
- Ending: 1 scene (results)

**Stat Effects Range:**
- Happiness: -30 to +20
- City Funds: -20 to +20
- Special Interest: -20 to +20
- Personal Profit: -5 to +15

**Building Unlocks:**
- Factory unlocked via: Accept factory path
- House unlocked via: Both main paths
- Park unlocked via: Both paths (different points)
- Shop unlocked via: Factory path & reject path
- Office unlocked via: Reject factory path

**Grid Features:**
- River: Placed when accepting factory
- Polluted River: Replaces river if citizens pay for pollution
- Protected Forest: Placed when rejecting factory

---

### Complete Scene Reference Table

This table shows ALL scenes with their properties in one comprehensive view:

| Scene ID | Title | # Choices | Next Scenes | Unlocks | Features | Special |
|----------|-------|-----------|-------------|---------|----------|---------|
| **intro** | Welcome to Tiger Central | 1 | choice1 | - | - | - |
| **choice1** | A Factory Proposal | 2 | choice2A, choice2B | factory/house OR park/house | river OR forest | Achievement tag |
| **choice2A** | Factory Construction | 1 | choice3A1 | park, shop | - | Mandatory factory |
| **choice2B** | Addressing Joblessness | 2 | choice3B1, choice3B2 | shop OR office | - | Mandatory office |
| **choice3A1** | Water Contamination | 2 | choice4A11, choice4A12 | office OR - | - | River pollution |
| **choice3A2** 🔒 | Angry Neighbors | 3 | choice4A21, choice4A22, choice4A23 | - | - | Mandatory house |
| **choice3B1** | Rising Tensions | 2 | choice4B11, choice4B12 | - | - | Mandatory office |
| **choice3B2** | Workplace Accidents | 2 | choice4B21, choice4B22 | - | - | - |
| **choice4A11** | Labor Dispute | 2 | ending, ending | - | - | - |
| **choice4A12** | Citizens Revolt | 2 | ending, ending | - | - | - |
| **choice4A21** 🔒 | Financial Strain | 2 | ending, ending | - | - | - |
| **choice4A22** 🔒 | Housing Crisis | 2 | ending, ending | - | - | Mandatory house |
| **choice4A23** 🔒 | Illegal Expansion | 2 | ending, ending | - | - | Mandatory park |
| **choice4B11** | Privacy Concerns | 2 | ending, ending | - | - | - |
| **choice4B12** | Hiring Hesitation | 2 | ending, ending | - | - | Mandatory shop |
| **choice4B21** | Slowing Progress | 2 | ending, ending | - | - | - |
| **choice4B22** | Lawsuits Mounting | 2 | ending, ending | - | - | - |
| **ending** | Your Term Ends | 0 | - | - | - | Score screen |

🔒 = Orphaned scene (not connected to main flow)

---

### All Choices with Full Effects

| Scene | Choice Text | Icon | H | F | I | P | Next |
|-------|-------------|------|---|---|---|---|------|
| **choice1** | Accept factory | ✅ | +10 | +20 | +15 | +5 | choice2A |
| **choice1** | Reject factory | ❌ | -10 | -10 | -15 | 0 | choice2B |
| **choice2A** | Approve riverside | 🏭 | -5 | +5 | +10 | +3 | choice3A1 |
| **choice2B** | Tax for benefits | 💰 | -15 | +10 | -5 | 0 | choice3B1 |
| **choice2B** | Infrastructure jobs | 🛠️ | +10 | -15 | +5 | 0 | choice3B2 |
| **choice3A1** | Tax TigerTech | 🏭 | +15 | +10 | -10 | 0 | choice4A11 |
| **choice3A1** | Raise water bills | 💧 | -20 | +15 | +10 | +5 | choice4A12 |
| **choice3A2** 🔒 | Compensation | 💵 | +5 | -15 | -5 | 0 | choice4A21 |
| **choice3A2** 🔒 | Relocate | 🏠 | +10 | -20 | 0 | 0 | choice4A22 |
| **choice3A2** 🔒 | Ignore | 🙉 | -25 | +5 | +15 | +10 | choice4A23 |
| **choice3B1** | Surveillance | 📹 | -10 | -10 | +10 | 0 | choice4B11 |
| **choice3B1** | Training | 📚 | +15 | -15 | -5 | 0 | choice4B12 |
| **choice3B2** | Safety regs | ⚠️ | +10 | -10 | -5 | 0 | choice4B21 |
| **choice3B2** | Ignore safety | ⏩ | -20 | +10 | +10 | +5 | choice4B22 |
| **choice4A11** | Labor laws | ⚖️ | +15 | 0 | -15 | 0 | ending |
| **choice4A11** | Cut wages | 📉 | -15 | 0 | +10 | +3 | ending |
| **choice4A12** | Meet leaders | 🤝 | +10 | -5 | -10 | 0 | ending |
| **choice4A12** | Police | 🚔 | -25 | -5 | +5 | 0 | ending |
| **choice4A21** 🔒 | Taxes | 📊 | -15 | +15 | -5 | 0 | ending |
| **choice4A21** 🔒 | Cut funding | ✂️ | -20 | +15 | +5 | 0 | ending |
| **choice4A22** 🔒 | Rush | ⏰ | -10 | +5 | +5 | +3 | ending |
| **choice4A22** 🔒 | Quality | 💎 | +15 | -20 | -5 | 0 | ending |
| **choice4A23** 🔒 | Keep ignoring | 🙈 | -30 | 0 | +20 | +15 | ending |
| **choice4A23** 🔒 | Fine company | ⚡ | +20 | +10 | -20 | 0 | ending |
| **choice4B11** | Scale back | 🔙 | +10 | +5 | -10 | 0 | ending |
| **choice4B11** | Double down | 🔒 | -20 | -10 | +15 | 0 | ending |
| **choice4B12** | Quotas | 📋 | +5 | 0 | -15 | 0 | ending |
| **choice4B12** | Tax breaks | 💸 | +10 | -10 | +10 | 0 | ending |
| **choice4B21** | Fire workers | ❌ | -15 | +5 | +10 | 0 | ending |
| **choice4B21** | Extend deadlines | ⏱️ | +10 | -5 | -10 | 0 | ending |
| **choice4B22** | Hush money | 💰 | -20 | -15 | +10 | -5 | ending |
| **choice4B22** | Court | ⚖️ | +5 | -20 | -15 | 0 | ending |

**Legend:**
- H = Happiness effect
- F = City Funds effect
- I = Special Interest effect
- P = Personal Profit effect
- 🔒 = Orphaned/unreachable

---

**Version:** 1.0
**Last Updated:** 2025-10-31
