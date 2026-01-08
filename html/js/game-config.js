// ==================== GAME CONFIGURATION ====================
// Data definitions, constants, and game state

// ==================== MOBILE DETECTION ====================
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
}

function getGridSize() {
    // Return different grid sizes based on screen size
    if (window.innerWidth <= 480) {
        return { cols: 6, rows: 4, total: 24 };
    } else if (window.innerWidth <= 768) {
        return { cols: 8, rows: 4, total: 32 };
    } else {
        return { cols: 10, rows: 6, total: 60 };
    }
}

// ==================== DIFFICULTY MODES ====================
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

// ==================== GAME STATE ====================
const gameState = {
    happiness: 50,
    cityFunds: 50,
    specialInterest: 50,
    personalProfit: 0,
    currentScene: 'intro', // Track current scene for auto-save
    decisions: [],
    buildings: ['city-hall', 'house', 'house'],
    timerSeconds: 30,
    isTimerRunning: false,
    timerInterval: null,
    timerExpired: false,   // Flag to track if timer ran out
    choiceMade: false,     // Flag to prevent multiple clicks on same choice
    timeBonus: 0,          // Total time bonus points accumulated
    timeBankSeconds: 0,    // Extra seconds to add to next timer
    currentDecisionTime: 0, // Time when decision was started
    cityGrid: Array(60).fill(null), // Grid cells (responsive: 60/32/24) - stores buildings AND features
    gridFeatures: [],      // Track all placed grid features (river, mountains, etc.)
    buildingHistory: [],   // Track last 3 placements for undo
    undoCount: 3,          // Number of undos remaining
    planningEfficiency: 0, // City planning efficiency score (0-100)
    detectedZones: [],     // Array of detected zones
    achievements: [],      // Unlocked achievements
    achievementTracking: { // Track progress toward story-based achievements
        builtNearRiver: false,
        rejectedFactory: false,
        neverTimedOut: true,
        usedNoUndos: true,
        usedNoRelocations: true
    },
    unlockedBuildings: [], // Buildings unlocked through story choices
    pendingBuildingPlacement: null, // Building that must be placed before continuing
    awaitingPlacement: false, // Is game waiting for mandatory placement?
    placementConstraints: null, // { allowedCells: [array of cell indices] } - restricts where buildings can be placed
    difficulty: null,      // Selected difficulty mode
    maxRelocations: 3,     // Max relocations allowed
    relocationsUsed: 0,    // Number of relocations used
    gameStartTime: null,   // Track game start for Rush Hour achievement
    gameEndTime: null      // Track game end time
};

