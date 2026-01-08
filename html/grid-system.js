// ==================== GRID SYSTEM ====================
// Grid rendering, features, patterns, initial placements

// ==================== GRID FEATURE PLACEMENT SYSTEM ====================

// Place a feature on the grid (called by story choices)
function placeGridFeature(featureId, cellIndices, silent = false) {
    const feature = gridFeatures[featureId];
    if (!feature) {
        console.error(`Feature ${featureId} not found`);
        return;
    }

    // Place feature on each specified cell
    cellIndices.forEach(cellIndex => {
        if (cellIndex >= 0 && cellIndex < gameState.cityGrid.length) {
            gameState.cityGrid[cellIndex] = {
                type: 'feature',
                featureId: featureId,
                icon: feature.icon,
                name: feature.name,
                buildable: feature.buildable,
                isBuilding: feature.isBuilding || false
            };

            // Track in gridFeatures array
            gameState.gridFeatures.push({
                featureId: featureId,
                cellIndex: cellIndex
            });
        }
    });

    console.log(`🗺️ Placed ${feature.name} on cells:`, cellIndices);

    // Update grid display
    renderCityGrid();

    // Show notification (unless silent)
    if (!silent) {
        showToast(`🗺️ ${feature.name} added to city map`, 'info');
    }
}

// Remove/replace a feature (e.g., river becomes polluted_river)
function replaceGridFeature(oldFeatureId, newFeatureId) {
    const affectedCells = [];

    // Find all cells with the old feature
    gameState.cityGrid.forEach((cell, index) => {
        if (cell && cell.type === 'feature' && cell.featureId === oldFeatureId) {
            affectedCells.push(index);
        }
    });

    if (affectedCells.length === 0) {
        console.log(`No cells found with feature ${oldFeatureId}`);
        return;
    }

    // Remove old feature from tracking
    gameState.gridFeatures = gameState.gridFeatures.filter(f => f.featureId !== oldFeatureId);

    // Clear old feature from grid
    affectedCells.forEach(index => {
        gameState.cityGrid[index] = null;
    });

    // Place new feature
    placeGridFeature(newFeatureId, affectedCells);

    const newFeature = gridFeatures[newFeatureId];
    console.log(`🔄 Replaced ${oldFeatureId} with ${newFeatureId}`);
    showToast(`⚠️ ${newFeature.name} - environmental change!`, 'warning');
}

// Generate river pattern for different grid sizes
function generateRiverPattern() {
    const gridSize = getGridSize();
    const pattern = [];

    if (gridSize.total === 60) {
        // Desktop: 10x6 - River flows vertically through middle-left (column 3)
        for (let row = 0; row < gridSize.rows; row++) {
            pattern.push(row * gridSize.cols + 3); // Column 3
        }
    } else if (gridSize.total === 32) {
        // Tablet: 8x4 - River flows through column 2
        for (let row = 0; row < gridSize.rows; row++) {
            pattern.push(row * gridSize.cols + 2);
        }
    } else {
        // Mobile: 6x4 - River flows through column 2
        for (let row = 0; row < gridSize.rows; row++) {
            pattern.push(row * gridSize.cols + 2);
        }
    }

    return pattern;
}

// Generate mountain pattern
function generateMountainPattern() {
    const gridSize = getGridSize();
    const pattern = [];

    if (gridSize.total === 60) {
        // Desktop: Mountains on right edge (column 9)
        for (let row = 0; row < 4; row++) {
            pattern.push(row * gridSize.cols + 9);
        }
    } else if (gridSize.total === 32) {
        // Tablet: Mountains on right edge
        for (let row = 0; row < 3; row++) {
            pattern.push(row * gridSize.cols + 7);
        }
    } else {
        // Mobile: Mountains on right edge
        for (let row = 0; row < 2; row++) {
            pattern.push(row * gridSize.cols + 5);
        }
    }

    return pattern;
}

