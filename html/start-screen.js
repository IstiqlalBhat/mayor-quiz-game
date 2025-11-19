// ==================== START SCREEN LOGIC ====================

// Settings stored in localStorage
const gameSettings = {
    music: localStorage.getItem('manestreet_music') !== 'false',
    sound: localStorage.getItem('manestreet_sound') !== 'false',
};

// Selected difficulty (default: normal)
let selectedDifficulty = 'normal';

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameWrapper = document.getElementById('game-wrapper');
const playerModal = document.getElementById('player-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');

const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const musicBtn = document.getElementById('music-btn');
const soundBtn = document.getElementById('sound-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');

const playerNameInput = document.getElementById('player-name');
const cancelStartBtn = document.getElementById('cancel-start-btn');
const confirmStartBtn = document.getElementById('confirm-start-btn');

const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// ==================== INITIALIZATION ====================

function initializeStartScreen() {
    // Update UI with saved settings
    updateSettingsUI();
    
    // Event Listeners
    startBtn.addEventListener('click', handleStartClick);
    quitBtn.addEventListener('click', handleQuitClick);
    musicBtn.addEventListener('click', toggleMusic);
    soundBtn.addEventListener('click', toggleSound);
    leaderboardBtn.addEventListener('click', showLeaderboard);
    
    cancelStartBtn.addEventListener('click', hidePlayerModal);
    confirmStartBtn.addEventListener('click', handleConfirmStart);
    closeLeaderboardBtn.addEventListener('click', hideLeaderboard);
    
    // Difficulty button selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedDifficulty = this.dataset.difficulty;
        });
    });
    
    // Allow Enter key to submit name
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleConfirmStart();
        }
    });
    
    // Filter buttons for leaderboard
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            loadLeaderboard(filter === 'all' ? null : filter);
        });
    });

    // Start menu music (will wait for user interaction due to browser autoplay policy)
    if (typeof audioManager !== 'undefined') {
        // Try to play immediately (will only work if user already interacted)
        setTimeout(() => {
            audioManager.playMusic('menu', true);
        }, 500);

        // Also add a one-time click handler to start music on first interaction
        const startMusicOnInteraction = () => {
            if (audioManager.musicEnabled && (!audioManager.currentMusic || audioManager.currentMusic.paused)) {
                audioManager.playMusic('menu', true);
            }
            // Remove listener after first interaction
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
        };
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
    }

    console.log('🎮 Start screen initialized');
}

// ==================== SETTINGS ====================

function updateSettingsUI() {
    document.getElementById('music-status').textContent = gameSettings.music ? 'On' : 'Off';
    document.getElementById('sound-status').textContent = gameSettings.sound ? 'On' : 'Off';
    
    // Update button colors
    musicBtn.style.background = gameSettings.music 
        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9))'
        : 'linear-gradient(135deg, rgba(158, 158, 158, 0.9), rgba(117, 117, 117, 0.9))';
    
    soundBtn.style.background = gameSettings.sound 
        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9))'
        : 'linear-gradient(135deg, rgba(158, 158, 158, 0.9), rgba(117, 117, 117, 0.9))';
}

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

// ==================== START GAME FLOW ====================

function handleStartClick() {
    // Show player setup modal
    playerModal.style.display = 'flex';
    playerNameInput.value = '';
    playerNameInput.focus();
}

function hidePlayerModal() {
    playerModal.style.display = 'none';
}

