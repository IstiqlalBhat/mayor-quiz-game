// ==================== BACKEND API CLIENT ====================
// This module handles all communication with the backend server

const API_BASE_URL = window.location.origin + '/api';

class GameAPI {
    constructor() {
        this.sessionId = localStorage.getItem('manestreet_session_id') || null;
        this.autoSaveInterval = null;
    }

    // Initialize a new game session
    async createNewSession(playerName, difficulty = 'normal') {
        try {
            const response = await fetch(`${API_BASE_URL}/game/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName, difficulty })
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.session.session_id;
                localStorage.setItem('manestreet_session_id', this.sessionId);
                console.log('✅ New game session created:', this.sessionId);
                return data.session;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error creating session:', error);
            return null;
        }
    }

    // Save current game state to backend
    async saveGame(gameState, score, currentScene) {
        if (!this.sessionId) {
            console.warn('⚠️ No active session, skipping save');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/game/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    gameState,
                    score,
                    currentScene
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('💾 Game saved successfully');
                return data.save;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error saving game:', error);
            return null;
        }
    }

    // Load game state from backend
    async loadGame(sessionId) {
        const loadSessionId = sessionId || this.sessionId;
        
        if (!loadSessionId) {
            console.warn('⚠️ No session ID provided');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/game/load/${loadSessionId}`);
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = loadSessionId;
                localStorage.setItem('manestreet_session_id', this.sessionId);
                console.log('📥 Game loaded successfully');
                return data.save;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error loading game:', error);
            return null;
        }
    }

    // Submit final game score
    async completeGame(stats) {
        if (!this.sessionId) {
            console.warn('⚠️ No active session');
            return { success: false, error: 'No active session' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/game/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    ...stats
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Server error:', response.status, data.error);
                return { 
                    success: false, 
                    error: data.error || `Server error (${response.status})`,
                    status: response.status
                };
            }
            
            if (data.success) {
                console.log('🏆 Game completed successfully');
                return { success: true, session: data.session };
            } else {
                console.error('❌ Completion failed:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('❌ Error completing game:', error);
            return { 
                success: false, 
                error: 'Failed to submit score. Please check your connection.' 
            };
        }
    }

    // Get leaderboard
    async getLeaderboard(difficulty = null, limit = 10) {
        try {
            let url = `${API_BASE_URL}/leaderboard?limit=${limit}`;
            if (difficulty) {
                url += `&difficulty=${difficulty}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                console.log('📊 Leaderboard fetched');
                return data.leaderboard;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    // Get player stats
    async getStats(sessionId) {
        const statsSessionId = sessionId || this.sessionId;
        
        if (!statsSessionId) {
            console.warn('⚠️ No session ID');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/stats/${statsSessionId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.stats;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            return null;
        }
    }

    // Get analytics summary
    async getAnalytics() {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/summary`);
            const data = await response.json();
            
            if (data.success) {
                return data.analytics;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
            return null;
        }
    }

    // Start auto-save (saves every 30 seconds)
    startAutoSave(gameStateGetter, scoreGetter, sceneGetter) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            const state = gameStateGetter();
            const score = scoreGetter();
            const scene = sceneGetter();
            this.saveGame(state, score, scene);
        }, 30000); // Save every 30 seconds

        console.log('🔄 Auto-save enabled (every 30 seconds)');
    }

    // Stop auto-save
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-save disabled');
        }
    }

    // Clear current session
    clearSession() {
        this.sessionId = null;
        localStorage.removeItem('manestreet_session_id');
        this.stopAutoSave();
        console.log('🗑️ Session cleared');
    }

    // Check if there's an active session
    hasActiveSession() {
        return this.sessionId !== null;
    }

    // Test backend connection
    async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            console.log('🏥 Backend health:', data);
            return data.status === 'ok';
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            return false;
        }
    }
}

// Create global API instance
const gameAPI = new GameAPI();

// Test connection on load
gameAPI.testConnection();