// ==================== BUILDING SYSTEM ====================
const buildingTypes = {
    // ============ CHAPTER 1 BUILDINGS ============
    'city-hall': {
        width: 120,
        height: 140,
        windows: 12,
        color: '#3498db',
        icon: '🏛️',
        cost: 0, // Pre-placed
        baseEffects: { happiness: 5, cityFunds: 0, specialInterest: 5 },
        adjacencyBonus: {
            near: ['office', 'park'],
            effect: { specialInterest: 3 }
        },
        description: 'City Hall - Government center'
    },
    'house': {
        width: 80,
        height: 100,
        windows: 6,
        color: '#e67e22',
        icon: '🏠',
        cost: 10,
        baseEffects: { happiness: 5, cityFunds: 0, specialInterest: 0 },
        adjacencyBonus: {
            near: ['park', 'shop', 'school'],
            effect: { happiness: 2 }
        },
        adjacencyPenalty: {
            near: ['factory', 'skyscraper'],
            effect: { happiness: -4 }
        },
        description: 'Residential Housing - Homes for citizens, relocation'
    },
    'shop': {
        width: 70,
        height: 90,
        windows: 4,
        color: '#e74c3c',
        icon: '🏪',
        cost: 15,
        baseEffects: { happiness: 3, cityFunds: 5, specialInterest: 3 },
        adjacencyBonus: {
            near: ['house', 'office', 'event_venue'],
            effect: { cityFunds: 2 }
        },
        description: 'Small Business - Local commerce'
    },
    'factory': {
        width: 150,
        height: 120,
        windows: 16,
        color: '#95a5a6',
        icon: '🏭',
        cost: 20,
        baseEffects: { happiness: -5, cityFunds: 10, specialInterest: 15 },
        adjacencyBonus: {
            near: ['river'],
            effect: { cityFunds: 5 }
        },
        adjacencyPenalty: {
            near: ['house', 'park', 'school', 'hospital'],
            effect: { happiness: -4 }
        },
        description: 'Industrial Factory - Heavy manufacturing'
    },
    'park': {
        width: 100,
        height: 80,
        windows: 0,
        color: '#2ecc71',
        icon: '🌳',
        cost: 12,
        baseEffects: { happiness: 8, cityFunds: 0, specialInterest: 0 },
        adjacencyBonus: {
            near: ['house', 'school', 'hospital', 'flooded_area'],
            effect: { happiness: 3 }
        },
        adjacencyPenalty: {
            near: ['factory', 'skyscraper'],
            effect: { happiness: -3 }
        },
        description: 'Public Park - Green space, community healing'
    },
    'office': {
        width: 90,
        height: 130,
        windows: 12,
        color: '#9b59b6',
        icon: '🏢',
        cost: 18,
        baseEffects: { happiness: 0, cityFunds: 5, specialInterest: 8 },
        adjacencyBonus: {
            near: ['shop', 'park', 'city-hall'],
            effect: { specialInterest: 2 }
        },
        description: 'Office Building - White collar jobs'
    },

    // ============ CHAPTER 2 - EMERGENCY RESPONSE ============
    'shelter': {
        width: 110,
        height: 95,
        windows: 8,
        color: '#f39c12',
        icon: '🏕️',
        cost: 12,
        baseEffects: { happiness: 8, cityFunds: 0, specialInterest: 5 },
        adjacencyBonus: {
            near: ['house', 'hospital', 'flooded_area', 'storm_damage'],
            effect: { happiness: 6 }
        },
        description: 'Emergency Shelter - Evacuation & disaster relief'
    },
    'police': {
        width: 95,
        height: 105,
        windows: 10,
        color: '#2980b9',
        icon: '🚓',
        cost: 15,
        baseEffects: { happiness: 5, cityFunds: -5, specialInterest: 10 },
        adjacencyBonus: {
            near: ['house', 'shop', 'flooded_area', 'storm_damage'],
            effect: { happiness: 4 }
        },
        adjacencyPenalty: {
            near: ['park', 'school'],
            effect: { happiness: -2 }
        },
        description: 'Police Station - Emergency coordination & security'
    },
    'hospital': {
        width: 140,
        height: 120,
        windows: 16,
        color: '#c0392b',
        icon: '🏥',
        cost: 22,
        baseEffects: { happiness: 15, cityFunds: -10, specialInterest: 0 },
        adjacencyBonus: {
            near: ['house', 'shelter', 'flooded_area'],
            effect: { happiness: 10 }
        },
        adjacencyPenalty: {
            near: ['factory', 'skyscraper'],
            effect: { happiness: -4 }
        },
        description: 'Hospital - Critical medical care & disaster response'
    },

    // ============ CHAPTER 2 - RECOVERY & INFRASTRUCTURE ============
    'school': {
        width: 120,
        height: 100,
        windows: 12,
        color: '#16a085',
        icon: '🏫',
        cost: 18,
        baseEffects: { happiness: 12, cityFunds: -8, specialInterest: -5 },
        adjacencyBonus: {
            near: ['house', 'park'],
            effect: { happiness: 6 }
        },
        adjacencyPenalty: {
            near: ['factory', 'police', 'skyscraper'],
            effect: { happiness: -4 }
        },
        description: 'School - Education, standing up to donors'
    },
    'event_venue': {
        width: 130,
        height: 110,
        windows: 0,
        color: '#8e44ad',
        icon: '🎪',
        cost: 20,
        baseEffects: { happiness: 10, cityFunds: 5, specialInterest: 8 },
        adjacencyBonus: {
            near: ['park', 'shop', 'office'],
            effect: { happiness: 4, specialInterest: 5 }
        },
        description: 'Event Venue - Fundraisers, town halls, PR events'
    },
    'water_pump': {
        width: 80,
        height: 70,
        windows: 0,
        color: '#3498db',
        icon: '💧',
        cost: 14,
        baseEffects: { happiness: 5, cityFunds: -5, specialInterest: 3 },
        adjacencyBonus: {
            near: ['flooded_area', 'river'],
            effect: { happiness: 8, cityFunds: 5 }
        },
        description: 'Water Pump - Flood control & recovery infrastructure'
    },

    // ============ CHAPTER 2 - CORRUPTION PATH ============
    'skyscraper': {
        width: 100,
        height: 160,
        windows: 20,
        color: '#34495e',
        icon: '🏙️',
        cost: 25,
        baseEffects: { happiness: -5, cityFunds: 15, specialInterest: 15 },
        adjacencyBonus: {
            near: ['office', 'shop', 'flooded_area'],
            effect: { cityFunds: 7, specialInterest: 5 }
        },
        adjacencyPenalty: {
            near: ['house', 'park', 'school', 'hospital'],
            effect: { happiness: -6 }
        },
        description: 'Skyscraper - Luxury development, disaster capitalism'
    }
};