async function handleConfirmStart() {
    // Play button click sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playButtonClick();
    }

    const playerName = playerNameInput.value.trim();

    // Validate name
    if (!playerName) {
        alert('Please enter your name!');
        playerNameInput.focus();
        return;
    }

    if (playerName.length < 2) {
        alert('Name must be at least 2 characters long!');
        playerNameInput.focus();
        return;
    }

    // Show loading state
    confirmStartBtn.textContent = 'Starting...';
    confirmStartBtn.disabled = true;
    
    try {
        // Create new game session in backend
        console.log('📝 Creating session for:', playerName, 'Difficulty:', selectedDifficulty);
        const session = await gameAPI.createNewSession(playerName, selectedDifficulty);
        
        if (session) {
            console.log('✅ Session created successfully:', session.session_id);

            // Hide modal
            hidePlayerModal();

            // Set difficulty directly (game.js is loaded by the time user clicks)
            if (typeof gameState !== 'undefined' && typeof difficultyModes !== 'undefined') {
                const mode = difficultyModes[selectedDifficulty];
                if (mode) {
                    gameState.difficulty = mode;
                    gameState.cityFunds = mode.startingFunds;
                    gameState.maxRelocations = mode.buildingRelocations;
                    gameState.undoCount = mode.undoLimit;

                    console.log('🎮 Difficulty set:', mode.name);
                    console.log('  ⏰ Timer:', mode.timerPerScene + 's');
                    console.log('  💰 Starting Funds: $' + mode.startingFunds + 'M');
                    console.log('  🔄 Relocations:', mode.buildingRelocations);
                    console.log('  ↶ Undos:', mode.undoLimit);
                    console.log('  🔍 gameState.difficulty:', gameState.difficulty);

                    // Update UI elements if functions are available
                    if (typeof updateStats === 'function') {
                        updateStats();
                    }
                    if (typeof updateUndoButton === 'function') {
                        updateUndoButton();
                    }

                    // Update difficulty badge
                    const badge = document.getElementById('difficulty-badge');
                    if (badge) {
                        badge.textContent = mode.icon + ' ' + mode.name;
                        badge.style.background = mode.color;
                    }

                    // Track game start time for achievements
                    gameState.gameStartTime = Date.now();
                } else {
                    console.error('❌ Invalid difficulty mode:', selectedDifficulty);
                }
            } else {
                console.error('❌ gameState or difficultyModes not available');
            }

            // Transition from start screen to game
            transitionToGame();
        } else {
            throw new Error('Failed to create session');
        }
    } catch (error) {
        console.error('❌ Error starting game:', error);
        alert('Failed to start game. Please try again!');
    } finally {
        confirmStartBtn.textContent = 'Begin Term';
        confirmStartBtn.disabled = false;
    }
}

// Note: Difficulty is now set using selectDifficulty() from game.js
// This function has been removed to avoid conflicts with game.js's startGame()

function transitionToGame() {
    // Fade out start screen
    startScreen.classList.add('fade-out');

    // Switch to gameplay music
    if (typeof audioManager !== 'undefined') {
        audioManager.playMusic('gameplay', true);
    }

    // Start auto-save
    if (typeof gameAPI !== 'undefined') {
        gameAPI.startAutoSave(
            () => gameState,
            () => calculateFinalScore(),
            () => gameState.currentScene // Track actual current scene
        );
    }

    // After animation, hide start screen and show game
    setTimeout(() => {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        gameWrapper.style.animation = 'fadeIn 0.5s ease';

        // Initialize game if needed
        if (typeof initializeGame === 'function') {
            initializeGame();
        }

        // Check if tutorial should be shown for first-time players
        checkAndShowTutorial();
    }, 500);
}

// Check if this is the player's first time and show tutorial
// Note: Tutorial will be shown when first choice scene renders, not immediately
function checkAndShowTutorial() {
    const hasPlayed = localStorage.getItem('manestreet_played');
    const tutorialStatus = localStorage.getItem('manestreet_tutorial');

    // Flag that tutorial should show when first timed choice appears
    if (!hasPlayed && tutorialStatus !== 'declined' && tutorialStatus !== 'skipped' && tutorialStatus !== 'completed') {
        console.log('📚 First-time player detected - tutorial will show on first choice');
        // Set flag so renderScene knows to show tutorial
        window.shouldShowTutorial = true;
    } else {
        console.log('📚 Returning player - skipping tutorial');
        window.shouldShowTutorial = false;
        // Mark as played if not already
        if (!hasPlayed) {
            localStorage.setItem('manestreet_played', 'true');
        }
    }
}

