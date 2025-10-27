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

// Haptic feedback (if supported)
function triggerHaptic(type = 'light') {
    if (navigator.vibrate) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 100, 50]
        };
        navigator.vibrate(patterns[type] || patterns.light);
    }
}

// ==================== PARTICLE BACKGROUND ====================
function createParticles() {
    const container = document.getElementById('particles');
    // Reduce particles on mobile for performance
    const particleCount = isMobileDevice() ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ==================== TOOLTIP FUNCTIONALITY ====================
function initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            tooltip.style.opacity = '1';
        });
        
        element.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.left = e.pageX + 15 + 'px';
            tooltip.style.top = e.pageY + 15 + 'px';
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.opacity = '0';
        });
    });
}

// ==================== DIFFICULTY MODES ====================
const difficultyModes = {
    easy: {
        id: 'easy',
        name: "Relaxed Mayor",
        icon: "🌱",
        color: "#4caf50",
        timerPerScene: 90,
        startingFunds: 80,
        buildingRelocations: 5,
        undoLimit: 5,
        description: "Take your time and experiment"
    },
    normal: {
        id: 'normal',
        name: "Working Mayor",
        icon: "⚖️",
        color: "#2196f3",
        timerPerScene: 60,
        startingFunds: 60,
        buildingRelocations: 3,
        undoLimit: 3,
        description: "Balanced challenge"
    },
    hard: {
        id: 'hard',
        name: "Under Pressure",
        icon: "🔥",
        color: "#ff9800",
        timerPerScene: 40,
        startingFunds: 50,
        buildingRelocations: 1,
        undoLimit: 1,
        description: "Quick decisions, tough choices"
    },
    expert: {
        id: 'expert',
        name: "Mayor Speedrun",
        icon: "⚡",
        color: "#f44336",
        timerPerScene: 25,
        startingFunds: 40,
        buildingRelocations: 0,
        undoLimit: 0,
        description: "No mistakes allowed!"
    }
};

// ==================== GAME STATE ====================
const gameState = {
    happiness: 50,
    cityFunds: 50,
    specialInterest: 50,
    personalProfit: 0,
    decisions: [],
    buildings: ['city-hall', 'house', 'house'],
    timerSeconds: 30,
    isTimerRunning: false,
    timerInterval: null,
    timeBonus: 0,          // Total time bonus points accumulated
    timeBankSeconds: 0,    // Extra seconds to add to next timer
    currentDecisionTime: 0, // Time when decision was started
    cityGrid: Array(60).fill(null), // Grid cells (responsive: 60/32/24)
    buildingHistory: [],   // Track last 3 placements for undo
    undoCount: 3,          // Number of undos remaining
    planningEfficiency: 0, // City planning efficiency score (0-100)
    detectedZones: [],     // Array of detected zones
    achievements: [],      // Unlocked achievements
    unlockedBuildings: [], // Buildings unlocked through story choices
    pendingBuildingPlacement: null, // Building that must be placed before continuing
    awaitingPlacement: false, // Is game waiting for mandatory placement?
    difficulty: null,      // Selected difficulty mode
    maxRelocations: 3,     // Max relocations allowed
    relocationsUsed: 0,    // Number of relocations used
    gameStartTime: null,   // Track game start for Rush Hour achievement
    gameEndTime: null      // Track game end time
};

// ==================== BUILDING SYSTEM ====================
const buildingTypes = {
    'city-hall': { width: 120, height: 140, windows: 12, color: '#3498db', icon: '🏛️' },
    'house': { width: 80, height: 100, windows: 6, color: '#e67e22', icon: '🏠' },
    'factory': { width: 150, height: 120, windows: 16, color: '#95a5a6', icon: '🏭' },
    'park': { width: 100, height: 80, windows: 0, color: '#2ecc71', icon: '🌳' },
    'office': { width: 90, height: 130, windows: 12, color: '#9b59b6', icon: '🏢' },
    'shop': { width: 70, height: 90, windows: 4, color: '#e74c3c', icon: '🏪' }
};

// Building Palette for drag-and-drop
const buildingPalette = [
    { id: 'house', name: 'House', icon: '🏠', cost: 10, effect: 'Happiness +5' },
    { id: 'shop', name: 'Shop', icon: '🏪', cost: 15, effect: 'Funds +5' },
    { id: 'factory', name: 'Factory', icon: '🏭', cost: 20, effect: 'Funds +10, Happiness -5' },
    { id: 'park', name: 'Park', icon: '🌳', cost: 12, effect: 'Happiness +8' },
    { id: 'office', name: 'Office', icon: '🏢', cost: 18, effect: 'Interest +8' }
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

function addBuilding(type) {
    gameState.buildings.push(type);
    // Building visualization removed - just track in state
}

// Render building palette cards
function renderBuildingPalette() {
    const container = document.getElementById('palette-buildings');
    if (!container) return;
    
    container.innerHTML = '';
    
    buildingPalette.forEach(building => {
        const isUnlocked = gameState.unlockedBuildings.includes(building.id);
        const canAfford = gameState.cityFunds >= building.cost;
        const canDrag = isUnlocked && canAfford;
        
        const card = document.createElement('div');
        card.className = `building-card ${!isUnlocked ? 'locked' : !canAfford ? 'disabled' : ''}`;
        card.setAttribute('data-building-id', building.id);
        card.setAttribute('draggable', canDrag ? 'true' : 'false');
        
        if (!isUnlocked) {
            // Locked building
            card.innerHTML = `
                <div class="building-header">
                    <span class="building-icon" style="filter: grayscale(100%) opacity(0.4);">🔒</span>
                    <div class="building-info">
                        <div class="building-name" style="opacity: 0.5;">${building.name}</div>
                        <span class="building-cost" style="background: #95a5a6;">🔒 Locked</span>
                    </div>
                </div>
                <div class="building-effect" style="opacity: 0.5;">Unlock through story choices</div>
            `;
        } else {
            // Unlocked building
            card.innerHTML = `
                <div class="building-header">
                    <span class="building-icon">${building.icon}</span>
                    <div class="building-info">
                        <div class="building-name">${building.name}</div>
                        <span class="building-cost">💰 $${building.cost}M</span>
                    </div>
                </div>
                <div class="building-effect">📊 ${building.effect}</div>
            `;
            
            // Add drag event listeners if affordable
            if (canAfford) {
                card.addEventListener('dragstart', handleBuildingDragStart);
                card.addEventListener('dragend', handleBuildingDragEnd);
            }
        }
        
        container.appendChild(card);
    });
}

// Update palette when funds change
function updateBuildingPalette() {
    renderBuildingPalette();
}

// Drag event handlers
function handleBuildingDragStart(e) {
    const buildingId = e.target.closest('.building-card').getAttribute('data-building-id');
    const building = buildingPalette.find(b => b.id === buildingId);
    
    // Store for validation during dragover
    currentDraggedBuilding = building;
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('buildingId', buildingId);
    e.dataTransfer.setData('buildingData', JSON.stringify(building));
    
    e.target.closest('.building-card').classList.add('dragging');
    
    // Create custom drag image (ghost)
    const dragGhost = e.target.closest('.building-card').cloneNode(true);
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    dragGhost.style.opacity = '0.8';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 50, 50);
    setTimeout(() => document.body.removeChild(dragGhost), 0);
    
    console.log('🏗️ Started dragging:', buildingId, `Cost: $${building.cost}M`);
}

function handleBuildingDragEnd(e) {
    e.target.closest('.building-card').classList.remove('dragging');
    
    // Clear drag tracking
    currentDraggedBuilding = null;
    
    // Clear any drag-over states
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('drag-over', 'invalid-drop');
    });
}

// ==================== CITY GRID SYSTEM ====================
function renderCityGrid() {
    const container = document.getElementById('city-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const now = Date.now();
    const gridSize = getGridSize();
    
    // Ensure cityGrid array matches current grid size
    if (gameState.cityGrid.length !== gridSize.total) {
        // Resize grid (preserve existing buildings if possible)
        const newGrid = Array(gridSize.total).fill(null);
        for (let i = 0; i < Math.min(gameState.cityGrid.length, gridSize.total); i++) {
            newGrid[i] = gameState.cityGrid[i];
        }
        gameState.cityGrid = newGrid;
    }
    
    // Create cells based on current screen size
    for (let i = 0; i < gridSize.total; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-cell-index', i);
        
        // If cell is occupied, show building
        if (gameState.cityGrid[i]) {
            const building = gameState.cityGrid[i];
            cell.classList.add('occupied');
            
            // Add newly-placed highlight (lasts 3 seconds)
            if (building.placedAt && (now - building.placedAt) < 3000) {
                cell.classList.add('newly-placed');
            }
            
            const icon = document.createElement('span');
            icon.className = 'grid-cell-icon';
            icon.textContent = building.icon;
            cell.appendChild(icon);
            
            // Add click handler for action menu
            cell.addEventListener('click', (e) => openActionMenu(i));
            
            // Add hover tooltip
            cell.addEventListener('mouseenter', (e) => showBuildingTooltip(e, building, i));
            cell.addEventListener('mouseleave', hideBuildingTooltip);
            
            // Make occupied cells draggable for relocation
            cell.setAttribute('draggable', 'true');
            cell.addEventListener('dragstart', (e) => handleOccupiedDragStart(e, i));
            cell.addEventListener('dragend', handleOccupiedDragEnd);
            
        } else {
            // Add drop event listeners only to empty cells
            cell.addEventListener('dragover', handleGridDragOver);
            cell.addEventListener('dragleave', handleGridDragLeave);
            cell.addEventListener('drop', handleGridDrop);
        }
        
        container.appendChild(cell);
    }
    
    console.log(`🏙️ City grid rendered (${gridSize.cols}x${gridSize.rows} = ${gridSize.total} cells)`);
    
    // Add touch support for mobile devices
    if (isMobileDevice()) {
        initializeTouchSupport();
    }
}

// Track currently dragged building for validation
let currentDraggedBuilding = null;

// ==================== TOUCH SUPPORT FOR MOBILE ====================
let touchDragData = null;

function initializeTouchSupport() {
    // Add touch events to building cards
    document.querySelectorAll('.building-card:not(.locked):not(.disabled)').forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: false });
        card.addEventListener('touchmove', handleTouchMove, { passive: false });
        card.addEventListener('touchend', handleTouchEnd, { passive: false });
    });
    
    // Add touch events to grid cells
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('touchstart', handleGridTouchStart, { passive: true });
        cell.addEventListener('touchmove', handleGridTouchMove, { passive: false });
        cell.addEventListener('touchend', handleGridTouchEnd, { passive: false });
    });
    
    console.log('📱 Touch support initialized');
}

function handleTouchStart(e) {
    const card = e.target.closest('.building-card');
    if (!card) return;
    
    const buildingId = card.getAttribute('data-building-id');
    const building = buildingPalette.find(b => b.id === buildingId);
    
    if (!building) return;
    
    touchDragData = {
        building: building,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        isDragging: false
    };
    
    currentDraggedBuilding = building;
    card.classList.add('dragging');
    
    // Light haptic feedback
    triggerHaptic('light');
    
    console.log('📱 Touch drag started:', building.name);
}