// ==================== GRID FEATURES SYSTEM ====================
// Fixed environmental features that appear based on story choices
const gridFeatures = {
    river: {
        id: 'river',
        name: 'River',
        icon: '🌊',
        description: 'Natural water source',
        buildable: false, // Can't build on river
        color: '#3498db',
        adjacencyEffects: {
            factory: { bonus: { cityFunds: 5 }, message: '🏭 Factory has water access!' },
            park: { bonus: { happiness: 3 }, message: '🌳 Riverside park is beautiful!' },
            house: { bonus: { happiness: 2 }, message: '🏠 Waterfront property!' }
        }
    },
    polluted_river: {
        id: 'polluted_river',
        name: 'Polluted River',
        icon: '🌊',
        description: 'Contaminated water',
        buildable: false,
        color: '#7f8c8d',
        adjacencyEffects: {
            house: { penalty: { happiness: -5 }, message: '🏠 Polluted water nearby!' },
            park: { penalty: { happiness: -3 }, message: '🌳 Park affected by pollution!' }
        }
    },
    mountain: {
        id: 'mountain',
        name: 'Mountain',
        icon: '⛰️',
        description: 'Scenic highlands',
        buildable: false,
        color: '#95a5a6',
        adjacencyEffects: {
            park: { bonus: { happiness: 4 }, message: '🌳 Mountain park is stunning!' },
            house: { bonus: { happiness: 2 }, message: '🏠 Mountain view property!' }
        }
    },
    highway: {
        id: 'highway',
        name: 'Highway',
        icon: '🛣️',
        description: 'Major road',
        buildable: false,
        color: '#34495e',
        adjacencyEffects: {
            shop: { bonus: { cityFunds: 4 }, message: '🏪 Highway access boosts business!' },
            office: { bonus: { specialInterest: 3 }, message: '🏢 Easy commute for workers!' },
            factory: { bonus: { cityFunds: 3 }, message: '🏭 Easy shipping access!' },
            house: { penalty: { happiness: -4 }, message: '🏠 Highway noise disturbs residents!' }
        }
    },
    protected_forest: {
        id: 'protected_forest',
        name: 'Protected Forest',
        icon: '🌲',
        description: 'Environmental preserve',
        buildable: false,
        color: '#27ae60',
        adjacencyEffects: {
            park: { bonus: { happiness: 5 }, message: '🌳 Park integrated with nature!' },
            house: { bonus: { happiness: 3 }, message: '🏠 Living near nature!' },
            factory: { penalty: { specialInterest: -8 }, message: '🏭 Environmental groups protest factory!' }
        }
    },
    city_hall: {
        id: 'city_hall',
        name: 'City Hall',
        icon: '🏛️',
        description: 'Government center',
        buildable: false,
        color: '#3498db',
        adjacencyEffects: {
            office: { bonus: { specialInterest: 4 }, message: '🏢 Close to government!' },
            park: { bonus: { happiness: 2 }, message: '🌳 Central park!' }
        }
    },
    existing_neighborhood: {
        id: 'existing_neighborhood',
        name: 'Existing Homes',
        icon: '🏘️',
        description: 'Pre-existing neighborhood',
        buildable: false,
        color: '#e67e22',
        isBuilding: true, // Acts like a building for adjacency
        adjacencyEffects: {
            shop: { bonus: { cityFunds: 3 }, message: '🏪 Shops serve existing residents!' },
            park: { bonus: { happiness: 3 }, message: '🌳 Park for the neighborhood!' },
            factory: { penalty: { happiness: -6 }, message: '🏭 Residents protest factory!' }
        }
    },
    // Chapter 2 Features - Storm & Flood
    flooded_area: {
        id: 'flooded_area',
        name: 'Flood Zone',
        icon: '🌊',
        description: 'Area affected by flooding',
        buildable: false, // Can't build on flooded areas
        color: '#5dade2',
        adjacencyEffects: {
            house: { penalty: { happiness: -10 }, message: '🏠 Homes damaged by flood!' },
            shop: { penalty: { cityFunds: -5 }, message: '🏪 Business disrupted by water!' },
            hospital: { bonus: { happiness: 5 }, message: '🏥 Hospital helps flood victims!' },
            shelter: { bonus: { happiness: 8 }, message: '🏕️ Shelter aids displaced families!' }
        }
    },
    storm_damage: {
        id: 'storm_damage',
        name: 'Storm Damage',
        icon: '💥',
        description: 'Area damaged by storm',
        buildable: true, // Can rebuild here
        color: '#95a5a6',
        adjacencyEffects: {
            police: { bonus: { happiness: 4 }, message: '🚓 Police secure damaged area!' },
            shelter: { bonus: { happiness: 6 }, message: '🏕️ Shelter helps victims!' }
        }
    }
};