// Generate highway pattern
function generateHighwayPattern() {
    const gridSize = getGridSize();
    const pattern = [];

    if (gridSize.total === 60) {
        // Desktop: Highway runs horizontally across top (row 0)
        for (let col = 0; col < gridSize.cols; col++) {
            pattern.push(col);
        }
    } else if (gridSize.total === 32) {
        // Tablet: Highway across top
        for (let col = 0; col < gridSize.cols; col++) {
            pattern.push(col);
        }
    } else {
        // Mobile: Highway across top
        for (let col = 0; col < gridSize.cols; col++) {
            pattern.push(col);
        }
    }

    return pattern;
}

// Generate protected forest pattern
function generateForestPattern() {
    const gridSize = getGridSize();
    const pattern = [];

    if (gridSize.total === 60) {
        // Desktop: Forest area in bottom-left corner (3x2 area)
        pattern.push(40, 41, 50, 51, 42, 52); // 6 cells
    } else if (gridSize.total === 32) {
        // Tablet: Forest in bottom-left
        pattern.push(24, 25, 26); // 3 cells
    } else {
        // Mobile: Forest in bottom-left
        pattern.push(18, 19); // 2 cells
    }

    return pattern;
}

// Place city hall at start of game
function placeInitialCityHall() {
    const gridSize = getGridSize();
    let centerCell;

    if (gridSize.total === 60) {
        centerCell = 25; // Center-ish of 10x6 grid
    } else if (gridSize.total === 32) {
        centerCell = 13; // Center of 8x4
    } else {
        centerCell = 9; // Center of 6x4
    }

    placeGridFeature('city_hall', [centerCell], true); // Silent placement
}

// Place existing neighborhood at start
function placeInitialNeighborhood() {
    const gridSize = getGridSize();
    const pattern = [];

    if (gridSize.total === 60) {
        // Desktop: Small neighborhood near city hall (3 houses)
        pattern.push(14, 15, 24);
    } else if (gridSize.total === 32) {
        // Tablet: 2 houses
        pattern.push(12, 20);
    } else {
        // Mobile: 2 houses
        pattern.push(8, 14);
    }

    placeGridFeature('existing_neighborhood', pattern, true); // Silent placement
}

// Place river at start (permanent feature)
function placeInitialRiver() {
    const pattern = generateRiverPattern();
    placeGridFeature('river', pattern, true); // Silent placement
    console.log('🌊 River placed on grid (permanent feature)');
}