function handleTouchMove(e) {
    if (!touchDragData) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    
    const touch = e.touches[0];
    const moveDistance = Math.abs(touch.clientX - touchDragData.startX) + 
                        Math.abs(touch.clientY - touchDragData.startY);
    
    if (moveDistance > 10) {
        touchDragData.isDragging = true;
        
        // Find element under touch
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = elementUnderTouch?.closest('.grid-cell');
        
        // Clear previous highlights
        document.querySelectorAll('.grid-cell').forEach(c => {
            c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
        });
        
        if (cell && !cell.classList.contains('occupied')) {
            const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
            const canAfford = gameState.cityFunds >= touchDragData.building.cost;
            
            if (canAfford) {
                cell.classList.add('drag-over');
                
                // Show adjacency preview
                const { beneficial, harmful } = getAdjacencyHighlights(cellIndex, touchDragData.building.id);
                beneficial.forEach(idx => {
                    const adjCell = document.querySelector(`[data-cell-index="${idx}"]`);
                    if (adjCell) adjCell.classList.add('adjacent-good');
                });
                harmful.forEach(idx => {
                    const adjCell = document.querySelector(`[data-cell-index="${idx}"]`);
                    if (adjCell) adjCell.classList.add('adjacent-bad');
                });
            } else {
                cell.classList.add('invalid-drop');
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!touchDragData) return;
    
    const card = e.target.closest('.building-card');
    if (card) {
        card.classList.remove('dragging');
    }
    
    if (touchDragData.isDragging) {
        const touch = e.changedTouches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = elementUnderTouch?.closest('.grid-cell');
        
        if (cell && !cell.classList.contains('occupied')) {
            const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
            const building = touchDragData.building;
            
            // Simulate drop
            if (gameState.cityFunds >= building.cost) {
                // Successful placement
                gameState.cityFunds -= building.cost;
                applyBuildingEffects(building);
                placeBuilding(cellIndex, building);
                applyAdjacencyEffects(cellIndex, building.id);
                
                // Haptic feedback for success
                triggerHaptic('success');
                
                showCelebration(cell, building, true); // true = mobile mode (fewer particles)
                updateStats();
                updateEfficiencyDisplay();
                
                // Check for zones
                const newZones = detectZones();
                const previousZoneCount = gameState.detectedZones.length;
                if (newZones.length > previousZoneCount) {
                    newZones.slice(previousZoneCount).forEach(zone => {
                        showToast(`${zone.icon} Zone Formed: ${zone.name}!`, 'success');
                    });
                    applyZoneBonuses();
                    updateStats();
                }
                
                // Check mandatory placement
                if (gameState.awaitingPlacement && 
                    gameState.pendingBuildingPlacement &&
                    gameState.pendingBuildingPlacement.building.id === building.id) {
                    showToast('✅ Mandatory building placed! Story continues...', 'success');
                    setTimeout(() => completeMandatoryPlacement(), 1500);
                }
            } else {
                // Insufficient funds
                triggerHaptic('error');
                showToast(`❌ Not enough funds! Need $${building.cost}M`, 'error');
            }
        }
    }
    
    // Clean up
    currentDraggedBuilding = null;
    touchDragData = null;
    document.querySelectorAll('.grid-cell').forEach(c => {
        c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
    });
}

function handleGridTouchStart(e) {
    // For occupied cells, could implement long-press for menu
    const cell = e.target.closest('.grid-cell');
    if (cell && cell.classList.contains('occupied')) {
        // Light haptic on touch
        triggerHaptic('light');
    }
}

function handleGridTouchMove(e) {
    // Placeholder for grid touch move if needed
}

function handleGridTouchEnd(e) {
    // Placeholder for grid touch end if needed
}

// Grid drag event handlers
function handleGridDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;
    
    const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
    
    // Clear previous highlights
    document.querySelectorAll('.grid-cell').forEach(c => {
        if (c !== cell) {
            c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
        }
    });
    
    // Check if this is a valid drop
    const isOccupied = gameState.cityGrid[cellIndex] !== null;
    const canAfford = currentDraggedBuilding ? gameState.cityFunds >= currentDraggedBuilding.cost : true;
    
    if (isOccupied || !canAfford) {
        cell.classList.add('invalid-drop');
        cell.classList.remove('drag-over');
    } else {
        cell.classList.add('drag-over');
        cell.classList.remove('invalid-drop');
        
        // Show adjacency preview if we have a building type
        if (currentDraggedBuilding) {
            const { beneficial, harmful } = getAdjacencyHighlights(cellIndex, currentDraggedBuilding.id);
            
            // Highlight beneficial neighbors in green
            beneficial.forEach(adjIndex => {
                const adjCell = document.querySelector(`[data-cell-index="${adjIndex}"]`);
                if (adjCell) adjCell.classList.add('adjacent-good');
            });
            
            // Highlight harmful neighbors in red
            harmful.forEach(adjIndex => {
                const adjCell = document.querySelector(`[data-cell-index="${adjIndex}"]`);
                if (adjCell) adjCell.classList.add('adjacent-bad');
            });
        }
    }
}

function handleGridDragLeave(e) {
    const cell = e.target.closest('.grid-cell');
    if (cell) {
        cell.classList.remove('drag-over', 'invalid-drop');
    }
}

function handleGridDrop(e) {
    e.preventDefault();
    
    const cell = e.target.closest('.grid-cell');
    const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
    
    // Check if this is a move operation
    const isMoving = e.dataTransfer.getData('moveBuilding') === 'true';
    
    if (isMoving) {
        // MOVE EXISTING BUILDING
        const sourceCellIndex = parseInt(e.dataTransfer.getData('sourceCellIndex'));
        
        if (sourceCellIndex === cellIndex) {
            // Dropped on same cell, do nothing
            return;
        }
        
        if (gameState.cityGrid[cellIndex]) {
            showToast('❌ Cannot move to occupied spot!', 'error');
            return;
        }
        
        // Check relocation limit from difficulty
        if (gameState.relocationsUsed >= gameState.maxRelocations) {
            showToast(`❌ Relocation limit reached! (${gameState.maxRelocations} max)`, 'error');
            return;
        }
        
        const RELOCATION_COST = 5;
        if (gameState.cityFunds < RELOCATION_COST) {
            showToast(`❌ Need $${RELOCATION_COST}M to relocate!`, 'error');
            return;
        }
        
        const building = gameState.cityGrid[sourceCellIndex];
        
        // Reverse old adjacency
        reverseAdjacencyEffects(sourceCellIndex, building.type);
        
        // Remove from old position
        gameState.cityGrid[sourceCellIndex] = null;
        
        // Deduct relocation cost
        gameState.cityFunds -= RELOCATION_COST;
        
        // Increment relocation counter
        gameState.relocationsUsed++;
        
        // Place in new position
        gameState.cityGrid[cellIndex] = building;
        building.placedAt = Date.now(); // Update timestamp
        
        // Apply new adjacency
        applyAdjacencyEffects(cellIndex, building.type);
        
        // Update display
        renderCityGrid();
        updateStats();
        updateEfficiencyDisplay();
        
        const relocationsLeft = gameState.maxRelocations - gameState.relocationsUsed;
        showToast(`🔄 ${building.name} relocated! -$${RELOCATION_COST}M (${relocationsLeft} left)`, 'info');
        console.log(`🔄 Moved ${building.name} from ${sourceCellIndex} to ${cellIndex}`);
        
    } else {
        // PLACE NEW BUILDING
        const buildingId = e.dataTransfer.getData('buildingId');
        const building = buildingPalette.find(b => b.id === buildingId);
        
        if (!building) {
            console.error('Invalid building data');
            return;
        }
        
        // Validate drop
        if (gameState.cityGrid[cellIndex]) {
            showToast('❌ This spot is already occupied!', 'error');
            cell.classList.add('invalid-drop');
            setTimeout(() => cell.classList.remove('invalid-drop'), 500);
            return;
        }
        
        if (gameState.cityFunds < building.cost) {
            showToast(`❌ Not enough funds! Need $${building.cost}M`, 'error');
            cell.classList.add('invalid-drop');
            setTimeout(() => cell.classList.remove('invalid-drop'), 500);
            return;
        }
        
        // Successful placement!
        console.log('✅ Placing building:', building.name, 'at cell', cellIndex);
        
        // Deduct cost
        gameState.cityFunds -= building.cost;
        
        // Apply base building effects
        applyBuildingEffects(building);
        
        // Place building in grid
        placeBuilding(cellIndex, building);
        
        // Apply adjacency bonuses/penalties
        applyAdjacencyEffects(cellIndex, building.id);
        
        // Show celebration
        showCelebration(cell, building, isMobileDevice());
        
        // Haptic feedback on placement
        triggerHaptic('success');
        
        // Update stats display
        updateStats();
        
        // Update efficiency and check for zone bonuses
        updateEfficiencyDisplay();
        
        // Check if new zones formed
        const newZones = detectZones();
        const previousZoneCount = gameState.detectedZones.length;
        if (newZones.length > previousZoneCount) {
            newZones.slice(previousZoneCount).forEach(zone => {
                showToast(`${zone.icon} Zone Formed: ${zone.name}!`, 'success');
            });
            applyZoneBonuses();
            updateStats();
        }
        
        // Check if this was a mandatory placement
        if (gameState.awaitingPlacement && 
            gameState.pendingBuildingPlacement &&
            gameState.pendingBuildingPlacement.building.id === building.id) {
            
            showToast('✅ Mandatory building placed! Story continues...', 'success');
            
            // Complete mandatory placement after short delay
            setTimeout(() => {
                completeMandatoryPlacement();
            }, 1500);
        }
    }
    
    // Clean up drag states and adjacency highlights
    document.querySelectorAll('.grid-cell').forEach(c => {
        c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
    });
}

// Place a building on the grid
function placeBuilding(cellIndex, building) {
    if (cellIndex < 0 || cellIndex >= 60) {
        console.error('Invalid cell index:', cellIndex);
        return false;
    }
    
    if (gameState.cityGrid[cellIndex]) {
        console.warn('Cell already occupied:', cellIndex);
        return false;
    }
    
    const buildingData = {
        type: building.id,
        icon: building.icon,
        name: building.name,
        placedAt: Date.now(),
        cost: building.cost,
        effect: building.effect
    };
    
    gameState.cityGrid[cellIndex] = buildingData;
    
    // Add to history for undo (keep last 3)
    gameState.buildingHistory.push({
        cellIndex: cellIndex,
        building: buildingData,
        previousFunds: gameState.cityFunds + building.cost, // Funds before deduction
        previousStats: {
            happiness: gameState.happiness,
            cityFunds: gameState.cityFunds,
            specialInterest: gameState.specialInterest
        }
    });
    
    // Keep only last 3 in history
    if (gameState.buildingHistory.length > 3) {
        gameState.buildingHistory.shift();
    }
    
    updateUndoButton();
    
    console.log('✅ Building placed:', building.name, 'at cell', cellIndex);
    renderCityGrid();
    return true;
}

// Remove building from grid
function removeBuilding(cellIndex) {
    if (gameState.cityGrid[cellIndex]) {
        const building = gameState.cityGrid[cellIndex];
        gameState.cityGrid[cellIndex] = null;
        console.log('🗑️ Building removed from cell', cellIndex);
        renderCityGrid();
        return building;
    }
    return null;
}

// ==================== ADJACENCY SYSTEM ====================
// Get adjacent cell indices (up, down, left, right) - works with dynamic grid
function getAdjacentCells(cellIndex) {
    const gridSize = getGridSize();
    const row = Math.floor(cellIndex / gridSize.cols);
    const col = cellIndex % gridSize.cols;
    const adjacent = [];
    
    // Up
    if (row > 0) adjacent.push(cellIndex - gridSize.cols);
    // Down
    if (row < gridSize.rows - 1) adjacent.push(cellIndex + gridSize.cols);
    // Left
    if (col > 0) adjacent.push(cellIndex - 1);
    // Right
    if (col < gridSize.cols - 1) adjacent.push(cellIndex + 1);
    
    return adjacent;
}

// Calculate adjacency bonuses for a building at a specific cell
function calculateAdjacency(cellIndex, buildingType) {
    const adjacentCells = getAdjacentCells(cellIndex);
    const rule = adjacencyRules[buildingType];
    
    if (!rule) return { bonuses: {}, penalties: {}, messages: [] };
    
    let totalBonuses = {};
    let totalPenalties = {};
    let messages = [];
    
    adjacentCells.forEach(adjIndex => {
        const neighbor = gameState.cityGrid[adjIndex];
        if (!neighbor) return;
        
        // Check if neighbor is in the 'near' list
        if (rule.near && rule.near.includes(neighbor.type)) {
            if (rule.bonus) {
                // Apply bonus
                Object.keys(rule.bonus).forEach(key => {
                    totalBonuses[key] = (totalBonuses[key] || 0) + rule.bonus[key];
                });
                messages.push(rule.message);
            }
            if (rule.penalty) {
                // Apply penalty
                Object.keys(rule.penalty).forEach(key => {
                    totalPenalties[key] = (totalPenalties[key] || 0) + rule.penalty[key];
                });
                messages.push(rule.message);
            }
        }
    });
    
    return { 
        bonuses: totalBonuses, 
        penalties: totalPenalties, 
        messages: [...new Set(messages)] // Remove duplicates
    };
}

// Apply adjacency effects to game state
function applyAdjacencyEffects(cellIndex, buildingType) {
    const { bonuses, penalties, messages } = calculateAdjacency(cellIndex, buildingType);
    
    let totalChanges = {};
    
    // Apply bonuses
    Object.keys(bonuses).forEach(key => {
        if (key === 'happiness') gameState.happiness += bonuses[key];
        if (key === 'cityFunds') gameState.cityFunds += bonuses[key];
        if (key === 'specialInterest') gameState.specialInterest += bonuses[key];
        totalChanges[key] = (totalChanges[key] || 0) + bonuses[key];
    });
    
    // Apply penalties
    Object.keys(penalties).forEach(key => {
        if (key === 'happiness') gameState.happiness += penalties[key];
        if (key === 'cityFunds') gameState.cityFunds += penalties[key];
        if (key === 'specialInterest') gameState.specialInterest += penalties[key];
        totalChanges[key] = (totalChanges[key] || 0) + penalties[key];
    });
    
    // Show messages
    if (messages.length > 0) {
        messages.forEach(msg => {
            showToast(msg, Object.keys(penalties).length > 0 ? 'error' : 'success');
        });
    }
    
    // Update stats
    updateStats();
    
    return totalChanges;
}

// Preview adjacency effects during drag (returns preview data, doesn't apply)
function previewAdjacency(cellIndex, buildingType) {
    return calculateAdjacency(cellIndex, buildingType);
}

// Get cells that would be highlighted during adjacency preview
function getAdjacencyHighlights(cellIndex, buildingType) {
    const adjacentCells = getAdjacentCells(cellIndex);
    const rule = adjacencyRules[buildingType];
    
    if (!rule) return { beneficial: [], harmful: [] };
    
    let beneficial = [];
    let harmful = [];
    
    adjacentCells.forEach(adjIndex => {
        const neighbor = gameState.cityGrid[adjIndex];
        if (!neighbor) return;
        
        if (rule.near && rule.near.includes(neighbor.type)) {
            if (rule.bonus) {
                beneficial.push(adjIndex);
            }
            if (rule.penalty) {
                harmful.push(adjIndex);
            }
        }
    });
    
    return { beneficial, harmful };
}

// Apply building effects to game stats
function applyBuildingEffects(building) {
    const effects = {
        'house': { happiness: 5 },
        'shop': { cityFunds: 5 },
        'factory': { cityFunds: 10, happiness: -5 },
        'park': { happiness: 8 },
        'office': { specialInterest: 8 }
    };
    
    const buildingEffects = effects[building.id] || {};
    
    if (buildingEffects.happiness) {
        gameState.happiness += buildingEffects.happiness;
        console.log(`😊 Happiness ${buildingEffects.happiness > 0 ? '+' : ''}${buildingEffects.happiness}`);
    }
    if (buildingEffects.cityFunds) {
        gameState.cityFunds += buildingEffects.cityFunds;
        console.log(`💰 Funds ${buildingEffects.cityFunds > 0 ? '+' : ''}${buildingEffects.cityFunds}M`);
    }
    if (buildingEffects.specialInterest) {
        gameState.specialInterest += buildingEffects.specialInterest;
        console.log(`🏛️ Interest ${buildingEffects.specialInterest > 0 ? '+' : ''}${buildingEffects.specialInterest}`);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Show celebration effect on building placement
function showCelebration(cell, building, isMobile = false) {
    // Reduce particles on mobile for performance
    const particleCount = isMobile ? 4 : 8;
    
    // Create sparkle particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.textContent = '✨';
        
        const rect = cell.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.setProperty('--angle', (i * (360 / particleCount)) + 'deg');
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
    
    // Show success toast
    showToast(`✅ ${building.name} placed! -$${building.cost}M`, 'success');
}

// ==================== BUILDING MANAGEMENT ====================
let selectedCellIndex = null;

// Open action menu for a building
function openActionMenu(cellIndex) {
    const building = gameState.cityGrid[cellIndex];
    if (!building) return;
    
    selectedCellIndex = cellIndex;
    
    const menu = document.getElementById('action-menu');
    const title = document.getElementById('action-menu-title');
    const info = document.getElementById('action-menu-info');
    
    const timePlaced = Math.floor((Date.now() - building.placedAt) / 1000);
    const refund = Math.floor(building.cost / 2);
    
    title.textContent = `${building.icon} ${building.name}`;
    info.innerHTML = `
        <strong>Effect:</strong> ${building.effect}<br>
        <strong>Original Cost:</strong> $${building.cost}M<br>
        <strong>Refund Value:</strong> $${refund}M (50%)<br>
        <strong>Time Placed:</strong> ${timePlaced}s ago
    `;
    
    menu.style.display = 'flex';
    console.log('📋 Action menu opened for cell', cellIndex);
}

// Close action menu
function closeActionMenu() {
    const menu = document.getElementById('action-menu');
    menu.style.display = 'none';
    selectedCellIndex = null;
}

// Sell building
function sellBuilding() {
    if (selectedCellIndex === null) return;
    
    const building = gameState.cityGrid[selectedCellIndex];
    if (!building) return;
    
    const refund = Math.floor(building.cost / 2);
    
    // Haptic feedback
    triggerHaptic('medium');
    
    // Reverse building effects
    reverseBuildingEffects(building.type);
    
    // Reverse adjacency effects
    reverseAdjacencyEffects(selectedCellIndex, building.type);
    
    // Remove from grid
    removeBuilding(selectedCellIndex);
    
    // Refund 50%
    gameState.cityFunds += refund;
    
    // Update stats
    updateStats();
    updateEfficiencyDisplay();
    
    // Show notification
    showToast(`💰 ${building.name} sold for $${refund}M`, 'success');
    
    // Close menu
    closeActionMenu();
    
    console.log(`💵 Sold ${building.name}, refunded $${refund}M`);
}

// Reverse building effects
function reverseBuildingEffects(buildingType) {
    const effects = {
        'house': { happiness: -5 },
        'shop': { cityFunds: -5 },
        'factory': { cityFunds: -10, happiness: 5 },
        'park': { happiness: -8 },
        'office': { specialInterest: -8 }
    };
    
    const reverseEffects = effects[buildingType] || {};
    
    if (reverseEffects.happiness) gameState.happiness += reverseEffects.happiness;
    if (reverseEffects.cityFunds) gameState.cityFunds += reverseEffects.cityFunds;
    if (reverseEffects.specialInterest) gameState.specialInterest += reverseEffects.specialInterest;
}

// Reverse adjacency effects when removing a building
function reverseAdjacencyEffects(cellIndex, buildingType) {
    const { bonuses, penalties } = calculateAdjacency(cellIndex, buildingType);
    
    // Reverse bonuses (subtract them)
    Object.keys(bonuses).forEach(key => {
        if (key === 'happiness') gameState.happiness -= bonuses[key];
        if (key === 'cityFunds') gameState.cityFunds -= bonuses[key];
        if (key === 'specialInterest') gameState.specialInterest -= bonuses[key];
    });
    
    // Reverse penalties (subtract them, which adds back)
    Object.keys(penalties).forEach(key => {
        if (key === 'happiness') gameState.happiness -= penalties[key];
        if (key === 'cityFunds') gameState.cityFunds -= penalties[key];
        if (key === 'specialInterest') gameState.specialInterest -= penalties[key];
    });
}

// Show building tooltip on hover
function showBuildingTooltip(e, building, cellIndex) {
    const tooltip = document.getElementById('tooltip');
    const timePlaced = Math.floor((Date.now() - building.placedAt) / 1000);
    
    tooltip.innerHTML = `
        <strong>${building.icon} ${building.name}</strong><br>
        📊 ${building.effect}<br>
        💰 Cost: $${building.cost}M<br>
        ⏱️ Placed ${timePlaced}s ago<br>
        <em style="font-size:0.9em;opacity:0.8;">Click to manage</em>
    `;
    tooltip.style.opacity = '1';
    tooltip.style.left = e.pageX + 15 + 'px';
    tooltip.style.top = e.pageY + 15 + 'px';
}

function hideBuildingTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.opacity = '0';
}

// Undo last building placement
function undoLastPlacement() {
    if (gameState.buildingHistory.length === 0 || gameState.undoCount <= 0) {
        showToast('❌ No more undos available!', 'error');
        triggerHaptic('error');
        return;
    }
    
    const lastAction = gameState.buildingHistory.pop();
    
    // Haptic feedback
    triggerHaptic('medium');
    
    // Remove building from grid
    gameState.cityGrid[lastAction.cellIndex] = null;
    
    // Restore stats
    gameState.happiness = lastAction.previousStats.happiness;
    gameState.cityFunds = lastAction.previousStats.cityFunds;
    gameState.specialInterest = lastAction.previousStats.specialInterest;
    
    // Decrease undo count
    gameState.undoCount--;
    
    // Update display
    renderCityGrid();
    updateStats();
    updateUndoButton();
    updateEfficiencyDisplay();
    
    showToast(`↶ Undid ${lastAction.building.name} placement`, 'info');
    console.log(`↶ Undo: Removed ${lastAction.building.name} from cell ${lastAction.cellIndex}`);
}

// Update undo button state
function updateUndoButton() {
    const button = document.getElementById('undo-button');
    const countDisplay = document.getElementById('undo-count');
    
    if (button && countDisplay) {
        countDisplay.textContent = `(${gameState.undoCount})`;
        button.disabled = gameState.buildingHistory.length === 0 || gameState.undoCount <= 0;
    }
}

// ==================== UNLOCK & MANDATORY PLACEMENT ====================

// Show unlock notification
function showUnlockNotification(building) {
    showToast(`🔓 NEW BUILDING UNLOCKED: ${building.icon} ${building.name}!`, 'success');
    
    // Find the card and add unlock animation
    setTimeout(() => {
        const card = document.querySelector(`[data-building-id="${building.id}"]`);
        if (card) {
            card.classList.add('unlocking');
            setTimeout(() => card.classList.remove('unlocking'), 800);
        }
    }, 100);
}

// Show mandatory placement overlay
function showMandatoryPlacementOverlay(building) {
    const overlay = document.getElementById('placement-overlay');
    const icon = document.getElementById('placement-icon');
    const text = document.getElementById('placement-text');
    
    icon.textContent = building.icon;
    text.textContent = `Drag ${building.name} to the grid to continue!`;
    
    overlay.classList.add('active');
    
    console.log(`🏗️ Mandatory placement required: ${building.name}`);
}

// Hide mandatory placement overlay
function hideMandatoryPlacementOverlay() {
    const overlay = document.getElementById('placement-overlay');
    overlay.classList.remove('active');
}

// Complete mandatory placement and continue to next scene
function completeMandatoryPlacement() {
    if (!gameState.pendingBuildingPlacement) return;
    
    const nextScene = gameState.pendingBuildingPlacement.nextScene;
    
    // Clear placement state
    gameState.pendingBuildingPlacement = null;
    gameState.awaitingPlacement = false;
    
    // Hide overlay
    hideMandatoryPlacementOverlay();
    
    // Continue to next scene
    renderScene(nextScene);
    
    console.log(`✅ Mandatory placement complete, continuing to ${nextScene}`);
}

// ==================== DRAG TO MOVE EXISTING BUILDINGS ====================
let draggedBuildingIndex = null;

function handleOccupiedDragStart(e, cellIndex) {
    draggedBuildingIndex = cellIndex;
    const building = gameState.cityGrid[cellIndex];
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('moveBuilding', 'true');
    e.dataTransfer.setData('sourceCellIndex', cellIndex.toString());
    
    e.target.classList.add('dragging');
    
    console.log('🔄 Moving building from cell', cellIndex);
}

function handleOccupiedDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedBuildingIndex = null;
    
    // Clear highlights
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
    });
}

