// ==================== GAME.JS - CORE GAME LOGIC ====================
// This file contains the unique game logic not found in other modules.
//
// MODULE DEPENDENCIES (loaded before this file):
// - game-config.js: isMobileDevice, getGridSize, getCurrentChapter,
//                   difficultyModes, gameState, buildingTypes, gridFeatures,
//                   buildingPalette, adjacencyRules, achievementDefinitions
// - ui-effects.js: triggerHaptic, createParticles, initializeTooltips,
//                  showToast, repositionToasts, showCelebration, showConfetti,
//                  showFloatingNumber, updateWeather, activeToasts, lastInteractionPosition
// - grid-system.js: placeGridFeature, replaceGridFeature, generateRiverPattern,
//                   generateMountainPattern, generateHighwayPattern, generateForestPattern,
//                   placeInitialCityHall, placeInitialNeighborhood, placeInitialRiver,
//                   getCellsAdjacentToFeature, renderCityGrid, handleGridDragOver,
//                   handleGridDragLeave, handleGridDrop
// - building-system.js: addBuilding, renderBuildingPalette, updateBuildingPalette,
//                       handleBuildingDragStart, handleBuildingDragEnd, placeBuilding,
//                       removeBuilding, getAdjacentCells, calculateAdjacency,
//                       applyAdjacencyEffects, previewAdjacency, getAdjacencyHighlights,
//                       applyBuildingEffects, openActionMenu, closeActionMenu, sellBuilding,
//                       reverseBuildingEffects, reverseAdjacencyEffects, showBuildingTooltip,
//                       showFeatureTooltip, hideBuildingTooltip, undoLastPlacement,
//                       updateUndoButton, showUnlockNotification, showMandatoryPlacementOverlay,
//                       hideMandatoryPlacementOverlay, completeMandatoryPlacement,
//                       handleOccupiedDragStart, handleOccupiedDragEnd, detectZones,
//                       calculateEfficiency, applyZoneBonuses, updateEfficiencyDisplay,
//                       currentDraggedBuilding, selectedCellIndex, draggedBuildingIndex
// - touch-handler.js: initializeTouchSupport, handleTouchStart, handleTouchMove,
//                     handleTouchEnd, handleGridTouchStart, handleGridTouchMove,
//                     handleGridTouchEnd, touchDragData
// - tutorial-system.js: checkFirstTime, startTutorial, showTutorialStep,
//                       nextTutorialStep, skipTutorial, completeTutorial, currentTutorialStep
// - narrative-manager.js: narrativeManager (NarrativeManager instance)
// - audio-manager.js: audioManager (AudioManager instance)
// - api-client.js: gameAPI (GameAPI instance)
// - start-screen.js: Start screen and difficulty selection

// ==================== STORY-CONNECTED ACHIEVEMENTS ====================
// NOTE: achievementDefinitions is now defined in game-config.js