// Building Palette for drag-and-drop
const buildingPalette = [
    // Chapter 1 Buildings
    { id: 'house', name: 'House', icon: '🏠', cost: 10, effect: 'Happiness +5', chapter: 1, availableInChapter2: true }, // Needed for relocation
    { id: 'shop', name: 'Shop', icon: '🏪', cost: 15, effect: 'Funds +5, Happiness +3', chapter: 1, availableInChapter2: false },
    { id: 'factory', name: 'Factory', icon: '🏭', cost: 20, effect: 'Funds +10, Happiness -5', chapter: 1, availableInChapter2: false },
    { id: 'park', name: 'Park', icon: '🌳', cost: 12, effect: 'Happiness +8', chapter: 1, availableInChapter2: true }, // Community healing
    { id: 'office', name: 'Office', icon: '🏢', cost: 18, effect: 'Interest +8, Funds +5', chapter: 1, availableInChapter2: false },

    // Chapter 2 - Emergency Response Buildings
    { id: 'shelter', name: 'Emergency Shelter', icon: '🏕️', cost: 12, effect: 'Happiness +8, Interest +5', chapter: 2 },
    { id: 'police', name: 'Police Station', icon: '🚓', cost: 15, effect: 'Happiness +5, Interest +10', chapter: 2 },
    { id: 'hospital', name: 'Hospital', icon: '🏥', cost: 22, effect: 'Happiness +15, Funds -10', chapter: 2 },

    // Chapter 2 - Recovery & Infrastructure
    { id: 'school', name: 'School', icon: '🏫', cost: 18, effect: 'Happiness +12, Funds -8', chapter: 2 },
    { id: 'event_venue', name: 'Event Venue', icon: '🎪', cost: 20, effect: 'Happiness +10, Funds +5', chapter: 2 },
    { id: 'water_pump', name: 'Water Pump', icon: '💧', cost: 14, effect: 'Happiness +5 (near floods)', chapter: 2 },

    // Chapter 2 - Corruption Path
    { id: 'skyscraper', name: 'Skyscraper', icon: '🏙️', cost: 25, effect: 'Funds +15, Happiness -5', chapter: 2 }
];