// ==================== ZONE DETECTION & EFFICIENCY ====================

// Detect zones (clusters of 3+ same building types)
function detectZones() {
    const zones = [];
    const buildingCounts = {};
    
    // Count each building type
    gameState.cityGrid.forEach(cell => {
        if (cell) {
            buildingCounts[cell.type] = (buildingCounts[cell.type] || 0) + 1;
        }
    });
    
    // Check for zone formations
    if (buildingCounts.house >= 3) {
        zones.push({
            type: 'residential',
            name: 'Neighborhood',
            count: buildingCounts.house,
            bonus: { happiness: 5 },
            icon: '🏘️'
        });
    }
    
    if (buildingCounts.shop >= 3) {
        zones.push({
            type: 'commercial',
            name: 'Shopping District',
            count: buildingCounts.shop,
            bonus: { cityFunds: 8 },
            icon: '🛍️'
        });
    }
    
    if (buildingCounts.factory >= 3) {
        zones.push({
            type: 'industrial',
            name: 'Industrial Park',
            count: buildingCounts.factory,
            bonus: { cityFunds: 12, happiness: -3 },
            icon: '🏭'
        });
    }
    
    // Check for mixed-use (balanced mix)
    const buildingTypes = Object.keys(buildingCounts).length;
    const totalBuildings = Object.values(buildingCounts).reduce((a, b) => a + b, 0);
    if (buildingTypes >= 4 && totalBuildings >= 10) {
        const isBalanced = Object.values(buildingCounts).every(count => count >= 2);
        if (isBalanced) {
            zones.push({
                type: 'mixed',
                name: 'Vibrant Community',
                count: totalBuildings,
                bonus: { happiness: 3, cityFunds: 3, specialInterest: 3 },
                icon: '🌆'
            });
        }
    }
    
    return zones;
}