// ==================== LEADERBOARD ====================

async function showLeaderboard() {
    leaderboardModal.style.display = 'flex';
    loadLeaderboard(null); // Load all difficulties
}

function hideLeaderboard() {
    leaderboardModal.style.display = 'none';
}

async function loadLeaderboard(difficulty = null) {
    leaderboardList.innerHTML = '<div class="loading">Loading leaderboard...</div>';

    try {
        const leaderboard = await gameAPI.getLeaderboard(difficulty, 20);

        if (!leaderboard || leaderboard.length === 0) {
            leaderboardList.innerHTML = '<div class="loading">No scores yet. Be the first!</div>';
            return;
        }

        // Store leaderboard data globally for modal access
        window.leaderboardData = leaderboard;

        // Display leaderboard entries
        leaderboardList.innerHTML = leaderboard.map((entry, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            const date = new Date(entry.completed_at).toLocaleDateString();
            const diffIcon = {
                'easy': '🌱',
                'normal': '⚖️',
                'hard': '🔥',
                'mayor': '👔'
            }[entry.difficulty] || '🎮';

            return `
                <div class="leaderboard-entry">
                    <div class="leaderboard-rank ${rankClass}">#${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${escapeHtml(entry.player_name)} ${diffIcon}</div>
                        <div class="leaderboard-stats">
                            😊 ${entry.happiness || 0} | 💰 ${entry.city_funds || 0} |
                            🏛️ ${entry.special_interest || 0} |
                            🎯 ${entry.decisions_made || 0} decisions | ${date}
                        </div>
                    </div>
                    <div class="leaderboard-score">${entry.final_score}</div>
                    <button class="more-btn" onclick="showPlayerDetails(${index})">More</button>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<div class="loading">Failed to load leaderboard</div>';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show player details modal
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
    const achievementDefs = window.achievementDefinitions || {};
    const validAchievements = playerAchievements.filter(id => achievementDefs[id]);
    let achievementsHTML = '';

    if (validAchievements.length > 0) {
        achievementsHTML = `
            <div class="player-detail-section">
                <h4>🏆 Achievements Earned (${validAchievements.length})</h4>
                <div class="player-achievements-grid">
                    ${validAchievements.map(id => {
                        const def = achievementDefs[id];
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
                    <h2>${escapeHtml(player.player_name)}</h2>
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
        card.addEventListener('click', function(e) {
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
    if (typeof triggerHaptic === 'function') {
        triggerHaptic('medium');
    }
}

// Close player details modal
function closePlayerDetails(event) {
    if (event && event.target.className !== 'player-details-modal') return;

    const container = document.getElementById('player-details-container');
    if (container) {
        container.remove();
    }
    if (typeof triggerHaptic === 'function') {
        triggerHaptic('light');
    }
}

// Make functions globally available
window.showPlayerDetails = showPlayerDetails;
window.closePlayerDetails = closePlayerDetails;

// ==================== QUIT ====================

function handleQuitClick() {
    const confirmQuit = confirm('Are you sure you want to quit?');
    if (confirmQuit) {
        // You could redirect to another page or close the window
        // For now, we'll just refresh
        window.location.reload();
    }
}

// ==================== HELPER FUNCTIONS ====================

// Calculate final score (if not already defined in game.js)
function calculateFinalScore() {
    if (typeof gameState === 'undefined') return 0;
    
    const avgStats = Math.round(
        (gameState.happiness + gameState.cityFunds + gameState.specialInterest) / 3
    );
    
    // Add bonus for planning efficiency
    const efficiencyBonus = Math.round(gameState.planningEfficiency / 2);
    
    return avgStats + efficiencyBonus;
}

// ==================== EXPORTS ====================

// Make settings accessible to other scripts
window.gameSettings = gameSettings;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStartScreen);
} else {
    initializeStartScreen();
}

console.log('✨ Start screen module loaded');
