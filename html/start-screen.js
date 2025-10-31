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

    // Start menu music
    if (typeof audioManager !== 'undefined') {
        setTimeout(() => {
            audioManager.playMusic('menu', true);
        }, 500);
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
            
            // Start the game with selected difficulty
            startGame(selectedDifficulty);
            
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

function startGame(difficulty) {
    // Set difficulty in game state
    if (typeof gameState !== 'undefined') {
        gameState.difficulty = difficulty;
        
        // Apply difficulty settings
        const difficultySettings = difficultyModes[difficulty];
        if (difficultySettings) {
            gameState.cityFunds = difficultySettings.startingFunds;
            gameState.undoCount = difficultySettings.undoLimit;
            gameState.maxRelocations = difficultySettings.buildingRelocations;
            
            // Update UI
            updateStats();
            
            // Update difficulty badge
            const badge = document.getElementById('difficulty-badge');
            if (badge) {
                badge.textContent = `${difficultySettings.icon} ${difficultySettings.name}`;
                badge.style.background = difficultySettings.color;
            }
            
            console.log('🎮 Game started with difficulty:', difficulty);
        }
    }
    
    // Start auto-save
    if (typeof gameAPI !== 'undefined') {
        gameAPI.startAutoSave(
            () => gameState,
            () => calculateFinalScore(),
            () => 'current_scene' // Update this based on your game state
        );
    }
}

function transitionToGame() {
    // Fade out start screen
    startScreen.classList.add('fade-out');

    // Switch to gameplay music
    if (typeof audioManager !== 'undefined') {
        audioManager.playMusic('gameplay', true);
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
    }, 500);
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
                'expert': '⚡'
            }[entry.difficulty] || '🎮';
            
            return `
                <div class="leaderboard-entry">
                    <div class="leaderboard-rank ${rankClass}">#${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${escapeHtml(entry.player_name)} ${diffIcon}</div>
                        <div class="leaderboard-stats">
                            😊 ${entry.happiness || 0} | 💰 ${entry.city_funds || 0} | 
                            🏦 ${entry.special_interest || 0} | 
                            🎯 ${entry.decisions_made || 0} decisions | ${date}
                        </div>
                    </div>
                    <div class="leaderboard-score">${entry.final_score}</div>
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