// Calculate planning efficiency score (0-100)
function calculateEfficiency() {
    let score = 0;
    const totalBuildings = gameState.cityGrid.filter(c => c !== null).length;
    
    if (totalBuildings === 0) return 0;
    
    // Zone formation: +10 per proper zone
    const zones = detectZones();
    score += zones.length * 10;
    
    // Count building types
    const buildingCounts = {};
    gameState.cityGrid.forEach(cell => {
        if (cell) {
            buildingCounts[cell.type] = (buildingCounts[cell.type] || 0) + 1;
        }
    });
    
    // Balanced placement: +20 if even distribution
    const buildingTypes = Object.keys(buildingCounts);
    if (buildingTypes.length >= 3) {
        const counts = Object.values(buildingCounts);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
        
        if (variance < 4) { // Low variance = balanced
            score += 20;
        } else if (variance < 9) {
            score += 10;
        }
    }
    
    // No isolated buildings: +15 if all buildings have neighbors
    let isolatedCount = 0;
    gameState.cityGrid.forEach((cell, index) => {
        if (cell) {
            const neighbors = getAdjacentCells(index);
            const hasNeighbor = neighbors.some(adjIndex => gameState.cityGrid[adjIndex] !== null);
            if (!hasNeighbor) isolatedCount++;
        }
    });
    
    if (isolatedCount === 0 && totalBuildings > 0) {
        score += 15;
    } else if (isolatedCount <= 2) {
        score += 8;
    }
    
    // Green spaces: +5 per park (max 25)
    const parkCount = buildingCounts.park || 0;
    score += Math.min(parkCount * 5, 25);
    
    // Cap at 100
    return Math.min(score, 100);
}

// Apply zone bonuses to game state
function applyZoneBonuses() {
    const zones = detectZones();
    gameState.detectedZones = zones;
    
    zones.forEach(zone => {
        if (zone.bonus.happiness) {
            gameState.happiness += zone.bonus.happiness;
            console.log(`${zone.icon} ${zone.name}: Happiness ${zone.bonus.happiness > 0 ? '+' : ''}${zone.bonus.happiness}`);
        }
        if (zone.bonus.cityFunds) {
            gameState.cityFunds += zone.bonus.cityFunds;
            console.log(`${zone.icon} ${zone.name}: Funds ${zone.bonus.cityFunds > 0 ? '+' : ''}${zone.bonus.cityFunds}M`);
        }
        if (zone.bonus.specialInterest) {
            gameState.specialInterest += zone.bonus.specialInterest;
            console.log(`${zone.icon} ${zone.name}: Interest ${zone.bonus.specialInterest > 0 ? '+' : ''}${zone.bonus.specialInterest}`);
        }
    });
}

// Update efficiency display
function updateEfficiencyDisplay() {
    const efficiency = calculateEfficiency();
    gameState.planningEfficiency = efficiency;
    
    const display = document.getElementById('efficiency-display');
    const valueElement = document.getElementById('efficiency-value');
    
    if (valueElement) {
        valueElement.textContent = efficiency + '%';
    }
    
    if (display) {
        display.classList.remove('excellent', 'good', 'poor');
        if (efficiency >= 70) {
            display.classList.add('excellent');
        } else if (efficiency >= 40) {
            display.classList.add('good');
        } else {
            display.classList.add('poor');
        }
    }
    
    // Check achievements
    checkAchievements();
}

// Comprehensive Achievement Definitions
const achievementDefinitions = {
    // Speed achievements
    lightning_mayor: {
        id: 'lightning_mayor',
        name: 'Lightning Mayor',
        description: 'All decisions under 30s',
        icon: '⚡',
        category: 'speed'
    },
    time_master: {
        id: 'time_master',
        name: 'Time Master',
        description: 'Earned 150+ time bonus points',
        icon: '⏱️',
        category: 'speed'
    },
    rush_hour: {
        id: 'rush_hour',
        name: 'Rush Hour',
        description: 'Completed game in under 8 minutes',
        icon: '🏃',
        category: 'speed'
    },
    
    // Building achievements
    architect: {
        id: 'architect',
        name: 'Architect',
        description: 'Placed 15+ buildings',
        icon: '🏗️',
        category: 'building'
    },
    city_planner: {
        id: 'city_planner',
        name: 'City Planner',
        description: 'Planning efficiency > 85',
        icon: '📐',
        category: 'building'
    },
    green_mayor: {
        id: 'green_mayor',
        name: 'Green Mayor',
        description: '6+ parks placed',
        icon: '🌳',
        category: 'building'
    },
    industrial_tycoon: {
        id: 'industrial_tycoon',
        name: 'Industrial Tycoon',
        description: '8+ factories',
        icon: '🏭',
        category: 'building'
    },
    urban_designer: {
        id: 'urban_designer',
        name: 'Urban Designer',
        description: 'Perfect adjacency score',
        icon: '✨',
        category: 'building'
    },
    
    // Balance achievements
    balanced_leader: {
        id: 'balanced_leader',
        name: 'Balanced Leader',
        description: 'All stats within 10 points',
        icon: '⚖️',
        category: 'balance'
    },
    popular_mayor: {
        id: 'popular_mayor',
        name: 'Popular Mayor',
        description: 'Happiness > 85',
        icon: '😊',
        category: 'balance'
    },
    rich_city: {
        id: 'rich_city',
        name: 'Rich City',
        description: 'City funds > 90',
        icon: '💰',
        category: 'balance'
    },
    well_connected: {
        id: 'well_connected',
        name: 'Well-Connected',
        description: 'Special interest > 80',
        icon: '🏛️',
        category: 'balance'
    },
    
    // Perfect run
    perfect_mayor: {
        id: 'perfect_mayor',
        name: 'Perfect Mayor',
        description: 'All stats > 90, efficiency > 85, time bonus > 200',
        icon: '👑',
        category: 'perfect'
    }
};

// Check and award achievements
function checkAchievements() {
    const newAchievements = [];
    
    // SPEED ACHIEVEMENTS
    // Lightning Mayor: All decisions under 30s
    const allFast = gameState.decisions.length > 0 && gameState.decisions.every(d => d.timeSpent <= 30);
    if (allFast && !gameState.achievements.includes('lightning_mayor')) {
        newAchievements.push(achievementDefinitions.lightning_mayor);
    }
    
    // Time Master: 150+ time bonus
    if (gameState.timeBonus >= 150 && !gameState.achievements.includes('time_master')) {
        newAchievements.push(achievementDefinitions.time_master);
    }
    
    // BUILDING ACHIEVEMENTS
    const totalBuildings = gameState.cityGrid.filter(c => c !== null).length;
    
    // Architect: 15+ buildings
    if (totalBuildings >= 15 && !gameState.achievements.includes('architect')) {
        newAchievements.push(achievementDefinitions.architect);
    }
    
    // City Planner: Efficiency > 85
    if (gameState.planningEfficiency > 85 && !gameState.achievements.includes('city_planner')) {
        newAchievements.push(achievementDefinitions.city_planner);
    }
    
    // Green Mayor: 6+ parks
    const parkCount = gameState.cityGrid.filter(c => c && c.type === 'park').length;
    if (parkCount >= 6 && !gameState.achievements.includes('green_mayor')) {
        newAchievements.push(achievementDefinitions.green_mayor);
    }
    
    // Industrial Tycoon: 8+ factories
    const factoryCount = gameState.cityGrid.filter(c => c && c.type === 'factory').length;
    if (factoryCount >= 8 && !gameState.achievements.includes('industrial_tycoon')) {
        newAchievements.push(achievementDefinitions.industrial_tycoon);
    }
    
    // Urban Designer: Perfect adjacency (all buildings have bonuses)
    let buildingsWithBonuses = 0;
    let totalBuildingsChecked = 0;
    gameState.cityGrid.forEach((cell, index) => {
        if (cell) {
            totalBuildingsChecked++;
            const { bonuses } = calculateAdjacency(index, cell.type);
            if (Object.keys(bonuses).length > 0) {
                buildingsWithBonuses++;
            }
        }
    });
    if (totalBuildingsChecked >= 5 && buildingsWithBonuses === totalBuildingsChecked && 
        !gameState.achievements.includes('urban_designer')) {
        newAchievements.push(achievementDefinitions.urban_designer);
    }
    
    // BALANCE ACHIEVEMENTS
    // Balanced Leader: All stats within 10 points
    const stats = [gameState.happiness, gameState.cityFunds, gameState.specialInterest];
    const maxStat = Math.max(...stats);
    const minStat = Math.min(...stats);
    if ((maxStat - minStat) <= 10 && !gameState.achievements.includes('balanced_leader')) {
        newAchievements.push(achievementDefinitions.balanced_leader);
    }
    
    // Popular Mayor: Happiness > 85
    if (gameState.happiness > 85 && !gameState.achievements.includes('popular_mayor')) {
        newAchievements.push(achievementDefinitions.popular_mayor);
    }
    
    // Rich City: Funds > 90
    if (gameState.cityFunds > 90 && !gameState.achievements.includes('rich_city')) {
        newAchievements.push(achievementDefinitions.rich_city);
    }
    
    // Well-Connected: Interest > 80
    if (gameState.specialInterest > 80 && !gameState.achievements.includes('well_connected')) {
        newAchievements.push(achievementDefinitions.well_connected);
    }
    
    // PERFECT RUN
    // Perfect Mayor: All stats > 90, efficiency > 85, time bonus > 200
    if (gameState.happiness > 90 && gameState.cityFunds > 90 && gameState.specialInterest > 90 &&
        gameState.planningEfficiency > 85 && gameState.timeBonus > 200 &&
        !gameState.achievements.includes('perfect_mayor')) {
        newAchievements.push(achievementDefinitions.perfect_mayor);
    }
    
    // Award new achievements
    newAchievements.forEach(achievement => {
        gameState.achievements.push(achievement.id);
        showToast(`🏆 Achievement: ${achievement.name}!`, 'success');
        console.log(`🏆 Achievement unlocked: ${achievement.name} - ${achievement.description}`);
    });
    
    // Update achievement counter in header
    updateAchievementCounter();
}