// Adjacency Rules for strategic placement
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
        message: "🏪 Shop has more customers near homes/offices"
    },
    office: {
        near: ['shop', 'park'],
        bonus: { specialInterest: 2 },
        message: "🏢 Offices value nearby amenities"
    },
    house: {
        near: ['park'],
        bonus: { happiness: 2 },
        message: "🏠 House near park increases quality of life"
    }
};

// Helper function to detect current chapter
function getCurrentChapter() {
    const scene = gameState.currentScene || currentSceneKey || '';
    // Check if we're in Chapter 2
    if (scene.startsWith('chapter2') || scene.startsWith('ch2_')) {
        return 2;
    }
    // Default to Chapter 1
    return 1;
}

// ==================== STORY-CONNECTED ACHIEVEMENTS ====================
const achievementDefinitions = {
    // Story-based achievements
    riverside_industrial: {
        id: 'riverside_industrial',
        name: 'Riverside Industrial',
        description: 'Built factory adjacent to the river',
        icon: '🏭',
        image: 'assets/pngs/RiversideIndustrial.PNG',
        category: 'story'
    },
    green_guardian: {
        id: 'green_guardian',
        name: 'Green Guardian',
        description: 'Rejected factory and built 4+ parks',
        icon: '🌳',
        image: 'assets/pngs/GreenGuardian.PNG',
        category: 'story'
    },

    // Stat achievements
    balanced_leader: {
        id: 'balanced_leader',
        name: 'Balanced Leader',
        description: 'All stats within 15 points at game end',
        icon: '⚖️',
        image: 'assets/pngs/BalancedLeader.PNG',
        category: 'balance'
    },
    peoples_champion: {
        id: 'peoples_champion',
        name: "People's Champion",
        description: 'Happiness > 80 at game end',
        icon: '😊',
        image: 'assets/pngs/PeoplesChampion.PNG',
        category: 'balance'
    },
    economic_powerhouse: {
        id: 'economic_powerhouse',
        name: 'Economic Powerhouse',
        description: 'City funds > 80 at game end',
        icon: '💰',
        image: 'assets/pngs/EconomicPowerhouse.PNG',
        category: 'balance'
    },
    master_diplomat: {
        id: 'master_diplomat',
        name: 'Master Diplomat',
        description: 'Special interest > 80 at game end',
        icon: '🤝',
        image: 'assets/pngs/MasterDiplomat.PNG',
        category: 'balance'
    },

    // Gameplay achievements
    master_planner: {
        id: 'master_planner',
        name: 'Master Planner',
        description: 'City planning efficiency > 85%',
        icon: '📐',
        image: 'assets/pngs/MasterPlanner.PNG',
        category: 'planning'
    },
    swift_decisor: {
        id: 'swift_decisor',
        name: 'Swift Decisor',
        description: 'Never let the timer expire',
        icon: '⚡',
        image: 'assets/pngs/SwiftDecisor.PNG',
        category: 'planning'
    },
    no_regrets: {
        id: 'no_regrets',
        name: 'No Regrets',
        description: 'Complete without undo or relocation',
        icon: '🎯',
        image: 'assets/pngs/NoRegrets.PNG',
        category: 'planning'
    },

    // Ultimate achievement
    perfect_mayor: {
        id: 'perfect_mayor',
        name: 'Perfect Mayor',
        description: 'All stats > 75, efficiency > 80, no timeouts',
        icon: '👑',
        image: 'assets/pngs/PerfectMayor.PNG',
        category: 'perfect'
    }
};

console.log('📦 game-config.js loaded');