// Check and award achievements (story-connected version)
// isGameEnd: true when called at game completion, false during gameplay
function checkAchievements(isGameEnd = false) {
    const newAchievements = [];

    // ==================== IMMEDIATE ACHIEVEMENTS ====================
    // These can be earned during gameplay based on specific actions

    // Riverside Industrial: Built factory near river (tracked in adjacency calculation)
    if (gameState.achievementTracking.builtNearRiver &&
        !gameState.achievements.includes('riverside_industrial')) {
        newAchievements.push(achievementDefinitions.riverside_industrial);
    }

    // Green Guardian: Rejected factory and built 4+ parks
    const parkCount = gameState.cityGrid.filter(c => c && c.type === 'park').length;
    if (gameState.achievementTracking.rejectedFactory && parkCount >= 4 &&
        !gameState.achievements.includes('green_guardian')) {
        newAchievements.push(achievementDefinitions.green_guardian);
    }

    // ==================== END-GAME ONLY ACHIEVEMENTS ====================
    // These should only be checked at game completion
    if (isGameEnd) {
        // STAT ACHIEVEMENTS - Only valid at game end since stats can change
        // Balanced Leader: All stats within 15 points
        const stats = [gameState.happiness, gameState.cityFunds, gameState.specialInterest];
        const maxStat = Math.max(...stats);
        const minStat = Math.min(...stats);
        if ((maxStat - minStat) <= 15 &&
            !gameState.achievements.includes('balanced_leader')) {
            newAchievements.push(achievementDefinitions.balanced_leader);
        }

        // People's Champion: Happiness > 80
        if (gameState.happiness > 80 && !gameState.achievements.includes('peoples_champion')) {
            newAchievements.push(achievementDefinitions.peoples_champion);
        }

        // Economic Powerhouse: Funds > 80
        if (gameState.cityFunds > 80 && !gameState.achievements.includes('economic_powerhouse')) {
            newAchievements.push(achievementDefinitions.economic_powerhouse);
        }

        // Master Diplomat: Interest > 80
        if (gameState.specialInterest > 80 && !gameState.achievements.includes('master_diplomat')) {
            newAchievements.push(achievementDefinitions.master_diplomat);
        }

        // GAMEPLAY ACHIEVEMENTS - Only valid at game end
        // Master Planner: Efficiency > 85%
        if (gameState.planningEfficiency > 85 && !gameState.achievements.includes('master_planner')) {
            newAchievements.push(achievementDefinitions.master_planner);
        }

        // Swift Decisor: Never let timer expire (must complete entire game without timeout)
        if (gameState.achievementTracking.neverTimedOut &&
            !gameState.achievements.includes('swift_decisor')) {
            newAchievements.push(achievementDefinitions.swift_decisor);
        }

        // No Regrets: No undo or relocation used (must complete entire game)
        if (gameState.achievementTracking.usedNoUndos &&
            gameState.achievementTracking.usedNoRelocations &&
            !gameState.achievements.includes('no_regrets')) {
            newAchievements.push(achievementDefinitions.no_regrets);
        }

        // ULTIMATE ACHIEVEMENT
        // Perfect Mayor: All stats > 75, efficiency > 80, never timed out
        if (gameState.happiness > 75 &&
            gameState.cityFunds > 75 &&
            gameState.specialInterest > 75 &&
            gameState.planningEfficiency > 80 &&
            gameState.achievementTracking.neverTimedOut &&
            !gameState.achievements.includes('perfect_mayor')) {
            newAchievements.push(achievementDefinitions.perfect_mayor);
        }
    }

    // Award new achievements
    newAchievements.forEach(achievement => {
        gameState.achievements.push(achievement.id);
        showToast(`🏆 Achievement: ${achievement.name}!`, 'success');
        console.log(`🏆 Achievement unlocked: ${achievement.name} - ${achievement.description}`);

        // Play achievement sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playAchievement();
        }

        // Show confetti for achievement
        showConfetti(window.innerWidth / 2, window.innerHeight / 4, 50);

        // Have advisor react to achievement
        narrativeManager.reactToAchievement(achievement.name);
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
// NOTE: Difficulty selection is now handled in start-screen.js
// This function is no longer used but kept for reference
/*
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
*/

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
    const duration = gameState.difficulty ? gameState.difficulty.timerPerScene : 60;
    console.log('🔍 getTimerDuration - gameState.difficulty:', gameState.difficulty);
    console.log('🔍 getTimerDuration - returning:', duration);
    return duration;
}

function startTimer() {
    stopTimer();

    // Get consistent timer duration from difficulty (always the same)
    const baseDuration = getTimerDuration();
    console.log('⏰ startTimer - baseDuration:', baseDuration);
    gameState.timerSeconds = baseDuration;
    gameState.currentDecisionTime = baseDuration; // Track starting time

    // Time bank no longer affects timer duration - only used for scoring
    // This makes timer consistent for every choice
    if (gameState.timeBankSeconds !== 0) {
        console.log(`💰 Time Bank: ${gameState.timeBankSeconds > 0 ? '+' : ''}${gameState.timeBankSeconds}s (saved for bonus scoring)`);
    }

    gameState.isTimerRunning = true;
    gameState.timerExpired = false; // Reset expired flag for new timer

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

            // Play critical timer sound
            if (typeof audioManager !== 'undefined') {
                audioManager.playTimerCritical();
            }
        }
    } else if (gameState.timerSeconds <= dangerThreshold) {
        // Danger: Last 20% - RED + URGENT
        timerContainer.classList.add('danger');
        if (barFill) barFill.classList.add('danger');

        // Audio hook for danger state (play once)
        if (Math.ceil(dangerThreshold) === gameState.timerSeconds) {
            timerContainer.setAttribute('data-sound-trigger', 'danger');
            console.log('🔊 Audio Hook: Danger warning!');

            // Play danger timer sound
            if (typeof audioManager !== 'undefined') {
                audioManager.playTimerDanger();
            }
        }
    } else if (gameState.timerSeconds <= warningThreshold) {
        // Warning: Last 50% - YELLOW
        timerContainer.classList.add('warning');
        if (barFill) barFill.classList.add('warning');

        // Audio hook for warning state (play once)
        if (Math.ceil(warningThreshold) === gameState.timerSeconds) {
            timerContainer.setAttribute('data-sound-trigger', 'warning');
            console.log('🔊 Audio Hook: Warning state');

            // Play warning timer sound
            if (typeof audioManager !== 'undefined') {
                audioManager.playTimerWarning();
            }
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
    gameState.timerExpired = true; // Mark that timer ran out
    gameState.achievementTracking.neverTimedOut = false; // Track for achievement

    // Play timeout sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playTimeOut();
    }

    console.log('⏰ TIME\'S UP! Failed to make a decision - applying penalties');

    const currentSceneKey = getCurrentSceneKey();
    if (currentSceneKey && gameData[currentSceneKey]) {
        const scene = gameData[currentSceneKey];
        if (scene.choices && scene.choices.length > 0) {
            // Apply penalties for indecision
            const penaltyEffects = {
                happiness: -10,      // Citizens unhappy with indecisive mayor
                cityFunds: -5,       // Wasted resources due to delay
                specialInterest: -8, // Lost trust from stakeholders
                personalProfit: 0
            };

            // Track the failed decision
            gameState.decisions.push({
                scene: currentSceneKey,
                choice: 'TIMED OUT - No Decision Made',
                timeSpent: gameState.currentDecisionTime
            });

            // Apply penalty effects
            applyEffects(penaltyEffects);

            // Apply time bank penalty (lose 10 seconds from next decision)
            gameState.timeBankSeconds -= 10;

            // Show consequence message
            showConsequence(
                penaltyEffects,
                '❌ You failed to make a decision in time! The city suffered from your indecision. Citizens are frustrated by the lack of leadership.',
                0,  // No time bonus
                -10 // Time bank penalty
            );

            // Move to next scene (use first choice's path as default)
            const nextScene = scene.choices[0].next;

            // Handle any building unlocks from the default path
            const defaultChoice = scene.choices[0];
            if (defaultChoice.unlocks && defaultChoice.unlocks.length > 0) {
                const newUnlocks = defaultChoice.unlocks.filter(b => !gameState.unlockedBuildings.includes(b));
                newUnlocks.forEach(buildingId => {
                    gameState.unlockedBuildings.push(buildingId);
                    const building = buildingPalette.find(b => b.id === buildingId);
                    if (building) {
                        showUnlockNotification(building);
                        console.log(`🔓 Unlocked building: ${building.name} (default path)`);
                    }
                });
                renderBuildingPalette();
            }

            // Continue to next scene after delay (gives player time to read consequences)
            setTimeout(() => {
                renderScene(nextScene);
            }, 4500);
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
    gameState.currentScene = key; // Keep game state in sync for auto-save
}

// ==================== GAME DATA ====================
const gameData = {
    intro: {
        title: "Welcome to Tiger Central",
        story: `<p>Congratulations! You've just won the election to become the mayor of Tiger Central, a city with a population of 300,000.</p><p>The previous mayor was corrupt—embezzling money, stealing from residents, and ultimately disappearing without a trace, leaving Tiger Central in shambles.</p><p>The city needs strong leadership to rebuild. Every decision you make will have consequences that affect different groups of people. There are no perfect solutions—only choices and their outcomes.</p><p>Can you restore Tiger Central to its former glory while keeping everyone happy?</p>`,
        choices: [{ text: "🎮 Start Your Mayoral Journey", icon: "🚀", next: 'choice1' }]
    },
    choice1: {
        chapter: "Chapter 1: Economic Opportunity",
        title: "A Factory Proposal",
        story: `<p>A large manufacturing company, TigerTech Industries, has approached the city with an interesting proposition.</p><p>They want to build a factory in Tiger Central, promising to bring 500 jobs to the community and offering $10 million to the city as an incentive.</p><p>The factory would be located near the river that flows through our city, giving them access to water for manufacturing. However, factories can bring pollution, traffic, and other concerns. What do you decide?</p>`,
        choices: [
            {
                text: "Accept the factory deal",
                icon: "✅",
                effects: { happiness: 10, cityFunds: 20, specialInterest: 15, personalProfit: 5 },
                next: 'choice2A',
                consequence: "TigerTech Industries is excited to begin construction near the river. Citizens are hopeful about new job opportunities.",
                unlocks: ['factory', 'house'] // Unlock factory and house buildings
            },
            {
                text: "Reject the factory",
                icon: "❌",
                effects: { happiness: -10, cityFunds: -10, specialInterest: -15, personalProfit: 0 },
                next: 'choice2B',
                consequence: "TigerTech Industries is disappointed. Unemployment remains high, and residents are worried about job prospects. Environmental groups propose protecting the riverside forest instead.",
                unlocks: ['park', 'house'], // Unlock environmentally-friendly options
                placeFeature: 'protected_forest', // Place protected forest
                achievementTag: 'reject_factory'
            }
        ]
    },
    choice2A: {
        chapter: "Chapter 1: Location Matters",
        title: "Factory Construction Begins",
        story: `<p>Now that you've approved the factory, TigerTech needs to place it on your city grid.</p><p>Look at the 🌊 river flowing through your city - the factory <strong>must be placed adjacent to the river</strong> for water access.</p><p><strong>Note:</strong> Only cells next to the river will be available for placement. Choose wisely!</p>`,
        choices: [
            {
                text: "Approve riverside construction",
                icon: "🏭",
                effects: { happiness: -5, cityFunds: 5, specialInterest: 10, personalProfit: 3 },
                next: 'choice3A1',
                consequence: "The factory is operational by the river. It has excellent water access for manufacturing.",
                unlocks: ['park', 'shop'], // Environmental concerns unlock parks, industrial area needs shops
                building: 'factory', // This will trigger mandatory placement
                placementConstraints: { adjacentToFeature: 'river' } // Lock to river-adjacent cells only
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
            {
                text: "Tax TigerTech Industries",
                icon: "🏭",
                effects: { happiness: 15, cityFunds: 10, specialInterest: -10, personalProfit: 0 },
                next: 'choice4A11',
                consequence: "Citizens appreciate you holding the company accountable. The company agrees to install water treatment systems.",
                unlocks: ['office'] // Corporate accountability attracts responsible businesses
            },
            {
                text: "Raise water bills for citizens",
                icon: "💧",
                effects: { happiness: -20, cityFunds: 15, specialInterest: 10, personalProfit: 5 },
                next: 'choice4A12',
                consequence: "Citizens are outraged that they're paying for corporate pollution. The river becomes visibly polluted.",
                replaceFeature: { oldFeature: 'river', newFeature: 'polluted_river' } // River becomes polluted!
            }
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
            { text: "Fund job-training programs", icon: "📚", effects: { happiness: 15, cityFunds: -15, specialInterest: -5, personalProfit: 0 }, next: 'choice4B12', consequence: "Training programs begin. Unemployed citizens are learning new skills.", building: 'office', unlocks: ['office'] }
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
            { text: "Implement labor protection laws", icon: "⚖️", effects: { happiness: 15, cityFunds: 0, specialInterest: -15, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Workers are protected, but TigerTech considers leaving Tiger Central." },
            { text: "Let the company cut wages", icon: "📉", effects: { happiness: -15, cityFunds: 0, specialInterest: 10, personalProfit: 3 }, next: 'chapter1_ending', consequence: "Workers face pay cuts. Families struggle." }
        ]
    },
    choice4A12: {
        chapter: "Chapter 1: Public Protest",
        title: "Citizens Revolt",
        story: `<p>Protests have erupted throughout Tiger Central!</p><p>Citizens are furious that they're paying for water treatment while the polluting company faces no consequences.</p>`,
        choices: [
            { text: "Meet with protest leaders", icon: "🤝", effects: { happiness: 10, cityFunds: -5, specialInterest: -10, personalProfit: 0 }, next: 'chapter1_ending', consequence: "You listen to citizens' concerns and promise reform. Trust begins to rebuild." },
            { text: "Send in police", icon: "🚔", effects: { happiness: -25, cityFunds: -5, specialInterest: 5, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Protests are dispersed by force. Resentment grows." }
        ]
    },
    choice4A21: {
        chapter: "Chapter 1: Budget Crisis",
        title: "Financial Strain",
        story: `<p>Compensating residents has created a budget shortfall. You need to balance the budget somehow.</p>`,
        choices: [
            { text: "Raise local taxes", icon: "📊", effects: { happiness: -15, cityFunds: 15, specialInterest: -5, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Tax increases anger citizens, but the budget is stabilized." },
            { text: "Cut education and parks funding", icon: "✂️", effects: { happiness: -20, cityFunds: 15, specialInterest: 5, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Schools and parks suffer. Families with children are upset." }
        ]
    },
    choice4A22: {
        chapter: "Chapter 1: Construction Delays",
        title: "Housing Crisis",
        story: `<p>The new homes for relocated residents are behind schedule. The contractor is having trouble finding materials and costs are rising.</p>`,
        choices: [
            { text: "Rush with cheaper materials", icon: "⏰", effects: { happiness: -10, cityFunds: 5, specialInterest: 5, personalProfit: 3 }, next: 'chapter1_ending', consequence: "Homes are completed quickly but quality is poor." },
            { text: "Spend extra for quality", icon: "💎", effects: { happiness: 15, cityFunds: -20, specialInterest: -5, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Beautiful, safe homes are built. The budget takes a hit.", building: 'house' }
        ]
    },
    choice4A23: {
        chapter: "Chapter 1: Corporate Overreach",
        title: "Illegal Expansion",
        story: `<p>TigerTech has taken advantage of your inaction! They've been illegally expanding their operations onto protected land.</p>`,
        choices: [
            { text: "Continue ignoring it", icon: "🙈", effects: { happiness: -30, cityFunds: 0, specialInterest: 20, personalProfit: 15 }, next: 'chapter1_ending', consequence: "Your inaction becomes a scandal. Citizens have lost all faith." },
            { text: "Fine the company", icon: "⚡", effects: { happiness: 20, cityFunds: 10, specialInterest: -20, personalProfit: 0 }, next: 'chapter1_ending', consequence: "You finally take a stand. Citizens applaud!", building: 'park' }
        ]
    },
    choice4B11: {
        chapter: "Chapter 1: Surveillance State",
        title: "Privacy Concerns",
        story: `<p>Crime has dropped thanks to increased surveillance, but citizens are uneasy. People feel like they're always being watched.</p>`,
        choices: [
            { text: "Scale back surveillance", icon: "🔙", effects: { happiness: 10, cityFunds: 5, specialInterest: -10, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Citizens breathe easier with less monitoring." },
            { text: "Double down", icon: "🔒", effects: { happiness: -20, cityFunds: -10, specialInterest: 15, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Tiger Central becomes a surveillance state." }
        ]
    },
    choice4B12: {
        chapter: "Chapter 1: Employment Challenge",
        title: "Hiring Hesitation",
        story: `<p>The job-training programs are producing qualified workers, but local businesses are hesitant to hire trainees.</p>`,
        choices: [
            { text: "Place hiring quotas", icon: "📋", effects: { happiness: 5, cityFunds: 0, specialInterest: -15, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Businesses must hire trainees. Some comply grudgingly." },
            { text: "Offer tax breaks", icon: "💸", effects: { happiness: 10, cityFunds: -10, specialInterest: 10, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Tax incentives work! Employment rises.", building: 'shop' }
        ]
    },
    choice4B21: {
        chapter: "Chapter 1: Productivity Crisis",
        title: "Slowing Progress",
        story: `<p>The new safety regulations are protecting workers, but productivity has dropped. Projects are behind schedule.</p>`,
        choices: [
            { text: "Fire underperforming employees", icon: "❌", effects: { happiness: -15, cityFunds: 5, specialInterest: 10, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Projects speed up, but workers live in fear." },
            { text: "Extend deadlines", icon: "⏱️", effects: { happiness: 10, cityFunds: -5, specialInterest: -10, personalProfit: 0 }, next: 'chapter1_ending', consequence: "Quality and safety improve. Citizens appreciate patience." }
        ]
    },
    choice4B22: {
        chapter: "Chapter 1: Legal Trouble",
        title: "Lawsuits Mounting",
        story: `<p>Injury reports are piling up, and now the lawsuits are coming. Injured workers are demanding compensation.</p>`,
        choices: [
            { text: "Pay employees to keep quiet", icon: "💰", effects: { happiness: -20, cityFunds: -15, specialInterest: 10, personalProfit: -5 }, next: 'chapter1_ending', consequence: "Hush money works temporarily, but rumors spread." },
            { text: "Let them bring cases to court", icon: "⚖️", effects: { happiness: 5, cityFunds: -20, specialInterest: -15, personalProfit: 0 }, next: 'chapter1_ending', consequence: "The truth comes out. You take responsibility and promise reform." }
        ]
    },
    chapter1_ending: {
        title: "Chapter 1 Complete",
        story: `<p>Your first year as mayor of Tiger Central has come to an end. Let's see how you did...</p>`
    },

    // ==================== CHAPTER 2: THE GREAT STORM ====================
    chapter2_intro: {
        chapter: "Chapter 2: The Great Storm",
        title: "Storm Warning",
        story: `<p>🌪️ <strong>SIX MONTHS LATER...</strong></p>
                <p>Your leadership during the first year has been tested, but Tiger Central has survived. Now you face a new crisis.</p>
                <p>A massive storm is barreling toward the city. Meteorologists are divided—some warn it could be the worst storm in 100 years, while experienced forecasters argue it will weaken before landfall.</p>
                <p>The storm is 24 hours away. Do you evacuate the entire city at massive cost, or trust the optimistic forecasts and stay put?</p>`,
        choices: [
            {
                text: "Issue mandatory evacuation",
                icon: "🚨",
                effects: { happiness: 5, cityFunds: -15, specialInterest: 5, personalProfit: 0 },
                next: 'ch2_evacuated_flood',
                consequence: "Citizens evacuate to shelters. Emergency crews stand ready. You must now set up emergency shelters across the city.",
                unlocks: ['shelter', 'hospital'],
                building: 'shelter', // Mandatory: Place emergency shelter
                timeBank: 5
            },
            {
                text: "Downplay threat and stay",
                icon: "🏠",
                effects: { happiness: -10, cityFunds: 5, specialInterest: -5, personalProfit: 3 },
                next: 'ch2_stayed_flood',
                consequence: "Citizens remain in their homes. Business continues. You've saved evacuation costs, but taken a significant risk.",
                unlocks: [],
                timeBank: -5
            }
        ]
    },

    // EVACUATION PATH
    ch2_evacuated_flood: {
        chapter: "Chapter 2: The Morning After",
        title: "False Alarm & Flood",
        story: `<p>🌅 The storm curved around Tiger Central just in time! You breathe a sigh of relief.</p>
                <p>But there's a new problem: Heavy rainfall north of the city caused the river to overflow. Riverside neighborhoods are flooding.</p>
                <p>Some citizens are angry about the "false alarm" evacuation, while flood victims desperately need help. Where do you focus your energy?</p>`,
        choices: [
            {
                text: "Focus on flood recovery",
                icon: "🚤",
                effects: { happiness: 10, cityFunds: -15, specialInterest: -5, personalProfit: 0 },
                next: 'ch2_recovery_budget',
                consequence: "Emergency crews help flood victims. You must deploy rescue operations and relocate displaced families to temporary housing.",
                unlocks: ['police', 'hospital'],
                building: 'house', // Mandatory: Build temporary housing for displaced families
                placeFeature: 'flooded_area', // Flood zones appear on the map near river
                timeBank: 5
            },
            {
                text: "Calm angry citizens (PR)",
                icon: "📢",
                effects: { happiness: 5, cityFunds: -5, specialInterest: 10, personalProfit: 5 },
                next: 'ch2_pr_victims_waiting',
                consequence: "You launch a PR campaign. Town halls held. But flood zones are still visible on the map...",
                unlocks: ['event_venue'], // Unlock event venue for PR events
                building: 'event_venue', // Mandatory: Build venue for town halls
                placeFeature: 'flooded_area', // Flood still happens
                timeBank: -5
            }
        ]
    },

    // STAYED PUT PATH
    ch2_stayed_flood: {
        chapter: "Chapter 2: Lucky Dodge",
        title: "Storm Misses, Flood Hits",
        story: `<p>🍀 The storm curved away! You look lucky to those who doubted the forecasters.</p>
                <p>However, heavy rainfall north of the city caused the river to overflow. Riverside flooding is happening now.</p>
                <p>Do you deploy emergency crews immediately, or wait for the water to recede naturally to save money?</p>`,
        choices: [
            {
                text: "Deploy emergency crews now",
                icon: "🚒",
                effects: { happiness: 10, cityFunds: -10, specialInterest: 5, personalProfit: 0 },
                next: 'ch2_active_response',
                consequence: "Fire trucks and rescue boats deploy! You must set up emergency response infrastructure.",
                unlocks: ['police', 'hospital', 'shelter'],
                building: 'police', // Mandatory: Place police station for emergency coordination
                placeFeature: 'flooded_area', // Flood zones appear
                timeBank: 10
            },
            {
                text: "Wait for water to recede",
                icon: "⏳",
                effects: { happiness: -15, cityFunds: 5, specialInterest: 10, personalProfit: 8 },
                next: 'ch2_neglect_worsens',
                consequence: "Water continues rising. Flood zones spread across the city. Property damage worsens dramatically.",
                unlocks: [],
                placeFeature: 'flooded_area', // Even more flooding since you waited
                replaceFeature: { oldFeature: 'river', newFeature: 'flooded_area' }, // River becomes flood zone
                timeBank: -10
            }
        ]
    },

    // RECOVERY BUDGET PATH (evacuated → recovery)
    ch2_recovery_budget: {
        chapter: "Chapter 2: Budget Crisis",
        title: "Running Out of Money",
        story: `<p>💸 Recovery efforts are underway, but the budget is severely strained. You've spent heavily on evacuation AND recovery.</p>
                <p>You need revenue fast. How do you raise funds?</p>`,
        choices: [
            {
                text: "Emergency taxes on wealthy",
                icon: "💰",
                effects: { happiness: -10, cityFunds: 15, specialInterest: -10, personalProfit: 0 },
                next: 'ch2_donor_pressure',
                consequence: "Emergency tax passes. But wealthy donors demand something in return...",
                unlocks: ['skyscraper'], // Wealthy demand luxury development
                timeBank: 5
            },
            {
                text: "Request federal aid",
                icon: "🏛️",
                effects: { happiness: 5, cityFunds: 10, specialInterest: 5, personalProfit: 3 },
                next: 'ch2_federal_oversight',
                consequence: "Federal aid arrives! You must demonstrate recovery progress with new infrastructure.",
                unlocks: ['hospital', 'school'],
                building: 'hospital', // Mandatory: Federal aid requires visible infrastructure
                timeBank: 0
            }
        ]
    },

    // PR PATH (evacuated → PR instead of recovery)
    ch2_pr_victims_waiting: {
        chapter: "Chapter 2: Media Firestorm",
        title: "Priorities Questioned",
        story: `<p>📺 You focused on PR while flood victims waited. Now the media is covering their suffering.</p>
                <p>Images of families wading through water dominate the news while you hold town halls about evacuation decisions. You're under intense pressure.</p>`,
        choices: [
            {
                text: "Pivot to helping victims now",
                icon: "🔄",
                effects: { happiness: 10, cityFunds: -15, specialInterest: -5, personalProfit: 0 },
                next: 'ch2_late_redemption',
                consequence: "You admit you should have acted sooner. Recovery efforts begin. Families are helped. Trust begins to rebuild, but the budget is decimated.",
                timeBank: 0
            },
            {
                text: "Continue damage control (PR)",
                icon: "🎭",
                effects: { happiness: -20, cityFunds: 5, specialInterest: 15, personalProfit: 10 },
                next: 'ch2_corruption_exposed',
                consequence: "You double down on spin. Flood victims organize protests. Media runs 'Tale of Two Cities' stories. Your approval plummets among working-class voters.",
                timeBank: -10
            }
        ]
    },

    // ACTIVE RESPONSE PATH (stayed → deployed crews)
    ch2_active_response: {
        chapter: "Chapter 2: Recovery Progress",
        title: "Crisis Management",
        story: `<p>🚤 Emergency response was fast and effective. Crews are working around the clock, but the costs are mounting.</p>
                <p>Do you continue funding full recovery until completion, or cut efforts short due to budget concerns?</p>`,
        choices: [
            {
                text: "Continue full recovery",
                icon: "💪",
                effects: { happiness: 10, cityFunds: -15, specialInterest: -10, personalProfit: 0 },
                next: 'ch2_thorough_finish',
                consequence: "Full recovery! You must rebuild affected areas and provide community support.",
                unlocks: ['house', 'park', 'school'],
                building: 'park', // Mandatory: Build park for community healing
                placementConstraints: { nearFeature: 'flooded_area' }, // Must be near flood zone
                timeBank: 10
            },
            {
                text: "Cut recovery short",
                icon: "✂️",
                effects: { happiness: -10, cityFunds: 10, specialInterest: 5, personalProfit: 5 },
                next: 'ch2_incomplete_recovery',
                consequence: "Recovery ends early. Flood zones remain visible. Some families abandoned.",
                unlocks: ['skyscraper'], // Developers buy cheap flooded land
                timeBank: -5
            }
        ]
    },

    // NEGLECT PATH (stayed → waited for water)
    ch2_neglect_worsens: {
        chapter: "Chapter 2: Disaster Unfolds",
        title: "Damage Worsening",
        story: `<p>🌊 Days have passed. Water is receding VERY slowly. Damage has worsened dramatically. Waterborne illnesses are spreading.</p>
                <p>Media coverage is brutal. Families are suffering. You must act now—or don't you?</p>`,
        choices: [
            {
                text: "Deploy crews NOW (late)",
                icon: "🆘",
                effects: { happiness: 5, cityFunds: -10, specialInterest: -5, personalProfit: 0 },
                next: 'ch2_too_little_late',
                consequence: "Crews arrive to scenes of devastation. Recovery begins but damage is worse than it would have been. Families are bitter about the delay.",
                timeBank: 0
            },
            {
                text: "Continue waiting (total neglect)",
                icon: "🙈",
                effects: { happiness: -25, cityFunds: 5, specialInterest: 15, personalProfit: 15 },
                next: 'ch2_recall_petition',
                consequence: "Riverside neighborhoods are abandoned by government. Private companies buy flooded properties for pennies. A class divide deepens. Your name becomes synonymous with neglect.",
                timeBank: -15
            }
        ]
    },

    // FINAL LAYER SCENES (shortened for space - each path gets one more decision before ending)
    ch2_donor_pressure: {
        chapter: "Chapter 2: Political Pressure",
        title: "Donors Demand Cuts",
        story: `<p>Wealthy donors are pressuring you to cut education and parks spending after the emergency taxes. What do you do?</p>`,
        choices: [
            {
                text: "Protect education/parks",
                icon: "🌳",
                effects: { happiness: 15, cityFunds: -5, specialInterest: -15, personalProfit: 0 },
                next: 'ending',
                consequence: "You stand up to donors! You must invest in education and community spaces.",
                building: 'school', // Mandatory: Build school to prove commitment
                unlocks: ['school', 'park']
            },
            {
                text: "Cut education/parks",
                icon: "✂️",
                effects: { happiness: -15, cityFunds: 10, specialInterest: 10, personalProfit: 5 },
                next: 'ending',
                consequence: "Donors get what they want. Luxury development begins...",
                building: 'skyscraper', // Mandatory: Build luxury development for donors
                unlocks: ['skyscraper']
            }
        ]
    },
    ch2_federal_oversight: {
        chapter: "Chapter 2: Federal Contracts",
        title: "Follow the Money",
        story: `<p>Federal aid arrived. How do you handle the contracts for recovery work?</p>`,
        choices: [
            { text: "Transparent competitive bids", icon: "📋", effects: { happiness: 10, cityFunds: 5, specialInterest: -5, personalProfit: 0 }, next: 'ending', consequence: "Clean governance. Quality infrastructure. Citizens trust you!" },
            { text: "Steer to political allies", icon: "🤝", effects: { happiness: -10, cityFunds: -10, specialInterest: 15, personalProfit: 10 }, next: 'ending', consequence: "Corruption rumors spread. Projects are low-quality. Kickbacks received." }
        ]
    },
    ch2_late_redemption: {
        chapter: "Chapter 2: Empty Budget",
        title: "Need Revenue Now",
        story: `<p>Recovery is complete but the budget is empty. You need revenue to keep the city running.</p>`,
        choices: [
            { text: "Progressive tax reform", icon: "📊", effects: { happiness: 10, cityFunds: 10, specialInterest: -15, personalProfit: 0 }, next: 'ending', consequence: "Fair taxation. Working class supports you. Sustainable revenue!" },
            { text: "Regressive fees (parking, permits)", icon: "💵", effects: { happiness: -15, cityFunds: 10, specialInterest: 5, personalProfit: 5 }, next: 'ending', consequence: "Working class hit hardest. Resentment grows. Revenue flows." }
        ]
    },
    ch2_corruption_exposed: {
        chapter: "Chapter 2: Protests Erupt",
        title: "Accountability Demanded",
        story: `<p>Flood victims demand accountability. Protests fill the streets. Your approval is tanking. What now?</p>`,
        choices: [
            { text: "Meet protesters, commit to recovery", icon: "🤝", effects: { happiness: 15, cityFunds: -15, specialInterest: -10, personalProfit: -5 }, next: 'ending', consequence: "You finally listen. Trust rebuilds. Recovery begins (late but real)." },
            { text: "Ignore and focus on donors", icon: "💼", effects: { happiness: -30, cityFunds: 5, specialInterest: 20, personalProfit: 15 }, next: 'ending', consequence: "Working class feels betrayed. Your mayorship defined by this scandal." }
        ]
    },
    ch2_thorough_finish: {
        chapter: "Chapter 2: Budget Management",
        title: "Fiscal Discipline",
        story: `<p>Recovery is complete and thorough. Citizens trust you, but the budget is tight. How do you manage?</p>`,
        choices: [
            { text: "Modest budget cuts", icon: "📉", effects: { happiness: 5, cityFunds: 5, specialInterest: -5, personalProfit: 0 }, next: 'ending', consequence: "Responsible budgeting. Citizens appreciate fiscal discipline!" },
            { text: "Borrow for popular projects", icon: "💳", effects: { happiness: 10, cityFunds: -10, specialInterest: 10, personalProfit: 3 }, next: 'ending', consequence: "Popular projects! Debt increases. Some skimming occurs." }
        ]
    },
    ch2_incomplete_recovery: {
        chapter: "Chapter 2: Families Organize",
        title: "Unfinished Business",
        story: `<p>Families in half-repaired homes are organizing. Media is covering their stories. The pressure is immense.</p>`,
        choices: [
            { text: "Resume recovery (admit mistake)", icon: "🔄", effects: { happiness: 10, cityFunds: -15, specialInterest: -10, personalProfit: 0 }, next: 'ending', consequence: "Course correction appreciated. Recovery completed. Budget strained." },
            { text: "Small relief checks instead", icon: "💵", effects: { happiness: -15, cityFunds: 5, specialInterest: 5, personalProfit: 8 }, next: 'ending', consequence: "Families insulted by token payments. Homes still damaged. Resentment festers." }
        ]
    },
    ch2_too_little_late: {
        chapter: "Chapter 2: Lawsuits Filed",
        title: "Legal Consequences",
        story: `<p>Recovery is underway but damage was worse due to delay. Lawsuits are threatened. How do you respond?</p>`,
        choices: [
            { text: "Settle fairly and take responsibility", icon: "⚖️", effects: { happiness: 10, cityFunds: -15, specialInterest: -10, personalProfit: 0 }, next: 'ending', consequence: "Accountability appreciated. Trust rebuilds. Settlements paid." },
            { text: "Fight lawsuits, blame nature", icon: "🌊", effects: { happiness: -20, cityFunds: 5, specialInterest: 10, personalProfit: 5 }, next: 'ending', consequence: "Victims feel gaslit and betrayed. Legal battles drag on." }
        ]
    },
    ch2_recall_petition: {
        chapter: "Chapter 2: Recall Election",
        title: "Democracy in Action",
        story: `<p>A recall petition has gathered enough signatures. Your administration is synonymous with corruption and neglect. How do you respond?</p>`,
        choices: [
            { text: "Resign with dignity", icon: "✍️", effects: { happiness: 20, cityFunds: 0, specialInterest: -20, personalProfit: -10 }, next: 'ending', consequence: "Citizens celebrate your departure. New leadership gets a chance." },
            { text: "Fight with donor money", icon: "💰", effects: { happiness: -35, cityFunds: -5, specialInterest: 20, personalProfit: 20 }, next: 'ending', consequence: "Democracy feels broken. Cynicism spreads. You cling to power through money." }
        ]
    },

    ending: {
        title: "Game Complete",
        story: `<p>Your time as mayor of Tiger Central has ended. Thank you for playing!</p>`
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

    // Update weather effects based on happiness
    updateWeather();
}

function applyEffects(effects) {
    // Apply effects and show floating text for each stat change
    if (effects.happiness) {
        gameState.happiness += effects.happiness;
        const happinessEl = document.getElementById('happiness');
        if (happinessEl) {
            narrativeManager.showStatChange('happiness', effects.happiness, happinessEl);
        }
    }
    if (effects.cityFunds) {
        gameState.cityFunds += effects.cityFunds;
        // Show floating number for money changes
        showFloatingNumber(effects.cityFunds, lastInteractionPosition.x, lastInteractionPosition.y);
        const fundsEl = document.getElementById('cityFunds');
        if (fundsEl) {
            narrativeManager.showStatChange('cityFunds', effects.cityFunds, fundsEl);
        }
    }
    if (effects.specialInterest) {
        gameState.specialInterest += effects.specialInterest;
        const interestEl = document.getElementById('specialInterest');
        if (interestEl) {
            narrativeManager.showStatChange('specialInterest', effects.specialInterest, interestEl);
        }
    }
    if (effects.personalProfit) {
        const oldProfit = gameState.personalProfit;
        gameState.personalProfit += effects.personalProfit;
        console.log(`💵 Personal Profit: $${oldProfit}M → $${gameState.personalProfit}M (${effects.personalProfit > 0 ? '+' : ''}${effects.personalProfit}M)`);
    }

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

    // Clear any pending dialogues from previous scene
    narrativeManager.clearDialogueQueue();

    // Reset choice flag for new scene
    gameState.choiceMade = false;
    gameState.timerExpired = false;

    // Update quiz title based on scene
    if (quizTitle) {
        if (sceneKey === 'intro') {
            quizTitle.textContent = 'Welcome';
        } else if (sceneKey === 'ending') {
            quizTitle.textContent = 'Game Complete';
        } else if (sceneKey === 'chapter1_ending') {
            quizTitle.textContent = 'Chapter 1 Complete';
        } else {
            quizTitle.textContent = scene.chapter || 'Decision Time';
        }
    }

    if (sceneKey === 'chapter1_ending') {
        renderChapter1Ending();
        return;
    }

    if (sceneKey === 'ending') {
        renderEnding();
        return;
    }

    let html = '';

    if (scene.chapter) {
        html += `<div class="chapter-title">${scene.chapter}</div>`;
    }

    html += `<div class="story-section"><h2>${scene.title}</h2><div class="story-text">${scene.story}</div></div>`;

    if (sceneKey === 'intro') {
        html += `<div class="intro-screen"><button class="start-btn" onclick="renderScene('choice1')"><span class="start-btn-text">Let's Begin!</span></button></div>`;
    } else {
        html += `<div class="choices">`;
        scene.choices.forEach((choice, index) => {
            // Use NarrativeManager to generate choice cards with advisor reactions
            html += narrativeManager.generateChoiceCardWithAdvisors(choice, index, sceneKey);
        });
        html += `</div>`;
    }

    content.innerHTML = html;

    // Have advisor react to the scene
    if (sceneKey !== 'intro' && sceneKey !== 'ending') {
        narrativeManager.reactToScene(sceneKey, scene);
    }

    // Start timer for ALL decision scenes (not intro or ending)
    if (sceneKey !== 'intro' && sceneKey !== 'ending') {
        console.log('🎮 Starting timer for scene:', sceneKey);

        // Check if tutorial should be shown (first-time player on first choice)
        if (sceneKey === 'choice1' && window.shouldShowTutorial) {
            console.log('📚 Showing tutorial for first-time player');
            window.shouldShowTutorial = false; // Only show once

            // Delay tutorial slightly so all UI elements are ready
            setTimeout(() => {
                if (typeof startTutorial === 'function') {
                    startTutorial();
                } else {
                    console.warn('⚠️ startTutorial function not found');
                    // Start timer if tutorial can't be shown
                    startTimer();
                }
            }, 500);
        } else {
            // Normal timer start
            setTimeout(() => {
                startTimer();
            }, 100);
        }
    }
}

function makeChoice(sceneKey, choiceIndex, isTimedOut = false) {
    // Prevent user clicks after timeout
    if (gameState.timerExpired && !isTimedOut) {
        console.log('❌ Cannot make choice - timer has expired!');
        showToast('⏰ Time\'s up! Decision was auto-selected', 'error');
        return;
    }

    // Prevent multiple clicks on the same choice
    if (gameState.choiceMade) {
        console.log('❌ Choice already made!');
        return;
    }

    // Mark that a choice has been made
    gameState.choiceMade = true;

    // Stop the timer immediately after choice is made
    // User can take their time reading consequences and building
    stopTimer();
    console.log('⏸️ Timer stopped - user can take their time with consequences and building');

    // Play choice sound
    if (!isTimedOut && typeof audioManager !== 'undefined') {
        audioManager.playChoiceSelect();
    }

    // Haptic feedback on choice
    triggerHaptic('medium');

    const scene = gameData[sceneKey];
    const choice = scene.choices[choiceIndex];

    // Calculate time bonus (2 points per second remaining)
    // No bonus if timeout occurred
    let earnedTimeBonus = 0;
    if (!isTimedOut) {
        const secondsRemaining = gameState.timerSeconds;
        earnedTimeBonus = secondsRemaining * 2;
        gameState.timeBonus += earnedTimeBonus;
        console.log(`⚡ Time Bonus: +${earnedTimeBonus} points (${secondsRemaining}s remaining)`);
    } else {
        console.log(`⏰ No time bonus - timer expired`);
    }

    // Track decision time for achievements
    const timeSpent = gameState.currentDecisionTime - gameState.timerSeconds;
    gameState.decisions.push({
        scene: sceneKey,
        choice: choice.text,
        timeSpent: timeSpent
    });

    // Store the next action details for the Continue button
    const buildingObj = choice.building ? buildingPalette.find(b => b.id === choice.building) : null;
    if (choice.building && !buildingObj) {
        console.error(`❌ Building ID "${choice.building}" not found in buildingPalette! Available buildings:`, buildingPalette.map(b => b.id).join(', '));
    }
    gameState.nextAction = {
        nextScene: choice.next,
        hasBuilding: !!choice.building,
        building: buildingObj,
        buildingId: choice.building || null, // Store ID for debugging
        constraints: choice.placementConstraints || null
    };

    // Handle building unlocks
    if (choice.unlocks && choice.unlocks.length > 0) {
        const newUnlocks = choice.unlocks.filter(b => !gameState.unlockedBuildings.includes(b));
        newUnlocks.forEach(buildingId => {
            gameState.unlockedBuildings.push(buildingId);
            const building = buildingPalette.find(b => b.id === buildingId);
            if (building) {
                showUnlockNotification(building);
                console.log(`🔓 Unlocked building: ${building.name}`);

                // Play building unlock sound
                if (typeof audioManager !== 'undefined') {
                    audioManager.playBuildingUnlock();
                }
            }
        });

        // Re-render palette to show unlocked buildings
        renderBuildingPalette();
    }

    // Handle feature placement from story choices
    if (choice.placeFeature) {
        const featureId = choice.placeFeature;
        let pattern = [];

        // Get pattern for the feature
        if (featureId === 'river') {
            pattern = generateRiverPattern();
        } else if (featureId === 'protected_forest') {
            pattern = generateForestPattern();
        } else if (featureId === 'mountain') {
            pattern = generateMountainPattern();
        } else if (featureId === 'highway') {
            pattern = generateHighwayPattern();
        }

        if (pattern.length > 0) {
            setTimeout(() => {
                placeGridFeature(featureId, pattern);
            }, 500); // Place after a short delay for visual effect
        }
    }

    // Handle feature replacement (e.g., river becomes polluted)
    if (choice.replaceFeature) {
        const { oldFeature, newFeature } = choice.replaceFeature;
        setTimeout(() => {
            replaceGridFeature(oldFeature, newFeature);
        }, 500);
    }

    // Track achievement progress
    if (choice.achievementTag) {
        if (choice.achievementTag === 'reject_factory') {
            gameState.achievementTracking.rejectedFactory = true;
            console.log('🏆 Achievement tracking: Rejected factory');
        }
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

        // Have advisor react to the choice
        narrativeManager.reactToChoice(choice.effects);

        if (choice.consequence) {
            showConsequence(choice.effects, choice.consequence, earnedTimeBonus, timeBankAdjustment, timeSpent);
        }
    }

    // Set up pending building placement if required
    if (choice.building) {
        const building = buildingPalette.find(b => b.id === choice.building);
        if (building) {
            gameState.pendingBuildingPlacement = {
                building: building,
                nextScene: choice.next
            };
            gameState.awaitingPlacement = true;
        }
    }

    // If no consequence to show, continue immediately
    if (!choice.consequence) {
        continueAfterConsequence();
    }
}

function showConsequence(effects, message, earnedTimeBonus = 0, timeBankAdjustment = 0, decisionTimeSeconds = 0) {
    const content = document.getElementById('game-content');
    const consequenceDiv = document.createElement('div');
    consequenceDiv.className = 'consequences';

    let html = '<h3>⚡ Consequences</h3>';

    // Use NarrativeManager for consequence with advisor commentary
    html += narrativeManager.showConsequenceWithAdvisor(message, effects);

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

    // Display decision time
    if (decisionTimeSeconds > 0) {
        html += `<div class="consequence-item" style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);border-left:4px solid #4caf50;">`;
        html += `⏱️ Decision Time: ${decisionTimeSeconds}s`;
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

    // Add Continue button (beautiful modern design)
    html += `<div class="continue-btn-container">
                <button class="continue-btn" onclick="continueAfterConsequence()" aria-label="Continue">
                    <span class="continue-btn-text">Continue</span>
                    <span class="continue-btn-arrow">→</span>
                </button>
             </div>`;

    consequenceDiv.innerHTML = html;
    content.appendChild(consequenceDiv);
    consequenceDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Continue after player clicks the Continue button on consequences
function continueAfterConsequence() {
    console.log('➡️ Player clicked Continue button');

    // Check if there's a next action stored
    if (!gameState.nextAction) {
        console.error('❌ No next action stored!');
        return;
    }

    const { nextScene, hasBuilding, building, buildingId, constraints } = gameState.nextAction;

    // Check if mandatory building placement is required
    if (hasBuilding) {
        if (!building) {
            // Building not found in palette - log error and skip to next scene
            console.error(`❌ Building not found in buildingPalette! Building ID: "${buildingId}". Available buildings:`, buildingPalette.map(b => b.id).join(', '));
            showToast('⚠️ Building not available, continuing story...', 'warning');

            // IMPORTANT: Clear pending placement state to prevent bugs
            gameState.pendingBuildingPlacement = null;
            gameState.awaitingPlacement = false;
            gameState.placementConstraints = null;
            renderBuildingPalette();

            setTimeout(() => {
                renderScene(nextScene);
            }, 1000);
        } else {
            // Show placement overlay after a brief delay for visual smoothness
            setTimeout(() => {
                showMandatoryPlacementOverlay(building, constraints);
            }, 500);
        }
    } else {
        // No mandatory placement, continue to next scene
        setTimeout(() => {
            renderScene(nextScene);
        }, 300);
    }

    // Clear the next action
    gameState.nextAction = null;
}

// ==================== CHAPTER 1 ENDING & CHAPTER 2 QUALIFICATION ====================
function renderChapter1Ending() {
    const content = document.getElementById('game-content');

    // Calculate score using same logic as final ending
    const startingFunds = gameState.difficulty?.startingFunds || 60;
    const fundsRatio = gameState.cityFunds / startingFunds;

    let fundsScore;
    if (fundsRatio >= 1.0) {
        fundsScore = 100;
    } else if (fundsRatio >= 0.5) {
        fundsScore = 75 + ((fundsRatio - 0.5) * 50);
    } else if (fundsRatio >= 0.2) {
        fundsScore = 50 + ((fundsRatio - 0.2) * 83.33);
    } else if (fundsRatio >= 0) {
        fundsScore = 25 + (fundsRatio * 125);
    } else {
        fundsScore = Math.max(0, 25 + (fundsRatio * 125));
    }

    const baseScore = (gameState.happiness * 0.5) + (gameState.specialInterest * 0.3) + (fundsScore * 0.2);
    const timeBonusScore = Math.min(20, gameState.timeBonus / 10);
    const achievementBonus = gameState.achievements.length * 5;
    const profitPenalty = gameState.personalProfit > 15 ? -15 : (gameState.personalProfit > 5 ? -5 : 0);
    const efficiencyBonus = gameState.planningEfficiency > 85 ? 10 : (gameState.planningEfficiency > 70 ? 5 : 0);
    const finalScore = (baseScore * 0.7) + (timeBonusScore * 0.15) + (achievementBonus * 0.1) + (efficiencyBonus * 0.05) + profitPenalty;
    const minStat = Math.min(gameState.happiness, fundsScore, gameState.specialInterest);
    const hasCriticalFailure = minStat < 20;

    // CHAPTER 2 QUALIFICATION: Score >= 45 AND no critical failures
    const qualifiesForChapter2 = finalScore >= 45 && !hasCriticalFailure;

    console.log('📊 CHAPTER 1 COMPLETE - QUALIFICATION CHECK:');
    console.log(`  Final Score: ${finalScore.toFixed(1)}/100`);
    console.log(`  Critical Failure: ${hasCriticalFailure}`);
    console.log(`  Qualifies for Chapter 2: ${qualifiesForChapter2}`);

    let rating = '';
    let message = '';

    if (hasCriticalFailure) {
        rating = '❌ Failed Mayor';
        message = 'Critical failures in governance have severely damaged Tiger Central. The city cannot continue under your leadership.';
    } else {
        if (finalScore >= 70) {
            rating = '👑 Outstanding Mayor!';
            message = 'You balanced competing interests masterfully! Tiger Central is thriving.';
        } else if (finalScore >= 60) {
            rating = '🌟 Excellent Mayor';
            message = 'Strong leadership! Most stakeholders are satisfied with your performance.';
        } else if (finalScore >= 45) {
            rating = '👍 Decent Mayor';
            message = 'You kept the city functioning through tough choices. Some groups are happier than others, but that\'s politics!';
        } else {
            rating = '😬 Struggling Mayor';
            message = 'Your term was rocky. Many citizens are unhappy, but you managed to avoid complete disaster.';
        }
    }

    let profitMessage = '';
    if (gameState.personalProfit > 15) {
        profitMessage = '<p style="color:#d63031;font-size:1.2em;">⚠️ Your personal profit-taking has not gone unnoticed.</p>';
    } else if (gameState.personalProfit > 5) {
        profitMessage = '<p style="font-size:1.1em;">You made some personal profit along the way.</p>';
    } else if (gameState.personalProfit <= 0) {
        profitMessage = '<p style="color:#00b894;font-size:1.2em;">✨ You remained ethical! Citizens respect your integrity.</p>';
    }

    const html = `
        <div class="game-over">
            <div class="chapter-title">Chapter 1: Economic Opportunity - COMPLETE</div>
            <h2>${rating}</h2>
            <p style="font-size:1.3em;margin:20px 0;font-weight:600;">${message}</p>
            ${profitMessage}

            <div class="final-stats">
                <h3>📊 Chapter 1 Statistics</h3>
                <div class="final-stat-item"><strong>Population Happiness:</strong> ${gameState.happiness}/100 ${gameState.happiness >= 70 ? '🎉' : gameState.happiness >= 40 ? '😐' : '😞'}</div>
                <div class="final-stat-item"><strong>City Funds:</strong> $${gameState.cityFunds}M ${gameState.cityFunds >= 70 ? '💰' : gameState.cityFunds >= 40 ? '💵' : '💸'}</div>
                <div class="final-stat-item"><strong>Special Interest Support:</strong> ${gameState.specialInterest}/100 ${gameState.specialInterest >= 70 ? '🤝' : gameState.specialInterest >= 40 ? '👌' : '👎'}</div>
                <div class="final-stat-item"><strong>Your Personal Profit:</strong> $${gameState.personalProfit}M ${gameState.personalProfit > 10 ? '⚠️' : gameState.personalProfit > 0 ? '💵' : '✨'}</div>
                <div class="final-stat-item"><strong>Chapter 1 Score:</strong> ${finalScore.toFixed(1)}/100 ${finalScore >= 70 ? '🌟' : finalScore >= 60 ? '👍' : finalScore >= 45 ? '😐' : '😬'}</div>
            </div>

            ${qualifiesForChapter2 ? `
                <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #e1f5fe 0%, #81d4fa 100%);border:3px solid #0288d1;">
                    <h3>🎉 CHAPTER 2 UNLOCKED!</h3>
                    <p style="font-size:1.2em;padding:15px;margin:0;line-height:1.6;">
                        <strong>Congratulations!</strong> You've proven yourself as a decent mayor. Tiger Central needs you for another term.<br><br>
                        A new crisis approaches... Are you ready to face <strong>The Great Storm</strong>?
                    </p>
                </div>
                <button class="start-btn" onclick="renderScene('chapter2_intro')" style="margin-top:30px;background:linear-gradient(135deg, #0288d1 0%, #01579b 100%);animation: pulse 2s infinite;">
                    <span class="start-btn-text">⚡ Continue to Chapter 2 ⚡</span>
                </button>
                <button class="start-btn" onclick="location.reload()" style="margin-top:15px;background:linear-gradient(135deg, #757575 0%, #424242 100%);">
                    <span class="start-btn-text">🔄 Restart Game</span>
                </button>
            ` : `
                <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);border:2px solid #c62828;">
                    <h3>Chapter 2 Locked</h3>
                    <p style="padding:15px;margin:0;line-height:1.6;">
                        Your performance in Chapter 1 did not meet the requirements to continue. To unlock Chapter 2, you need:<br><br>
                        ✓ Overall Score ≥ 45<br>
                        ✓ No critical failures (all stats ≥ 20)<br><br>
                        Try again and make better choices to see what happens next!
                    </p>
                </div>
                <button class="start-btn" onclick="location.reload()" style="margin-top:30px;">
                    <span class="start-btn-text">🔄 Try Again</span>
                </button>
            `}
        </div>
    `;

    content.innerHTML = html;

    // Add pulse animation for continue button
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 5px 15px rgba(2,136,209,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(2,136,209,0.6); }
        }
    `;
    document.head.appendChild(style);
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

    // Final achievement check (pass true for end-game achievements)
    checkAchievements(true);

    let rating = '';
    let message = '';

    // ==================== IMPROVED SCORING SYSTEM ====================

    // STEP 1: Normalize City Funds to 0-100 scale
    // City funds are in millions and vary by difficulty, so we need to normalize them
    const startingFunds = gameState.difficulty?.startingFunds || 60; // Default to normal mode
    const fundsRatio = gameState.cityFunds / startingFunds;

    // Calculate funds score (0-100) - spending money on buildings is GOOD!
    let fundsScore;
    if (fundsRatio >= 1.0) {
        // Made profit! Excellent financial management
        fundsScore = 100;
    } else if (fundsRatio >= 0.5) {
        // Still have 50%+ of starting funds - very good
        fundsScore = 75 + ((fundsRatio - 0.5) * 50);
    } else if (fundsRatio >= 0.2) {
        // Have 20-50% of funds - reasonable (spent on city development)
        fundsScore = 50 + ((fundsRatio - 0.2) * 83.33);
    } else if (fundsRatio >= 0) {
        // Have 0-20% of funds - low but not debt
        fundsScore = 25 + (fundsRatio * 125);
    } else {
        // Negative funds (debt) - bad
        fundsScore = Math.max(0, 25 + (fundsRatio * 125));
    }

    // STEP 2: Calculate weighted base score
    // Happiness is most important (50%), Special Interest (30%), Funds (20%)
    // This reflects that citizen happiness is the primary goal of a mayor
    const baseScore = (gameState.happiness * 0.5) + (gameState.specialInterest * 0.3) + (fundsScore * 0.2);

    // STEP 3: Calculate bonus scores
    // Time bonus contributes less (max ~20 points instead of unlimited)
    const timeBonusScore = Math.min(20, gameState.timeBonus / 10);

    // Achievement bonus (5 points per achievement, max ~50 points)
    const achievementBonus = gameState.achievements.length * 5;

    // Personal profit penalty (high corruption hurts your rating)
    const profitPenalty = gameState.personalProfit > 15 ? -15 : (gameState.personalProfit > 5 ? -5 : 0);

    // Planning efficiency bonus (good city planning adds up to 10 points)
    const efficiencyBonus = gameState.planningEfficiency > 85 ? 10 : (gameState.planningEfficiency > 70 ? 5 : 0);

    // STEP 4: Calculate final score (base score is 70% of weight, bonuses are 30%)
    const finalScore = (baseScore * 0.7) + (timeBonusScore * 0.15) + (achievementBonus * 0.1) + (efficiencyBonus * 0.05) + profitPenalty;

    // STEP 5: Check for critical failures (any NORMALIZED stat below 20 = automatic bad rating)
    // Use normalized funds score, not raw dollar amount!
    const minStat = Math.min(gameState.happiness, fundsScore, gameState.specialInterest);
    const hasCriticalFailure = minStat < 20;

    console.log('📊 SCORING BREAKDOWN:');
    console.log(`  Happiness: ${gameState.happiness}/100`);
    console.log(`  Special Interest: ${gameState.specialInterest}/100`);
    console.log(`  City Funds: $${gameState.cityFunds}M (normalized: ${fundsScore.toFixed(1)}/100)`);
    console.log(`  Personal Profit: $${gameState.personalProfit}M`);
    console.log(`  Base Score: ${baseScore.toFixed(1)}/100 (weight: 70%)`);
    console.log(`  Time Bonus: ${timeBonusScore.toFixed(1)} points (weight: 15%)`);
    console.log(`  Achievements: ${achievementBonus.toFixed(1)} points (weight: 10%)`);
    console.log(`  Efficiency: ${efficiencyBonus.toFixed(1)} points (weight: 5%)`);
    console.log(`  Profit Penalty: ${profitPenalty} points`);
    console.log(`  Final Score: ${finalScore.toFixed(1)}/100`);
    console.log(`  Critical Failure: ${hasCriticalFailure}`);

    // Play victory or defeat music based on score
    if (typeof audioManager !== 'undefined') {
        if (finalScore >= 65 && !hasCriticalFailure) {
            audioManager.playMusic('victory', true);
        } else if (finalScore < 30 || hasCriticalFailure) {
            audioManager.playMusic('defeat', true);
        } else {
            audioManager.playMusic('victory', true); // Medium scores get victory music
        }
    }

    // Calculate play time in seconds
    const playTimeSeconds = gameState.gameStartTime ? Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000) : 0;

    // Calculate average decision time
    const totalDecisionTime = gameState.decisions.reduce((sum, d) => sum + (d.timeSpent || 0), 0);
    const avgDecisionTime = gameState.decisions.length > 0 ? totalDecisionTime / gameState.decisions.length : 0;

    // Count buildings placed (excluding features)
    const buildingsPlaced = gameState.cityGrid.filter(c => c !== null && c.type !== 'feature').length;

    // Submit final score to backend
    if (typeof gameAPI !== 'undefined') {
        gameAPI.completeGame({
            finalScore: Math.round(finalScore),
            happiness: gameState.happiness,
            cityFunds: gameState.cityFunds,
            specialInterest: gameState.specialInterest,
            personalProfit: gameState.personalProfit,
            decisions: gameState.decisions.length,
            playTime: playTimeSeconds,
            // New detailed stats
            achievements: gameState.achievements,
            buildingsPlaced: buildingsPlaced,
            avgDecisionTime: Math.round(avgDecisionTime * 10) / 10,
            planningEfficiency: gameState.planningEfficiency,
            timeBonus: gameState.timeBonus,
            zonesFormed: gameState.detectedZones.map(z => z.name)
        }).then(result => {
            if (result.success) {
                console.log('🏆 Game score submitted successfully!');
                showToast('🏆 Score submitted to leaderboard!', 'success');
            } else {
                console.warn('⚠️ Failed to submit score:', result.error);
                showToast('⚠️ Could not submit score to leaderboard', 'warning');
            }
        }).catch(error => {
            console.error('❌ Error submitting score:', error);
        });

        // Stop auto-save
        gameAPI.stopAutoSave();
    }

    // Get all earned achievements with details
    const earnedAchievements = gameState.achievements.map(id => {
        return achievementDefinitions[id] || null;
    }).filter(a => a !== null);

    // Get all achievements for display (earned and unearned)
    const allAchievements = Object.values(achievementDefinitions);

    // ==================== RATING SYSTEM (Improved Logic) ====================
    // Critical failure check - if any stat is below 20, you can't be excellent
    if (hasCriticalFailure) {
        if (baseScore < 25) {
            rating = '💀 Catastrophic Failure';
            message = 'Tiger Central is in crisis! One or more critical areas have completely collapsed. Your leadership has been disastrous.';
        } else if (baseScore < 40) {
            rating = '❌ Failed Mayor';
            message = 'Despite some efforts, critical areas of city governance have failed catastrophically. The city council is discussing emergency measures.';
        } else {
            rating = '😬 Struggling Mayor';
            message = 'While you had some successes, critical failures in key areas have severely damaged the city. Major reforms are needed.';
        }
    } else {
        // No critical failures - rate based on final score
        if (finalScore >= 70 && baseScore >= 60) {
            rating = '👑 Outstanding Mayor!';
            message = 'You balanced competing interests masterfully! Tiger Central is thriving under your leadership. Citizens are calling for you to run for governor!';
        } else if (finalScore >= 60) {
            rating = '🌟 Excellent Mayor';
            message = 'You made strong decisions and kept the city running well. Most stakeholders are satisfied with your leadership.';
        } else if (finalScore >= 45) {
            rating = '👍 Decent Mayor';
            message = "You made tough choices and kept the city functioning. Some groups are happier than others, but that's politics!";
        } else if (finalScore >= 30) {
            rating = '😬 Struggling Mayor';
            message = 'Your term was rocky. Many citizens are unhappy with your decisions. You may face challenges in re-election.';
        } else {
            rating = '❌ Failed Mayor';
            message = 'Your decisions have left Tiger Central worse than before. The city is considering a recall election.';
        }
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

            <!-- Tab Navigation -->
            <div class="results-tabs">
                <button class="tab-btn active" onclick="switchResultsTab('achievements')">🏆 Awards</button>
                <button class="tab-btn" onclick="switchResultsTab('stats')">📊 Stats</button>
                <button class="tab-btn" onclick="switchResultsTab('score')">🎯 Score</button>
                <button class="tab-btn" onclick="switchResultsTab('city')">🏙️ City</button>
                <button class="tab-btn" onclick="switchResultsTab('learn')">🎓 Learn</button>
                <button class="tab-btn" onclick="switchResultsTab('leaderboard')">👑 Top</button>
            </div>

            <!-- Tab Contents -->
            <div class="tab-content active" id="tab-achievements">
                <div class="final-stats" style="background:linear-gradient(135deg, #fff5e5 0%, #ffe5cc 100%);">
                    <h3>🏆 Achievements (${earnedAchievements.length}/${allAchievements.length})</h3>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #fffbea 0%, #fff4d6 100%);font-size:1.1em;">
                        <strong>Achievement Bonus:</strong> +${achievementBonus.toFixed(1)} points (${earnedAchievements.length} × 5)
                    </div>
                    <div class="achievement-grid">
                        ${allAchievements.map(achievement => {
        const isEarned = gameState.achievements.includes(achievement.id);
        return `
                                <div class="achievement-item ${isEarned ? 'earned' : 'locked'}">
                                    <img src="${achievement.image}" alt="${achievement.name}" class="achievement-image">
                                    <div class="achievement-name">${achievement.name}</div>
                                    <div class="achievement-desc">${achievement.description}</div>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            </div>

            <div class="tab-content" id="tab-stats">
                <div class="final-stats">
                    <h3>📊 Final Statistics</h3>
                    <div class="final-stat-item"><strong>Population Happiness:</strong> ${gameState.happiness}/100 ${gameState.happiness >= 70 ? '🎉' : gameState.happiness >= 40 ? '😐' : '😞'}</div>
                    <div class="final-stat-item"><strong>City Funds:</strong> $${gameState.cityFunds}M ${gameState.cityFunds >= 70 ? '💰' : gameState.cityFunds >= 40 ? '💵' : '💸'}</div>
                    <div class="final-stat-item"><strong>Special Interest Support:</strong> ${gameState.specialInterest}/100 ${gameState.specialInterest >= 70 ? '🤝' : gameState.specialInterest >= 40 ? '👌' : '👎'}</div>
                    <div class="final-stat-item"><strong>Your Personal Profit:</strong> $${gameState.personalProfit}M ${gameState.personalProfit > 10 ? '⚠️' : gameState.personalProfit > 0 ? '💵' : '✨'}</div>
                    <div class="final-stat-item"><strong>Decisions Made:</strong> ${gameState.decisions.length} choices 🎯</div>
                </div>
            </div>

            <div class="tab-content" id="tab-score">
                <div class="final-stats" style="background:linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%);">
                    <h3>📊 Score Breakdown</h3>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);"><strong>Base Score (70% weight):</strong> ${baseScore.toFixed(1)}/100 ${baseScore >= 60 ? '✅' : baseScore >= 40 ? '⚠️' : '❌'}</div>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #fff9e6 0%, #fef5e7 100%);"><strong>Time Bonus (15% weight):</strong> +${timeBonusScore.toFixed(1)} points ⚡</div>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #fffbea 0%, #fff4d6 100%);"><strong>Achievement Bonus (10%):</strong> +${achievementBonus.toFixed(1)} points 🏆</div>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f5e9 0%, #d1f2eb 100%);"><strong>Efficiency Bonus (5%):</strong> +${efficiencyBonus.toFixed(1)} points 📐</div>
                    ${profitPenalty < 0 ? `<div class="final-stat-item" style="background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);"><strong>Corruption Penalty:</strong> ${profitPenalty} points ⚠️</div>` : ''}
                    ${hasCriticalFailure ? `<div class="final-stat-item" style="background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);color:#c62828;"><strong>⚠️ Critical Failure:</strong> One or more stats below 20</div>` : ''}
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);font-size:1.4em;font-weight:bold;border:3px solid #0288d1;"><strong>FINAL SCORE:</strong> ${finalScore.toFixed(1)}/100 ${finalScore >= 70 ? '🌟' : finalScore >= 60 ? '👍' : finalScore >= 45 ? '😐' : '😬'}</div>
                </div>
            </div>

            <div class="tab-content" id="tab-city">
                <div class="final-stats" style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                    <h3>🏙️ City Planning</h3>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #fff9e6 0%, #fef5e7 100%);"><strong>Planning Efficiency:</strong> ${gameState.planningEfficiency}% 📐</div>
                    <div class="final-stat-item" style="background:linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);"><strong>Buildings Placed:</strong> ${gameState.cityGrid.filter(c => c !== null && c.type !== 'feature').length} buildings 🏗️</div>
                    ${gameState.detectedZones.length > 0 ? `
                        <div class="final-stat-item" style="background:white;"><strong>Zones Formed:</strong> ${gameState.detectedZones.map(z => `${z.icon} ${z.name}`).join(', ')}</div>
                    ` : '<div class="final-stat-item" style="background:white;opacity:0.7;">No zones formed</div>'}
                </div>
            </div>

            <div class="tab-content" id="tab-learn">
                <div class="final-stats story-section" style="text-align:left;background:linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
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
            </div>

            <div class="tab-content" id="tab-leaderboard">
                <div id="ending-leaderboard" class="final-stats" style="background:linear-gradient(135deg, #fff9e6 0%, #ffe5cc 100%);">
                    <h3>👑 Top Mayors Leaderboard</h3>
                    <div style="padding:20px;text-align:center;">Loading leaderboard...</div>
                </div>
            </div>

            <button class="start-btn" onclick="location.reload()" style="margin-top:30px;"><span class="start-btn-text">🔄 Play Again</span></button>
        </div>
    `;

    content.innerHTML = html;

    // Fetch and display leaderboard
    if (typeof gameAPI !== 'undefined') {
        const difficultyId = gameState.difficulty ? gameState.difficulty.id : null;
        gameAPI.getLeaderboard(difficultyId, 10).then(leaderboard => {
            const leaderboardDiv = document.getElementById('ending-leaderboard');
            if (leaderboard && leaderboard.length > 0) {
                // Store leaderboard data globally for modal access
                window.leaderboardData = leaderboard;

                const leaderboardHTML = leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    let rankBadge = '';
                    if (rank === 1) rankBadge = '🥇';
                    else if (rank === 2) rankBadge = '🥈';
                    else if (rank === 3) rankBadge = '🥉';
                    else rankBadge = `#${rank}`;

                    // Get achievement icons
                    const achievementIcons = (entry.achievements || []).map(id => {
                        const def = achievementDefinitions[id];
                        return def ? def.icon : '';
                    }).join(' ');

                    return `
                        <div class="leaderboard-entry" onclick="showPlayerDetails(${index})" style="cursor:pointer;">
                            <div class="leaderboard-header">
                                <div class="leaderboard-rank-name">
                                    <strong class="rank-badge">${rankBadge}</strong>
                                    <span class="player-name">${escapeHTML(entry.player_name)}</span>
                                </div>
                                <strong class="final-score">${entry.final_score}</strong>
                            </div>
                            <div class="leaderboard-details">
                                <div class="stat-row">
                                    <span>😊 ${entry.happiness || 0}</span>
                                    <span>💰 ${entry.city_funds || 0}</span>
                                    <span>🏛️ ${entry.special_interest || 0}</span>
                                    <span>📐 ${entry.planning_efficiency || 0}%</span>
                                </div>
                                <div class="stat-row">
                                    <span>🏗️ ${entry.buildings_placed || 0} buildings</span>
                                    <span>⚡ ${entry.avg_decision_time || 0}s avg</span>
                                    <span>🎯 ${entry.decisions_made || 0} decisions</span>
                                </div>
                                ${achievementIcons ? `<div class="achievement-row">${achievementIcons}</div>` : ''}
                            </div>
                            <div class="click-hint">Click to view details</div>
                        </div>
                    `;
                }).join('');
                leaderboardDiv.innerHTML = `<h3>👑 Top Mayors Leaderboard</h3>${leaderboardHTML}`;
            } else {
                leaderboardDiv.innerHTML = '<h3>👑 Top Mayors Leaderboard</h3><div style="padding:20px;text-align:center;opacity:0.7;">Be the first to complete the game!</div>';
            }
        }).catch(error => {
            console.error('Failed to load leaderboard:', error);
            const leaderboardDiv = document.getElementById('ending-leaderboard');
            leaderboardDiv.innerHTML = '<h3>👑 Top Mayors Leaderboard</h3><div style="padding:20px;text-align:center;opacity:0.7;">Unable to load leaderboard</div>';
        });
    }
}

// ==================== BANKRUPTCY ENDING ====================
// Called when player cannot afford a mandatory building
function renderBankruptcyEnding() {
    const content = document.getElementById('game-content');

    // Track game end time
    gameState.gameEndTime = Date.now();

    // Play defeat music
    if (typeof audioManager !== 'undefined') {
        audioManager.playMusic('defeat', true);
    }

    // Calculate play time in seconds
    const playTimeSeconds = gameState.gameStartTime ? Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000) : 0;

    // Calculate average decision time
    const totalDecisionTime = gameState.decisions.reduce((sum, d) => sum + (d.timeSpent || 0), 0);
    const avgDecisionTime = gameState.decisions.length > 0 ? totalDecisionTime / gameState.decisions.length : 0;

    // Count buildings placed (excluding features)
    const buildingsPlaced = gameState.cityGrid.filter(c => c !== null && c.type !== 'feature').length;

    // Submit bankruptcy score to backend with very low score
    if (typeof gameAPI !== 'undefined') {
        gameAPI.completeGame({
            finalScore: 0,
            happiness: gameState.happiness,
            cityFunds: gameState.cityFunds,
            specialInterest: gameState.specialInterest,
            personalProfit: gameState.personalProfit,
            decisions: gameState.decisions.length,
            playTime: playTimeSeconds,
            // New detailed stats
            achievements: gameState.achievements,
            buildingsPlaced: buildingsPlaced,
            avgDecisionTime: Math.round(avgDecisionTime * 10) / 10,
            planningEfficiency: gameState.planningEfficiency,
            timeBonus: gameState.timeBonus,
            zonesFormed: gameState.detectedZones.map(z => z.name)
        }).then(result => {
            if (result.success) {
                console.log('💸 Bankruptcy score submitted!');
            }
        }).catch(error => {
            console.error('❌ Error submitting bankruptcy score:', error);
        });

        // Stop auto-save
        gameAPI.stopAutoSave();
    }

    const html = `
        <div class="game-over">
            <h2 style="color:#d63031;">💸 City Bankruptcy!</h2>
            <p style="font-size:1.4em;margin:20px 0;font-weight:600;color:#d63031;">
                Tiger Central has run out of funds! The city cannot afford essential infrastructure.
            </p>
            <p style="font-size:1.2em;margin:20px 0;">
                Your financial decisions have led the city into bankruptcy. Without enough money to build critical infrastructure,
                the city council has called an emergency session and voted to remove you from office.
            </p>

            <div class="final-stats" style="border:3px solid #d63031;">
                <h3>💰 Financial Situation</h3>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);"><strong>City Funds:</strong> $${gameState.cityFunds}M 💸</div>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);"><strong>Required Building Cost:</strong> $${gameState.pendingBuildingPlacement ? gameState.pendingBuildingPlacement.building.cost : '??'}M</div>
                <div class="final-stat-item" style="background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);"><strong>Deficit:</strong> -$${gameState.pendingBuildingPlacement ? (gameState.pendingBuildingPlacement.building.cost - gameState.cityFunds) : '??'}M ⚠️</div>
            </div>

            <div class="final-stats" style="margin-top:20px;">
                <h3>📊 Your Term Statistics</h3>
                <div class="final-stat-item"><strong>Population Happiness:</strong> ${gameState.happiness}/100 ${gameState.happiness >= 40 ? '😐' : '😞'}</div>
                <div class="final-stat-item"><strong>Special Interest Support:</strong> ${gameState.specialInterest}/100 ${gameState.specialInterest >= 40 ? '👌' : '👎'}</div>
                <div class="final-stat-item"><strong>Your Personal Profit:</strong> $${gameState.personalProfit}M ${gameState.personalProfit > 10 ? '⚠️' : gameState.personalProfit > 0 ? '💵' : '✨'}</div>
                <div class="final-stat-item"><strong>Decisions Made:</strong> ${gameState.decisions.length} choices 🎯</div>
            </div>

            ${gameState.personalProfit > 5 ? `
                <div class="story-section" style="margin-top:20px;background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);border-left:4px solid #d63031;">
                    <h3>⚠️ Corruption Investigation</h3>
                    <p>While the city went bankrupt, you managed to accumulate $${gameState.personalProfit}M in personal profit.
                    The state attorney general has announced an investigation into possible corruption and misuse of public funds.</p>
                </div>
            ` : ''}

            <div class="story-section" style="margin-top:20px;text-align:left;">
                <h3>🎓 What Went Wrong</h3>
                <p>As mayor, fiscal responsibility is crucial:</p>
                <ul style="margin-left:20px;margin-top:10px;line-height:1.8;">
                    <li>Every decision has financial consequences</li>
                    <li>You must balance spending with revenue</li>
                    <li>Choices that decrease city funds can lead to bankruptcy</li>
                    <li>Strategic planning requires keeping an eye on the budget</li>
                    <li>Personal profit-taking shouldn't come before city needs</li>
                </ul>
                <p style="margin-top:15px;">💡 <strong>Tip:</strong> Choose options that maintain or increase city funds, especially early in the game.
                Watch the City Funds meter and avoid consecutive choices that drain the treasury!</p>
            </div>

            <div class="final-stats" style="margin-top:20px;background:linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                <h3>🎮 Difficulty Tip</h3>
                <p style="padding:15px;margin:0;">Consider trying an easier difficulty mode where you start with more funds.
                Easy mode starts with $100M and gives you more time to make decisions!</p>
            </div>

            <button class="start-btn" onclick="location.reload()" style="margin-top:30px;"><span class="start-btn-text">🔄 Try Again</span></button>
        </div>
    `;

    content.innerHTML = html;

    console.log('💸 GAME ENDED: City Bankruptcy');
    console.log(`  Final Funds: $${gameState.cityFunds}M`);
    console.log(`  Decisions Made: ${gameState.decisions.length}`);
    console.log(`  Personal Profit: $${gameState.personalProfit}M`);
}

// Helper function to escape HTML for security
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== PLAYER DETAILS MODAL ====================
// Shows detailed player stats and achievements when clicking on leaderboard entry
function showPlayerDetails(index) {
    if (!window.leaderboardData || !window.leaderboardData[index]) {
        console.error('No leaderboard data found for index:', index);
        return;
    }

    const player = window.leaderboardData[index];
    const rank = index + 1;
    let rankBadge = '';
    if (rank === 1) rankBadge = '🥇 1st Place';
    else if (rank === 2) rankBadge = '🥈 2nd Place';
    else if (rank === 3) rankBadge = '🥉 3rd Place';
    else rankBadge = `#${rank}`;

    // Format play time
    const playTime = player.play_time_seconds || 0;
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    const timeStr = `${minutes}m ${seconds}s`;

    // Build achievements HTML with images
    const playerAchievements = player.achievements || [];
    // Filter to only achievements that have definitions
    const validAchievements = playerAchievements.filter(id => achievementDefinitions[id]);
    let achievementsHTML = '';

    if (validAchievements.length > 0) {
        achievementsHTML = `
            <div class="player-detail-section">
                <h4>🏆 Achievements Earned (${validAchievements.length})</h4>
                <div class="player-achievements-grid">
                    ${validAchievements.map(id => {
            const def = achievementDefinitions[id];
            return `
                            <div class="player-achievement-card">
                                <img src="${def.image}" alt="${def.name}" class="player-achievement-image">
                                <div class="player-achievement-name">${def.name}</div>
                                <div class="player-achievement-desc">${def.description}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    } else {
        achievementsHTML = `
            <div class="player-detail-section">
                <h4>🏆 Achievements</h4>
                <p style="text-align:center;opacity:0.7;padding:20px;">No achievements earned</p>
            </div>
        `;
    }

    // Build zones HTML
    const zones = player.zones_formed || [];
    let zonesHTML = '';
    if (zones.length > 0) {
        zonesHTML = `
            <div class="player-detail-section">
                <h4>🏘️ Zones Formed</h4>
                <div class="zones-list">
                    ${zones.map(zone => `<span class="zone-badge">${zone}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Create modal HTML
    const modalHTML = `
        <div class="player-details-modal" onclick="closePlayerDetails(event)">
            <div class="player-details-content" onclick="event.stopPropagation()">
                <button class="close-modal-btn" onclick="closePlayerDetails()">&times;</button>

                <div class="player-details-header">
                    <h2>${escapeHTML(player.player_name)}</h2>
                    <div class="player-rank">${rankBadge}</div>
                    <div class="player-final-score">${player.final_score} pts</div>
                </div>

                ${achievementsHTML}

                <div class="player-detail-section">
                    <h4>📊 Game Statistics</h4>
                    <div class="player-stats-grid">
                        <div class="player-stat-item">
                            <span class="stat-icon">😊</span>
                            <span class="stat-label">Happiness</span>
                            <span class="stat-value">${player.happiness || 0}</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">City Funds</span>
                            <span class="stat-value">$${player.city_funds || 0}M</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">🏛️</span>
                            <span class="stat-label">Special Interest</span>
                            <span class="stat-value">${player.special_interest || 0}</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">💵</span>
                            <span class="stat-label">Personal Profit</span>
                            <span class="stat-value">$${player.personal_profit || 0}M</span>
                        </div>
                    </div>
                </div>

                <div class="player-detail-section">
                    <h4>⚡ Performance Metrics</h4>
                    <div class="player-stats-grid">
                        <div class="player-stat-item">
                            <span class="stat-icon">🏗️</span>
                            <span class="stat-label">Buildings Placed</span>
                            <span class="stat-value">${player.buildings_placed || 0}</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">🎯</span>
                            <span class="stat-label">Decisions Made</span>
                            <span class="stat-value">${player.decisions_made || 0}</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-label">Avg Decision Time</span>
                            <span class="stat-value">${player.avg_decision_time || 0}s</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">📐</span>
                            <span class="stat-label">Planning Efficiency</span>
                            <span class="stat-value">${player.planning_efficiency || 0}%</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">⏰</span>
                            <span class="stat-label">Time Bonus</span>
                            <span class="stat-value">+${player.time_bonus || 0}</span>
                        </div>
                        <div class="player-stat-item">
                            <span class="stat-icon">🎮</span>
                            <span class="stat-label">Play Time</span>
                            <span class="stat-value">${timeStr}</span>
                        </div>
                    </div>
                </div>

                ${zonesHTML}

                <div class="player-detail-footer">
                    <span class="difficulty-badge">${player.difficulty || 'normal'} mode</span>
                    <span class="completed-date">${player.completed_at ? new Date(player.completed_at).toLocaleDateString() : ''}</span>
                </div>
            </div>
        </div>
    `;

    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.id = 'player-details-container';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // Add touch support for achievement cards
    const achievementCards = modalContainer.querySelectorAll('.player-achievement-card');
    achievementCards.forEach(card => {
        card.addEventListener('click', function (e) {
            e.stopPropagation();
            // Toggle touched class for this card
            const wasTouched = this.classList.contains('touched');
            // Remove touched from all cards
            achievementCards.forEach(c => c.classList.remove('touched'));
            // Add to this card if it wasn't already touched
            if (!wasTouched) {
                this.classList.add('touched');
            }
        });
    });

    // Trigger haptic feedback
    triggerHaptic('medium');
}

// Close player details modal
function closePlayerDetails(event) {
    if (event && event.target.className !== 'player-details-modal') return;

    const container = document.getElementById('player-details-container');
    if (container) {
        container.remove();
    }
    triggerHaptic('light');
}

// ==================== TUTORIAL SYSTEM ====================
// NOTE: tutorialSteps, currentTutorialStep and all tutorial functions
// (checkFirstTime, startTutorial, showTutorialStep, nextTutorialStep,
//  skipTutorial, completeTutorial) are now defined in tutorial-system.js

// ==================== GAME START ====================
// Note: Difficulty selection is now handled in start-screen.js
// This function is kept for compatibility but just goes to first choice
function startGame() {
    // Go directly to first decision (difficulty already selected in start-screen.js)
    renderScene('choice1');
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
    } else {
        overlay.classList.add('hidden');
        unhideBtn.style.display = 'flex'; // Show the shaking unhide button
        toggleText.textContent = 'Show';
        toggleIcon.textContent = '👁️‍🗨️';
    }

    // Trigger haptic feedback
    triggerHaptic('light');
}

// Initialize quiz toggle system
function initializeQuizToggle() {
    // No need for city view click handler since we have the unhide button
    console.log('🎮 Quiz toggle system initialized');
}

// ==================== ORIENTATION & RESIZE HANDLING ====================
let resizeTimeout;
function handleOrientationChange() {
    // Clear any existing timeout
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }

    // Debounce resize handler to avoid too many redraws
    resizeTimeout = setTimeout(() => {
        console.log('📱 Orientation/resize detected, updating grid...');

        // Store current grid state
        const currentGrid = [...gameState.cityGrid];

        // Get new grid size
        const newGridSize = getGridSize();

        // If grid size changed, we need to reinitialize
        if (gameState.cityGrid.length !== newGridSize.total) {
            console.log(`📐 Grid size changed from ${gameState.cityGrid.length} to ${newGridSize.total} cells`);

            // Detect which features are currently placed (before clearing grid)
            const placedFeatures = new Set();
            gameState.gridFeatures.forEach(item => {
                if (!placedFeatures.has(item.featureId)) {
                    placedFeatures.add(item.featureId);
                }
            });

            // Create new grid
            gameState.cityGrid = new Array(newGridSize.total).fill(null);
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
                    pattern = generateRiverPattern(); // Same pattern as river
                } else if (featureId === 'flooded_area') {
                    pattern = generateRiverPattern(); // Same pattern as river
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
                        console.log(`🗺️ Re-placed ${feature.name} for new grid size`);
                    }
                }
            });

            // Note: Player-placed buildings are NOT preserved across grid size changes
            // This is intentional as grid dimensions change and building positions become invalid
            console.log(`⚠️ Grid resize: Features re-placed, player buildings cleared`);
        }

        // Re-render grid with new layout
        renderCityGrid();
        renderBuildingPalette();
        updateEfficiencyDisplay();

        // Trigger haptic feedback on mobile
        triggerHaptic('light');

        console.log('✅ Layout updated for new orientation/size');
    }, 300); // Wait 300ms after last resize event
}

// Listen for orientation changes
window.addEventListener('orientationchange', handleOrientationChange);

// Listen for window resize (covers desktop and some mobile browsers)
window.addEventListener('resize', handleOrientationChange);

// ==================== PALETTE RESIZE FUNCTIONALITY ====================
let paletteCollapsed = false;

function togglePaletteSize() {
    const palette = document.getElementById('building-palette');
    const gameWrapper = document.getElementById('game-wrapper');
    const resizeIcon = document.getElementById('palette-resize-icon');
    const resizeText = document.getElementById('palette-resize-text');

    paletteCollapsed = !paletteCollapsed;

    if (paletteCollapsed) {
        palette.classList.add('collapsed');
        resizeIcon.textContent = '▲';
        resizeText.textContent = 'Show';
        // Adjust game wrapper to give more space
        if (isMobileDevice()) {
            gameWrapper.style.bottom = '65px';
        }
        console.log('📦 Palette collapsed - more game space');
    } else {
        palette.classList.remove('collapsed');
        resizeIcon.textContent = '▼';
        resizeText.textContent = 'Hide';
        // Reset game wrapper bottom
        if (isMobileDevice()) {
            if (window.innerWidth <= 480) {
                gameWrapper.style.bottom = 'calc(28vh + 5px)';
            } else {
                gameWrapper.style.bottom = 'calc(30vh + 5px)';
            }
        }
        console.log('📦 Palette expanded');
    }

    // Trigger haptic feedback
    triggerHaptic('light');
}

// ==================== RESULTS TAB SWITCHING ====================
function switchResultsTab(tabName) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Remove active class from all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to clicked button
    const clickedBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Show the corresponding tab content
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Haptic feedback
    triggerHaptic('light');
}

// ==================== INITIALIZATION ====================

// Initialize game UI elements (called on page load)
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initializeTooltips();
    initializeQuizToggle();

    // Place initial grid features (city hall, river, and existing neighborhood)
    placeInitialCityHall();
    placeInitialRiver();
    placeInitialNeighborhood();

    renderBuildingPalette();
    renderCityGrid();
    updateUndoButton();
    updateEfficiencyDisplay();

    // DON'T render scene yet - wait for user to start game from start screen
    // renderScene('intro'); // <-- Moved to initializeGame()

    // Show palette resize button on mobile
    if (isMobileDevice()) {
        const resizeBtn = document.getElementById('palette-resize-btn');
        if (resizeBtn) {
            resizeBtn.style.display = 'flex';
        }
        console.log('📱 Mobile device detected - Touch controls enabled');
    }

    console.log('🎮 Game UI initialized - Waiting for player to start');
});

// Initialize gameplay (called when user clicks "Start Game")
function initializeGame() {
    console.log('🎮 Starting gameplay from intro scene');

    // Start the game from the intro scene
    renderScene('intro');

    // Track game start time for achievements
    if (!gameState.gameStartTime) {
        gameState.gameStartTime = Date.now();
    }

    console.log('✅ Game started!');
}