// Update achievement counter display
function updateAchievementCounter() {
    // This will be implemented when we add the UI element
    const totalAchievements = Object.keys(achievementDefinitions).length;
    const unlockedCount = gameState.achievements.length;
    console.log(`🏆 Achievements: ${unlockedCount}/${totalAchievements}`);
}

// ==================== DIFFICULTY SYSTEM ====================
function selectDifficulty(difficultyId) {
    const mode = difficultyModes[difficultyId];
    if (!mode) {
        console.error('Invalid difficulty:', difficultyId);
        return;
    }
    
    gameState.difficulty = mode;
    
    // Apply difficulty modifiers
    gameState.cityFunds = mode.startingFunds;
    gameState.maxRelocations = mode.buildingRelocations;
    gameState.undoCount = mode.undoLimit;
    
    console.log(`🎮 Difficulty selected: ${mode.name}`);
    console.log(`  ⏰ Timer: ${mode.timerPerScene}s`);
    console.log(`  💰 Starting Funds: $${mode.startingFunds}M`);
    console.log(`  🔄 Relocations: ${mode.buildingRelocations}`);
    console.log(`  ↶ Undos: ${mode.undoLimit}`);
    
    // Update displays
    updateStats();
    updateUndoButton();
    updateDifficultyBadge();
    
    // Track game start time for Rush Hour achievement
    gameState.gameStartTime = Date.now();
    
    // Check if tutorial should be shown
    const tutorialStatus = localStorage.getItem('manestreet_tutorial');
    if (tutorialStatus === 'started' || (checkFirstTime() && tutorialStatus !== 'declined' && tutorialStatus !== 'skipped')) {
        // Show tutorial first, then start game
        renderScene('choice1');
        setTimeout(() => {
            startTutorial();
        }, 500);
    } else {
        // Start the game directly
        renderScene('choice1');
    }
}

function updateDifficultyBadge() {
    const badge = document.getElementById('difficulty-badge');
    if (badge && gameState.difficulty) {
        badge.textContent = `${gameState.difficulty.icon} ${gameState.difficulty.name}`;
        badge.style.display = 'inline-block';
        badge.style.background = gameState.difficulty.color;
    }
}

// ==================== TIMER SYSTEM ====================
function getTimerDuration() {
    return gameState.difficulty ? gameState.difficulty.timerPerScene : 60;
}

function startTimer() {
    stopTimer();
    
    // Get timer duration from difficulty
    const baseDuration = getTimerDuration();
    
    // Apply time bank bonuses/penalties
    const adjustedTime = baseDuration + gameState.timeBankSeconds;
    gameState.timerSeconds = Math.max(10, Math.min(120, adjustedTime)); // Clamp between 10-120 seconds
    gameState.currentDecisionTime = gameState.timerSeconds; // Track starting time
    
    // Reset time bank after applying
    if (gameState.timeBankSeconds !== 0) {
        console.log(`⏱️ Time Bank Applied: ${gameState.timeBankSeconds > 0 ? '+' : ''}${gameState.timeBankSeconds}s (Total: ${gameState.timerSeconds}s)`);
    }
    gameState.timeBankSeconds = 0;
    
    gameState.isTimerRunning = true;
    
    const timerContainer = document.getElementById('timer-container');
    timerContainer.classList.add('active');
    
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();
        
        if (gameState.timerSeconds <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    gameState.isTimerRunning = false;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    const timerContainer = document.getElementById('timer-container');
    timerContainer.classList.remove('active', 'calm', 'warning', 'danger', 'critical');
    
    // Clean up bar classes too
    const barFill = document.getElementById('timer-progress');
    if (barFill) {
        barFill.classList.remove('warning', 'danger', 'critical');
    }
}

function pauseTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    gameState.isTimerRunning = false;
}

