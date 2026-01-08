// ==================== TOUCH SUPPORT FOR MOBILE ====================
// Mobile touch support for drag/drop

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

    const touch = e.touches[0];
    const moveDistance = Math.abs(touch.clientX - touchDragData.startX) +
        Math.abs(touch.clientY - touchDragData.startY);

    // Only prevent scrolling once significant movement detected (dragging started)
    if (moveDistance > 10 || touchDragData.isDragging) {
        e.preventDefault(); // Prevent scrolling while dragging
    } else {
        return; // Allow normal scrolling for small movements
    }

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
            // Only apply constraint if this is the mandatory building
            const isConstrained = gameState.placementConstraints &&
                gameState.awaitingPlacement &&
                gameState.pendingBuildingPlacement &&
                touchDragData.building.id === gameState.pendingBuildingPlacement.building.id &&
                !gameState.placementConstraints.allowedCells.includes(cellIndex);

            if (canAfford && !isConstrained) {
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

            // Check if timer is running (allow placement during mandatory placement mode)
            if (!gameState.isTimerRunning && !gameState.awaitingPlacement) {
                showToast('⏸️ Cannot build when there is no active decision!', 'warning');
                triggerHaptic('warning');
                // Clear touch data
                touchDragData = null;
                document.querySelectorAll('.grid-cell').forEach(c => {
                    c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
                });
                return;
            }

            // Check placement constraints (only for mandatory building)
            if (gameState.placementConstraints &&
                gameState.awaitingPlacement &&
                gameState.pendingBuildingPlacement &&
                building.id === gameState.pendingBuildingPlacement.building.id) {
                if (!gameState.placementConstraints.allowedCells.includes(cellIndex)) {
                    showToast('❌ Cannot place here! Must be adjacent to the river.', 'error');
                    triggerHaptic('error');
                    // Clear touch data
                    touchDragData = null;
                    document.querySelectorAll('.grid-cell').forEach(c => {
                        c.classList.remove('drag-over', 'invalid-drop', 'adjacent-good', 'adjacent-bad');
                    });
                    return;
                }
            }

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

                // Check mandatory placement
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
                        // This handles edge cases where IDs might not match exactly
                        showToast('✅ Building placed! Story continues...', 'success');
                        setTimeout(() => completeMandatoryPlacement(), 1500);
                    }
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

console.log('📦 touch-handler.js loaded');
