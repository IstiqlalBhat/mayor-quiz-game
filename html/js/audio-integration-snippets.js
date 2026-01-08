// ==================== AUDIO INTEGRATION SNIPPETS ====================
// Copy and paste these into your existing files

// ==================== 1. ADD TO index.html ====================
/*
Add this script tag BEFORE game.js and AFTER api-client.js:

<script src="api-client.js"></script>
<script src="audio-manager.js"></script>  <!-- ADD THIS LINE -->
<script src="start-screen.js"></script>
<script src="game.js"></script>
*/

// ==================== 2. UPDATE start-screen.js ====================

// Replace the toggleMusic() function:
function toggleMusic() {
    gameSettings.music = !gameSettings.music;
    localStorage.setItem('manestreet_music', gameSettings.music);
    updateSettingsUI();

    // Use audio manager
    if (typeof audioManager !== 'undefined') {
        audioManager.toggleMusic();
    }

    console.log('🎵 Music:', gameSettings.music ? 'On' : 'Off');
}

// Replace the toggleSound() function:
function toggleSound() {
    gameSettings.sound = !gameSettings.sound;
    localStorage.setItem('manestreet_sound', gameSettings.sound);
    updateSettingsUI();

    // Use audio manager
    if (typeof audioManager !== 'undefined') {
        audioManager.toggleSound();
    }

    console.log('🔊 Sound:', gameSettings.sound ? 'On' : 'Off');
}

// Add to initializeStartScreen() - near the end:
function initializeStartScreen() {
    // ... existing code ...

    // Start menu music
    if (typeof audioManager !== 'undefined') {
        setTimeout(() => {
            audioManager.playMusic('menu', true);
        }, 500);
    }

    console.log('🎮 Start screen initialized');
}

// Add to handleConfirmStart() - at the beginning:
async function handleConfirmStart() {
    // Play button click sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playButtonClick();
    }

    // ... rest of existing code ...
}

// ==================== 3. UPDATE game.js ====================

// Add to transitionToGame() function:
function transitionToGame() {
    startScreen.classList.add('fade-out');

    // Switch to gameplay music
    if (typeof audioManager !== 'undefined') {
        audioManager.playMusic('gameplay', true);
    }

    setTimeout(() => {
        // ... existing code ...
    }, 500);
}

// Add to makeChoice() function (near the beginning):
function makeChoice(sceneKey, choiceIndex, isTimedOut = false) {
    if (gameState.timerExpired && !isTimedOut) {
        // ... existing code ...
        return;
    }

    stopTimer();

    // Play choice sound
    if (!isTimedOut && typeof audioManager !== 'undefined') {
        audioManager.playChoiceSelect();
    }

    // ... rest of existing code ...
}

// Add to placeBuilding() function (after successful placement):
// Around line 500, after gameState.cityGrid[cellIndex] = { building, adjacencyBonus };
if (typeof audioManager !== 'undefined') {
    audioManager.playBuildingPlace();
}

// Add to unlockBuildings() function:
function unlockBuildings(buildingIds) {
    // ... existing code ...

    // Play unlock sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playBuildingUnlock();
    }

    // ... rest of code ...
}

// Add to unlockAchievement() function:
function unlockAchievement(achievementId) {
    // ... existing code ...

    // Play achievement sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playAchievement();
    }

    showToast(/* ... */);
}

// Add to updateTimerDisplay() function (in the critical section):
if (gameState.timerSeconds <= criticalThreshold) {
    timerContainer.classList.add('critical');
    if (barFill) barFill.classList.add('critical');

    // Play critical sound once
    if (Math.ceil(criticalThreshold) === gameState.timerSeconds) {
        timerContainer.setAttribute('data-sound-trigger', 'critical');
        console.log('🔊 Audio Hook: Critical warning!');

        // Play sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playTimerCritical();
        }
    }
}

// Add to handleTimeout() function (at the beginning):
function handleTimeout() {
    stopTimer();
    gameState.timerExpired = true;

    // Play timeout sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playTimeOut();
    }

    console.log('⏰ TIME\'S UP! Failed to make a decision - applying penalties');
    // ... rest of code ...
}

// Add to renderEnding() function (after calculating finalScore):
function renderEnding() {
    // ... existing code to calculate finalScore ...

    // Play victory or defeat music based on score
    if (typeof audioManager !== 'undefined') {
        if (finalScore >= 70) {
            audioManager.playMusic('victory', true);
        } else if (finalScore < 30) {
            audioManager.playMusic('defeat', true);
        } else {
            audioManager.playMusic('victory', true);
        }
    }

    // ... rest of code ...
}

// Add to detectZones() function (when a new zone is formed):
// After: gameState.detectedZones.push(zone);
if (typeof audioManager !== 'undefined') {
    audioManager.playZoneFormed();
}

// ==================== 4. ADD TO ALL BUTTONS (Optional) ====================

// Add hover sounds to buttons:
document.querySelectorAll('button, .choice-card, .building-card').forEach(button => {
    button.addEventListener('mouseenter', () => {
        if (typeof audioManager !== 'undefined') {
            audioManager.playButtonHover();
        }
    });
});

// Add click sounds to all buttons:
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        if (typeof audioManager !== 'undefined') {
            audioManager.playButtonClick();
        }
    });
});

// ==================== 5. STAT CHANGE SOUNDS (Optional) ====================

// Add to applyEffects() function in game.js:
function applyEffects(effects) {
    const oldHappiness = gameState.happiness;
    const oldFunds = gameState.cityFunds;

    // ... existing code that changes stats ...

    // Play sounds based on changes
    if (typeof audioManager !== 'undefined') {
        if (gameState.happiness > oldHappiness) {
            audioManager.playHappinessUp();
        } else if (gameState.happiness < oldHappiness) {
            audioManager.playHappinessDown();
        }

        if (gameState.cityFunds > oldFunds) {
            audioManager.playMoneyGain();
        } else if (gameState.cityFunds < oldFunds) {
            audioManager.playMoneyLoss();
        }
    }

    updateStats();
}

// ==================== TESTING IN CONSOLE ====================
/*
After adding the audio manager, test in browser console:

// Test if audio manager is loaded
console.log(audioManager);

// Test music
audioManager.playMusic('menu');
audioManager.stopMusic();

// Test sound effects
audioManager.playButtonClick();
audioManager.playChoiceSelect();
audioManager.playAchievement();

// Toggle settings
audioManager.toggleMusic();
audioManager.toggleSound();

// Adjust volumes
audioManager.setMusicVolume(0.3);  // 30%
audioManager.setSfxVolume(0.7);    // 70%
*/