function resumeTimer() {
    if (!gameState.isTimerRunning && gameState.timerSeconds > 0) {
        gameState.isTimerRunning = true;
        
        gameState.timerInterval = setInterval(() => {
            gameState.timerSeconds--;
            updateTimerDisplay();
            
            if (gameState.timerSeconds <= 0) {
                handleTimeout();
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const secondsElement = document.getElementById('timer-seconds');
    const barFill = document.getElementById('timer-progress');
    const timerContainer = document.getElementById('timer-container');
    
    // Update seconds text
    if (secondsElement) secondsElement.textContent = gameState.timerSeconds;
    
    // Calculate percentage for progress bar (dynamic based on starting time)
    const percentage = (gameState.timerSeconds / gameState.currentDecisionTime) * 100;
    if (barFill) barFill.style.width = percentage + '%';
    
    // Remove all state classes
    timerContainer.classList.remove('calm', 'warning', 'danger', 'critical');
    if (barFill) barFill.classList.remove('warning', 'danger', 'critical');
    
    // Apply state-based classes and audio hooks (percentage-based for variable timer)
    const percentRemaining = percentage;
    const criticalThreshold = gameState.currentDecisionTime * 0.1; // Last 10% of time
    const dangerThreshold = gameState.currentDecisionTime * 0.2;   // Last 20% of time
    const warningThreshold = gameState.currentDecisionTime * 0.5;  // Last 50% of time
    
    if (gameState.timerSeconds <= criticalThreshold) {
        // Critical: Last 10% - SHAKE + URGENT
        timerContainer.classList.add('critical');
        if (barFill) barFill.classList.add('critical');
        
        // Audio hook for critical state (play once)
        if (Math.ceil(criticalThreshold) === gameState.timerSeconds) {
            timerContainer.setAttribute('data-sound-trigger', 'critical');
            console.log('🔊 Audio Hook: Critical warning!');
        }
    } else if (gameState.timerSeconds <= dangerThreshold) {
        // Danger: Last 20% - RED + URGENT
        timerContainer.classList.add('danger');
        if (barFill) barFill.classList.add('danger');
        
        // Audio hook for danger state (play once)
        if (Math.ceil(dangerThreshold) === gameState.timerSeconds) {
            timerContainer.setAttribute('data-sound-trigger', 'danger');
            console.log('🔊 Audio Hook: Danger warning!');
        }
    } else if (gameState.timerSeconds <= warningThreshold) {
        // Warning: Last 50% - YELLOW
        timerContainer.classList.add('warning');
        if (barFill) barFill.classList.add('warning');
        
        // Audio hook for warning state (play once)
        if (Math.ceil(warningThreshold) === gameState.timerSeconds) {
            timerContainer.setAttribute('data-sound-trigger', 'warning');
            console.log('🔊 Audio Hook: Warning state');
        }
    } else {
        // Calm: First 50% - GREEN
        timerContainer.classList.add('calm');
    }
    
    // Tick sound for last 10% (optional)
    if (gameState.timerSeconds <= criticalThreshold && gameState.timerSeconds > 0) {
        timerContainer.setAttribute('data-sound-trigger', 'tick');
    }
}

function handleTimeout() {
    stopTimer();
    
    const currentSceneKey = getCurrentSceneKey();
    if (currentSceneKey && gameData[currentSceneKey]) {
        const scene = gameData[currentSceneKey];
        if (scene.choices && scene.choices.length > 0) {
            const randomIndex = Math.floor(Math.random() * scene.choices.length);
            makeChoice(currentSceneKey, randomIndex);
        }
    }
}

// Current scene tracking
let currentSceneKey = null;

function getCurrentSceneKey() {
    return currentSceneKey;
}

function setCurrentSceneKey(key) {
    currentSceneKey = key;
}

// ==================== GAME DATA ====================
const gameData = {
    intro: {
        title: "Welcome to Tiger Central",
        story: `<p>Congratulations! You've just won the election to become the mayor of Tiger Central, a city with a population of 300,000.</p><p>The previous mayor was corrupt—embezzling money, stealing from residents, and ultimately disappearing without a trace, leaving Tiger Central in shambles.</p><p>The city needs strong leadership to rebuild. Every decision you make will have consequences that affect different groups of people. There are no perfect solutions—only choices and their outcomes.</p><p>Can you restore Tiger Central to its former glory while keeping everyone happy?</p>`,
        choices: [{ text: "🎮 Start Your Mayoral Journey", icon: "🚀", next: 'difficulty_selection' }]
    },
    difficulty_selection: {
        title: "Choose Your Challenge",
        story: `<p>Before you begin your term, select your preferred difficulty level. Each mode offers a different challenge:</p>`,
        isDifficultySelection: true
    },
    choice1: {
        chapter: "Chapter 1: Economic Opportunity",
        title: "A Factory Proposal",
        story: `<p>A large manufacturing company, TigerTech Industries, has approached the city with an interesting proposition.</p><p>They want to build a factory in Tiger Central, promising to bring 500 jobs to the community and offering $10 million to the city as an incentive.</p><p>However, factories can bring pollution, traffic, and other concerns. What do you decide?</p>`,
        choices: [
            { 
                text: "Accept the factory deal", 
                icon: "✅", 
                effects: { happiness: 10, cityFunds: 20, specialInterest: 15, personalProfit: 5 }, 
                next: 'choice2A', 
                consequence: "TigerTech Industries is excited to begin construction. Citizens are hopeful about new job opportunities.", 
                building: 'factory',
                unlocks: ['factory', 'house'] // Unlock factory and house buildings
            },
            { 
                text: "Reject the factory", 
                icon: "❌", 
                effects: { happiness: -10, cityFunds: -10, specialInterest: -15, personalProfit: 0 }, 
                next: 'choice2B', 
                consequence: "TigerTech Industries is disappointed. Unemployment remains high, and residents are worried about job prospects.",
                unlocks: ['park', 'house'] // Unlock environmentally-friendly options
            }
        ]
    },
    choice2A: {
        chapter: "Chapter 1: Location Matters",
        title: "Where to Build?",
        story: `<p>Now that you've approved the factory, you need to decide where to place it.</p><p>The company has given you two options:</p><ul><li><strong>Near the River:</strong> Easy access to water for manufacturing, but potential pollution risks</li><li><strong>Near Suburban Neighborhoods:</strong> Closer to workers' homes, but will increase noise/traffic</li></ul>`,
        choices: [
            { 
                text: "Build near the river", 
                icon: "🏞️", 
                effects: { happiness: -5, cityFunds: 5, specialInterest: 10, personalProfit: 3 }, 
                next: 'choice3A1', 
                consequence: "Construction begins by the river. Environmental groups are concerned about water quality.",
                unlocks: ['park'] // Environmental concerns unlock parks
            },
            { 
                text: "Build near suburban area", 
                icon: "🏘️", 
                effects: { happiness: -15, cityFunds: -5, specialInterest: 5, personalProfit: 2 }, 
                next: 'choice3A2', 
                consequence: "Families are displaced to make room for the factory. Homeowners are upset.", 
                building: 'house',
                unlocks: ['shop'] // Suburban development unlocks shops
            }
        ]
    },
    choice2B: {
        chapter: "Chapter 1: Unemployment Crisis",
        title: "Addressing Joblessness",
        story: `<p>Without the factory, unemployment remains high in Tiger Central. People are struggling to make ends meet.</p><p>You need to find a way to help unemployed citizens. What's your approach?</p>`,
        choices: [
            { 
                text: "Raise taxes for unemployment benefits", 
                icon: "💰", 
                effects: { happiness: -15, cityFunds: 10, specialInterest: -5, personalProfit: 0 }, 
                next: 'choice3B1', 
                consequence: "Unemployment benefits help struggling families, but working citizens feel the tax burden.",
                unlocks: ['shop'] // Economic focus unlocks shops
            },
            { 
                text: "Hire people for infrastructure projects", 
                icon: "🛠️", 
                effects: { happiness: 10, cityFunds: -15, specialInterest: 5, personalProfit: 0 }, 
                next: 'choice3B2', 
                consequence: "New infrastructure jobs are created. Roads and bridges are being renovated.", 
                building: 'office',
                unlocks: ['office'] // Infrastructure unlocks offices
            }
        ]
    },
    choice3A1: {
        chapter: "Chapter 1: Pollution Problems",
        title: "Water Contamination",
        story: `<p>The factory near the river is now operational, but there's a serious problem.</p><p>Chemical waste from manufacturing is contaminating the water supply. The city needs expensive water treatment to keep it safe.</p><p>Who should pay for this?</p>`,
        choices: [
            { text: "Tax TigerTech Industries", icon: "🏭", effects: { happiness: 15, cityFunds: 10, specialInterest: -10, personalProfit: 0 }, next: 'choice4A11', consequence: "Citizens appreciate you holding the company accountable." },
            { text: "Raise water bills for citizens", icon: "💧", effects: { happiness: -20, cityFunds: 15, specialInterest: 10, personalProfit: 5 }, next: 'choice4A12', consequence: "Citizens are outraged that they're paying for corporate pollution." }
        ]
    },
    choice3A2: {
        chapter: "Chapter 1: Suburban Unrest",
        title: "Angry Neighbors",
        story: `<p>The factory near the suburban area has caused major problems for residents.</p><p>Noise, traffic, and pollution have increased dramatically. Property values are dropping, and residents are demanding action.</p>`,
        choices: [
            { text: "Offer compensation to residents", icon: "💵", effects: { happiness: 5, cityFunds: -15, specialInterest: -5, personalProfit: 0 }, next: 'choice4A21', consequence: "Residents receive financial compensation. The city budget is stretched thin." },
            { text: "Build new homes and relocate", icon: "🏠", effects: { happiness: 10, cityFunds: -20, specialInterest: 0, personalProfit: 0 }, next: 'choice4A22', consequence: "New homes are being constructed. Relocation plans are underway.", building: 'house' },
            { text: "Ignore their complaints", icon: "🙉", effects: { happiness: -25, cityFunds: 5, specialInterest: 15, personalProfit: 10 }, next: 'choice4A23', consequence: "Residents feel abandoned. Trust in your leadership is declining rapidly." }
        ]
    },
    choice3B1: {
        chapter: "Chapter 1: Social Division",
        title: "Rising Tensions",
        story: `<p>The unemployment tax has created serious social tensions in Tiger Central.</p><p>Employed and unemployed citizens are clashing. Crime is increasing, and neighborhood disputes are common.</p>`,
        choices: [
            { text: "Increase surveillance", icon: "📹", effects: { happiness: -10, cityFunds: -10, specialInterest: 10, personalProfit: 0 }, next: 'choice4B11', consequence: "More cameras and police patrol the streets. Crime drops, but citizens feel watched." },
            { text: "Fund job-training programs", icon: "📚", effects: { happiness: 15, cityFunds: -15, specialInterest: -5, personalProfit: 0 }, next: 'choice4B12', consequence: "Training programs begin. Unemployed citizens are learning new skills.", building: 'office' }
        ]
    },
    choice3B2: {
        chapter: "Chapter 1: Safety Concerns",
        title: "Workplace Accidents",
        story: `<p>The infrastructure projects have created jobs, but workplace accidents and injuries are increasing dramatically.</p><p>What's your response?</p>`,
        choices: [
            { text: "Increase safety regulations", icon: "⚠️", effects: { happiness: 10, cityFunds: -10, specialInterest: -5, personalProfit: 0 }, next: 'choice4B21', consequence: "New safety rules are implemented. Workers feel safer, but projects are slowing down." },
            { text: "Ignore safety concerns", icon: "⏩", effects: { happiness: -20, cityFunds: 10, specialInterest: 10, personalProfit: 5 }, next: 'choice4B22', consequence: "Projects move forward quickly, but injuries continue to mount." }
        ]
    },
    choice4A11: {
        chapter: "Chapter 1: Corporate Backlash",
        title: "Labor Dispute",
        story: `<p>TigerTech Industries is retaliating against the pollution taxes you imposed.</p><p>They're threatening to cut wages and hours for their 500 employees. Do you intervene?</p>`,
        choices: [
            { text: "Implement labor protection laws", icon: "⚖️", effects: { happiness: 15, cityFunds: 0, specialInterest: -15, personalProfit: 0 }, next: 'ending', consequence: "Workers are protected, but TigerTech considers leaving Tiger Central." },
            { text: "Let the company cut wages", icon: "📉", effects: { happiness: -15, cityFunds: 0, specialInterest: 10, personalProfit: 3 }, next: 'ending', consequence: "Workers face pay cuts. Families struggle." }
        ]
    },
    choice4A12: {
        chapter: "Chapter 1: Public Protest",
        title: "Citizens Revolt",
        story: `<p>Protests have erupted throughout Tiger Central!</p><p>Citizens are furious that they're paying for water treatment while the polluting company faces no consequences.</p>`,
        choices: [
            { text: "Meet with protest leaders", icon: "🤝", effects: { happiness: 10, cityFunds: -5, specialInterest: -10, personalProfit: 0 }, next: 'ending', consequence: "You listen to citizens' concerns and promise reform. Trust begins to rebuild." },
            { text: "Send in police", icon: "🚔", effects: { happiness: -25, cityFunds: -5, specialInterest: 5, personalProfit: 0 }, next: 'ending', consequence: "Protests are dispersed by force. Resentment grows." }
        ]
    },
    choice4A21: {
        chapter: "Chapter 1: Budget Crisis",
        title: "Financial Strain",
        story: `<p>Compensating residents has created a budget shortfall. You need to balance the budget somehow.</p>`,
        choices: [
            { text: "Raise local taxes", icon: "📊", effects: { happiness: -15, cityFunds: 15, specialInterest: -5, personalProfit: 0 }, next: 'ending', consequence: "Tax increases anger citizens, but the budget is stabilized." },
            { text: "Cut education and parks funding", icon: "✂️", effects: { happiness: -20, cityFunds: 15, specialInterest: 5, personalProfit: 0 }, next: 'ending', consequence: "Schools and parks suffer. Families with children are upset." }
        ]
    },
    choice4A22: {
        chapter: "Chapter 1: Construction Delays",
        title: "Housing Crisis",
        story: `<p>The new homes for relocated residents are behind schedule. The contractor is having trouble finding materials and costs are rising.</p>`,
        choices: [
            { text: "Rush with cheaper materials", icon: "⏰", effects: { happiness: -10, cityFunds: 5, specialInterest: 5, personalProfit: 3 }, next: 'ending', consequence: "Homes are completed quickly but quality is poor." },
            { text: "Spend extra for quality", icon: "💎", effects: { happiness: 15, cityFunds: -20, specialInterest: -5, personalProfit: 0 }, next: 'ending', consequence: "Beautiful, safe homes are built. The budget takes a hit.", building: 'house' }
        ]
    },
    choice4A23: {
        chapter: "Chapter 1: Corporate Overreach",
        title: "Illegal Expansion",
        story: `<p>TigerTech has taken advantage of your inaction! They've been illegally expanding their operations onto protected land.</p>`,
        choices: [
            { text: "Continue ignoring it", icon: "🙈", effects: { happiness: -30, cityFunds: 0, specialInterest: 20, personalProfit: 15 }, next: 'ending', consequence: "Your inaction becomes a scandal. Citizens have lost all faith." },
            { text: "Fine the company", icon: "⚡", effects: { happiness: 20, cityFunds: 10, specialInterest: -20, personalProfit: 0 }, next: 'ending', consequence: "You finally take a stand. Citizens applaud!", building: 'park' }
        ]
    },
    choice4B11: {
        chapter: "Chapter 1: Surveillance State",
        title: "Privacy Concerns",
        story: `<p>Crime has dropped thanks to increased surveillance, but citizens are uneasy. People feel like they're always being watched.</p>`,
        choices: [
            { text: "Scale back surveillance", icon: "🔙", effects: { happiness: 10, cityFunds: 5, specialInterest: -10, personalProfit: 0 }, next: 'ending', consequence: "Citizens breathe easier with less monitoring." },
            { text: "Double down", icon: "🔒", effects: { happiness: -20, cityFunds: -10, specialInterest: 15, personalProfit: 0 }, next: 'ending', consequence: "Tiger Central becomes a surveillance state." }
        ]
    },
    choice4B12: {
        chapter: "Chapter 1: Employment Challenge",
        title: "Hiring Hesitation",
        story: `<p>The job-training programs are producing qualified workers, but local businesses are hesitant to hire trainees.</p>`,
        choices: [
            { text: "Place hiring quotas", icon: "📋", effects: { happiness: 5, cityFunds: 0, specialInterest: -15, personalProfit: 0 }, next: 'ending', consequence: "Businesses must hire trainees. Some comply grudgingly." },
            { text: "Offer tax breaks", icon: "💸", effects: { happiness: 10, cityFunds: -10, specialInterest: 10, personalProfit: 0 }, next: 'ending', consequence: "Tax incentives work! Employment rises.", building: 'shop' }
        ]
    },
    choice4B21: {
        chapter: "Chapter 1: Productivity Crisis",
        title: "Slowing Progress",
        story: `<p>The new safety regulations are protecting workers, but productivity has dropped. Projects are behind schedule.</p>`,
        choices: [
            { text: "Fire underperforming employees", icon: "❌", effects: { happiness: -15, cityFunds: 5, specialInterest: 10, personalProfit: 0 }, next: 'ending', consequence: "Projects speed up, but workers live in fear." },
            { text: "Extend deadlines", icon: "⏱️", effects: { happiness: 10, cityFunds: -5, specialInterest: -10, personalProfit: 0 }, next: 'ending', consequence: "Quality and safety improve. Citizens appreciate patience." }
        ]
    },
    choice4B22: {
        chapter: "Chapter 1: Legal Trouble",
        title: "Lawsuits Mounting",
        story: `<p>Injury reports are piling up, and now the lawsuits are coming. Injured workers are demanding compensation.</p>`,
        choices: [
            { text: "Pay employees to keep quiet", icon: "💰", effects: { happiness: -20, cityFunds: -15, specialInterest: 10, personalProfit: -5 }, next: 'ending', consequence: "Hush money works temporarily, but rumors spread." },
            { text: "Let them bring cases to court", icon: "⚖️", effects: { happiness: 5, cityFunds: -20, specialInterest: -15, personalProfit: 0 }, next: 'ending', consequence: "The truth comes out. You take responsibility and promise reform." }
        ]
    },
    ending: { 
        title: "Your Term Ends", 
        story: `<p>Your first year as mayor of Tiger Central has come to an end. Let's see how you did...</p>` 
    }
};

// ==================== STATS MANAGEMENT ====================
function updateStats() {
    gameState.happiness = Math.max(0, Math.min(100, gameState.happiness));
    gameState.cityFunds = Math.max(0, Math.min(100, gameState.cityFunds));
    gameState.specialInterest = Math.max(0, Math.min(100, gameState.specialInterest));

    // Update stat displays (using new compact layout IDs)
    const happinessEl = document.getElementById('happiness');
    const fundsEl = document.getElementById('cityFunds');
    const interestEl = document.getElementById('specialInterest');
    const decisionsEl = document.getElementById('decisionsMade');
    
    if (happinessEl) happinessEl.textContent = gameState.happiness;
    if (fundsEl) fundsEl.textContent = gameState.cityFunds;
    if (interestEl) interestEl.textContent = gameState.specialInterest;
    if (decisionsEl) decisionsEl.textContent = gameState.decisions.length;
    
    // Update building palette to reflect affordability
    updateBuildingPalette();
}

function applyEffects(effects) {
    if (effects.happiness) gameState.happiness += effects.happiness;
    if (effects.cityFunds) gameState.cityFunds += effects.cityFunds;
    if (effects.specialInterest) gameState.specialInterest += effects.specialInterest;
    if (effects.personalProfit) gameState.personalProfit += effects.personalProfit;
    
    updateStats();
}

// ==================== SCENE RENDERING ====================
function renderScene(sceneKey) {
    const scene = gameData[sceneKey];
    const content = document.getElementById('game-content');
    const quizTitle = document.getElementById('quiz-title');
    
    // Always stop any existing timer first
    stopTimer();
    setCurrentSceneKey(sceneKey);
    
    // Update quiz title based on scene
    if (quizTitle) {
        if (sceneKey === 'intro') {
            quizTitle.textContent = 'Welcome';
        } else if (sceneKey === 'ending') {
            quizTitle.textContent = 'Game Complete';
        } else if (scene.isDifficultySelection) {
            quizTitle.textContent = 'Choose Difficulty';
        } else {
            quizTitle.textContent = scene.chapter || 'Decision Time';
        }
    }
    
    if (sceneKey === 'ending') {
        renderEnding();
        return;
    }
    
    if (scene.isDifficultySelection) {
        renderDifficultySelection();
        return;
    }

    let html = '';

    if (scene.chapter) {
        html += `<div class="chapter-title">${scene.chapter}</div>`;
    }

    html += `<div class="story-section"><h2>${scene.title}</h2><div class="story-text">${scene.story}</div></div>`;

    if (sceneKey === 'intro') {
        html += `<div class="intro-screen"><button class="start-btn" onclick="startGame()"><span class="start-btn-text">Let's Begin!</span></button></div>`;
    } else {
        html += `<div class="choices">`;
        scene.choices.forEach((choice, index) => {
            html += `<div class="choice-card" onclick="makeChoice('${sceneKey}', ${index})">`;
            html += `<span class="choice-icon">${choice.icon}</span>`;
            html += `<div class="choice-text">${choice.text}</div>`;
            html += `</div>`;
        });
        html += `</div>`;
    }

    content.innerHTML = html;
    
    // Start timer for ALL decision scenes (not intro, difficulty, or ending)
    if (sceneKey !== 'intro' && sceneKey !== 'ending' && sceneKey !== 'difficulty_selection') {
        console.log('🎮 Starting timer for scene:', sceneKey);
        setTimeout(() => {
            startTimer();
        }, 100);
    }
}

// Render difficulty selection screen
function renderDifficultySelection() {
    const content = document.getElementById('game-content');
    const scene = gameData.difficulty_selection;
    
    let html = `<div class="story-section"><h2>${scene.title}</h2><div class="story-text">${scene.story}</div></div>`;
    
    html += `<div class="difficulty-grid">`;
    
    Object.values(difficultyModes).forEach(mode => {
        html += `
            <div class="difficulty-card" onclick="selectDifficulty('${mode.id}')" 
                 style="border-color: ${mode.color};">
                <div class="difficulty-icon" style="color: ${mode.color};">${mode.icon}</div>
                <h3 class="difficulty-name">${mode.name}</h3>
                <p class="difficulty-desc">${mode.description}</p>
                <div class="difficulty-stats">
                    <div class="diff-stat">⏰ <strong>${mode.timerPerScene}s</strong> per decision</div>
                    <div class="diff-stat">💰 <strong>$${mode.startingFunds}M</strong> starting funds</div>
                    <div class="diff-stat">🔄 <strong>${mode.buildingRelocations}</strong> relocations</div>
                    <div class="diff-stat">↶ <strong>${mode.undoLimit}</strong> undos</div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    content.innerHTML = html;
}

function makeChoice(sceneKey, choiceIndex) {
    stopTimer();
    
    // Haptic feedback on choice
    triggerHaptic('medium');
    
    const scene = gameData[sceneKey];
    const choice = scene.choices[choiceIndex];

    // Calculate time bonus (2 points per second remaining)
    const secondsRemaining = gameState.timerSeconds;
    const earnedTimeBonus = secondsRemaining * 2;
    gameState.timeBonus += earnedTimeBonus;
    
    console.log(`⚡ Time Bonus: +${earnedTimeBonus} points (${secondsRemaining}s remaining)`);

    // Track decision time for achievements
    const timeSpent = gameState.currentDecisionTime - gameState.timerSeconds;
    gameState.decisions.push({ 
        scene: sceneKey, 
        choice: choice.text,
        timeSpent: timeSpent 
    });

    // Handle building unlocks
    if (choice.unlocks && choice.unlocks.length > 0) {
        const newUnlocks = choice.unlocks.filter(b => !gameState.unlockedBuildings.includes(b));
        newUnlocks.forEach(buildingId => {
            gameState.unlockedBuildings.push(buildingId);
            const building = buildingPalette.find(b => b.id === buildingId);
            if (building) {
                showUnlockNotification(building);
                console.log(`🔓 Unlocked building: ${building.name}`);
            }
        });
        
        // Re-render palette to show unlocked buildings
        renderBuildingPalette();
    }

    // Determine time bank adjustment based on choice quality
    let timeBankAdjustment = 0;
    if (choice.effects) {
        // Calculate total impact (positive or negative)
        const totalImpact = (choice.effects.happiness || 0) + 
                           (choice.effects.cityFunds || 0) + 
                           (choice.effects.specialInterest || 0);
        
        if (totalImpact > 5) {
            // Good choice: +10 seconds
            timeBankAdjustment = 10;
            gameState.timeBankSeconds += 10;
        } else if (totalImpact < -5) {
            // Bad choice: -5 seconds
            timeBankAdjustment = -5;
            gameState.timeBankSeconds -= 5;
        }
        
        applyEffects(choice.effects);
        
        if (choice.consequence) {
            showConsequence(choice.effects, choice.consequence, earnedTimeBonus, timeBankAdjustment);
        }
    }

    // Check if mandatory building placement is required
    if (choice.building) {
        const building = buildingPalette.find(b => b.id === choice.building);
        if (building) {
            // Set up mandatory placement
            gameState.pendingBuildingPlacement = {
                building: building,
                nextScene: choice.next
            };
            gameState.awaitingPlacement = true;
            
            // Show placement overlay after short delay
            setTimeout(() => {
                showMandatoryPlacementOverlay(building);
            }, 2500);
        } else {
            // No building found, continue normally
            setTimeout(() => {
                renderScene(choice.next);
            }, 2500);
        }
    } else {
        // No mandatory placement, continue normally
        setTimeout(() => {
            renderScene(choice.next);
        }, 2500);
    }
}

function showConsequence(effects, message, earnedTimeBonus = 0, timeBankAdjustment = 0) {
    const content = document.getElementById('game-content');
    const consequenceDiv = document.createElement('div');
    consequenceDiv.className = 'consequences';
    
    let html = '<h3>⚡ Consequences</h3>';
    html += `<p>${message}</p>`;
    
    if (effects.happiness) {
        html += `<div class="consequence-item ${effects.happiness > 0 ? 'positive' : 'negative'}">`;
        html += `😊 Happiness: ${effects.happiness > 0 ? '+' : ''}${effects.happiness}`;
        html += `</div>`;
    }
    
    if (effects.cityFunds) {
        html += `<div class="consequence-item ${effects.cityFunds > 0 ? 'positive' : 'negative'}">`;
        html += `💰 City Funds: ${effects.cityFunds > 0 ? '+' : ''}${effects.cityFunds}M`;
        html += `</div>`;
    }
    
    if (effects.specialInterest) {
        html += `<div class="consequence-item ${effects.specialInterest > 0 ? 'positive' : 'negative'}">`;
        html += `🏛️ Special Interest: ${effects.specialInterest > 0 ? '+' : ''}${effects.specialInterest}`;
        html += `</div>`;
    }
    
    if (effects.personalProfit !== 0) {
        html += `<div class="consequence-item ${effects.personalProfit > 0 ? 'positive' : 'negative'}">`;
        html += `💵 Your Profit: ${effects.personalProfit > 0 ? '+' : ''}${effects.personalProfit}M`;
        html += `</div>`;
    }
    
    // Display time bonus earned
    if (earnedTimeBonus > 0) {
        html += `<div class="consequence-item positive" style="border-top: 2px dashed rgba(0,184,148,0.3); margin-top: 10px; padding-top: 10px;">`;
        html += `⚡ Time Bonus: +${earnedTimeBonus} points`;
        html += `</div>`;
    }
    
    // Display time bank adjustment for next scene
    if (timeBankAdjustment !== 0) {
        html += `<div class="consequence-item ${timeBankAdjustment > 0 ? 'positive' : 'negative'}">`;
        html += `⏰ Next Timer: ${timeBankAdjustment > 0 ? '+' : ''}${timeBankAdjustment}s`;
        html += `</div>`;
    }

    consequenceDiv.innerHTML = html;
    content.appendChild(consequenceDiv);
    consequenceDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderEnding() {
    const content = document.getElementById('game-content');
    
    // Track game end time
    gameState.gameEndTime = Date.now();
    
    // Check Rush Hour achievement (game completed in under 8 minutes)
    if (gameState.gameStartTime) {
        const gameTime = (gameState.gameEndTime - gameState.gameStartTime) / 1000 / 60; // minutes
        console.log(`🎮 Total game time: ${gameTime.toFixed(2)} minutes`);
        
        if (gameTime < 8 && !gameState.achievements.includes('rush_hour')) {
            gameState.achievements.push('rush_hour');
            showToast('🏃 Achievement: Rush Hour - Completed in under 8 minutes!', 'success');
        }
    }
    
    // Final achievement check
    checkAchievements();
    
    let rating = '';
    let message = '';
    
    // Calculate base score and final score with time bonus
    const baseScore = (gameState.happiness + gameState.cityFunds + gameState.specialInterest) / 3;
    const achievementBonus = gameState.achievements.length * 10; // 10 points per achievement
    const finalScore = baseScore + (gameState.timeBonus / 10) + achievementBonus;
    
    // Get all earned achievements with details
    const earnedAchievements = gameState.achievements.map(id => {
        const def = achievementDefinitions[id];
        return def ? `${def.icon} ${def.name} - ${def.description}` : null;
    }).filter(a => a !== null);

    if (finalScore >= 70) {
        rating = '🌟 Excellent Mayor!';
        message = 'You balanced competing interests masterfully! Tiger Central is thriving under your leadership.';
    } else if (finalScore >= 50) {
        rating = '👍 Decent Mayor';
        message = "You made tough choices and kept the city running. Some groups are happier than others, but that's politics!";
    } else if (finalScore >= 30) {
        rating = '😬 Struggling Mayor';
        message = 'Your term was rocky. Many citizens are unhappy with your decisions.';
    } else {
        rating = '❌ Failed Mayor';
        message = 'Your decisions have left Tiger Central worse than before. The city is considering a recall election.';
    }

    let profitMessage = '';
    if (gameState.personalProfit > 15) {
        profitMessage = '<p style="color:#d63031;font-size:1.2em;">⚠️ Your personal profit-taking has not gone unnoticed. Citizens question your integrity.</p>';
    } else if (gameState.personalProfit > 5) {
        profitMessage = '<p style="font-size:1.1em;">You made some personal profit along the way. Not illegal, but not exactly selfless leadership either.</p>';
    } else if (gameState.personalProfit <= 0) {
        profitMessage = '<p style="color:#00b894;font-size:1.2em;">✨ You remained ethical and avoided personal enrichment. Citizens respect your integrity!</p>';
    }

    const html = `
        <div class="game-over">
            <h2>${rating}</h2>
            <p style="font-size:1.3em;margin:20px 0;font-weight:600;">${message}</p>
            ${profitMessage}
            
            <div class="final-stats">
                <h3>📊 Final Statistics</h3>
                <div class="final-stat-item"><strong>Population Happiness:</strong> ${gameState.happiness}/100 ${gameState.happiness >= 70 ? '🎉' : gameState.happiness >= 40 ? '😐' : '😞'}</div>
                <div class="final-stat-item"><strong>City Funds:</strong> $${gameState.cityFunds}M ${gameState.cityFunds >= 70 ? '💰' : gameState.cityFunds >= 40 ? '💵' : '💸'}</div>
                <div class="final-stat-item"><strong>Special Interest Support:</strong> ${gameState.specialInterest}/100 ${gameState.specialInterest >= 70 ? '🤝' : gameState.specialInterest >= 40 ? '👌' : '👎'}</div>
                <div class="final-stat-item"><strong>Your Personal Profit:</strong> $${gameState.personalProfit}M ${gameState.personalProfit > 10 ? '⚠️' : gameState.personalProfit > 0 ? '💵' : '✨'}</div>
                <div class="final-stat-item"><strong>Decisions Made:</strong> ${gameState.decisions.length} choices 🎯</div>
            </div>
            
            <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%);">
                <h3>⚡ Time Performance</h3>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);"><strong>Base Score:</strong> ${baseScore.toFixed(1)}/100</div>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #fff9e6 0%, #fef5e7 100%);"><strong>Time Bonus Earned:</strong> +${gameState.timeBonus} points ⚡</div>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);font-size:1.3em;"><strong>Final Score:</strong> ${finalScore.toFixed(1)}/100 ${finalScore >= 70 ? '🌟' : finalScore >= 50 ? '👍' : '😬'}</div>
            </div>
            
            <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                <h3>🏙️ City Planning</h3>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #fff9e6 0%, #fef5e7 100%);"><strong>Planning Efficiency:</strong> ${gameState.planningEfficiency}% 📐</div>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);"><strong>Buildings Placed:</strong> ${gameState.cityGrid.filter(c => c !== null).length} total 🏗️</div>
                ${gameState.detectedZones.length > 0 ? `
                    <div class="final-stat-item" style="background:white;"><strong>Zones Formed:</strong> ${gameState.detectedZones.map(z => `${z.icon} ${z.name}`).join(', ')}</div>
                ` : '<div class="final-stat-item" style="background:white;opacity:0.7;">No zones formed</div>'}
            </div>
            
            ${earnedAchievements.length > 0 ? `
                <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #fff5e5 0%, #ffe5cc 100%);">
                    <h3>🏆 Achievements Unlocked (${earnedAchievements.length}/${Object.keys(achievementDefinitions).length})</h3>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #fffbea 0%, #fff4d6 100%);font-size:1.1em;">
                        <strong>Achievement Bonus:</strong> +${achievementBonus} points (${earnedAchievements.length} × 10)
                    </div>
                    ${earnedAchievements.map(a => `<div class="final-stat-item" style="background:white;border-left:4px solid #f39c12;">${a}</div>`).join('')}
                </div>
            ` : `
                <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);opacity:0.7;">
                    <h3>🏆 No Achievements Unlocked</h3>
                    <p style="padding:15px;margin:0;">Try building more strategically or making faster decisions to unlock achievements!</p>
                </div>
            `}

            <div class="story-section" style="margin-top:20px;text-align:left;">
                <h3>🎓 What You Learned</h3>
                <p>Politics isn't black and white. Every decision has trade-offs:</p>
                <ul style="margin-left:20px;margin-top:10px;line-height:1.8;">
                    <li>Economic growth can come at an environmental cost</li>
                    <li>Helping one group might upset another</li>
                    <li>Sometimes there are no perfect solutions</li>
                    <li>Leadership requires balancing many competing interests</li>
                    <li>Corruption and personal profit-taking erode public trust</li>
                </ul>
                <p style="margin-top:15px;">Real mayors face these kinds of complex decisions every day. Understanding that politics involves difficult choices and trade-offs helps us be better informed citizens!</p>
            </div>

            <button class="start-btn" onclick="location.reload()" style="margin-top:30px;"><span class="start-btn-text">🔄 Play Again</span></button>
        </div>
    `;

    content.innerHTML = html;
}

// ==================== TUTORIAL SYSTEM ====================
const tutorialSteps = [
    {
        title: "⏰ Decision Timer",
        text: "This is your timer - make decisions before it runs out! The timer changes color as time decreases. Green is safe, yellow is warning, red means hurry!",
        highlightElement: 'timer-container',
        position: 'bottom'
    },
    {
        title: "📊 Your Stats",
        text: "These are your stats - keep them balanced! Track Population Happiness, City Funds, Special Interest Support, and Your Profit. Every decision affects these metrics.",
        highlightElement: 'stats-panel',
        position: 'top'
    },
    {
        title: "🏗️ Building Palette",
        text: "Drag buildings from here to build your city! Each building costs money and provides different benefits. Buildings unlock as you make story choices.",
        highlightElement: 'building-palette',
        position: 'left'
    },
    {
        title: "🏙️ City Grid",
        text: "Drop buildings on the grid - watch for bonuses! Green highlights show beneficial adjacency, red shows penalties. Place buildings strategically for maximum efficiency!",
        highlightElement: 'city-grid',
        position: 'top'
    },
    {
        title: "🎮 Ready to Play!",
        text: "Now you're ready! Make your first decision. You'll get bonus time (+30s) for your first choice. Remember: Think fast, build smart, and balance your city!",
        highlightElement: null,
        position: 'center'
    }
];

let currentTutorialStep = 0;

function checkFirstTime() {
    const hasPlayed = localStorage.getItem('manestreet_played');
    if (!hasPlayed) {
        // First time player - show tutorial prompt after intro
        return true;
    }
    return false;
}

function startTutorial() {
    currentTutorialStep = 0;
    showTutorialStep(0);
    localStorage.setItem('manestreet_tutorial', 'started');
}

function showTutorialStep(stepIndex) {
    const step = tutorialSteps[stepIndex];
    const overlay = document.getElementById('tutorial-overlay');
    const highlight = document.getElementById('tutorial-highlight');
    const title = document.getElementById('tutorial-title');
    const text = document.getElementById('tutorial-text');
    const progress = document.getElementById('tutorial-progress');
    const nextBtn = document.querySelector('.tutorial-next');
    
    overlay.style.display = 'block';
    title.textContent = step.title;
    text.textContent = step.text;
    progress.textContent = `Step ${stepIndex + 1} of ${tutorialSteps.length}`;
    
    if (stepIndex === tutorialSteps.length - 1) {
        nextBtn.textContent = 'Start Game! →';
    } else {
        nextBtn.textContent = 'Next →';
    }
    
    // Highlight element if specified
    if (step.highlightElement) {
        const element = document.getElementById(step.highlightElement) || 
                       document.querySelector(`.${step.highlightElement}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            highlight.style.top = rect.top - 10 + 'px';
            highlight.style.left = rect.left - 10 + 'px';
            highlight.style.width = rect.width + 20 + 'px';
            highlight.style.height = rect.height + 20 + 'px';
            highlight.style.display = 'block';
        }
    } else {
        highlight.style.display = 'none';
    }
    
    console.log(`📚 Tutorial step ${stepIndex + 1}/${tutorialSteps.length}: ${step.title}`);
}

function nextTutorialStep() {
    currentTutorialStep++;
    
    if (currentTutorialStep >= tutorialSteps.length) {
        completeTutorial();
    } else {
        showTutorialStep(currentTutorialStep);
    }
}

function skipTutorial() {
    localStorage.setItem('manestreet_tutorial', 'skipped');
    completeTutorial();
}

function completeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    overlay.style.display = 'none';
    localStorage.setItem('manestreet_played', 'true');
    localStorage.setItem('manestreet_tutorial', 'completed');
    
    // Add time bonus for first choice
    gameState.timeBankSeconds += 30;
    
    console.log('📚 Tutorial completed! +30s bonus for first decision');
}

