// ==================== AUDIO MANAGER ====================
// Handles all background music and sound effects for the game

class AudioManager {
    constructor() {
        // Cache-busting version - increment this whenever you replace audio files
        const audioVersion = '?v=2';

        // Audio file paths (customize these paths to match your audio files)
        this.audioFiles = {
            // Background Music (MP3 format for smaller file sizes)
            music: {
                menu: 'audio/music/menu.mp3' + audioVersion,           // Start screen music
                gameplay: 'audio/music/gameplay.mp3' + audioVersion,   // Main game music
                victory: 'audio/music/victory.mp3' + audioVersion,     // Ending screen (high score)
                defeat: 'audio/music/defeat.mp3' + audioVersion        // Ending screen (low score)
            },

            // Sound Effects (MP3 format for smaller file sizes)
            sfx: {
                // UI Sounds
                buttonClick: 'audio/sfx/button-click.mp3' + audioVersion,
                buttonHover: 'audio/sfx/button-hover.mp3' + audioVersion,
                modalOpen: 'audio/sfx/modal-open.mp3' + audioVersion,
                modalClose: 'audio/sfx/modal-close.mp3' + audioVersion,

                // Game Actions
                buildingPlace: 'audio/sfx/building-place.mp3' + audioVersion,
                buildingUnlock: 'audio/sfx/building-unlock.mp3' + audioVersion,
                choiceSelect: 'audio/sfx/choice-select.mp3' + audioVersion,

                // Stats Changes
                happinessUp: 'audio/sfx/happiness-up.mp3' + audioVersion,
                happinessDown: 'audio/sfx/happiness-down.mp3' + audioVersion,
                moneyGain: 'audio/sfx/money-gain.mp3' + audioVersion,
                moneyLoss: 'audio/sfx/money-loss.mp3' + audioVersion,

                // Timer Sounds
                timerTick: 'audio/sfx/timer-tick.mp3' + audioVersion,
                timerWarning: 'audio/sfx/timer-warning.mp3' + audioVersion,
                timerDanger: 'audio/sfx/timer-danger.mp3' + audioVersion,
                timerCritical: 'audio/sfx/timer-critical.mp3' + audioVersion,
                timeOut: 'audio/sfx/timer-critical.mp3' + audioVersion,  // Reuse critical for timeout

                // Achievements & Rewards
                achievement: 'audio/sfx/achievement.mp3' + audioVersion,
                levelComplete: 'audio/sfx/level-complete.mp3' + audioVersion,

                // Zones
                zoneFormed: 'audio/sfx/zone-formed.mp3' + audioVersion,

                // Notifications
                notification: 'audio/sfx/notification.mp3' + audioVersion,
                success: 'audio/sfx/success.mp3' + audioVersion,
                error: 'audio/sfx/error.mp3' + audioVersion
            }
        };

        // Audio objects storage
        this.musicTracks = {};
        this.soundEffects = {};

        // Current music state
        this.currentMusic = null;
        this.currentMusicPromise = null; // Track pending play promise
        this.musicVolume = 0.4;  // 40% volume for background music
        this.sfxVolume = 0.6;    // 60% volume for sound effects

        // Settings (will be synced with localStorage)
        this.musicEnabled = true;
        this.soundEnabled = true;

        // Initialize
        this.init();
    }

    init() {
        // Load settings from localStorage
        this.loadSettings();

        // Preload audio files
        this.preloadAudio();

        console.log('🎵 Audio Manager initialized');
    }

    loadSettings() {
        // Sync with existing game settings
        const musicSetting = localStorage.getItem('manestreet_music');
        const soundSetting = localStorage.getItem('manestreet_sound');

        this.musicEnabled = musicSetting !== 'false';
        this.soundEnabled = soundSetting !== 'false';

        console.log(`🎵 Music: ${this.musicEnabled ? 'ON' : 'OFF'}`);
        console.log(`🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`);
    }

