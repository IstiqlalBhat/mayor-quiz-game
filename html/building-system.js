// ==================== BUILDING SYSTEM ====================
// Building palette, placement, effects, adjacency, undo

// Track currently dragged building for validation
let currentDraggedBuilding = null;

function addBuilding(type) {
    gameState.buildings.push(type);
    // Building visualization removed - just track in state
}

// Render building palette cards
function renderBuildingPalette() {
    const container = document.getElementById('palette-buildings');
    if (!container) return;

    container.innerHTML = '';

    // If in mandatory placement mode, only show the mandatory building
    let buildingsToShow = buildingPalette;
    if (gameState.awaitingPlacement && gameState.pendingBuildingPlacement) {
        const mandatoryBuilding = gameState.pendingBuildingPlacement.building;
        if (mandatoryBuilding) {
            buildingsToShow = buildingPalette.filter(b => b.id === mandatoryBuilding.id);
            console.log(`🔒 Mandatory placement mode: Only showing ${mandatoryBuilding.name} (ID: ${mandatoryBuilding.id})`);
        } else {
            console.error('❌ pendingBuildingPlacement.building is null/undefined!');
            // Clear invalid state
            gameState.pendingBuildingPlacement = null;
            gameState.awaitingPlacement = false;
        }
    } else {
        console.log(`📋 Normal palette mode - awaitingPlacement: ${gameState.awaitingPlacement}`);
    }

    if (!gameState.awaitingPlacement) {
        // Filter buildings based on current chapter
        const currentChapter = getCurrentChapter();
        if (currentChapter === 2) {
            // In Chapter 2, only show:
            // - Chapter 2 buildings (when unlocked)
            // - Chapter 1 buildings that are explicitly available in Chapter 2
            buildingsToShow = buildingPalette.filter(b => {
                if (b.chapter === 2) {
                    return true; // Show all Chapter 2 buildings (they'll be locked if not unlocked)
                } else if (b.chapter === 1) {
                    return b.availableInChapter2 === true; // Only show if explicitly allowed
                }
                return false;
            });
            console.log(`📋 Chapter 2: Filtered to ${buildingsToShow.length} contextually relevant buildings`);
        }
        // In Chapter 1, show all Chapter 1 buildings (no filtering needed)
    }

    buildingsToShow.forEach(building => {
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

    // Play building place sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playBuildingPlace();
    }

    console.log('✅ Building placed:', building.name, 'at cell', cellIndex);
    renderCityGrid();

    // Have advisor react to building placement
    narrativeManager.reactToBuilding(building.id);

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

    let totalBonuses = {};
    let totalPenalties = {};
    let messages = [];

    adjacentCells.forEach(adjIndex => {
        const neighbor = gameState.cityGrid[adjIndex];
        if (!neighbor) return;

        // HANDLE FEATURES (river, mountains, etc.)
        if (neighbor.type === 'feature') {
            const feature = gridFeatures[neighbor.featureId];
            if (feature && feature.adjacencyEffects && feature.adjacencyEffects[buildingType]) {
                const effect = feature.adjacencyEffects[buildingType];

                // Apply bonus from feature
                if (effect.bonus) {
                    Object.keys(effect.bonus).forEach(key => {
                        totalBonuses[key] = (totalBonuses[key] || 0) + effect.bonus[key];
                    });
                    messages.push(effect.message);
                }

                // Apply penalty from feature
                if (effect.penalty) {
                    Object.keys(effect.penalty).forEach(key => {
                        totalPenalties[key] = (totalPenalties[key] || 0) + effect.penalty[key];
                    });
                    messages.push(effect.message);
                }

                // Track achievement: built near river
                if (neighbor.featureId === 'river' && buildingType === 'factory') {
                    gameState.achievementTracking.builtNearRiver = true;
                    console.log('🏆 Achievement tracking: Built factory near river');
                }
            }
        }
        // HANDLE BUILDINGS (existing adjacency rules)
        else if (rule && rule.near && rule.near.includes(neighbor.type)) {
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

// Show feature tooltip on hover
function showFeatureTooltip(e, feature) {
    const tooltip = document.getElementById('tooltip');

    tooltip.innerHTML = `
        <strong>${feature.icon} ${feature.name}</strong><br>
        📖 ${feature.description}<br>
        ${!feature.buildable ? '🚫 Cannot build here' : '✅ Can build here'}<br>
        <em style="font-size:0.9em;opacity:0.8;">Environmental feature</em>
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
    gameState.achievementTracking.usedNoUndos = false; // Track for achievement

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
function showMandatoryPlacementOverlay(building, constraints = null) {
    // CHECK FOR INSUFFICIENT FUNDS - TRIGGER BANKRUPTCY ENDING
    if (gameState.cityFunds < building.cost) {
        console.log(`💸 BANKRUPTCY: Cannot afford mandatory building ${building.name} ($${building.cost}M, have $${gameState.cityFunds}M)`);

        // Stop timer if running
        stopTimer();

        // Show bankruptcy ending
        showToast('💸 BANKRUPTCY! City has run out of funds!', 'error');

        // Delay slightly for dramatic effect
        setTimeout(() => {
            renderBankruptcyEnding();
        }, 2000);

        return;
    }

    const overlay = document.getElementById('placement-overlay');
    const icon = document.getElementById('placement-icon');
    const text = document.getElementById('placement-text');

    icon.textContent = building.icon;

    // Update text based on constraints
    if (constraints && constraints.adjacentToFeature) {
        const feature = gridFeatures[constraints.adjacentToFeature];
        text.textContent = `Drag ${building.name} to a cell adjacent to the ${feature.icon} ${feature.name}!`;
    } else {
        text.textContent = `Drag ${building.name} to the grid to continue!`;
    }

    overlay.classList.add('active');

    // Set placement constraints if provided
    if (constraints) {
        if (constraints.adjacentToFeature) {
            // Get all cells adjacent to the specified feature
            const allowedCells = getCellsAdjacentToFeature(constraints.adjacentToFeature);
            gameState.placementConstraints = { allowedCells };
            console.log(`🔒 Placement restricted to ${allowedCells.length} cells adjacent to ${constraints.adjacentToFeature}`);
        } else if (constraints.allowedCells) {
            gameState.placementConstraints = { allowedCells: constraints.allowedCells };
            console.log(`🔒 Placement restricted to ${constraints.allowedCells.length} specific cells`);
        }
    } else {
        gameState.placementConstraints = null;
    }

    // Re-render grid to show locked/allowed cells
    renderCityGrid();

    // Re-render building palette to show only the mandatory building
    renderBuildingPalette();

    console.log(`🏗️ Mandatory placement required: ${building.name}`);
}

// Hide mandatory placement overlay
function hideMandatoryPlacementOverlay() {
    const overlay = document.getElementById('placement-overlay');
    overlay.classList.remove('active');
}

// Complete mandatory placement and continue to next scene
function completeMandatoryPlacement() {
    if (!gameState.pendingBuildingPlacement) {
        console.warn('⚠️ completeMandatoryPlacement called but no pending placement');
        // Still clear state defensively
        gameState.awaitingPlacement = false;
        gameState.placementConstraints = null;
        hideMandatoryPlacementOverlay();
        renderBuildingPalette();
        return;
    }

    const nextScene = gameState.pendingBuildingPlacement.nextScene;
    const buildingName = gameState.pendingBuildingPlacement.building?.name || 'Unknown';

    console.log(`🏗️ Completing mandatory placement of ${buildingName}, next: ${nextScene}`);

    // Clear placement state FIRST
    gameState.pendingBuildingPlacement = null;
    gameState.awaitingPlacement = false;
    gameState.placementConstraints = null;

    // Hide overlay
    hideMandatoryPlacementOverlay();

    // Re-render grid to remove locked cells
    renderCityGrid();

    // Re-render building palette to show all buildings again
    renderBuildingPalette();

    // Verify state is cleared
    console.log(`📋 State cleared - awaitingPlacement: ${gameState.awaitingPlacement}, pendingBuildingPlacement: ${gameState.pendingBuildingPlacement}`);

    // Continue to next scene
    renderScene(nextScene);

    console.log(`✅ Mandatory placement complete, continuing to ${nextScene}`);
}

// ==================== DRAG TO MOVE EXISTING BUILDINGS ====================
let draggedBuildingIndex = null;

function handleOccupiedDragStart(e, cellIndex) {
    const building = gameState.cityGrid[cellIndex];

    // Prevent dragging permanent features (City Hall, River, etc.)
    if (building && building.type === 'feature') {
        const permanentFeatures = ['city_hall', 'river', 'polluted_river', 'mountain', 'highway', 'protected_forest', 'flooded_area'];
        if (permanentFeatures.includes(building.featureId)) {
            e.preventDefault();
            showToast('🏛️ Permanent features cannot be moved!', 'info');
            return;
        }
    }

    draggedBuildingIndex = cellIndex;

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
    const buildingTypesList = Object.keys(buildingCounts);
    if (buildingTypesList.length >= 3) {
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

console.log('📦 building-system.js loaded');