// ==================== GAME START ====================
function startGame() {
    // Check if first time playing
    const isFirstTime = checkFirstTime();
    
    if (isFirstTime) {
        // Show tutorial prompt
        const proceed = confirm("First time playing? Would you like to see a quick tutorial? (Recommended for new players)");
        if (proceed) {
            // Go to difficulty selection, then tutorial will show
            renderScene('difficulty_selection');
            
            // Start tutorial after difficulty is selected
            // This will be triggered after selectDifficulty
        } else {
            localStorage.setItem('manestreet_played', 'true');
            localStorage.setItem('manestreet_tutorial', 'declined');
            renderScene('difficulty_selection');
        }
    } else {
        renderScene('difficulty_selection');
    }
}

// ==================== DYNAMIC QUIZ SYSTEM ====================
let isQuizVisible = true;

function toggleQuiz() {
    const overlay = document.getElementById('game-content-overlay');
    const toggleBtn = document.getElementById('quiz-toggle');
    const unhideBtn = document.getElementById('unhide-button');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    
    isQuizVisible = !isQuizVisible;
    
    if (isQuizVisible) {
        overlay.classList.remove('hidden');
        unhideBtn.style.display = 'none';
        toggleText.textContent = 'Hide';
        toggleIcon.textContent = '👁️';
        toggleBtn.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        unhideBtn.style.display = 'flex';
        toggleText.textContent = 'Show';
        toggleIcon.textContent = '👁️‍🗨️';
        toggleBtn.classList.add('hidden');
    }
    
    // Trigger haptic feedback
    triggerHaptic('light');
}

// Initialize quiz toggle system
function initializeQuizToggle() {
    // No need for city view click handler since we have the unhide button
    console.log('🎮 Quiz toggle system initialized');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initializeTooltips();
    initializeQuizToggle();
    renderBuildingPalette();
    renderCityGrid();
    updateUndoButton();
    updateEfficiencyDisplay();
    renderScene('intro');
});