    preloadAudio() {
        // Preload background music
        for (const [key, path] of Object.entries(this.audioFiles.music)) {
            try {
                const audio = new Audio();
                audio.src = path;
                audio.volume = this.musicVolume;
                audio.loop = (key === 'menu' || key === 'gameplay'); // Loop menu and gameplay music
                audio.preload = 'auto';

                // Force immediate loading
                audio.load();

                this.musicTracks[key] = audio;

                // Add event listener to confirm loading
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Music loaded: ${key}`);
                }, { once: true });
            } catch (error) {
                console.warn(`⚠️ Could not load music: ${key}`, error);
            }
        }

        // PERFORMANCE OPTIMIZATION: Preload ALL sound effects for instant playback
        // Creates audio pool for frequently used sounds (multiple instances)
        const audioPool = {
            buttonClick: 3,    // 3 instances for rapid clicks
            choiceSelect: 2,
            buildingPlace: 2,
            timerCritical: 2
        };

        for (const [key, path] of Object.entries(this.audioFiles.sfx)) {
            try {
                const poolSize = audioPool[key] || 1;
                const instances = [];

                for (let i = 0; i < poolSize; i++) {
                    const audio = new Audio();
                    audio.src = path;
                    audio.volume = this.sfxVolume;
                    audio.preload = 'auto';

                    // Force immediate loading
                    audio.load();

                    instances.push(audio);

                    // Log when loaded
                    audio.addEventListener('canplaythrough', () => {
                        if (i === 0) console.log(`✅ SFX loaded: ${key}`);
                    }, { once: true });
                }

                // Store array of instances for pooling
                this.soundEffects[key] = instances.length === 1 ? instances[0] : instances;

            } catch (error) {
                console.warn(`⚠️ Could not load SFX: ${key}`, error);
            }
        }

        console.log('🎵 Audio files preloaded with pooling for instant playback');
    }

    // ==================== MUSIC CONTROLS ====================

    playMusic(trackName, fadeIn = true) {
        if (!this.musicEnabled) return;

        // Stop current music
        if (this.currentMusic) {
            this.stopMusic(fadeIn);
        }

        // Get the track
        const track = this.musicTracks[trackName];
        if (!track) {
            console.warn(`⚠️ Music track not found: ${trackName}`);
            return;
        }

        // Play with optional fade in
        if (fadeIn) {
            track.volume = 0;
            this.currentMusicPromise = track.play().then(() => {
                this.fadeVolume(track, this.musicVolume, 2000); // Fade in over 2 seconds
                this.currentMusicPromise = null;
            }).catch(err => {
                console.warn(`⚠️ Could not play music: ${trackName}`, err);
                this.currentMusicPromise = null;
            });
        } else {
            track.volume = this.musicVolume;
            this.currentMusicPromise = track.play().then(() => {
                this.currentMusicPromise = null;
            }).catch(err => {
                console.warn(`⚠️ Could not play music: ${trackName}`, err);
                this.currentMusicPromise = null;
            });
        }

        this.currentMusic = track;
        console.log(`🎵 Playing music: ${trackName}`);
    }

    stopMusic(fadeOut = true) {
        if (!this.currentMusic) return;

        if (fadeOut) {
            this.fadeVolume(this.currentMusic, 0, 1000).then(() => {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            });
        } else {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        this.currentMusic = null;
    }

    async pauseMusic() {
        if (this.currentMusic) {
            // Wait for any pending play operation to complete
            if (this.currentMusicPromise) {
                await this.currentMusicPromise.catch(() => {});
            }
            this.currentMusic.pause();
        }
    }

    async resumeMusic() {
        if (this.currentMusic && this.musicEnabled) {
            // Wait for any pending operations
            if (this.currentMusicPromise) {
                await this.currentMusicPromise.catch(() => {});
            }
            this.currentMusicPromise = this.currentMusic.play().then(() => {
                this.currentMusicPromise = null;
            }).catch(err => {
                // Silently handle autoplay restrictions - user hasn't interacted yet
                if (err.name === 'NotAllowedError') {
                    console.log('🎵 Music paused - waiting for user interaction');
                } else {
                    console.warn('⚠️ Could not resume music', err);
                }
                this.currentMusicPromise = null;
            });
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('manestreet_music', this.musicEnabled);

        if (this.musicEnabled) {
            // Resume current track if it was playing
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }

        console.log(`🎵 Music: ${this.musicEnabled ? 'ON' : 'OFF'}`);
        return this.musicEnabled;
    }

    // ==================== SOUND EFFECTS ====================

    playSfx(sfxName, volume = null) {
        if (!this.soundEnabled) return;

        // Get the sound effect (could be single audio or array of pooled instances)
        let sfx = this.soundEffects[sfxName];

        // If not preloaded, load it now (fallback)
        if (!sfx && this.audioFiles.sfx[sfxName]) {
            try {
                sfx = new Audio();
                sfx.src = this.audioFiles.sfx[sfxName];
                sfx.volume = volume !== null ? volume : this.sfxVolume;
                sfx.preload = 'auto';
                sfx.load();
                this.soundEffects[sfxName] = sfx;
            } catch (error) {
                console.warn(`⚠️ Could not load SFX: ${sfxName}`, error);
                return;
            }
        }

        if (!sfx) {
            console.warn(`⚠️ SFX not found: ${sfxName}`);
            return;
        }

        // PERFORMANCE OPTIMIZATION: Use audio pooling for instant playback
        if (Array.isArray(sfx)) {
            // Find a free instance in the pool (one that's not currently playing)
            let availableAudio = sfx.find(audio => audio.paused || audio.ended);

            // If all instances are playing, use the first one anyway (will restart it)
            if (!availableAudio) {
                availableAudio = sfx[0];
            }

            // Reset and play
            availableAudio.currentTime = 0;
            availableAudio.volume = volume !== null ? volume : this.sfxVolume;
            availableAudio.play().catch(err => {
                console.warn(`⚠️ Could not play SFX: ${sfxName}`, err);
            });
        } else {
            // Single instance - clone for overlapping sounds
            const sfxClone = sfx.cloneNode();
            sfxClone.volume = volume !== null ? volume : this.sfxVolume;

            sfxClone.play().catch(err => {
                console.warn(`⚠️ Could not play SFX: ${sfxName}`, err);
            });
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('manestreet_sound', this.soundEnabled);

        console.log(`🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`);
        return this.soundEnabled;
    }

    // ==================== HELPER FUNCTIONS ====================

    fadeVolume(audio, targetVolume, duration) {
        return new Promise((resolve) => {
            const startVolume = audio.volume;
            const volumeDiff = targetVolume - startVolume;
            const steps = 50;
            const stepDuration = duration / steps;
            const stepSize = volumeDiff / steps;

            let currentStep = 0;
            const fadeInterval = setInterval(() => {
                currentStep++;
                audio.volume = Math.max(0, Math.min(1, startVolume + (stepSize * currentStep)));

                if (currentStep >= steps) {
                    clearInterval(fadeInterval);
                    audio.volume = targetVolume;
                    resolve();
                }
            }, stepDuration);
        });
    }

    // ==================== CONVENIENCE METHODS ====================

    // Play UI sounds
    playButtonClick() { this.playSfx('buttonClick'); }
    playButtonHover() { this.playSfx('buttonHover', 0.3); } // Quieter hover
    playModalOpen() { this.playSfx('modalOpen'); }
    playModalClose() { this.playSfx('modalClose'); }

    // Play game action sounds
    playBuildingPlace() { this.playSfx('buildingPlace'); }
    playBuildingUnlock() { this.playSfx('buildingUnlock'); }
    playChoiceSelect() { this.playSfx('choiceSelect'); }

    // Play stat change sounds
    playHappinessUp() { this.playSfx('happinessUp'); }
    playHappinessDown() { this.playSfx('happinessDown'); }
    playMoneyGain() { this.playSfx('moneyGain'); }
    playMoneyLoss() { this.playSfx('moneyLoss'); }

    // Play timer sounds
    playTimerTick() { this.playSfx('timerTick', 0.4); }
    playTimerWarning() { this.playSfx('timerWarning'); }
    playTimerDanger() { this.playSfx('timerDanger'); }
    playTimerCritical() { this.playSfx('timerCritical'); }
    playTimeOut() { this.playSfx('timeOut'); }

    // Play reward sounds
    playAchievement() { this.playSfx('achievement'); }
    playLevelComplete() { this.playSfx('levelComplete'); }
    playZoneFormed() { this.playSfx('zoneFormed'); }

    // Play notification sounds
    playNotification() { this.playSfx('notification'); }
    playSuccess() { this.playSfx('success'); }
    playError() { this.playSfx('error'); }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Make it globally accessible
window.audioManager = audioManager;

console.log('✨ Audio Manager module loaded');