// Get all cells adjacent to a specific feature type
function getCellsAdjacentToFeature(featureId) {
    const adjacentCells = new Set();
    let featureCellsFound = 0;

    // Find all cells with this feature
    gameState.cityGrid.forEach((cell, index) => {
        if (cell && cell.type === 'feature' && cell.featureId === featureId) {
            featureCellsFound++;
            // Get all adjacent cells for this feature cell
            const neighbors = getAdjacentCells(index);
            neighbors.forEach(neighborIndex => {
                // Only add if the cell is empty (not a feature, not a building)
                const neighborCell = gameState.cityGrid[neighborIndex];
                if (!neighborCell || (neighborCell.type === 'feature' && neighborCell.buildable)) {
                    adjacentCells.add(neighborIndex);
                }
            });
        }
    });

    console.log(`🔍 Found ${featureCellsFound} cells with feature '${featureId}', ${adjacentCells.size} adjacent cells available`);
    return Array.from(adjacentCells);
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
        console.log(`📐 Grid size mismatch in renderCityGrid: ${gameState.cityGrid.length} → ${gridSize.total}`);

        // Detect which features are currently placed (before clearing grid)
        const placedFeatures = new Set();
        gameState.gridFeatures.forEach(item => {
            if (!placedFeatures.has(item.featureId)) {
                placedFeatures.add(item.featureId);
            }
        });

        // Create new grid
        gameState.cityGrid = Array(gridSize.total).fill(null);
        gameState.gridFeatures = []; // Clear feature tracking

        // Re-place all permanent features with new patterns for new grid size
        placedFeatures.forEach(featureId => {
            let pattern = [];

            if (featureId === 'river') {
                pattern = generateRiverPattern();
            } else if (featureId === 'city_hall') {
                const gridSize = getGridSize();
                if (gridSize.total === 60) {
                    pattern = [25];
                } else if (gridSize.total === 32) {
                    pattern = [13];
                } else {
                    pattern = [9];
                }
            } else if (featureId === 'existing_neighborhood') {
                const gridSize = getGridSize();
                if (gridSize.total === 60) {
                    pattern = [14, 15, 24];
                } else if (gridSize.total === 32) {
                    pattern = [12, 20];
                } else {
                    pattern = [8, 14];
                }
            } else if (featureId === 'mountain') {
                pattern = generateMountainPattern();
            } else if (featureId === 'protected_forest') {
                pattern = generateForestPattern();
            } else if (featureId === 'highway') {
                pattern = generateHighwayPattern();
            } else if (featureId === 'polluted_river') {
                pattern = generateRiverPattern();
            } else if (featureId === 'flooded_area') {
                pattern = generateRiverPattern();
            }

            if (pattern.length > 0) {
                const feature = gridFeatures[featureId];
                if (feature) {
                    pattern.forEach(cellIndex => {
                        if (cellIndex >= 0 && cellIndex < gameState.cityGrid.length) {
                            gameState.cityGrid[cellIndex] = {
                                type: 'feature',
                                featureId: featureId,
                                icon: feature.icon,
                                name: feature.name,
                                buildable: feature.buildable,
                                isBuilding: feature.isBuilding || false
                            };
                            gameState.gridFeatures.push({
                                featureId: featureId,
                                cellIndex: cellIndex
                            });
                        }
                    });
                }
            }
        });
    }

    // Create cells based on current screen size
    for (let i = 0; i < gridSize.total; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-cell-index', i);

        // If cell is occupied (building or feature), render it
        if (gameState.cityGrid[i]) {
            const cellData = gameState.cityGrid[i];

            // Handle FEATURES (river, mountains, etc.)
            if (cellData.type === 'feature') {
                const feature = gridFeatures[cellData.featureId];
                cell.classList.add('feature-cell');
                cell.setAttribute('data-feature-id', cellData.featureId);

                // Add feature-specific class for styling
                if (cellData.featureId) {
                    cell.classList.add(`feature-${cellData.featureId.replace('_', '-')}`);
                }

                const icon = document.createElement('span');
                icon.className = 'grid-cell-icon feature-icon';
                icon.textContent = cellData.icon;
                cell.classList.add('has-feature');
                cell.appendChild(icon);

                // Add tooltip for features
                cell.addEventListener('mouseenter', (e) => showFeatureTooltip(e, feature));
                cell.addEventListener('mouseleave', hideBuildingTooltip);

                // If feature is buildable, allow drops
                if (cellData.buildable) {
                    cell.addEventListener('dragover', handleGridDragOver);
                    cell.addEventListener('dragleave', handleGridDragLeave);
                    cell.addEventListener('drop', handleGridDrop);
                }
                // If feature acts like a building (existing_neighborhood), make it interactable
                else if (cellData.isBuilding) {
                    cell.classList.add('occupied');
                    cell.addEventListener('click', (e) => {
                        showToast('🏘️ This is an existing neighborhood from the previous mayor', 'info');
                    });
                }
            }
            // Handle BUILDINGS (house, shop, factory, etc.)
            else {
                const building = cellData;
                cell.classList.add('occupied');

                // Add newly-placed highlight (lasts 3 seconds)
                if (building.placedAt && (now - building.placedAt) < 3000) {
                    cell.classList.add('newly-placed');
                }

                const icon = document.createElement('span');
                icon.className = 'grid-cell-icon building-icon';
                icon.textContent = building.icon;

                // Add pop animation for very recently placed buildings (<500ms)
                if (building.placedAt && (now - building.placedAt) < 500) {
                    icon.classList.add('building-pop');
                }

                cell.classList.add('has-building');
                cell.appendChild(icon);

                // Add click handler for action menu
                cell.addEventListener('click', (e) => openActionMenu(i));

                // Add hover tooltip
                cell.addEventListener('mouseenter', (e) => showBuildingTooltip(e, building, i));
                cell.addEventListener('mouseleave', hideBuildingTooltip);

                // Make buildings draggable for relocation (but NOT permanent features like City Hall)
                const isPermanentFeature = building.type === 'feature' && building.featureId &&
                    (building.featureId === 'city_hall' ||
                        building.featureId === 'river' ||
                        building.featureId === 'polluted_river' ||
                        building.featureId === 'mountain' ||
                        building.featureId === 'highway' ||
                        building.featureId === 'protected_forest' ||
                        building.featureId === 'flooded_area');

                if (!isPermanentFeature) {
                    // Only make buildings draggable, not permanent features
                    cell.setAttribute('draggable', 'true');
                    cell.addEventListener('dragstart', (e) => handleOccupiedDragStart(e, i));
                    cell.addEventListener('dragend', handleOccupiedDragEnd);
                } else {
                    // Permanent features are not draggable
                    cell.setAttribute('draggable', 'false');
                    cell.style.cursor = 'default';
                }
            }

        } else {
            // Visual indicator for placement constraints (for mandatory building only)
            if (gameState.placementConstraints) {
                const isAllowed = gameState.placementConstraints.allowedCells.includes(i);
                if (!isAllowed) {
                    cell.classList.add('locked-cell');
                    cell.setAttribute('title', 'Factory must be placed adjacent to river (other buildings can go anywhere)');
                } else {
                    cell.classList.add('allowed-cell');
                }
            }

            // All empty cells are droppable (constraints checked during drop)
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
    // Only apply constraint if this is the mandatory building
    const isConstrained = gameState.placementConstraints &&
        gameState.awaitingPlacement &&
        gameState.pendingBuildingPlacement &&
        currentDraggedBuilding &&
        currentDraggedBuilding.id === gameState.pendingBuildingPlacement.building.id &&
        !gameState.placementConstraints.allowedCells.includes(cellIndex);

    if (isOccupied || !canAfford || isConstrained) {
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

    // Check if timer is running (allow placement during mandatory placement mode)
    if (!gameState.isTimerRunning && !gameState.awaitingPlacement) {
        showToast('⏸️ Cannot build when there is no active decision!', 'warning');
        triggerHaptic('warning');
        return;
    }

    // Check placement constraints (only for mandatory building)
    if (gameState.placementConstraints &&
        gameState.awaitingPlacement &&
        gameState.pendingBuildingPlacement &&
        currentDraggedBuilding &&
        currentDraggedBuilding.id === gameState.pendingBuildingPlacement.building.id) {
        if (!gameState.placementConstraints.allowedCells.includes(cellIndex)) {
            showToast('❌ Cannot place here! Must be adjacent to the river.', 'error');
            triggerHaptic('error');
            return;
        }
    }

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
        gameState.achievementTracking.usedNoRelocations = false; // Track for achievement

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

                // Play zone formed sound
                if (typeof audioManager !== 'undefined') {
                    audioManager.playZoneFormed();
                }

                // Show confetti for zone formation
                showConfetti(window.innerWidth / 2, window.innerHeight / 3, 40);

                // Have advisor react to zone formation
                narrativeManager.reactToZone(zone.name);
            });
            applyZoneBonuses();
            updateStats();
        }

        // Check if this was a mandatory placement
        if (gameState.awaitingPlacement && gameState.pendingBuildingPlacement) {
            // Compare by ID string to avoid reference issues
            const pendingId = gameState.pendingBuildingPlacement.building?.id;
            const placedId = building.id;

            if (pendingId === placedId) {
                showToast('✅ Mandatory building placed! Story continues...', 'success');
                setTimeout(() => completeMandatoryPlacement(), 1500);
            } else {
                console.warn(`⚠️ Placed ${placedId} but pending was ${pendingId}`);
                // Still complete if we're in mandatory mode and placed ANY building
                showToast('✅ Building placed! Story continues...', 'success');
                setTimeout(() => completeMandatoryPlacement(), 1500);
            }
        }
    }

    // Clean up drag states and adjacency highlights
    document.querySelectorAll('.grid-cell').forEach(c => {
        c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
    });
}

console.log('📦 grid-system.js loaded');
