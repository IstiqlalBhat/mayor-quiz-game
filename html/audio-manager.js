// ==================== AUDIO MANAGER ====================
// Handles all background music and sound effects for the game

class AudioManager {
    constructor() {
        // Audio file paths (customize these paths to match your audio files)
        this.audioFiles = {
            // Background Music (MP3 format for smaller file sizes)
            music: {
                menu: 'audio/music/menu.mp3',           // Start screen music
                gameplay: 'audio/music/gameplay.mp3',   // Main game music
                victory: 'audio/music/victory.mp3',     // Ending screen (high score)
                defeat: 'audio/music/defeat.mp3'        // Ending screen (low score)
            },

            // Sound Effects (MP3 format for smaller file sizes)
            sfx: {
                // UI Sounds
                buttonClick: 'audio/sfx/button-click.mp3',
                buttonHover: 'audio/sfx/button-hover.mp3',
                modalOpen: 'audio/sfx/modal-open.mp3',
                modalClose: 'audio/sfx/modal-close.mp3',

                // Game Actions
                buildingPlace: 'audio/sfx/building-place.mp3',
                buildingUnlock: 'audio/sfx/building-unlock.mp3',
                choiceSelect: 'audio/sfx/choice-select.mp3',

                // Stats Changes
                happinessUp: 'audio/sfx/happiness-up.mp3',
                happinessDown: 'audio/sfx/happiness-down.mp3',
                moneyGain: 'audio/sfx/money-gain.mp3',
                moneyLoss: 'audio/sfx/money-loss.mp3',

                // Timer Sounds
                timerTick: 'audio/sfx/timer-tick.mp3',
                timerWarning: 'audio/sfx/timer-warning.mp3',
                timerDanger: 'audio/sfx/timer-danger.mp3',
                timerCritical: 'audio/sfx/timer-critical.mp3',
                timeOut: 'audio/sfx/timer-critical.mp3',  // Reuse critical for timeout

                // Achievements & Rewards
                achievement: 'audio/sfx/achievement.mp3',
                levelComplete: 'audio/sfx/level-complete.mp3',

                // Zones
                zoneFormed: 'audio/sfx/zone-formed.mp3',

                // Notifications
                notification: 'audio/sfx/notification.mp3',
                success: 'audio/sfx/success.mp3',
                error: 'audio/sfx/error.mp3'
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
                const audio = new Audio(path);
                audio.volume = this.musicVolume;
                audio.loop = (key === 'menu' || key === 'gameplay'); // Loop menu and gameplay music
                audio.preload = 'auto';
                this.musicTracks[key] = audio;
            } catch (error) {
                console.warn(`⚠️ Could not load music: ${key}`, error);
            }
        }

        // Preload sound effects (only common ones to save memory)
        const prioritySfx = [
            'buttonClick', 'choiceSelect', 'buildingPlace',
            'achievement', 'timerCritical', 'success', 'error'
        ];

        for (const key of prioritySfx) {
            if (this.audioFiles.sfx[key]) {
                try {
                    const audio = new Audio(this.audioFiles.sfx[key]);
                    audio.volume = this.sfxVolume;
                    audio.preload = 'auto';
                    this.soundEffects[key] = audio;
                } catch (error) {
                    console.warn(`⚠️ Could not load SFX: ${key}`, error);
                }
            }
        }

        console.log('🎵 Audio files preloaded');
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

        // Check if already loaded
        let sfx = this.soundEffects[sfxName];

        // If not preloaded, load it now
        if (!sfx && this.audioFiles.sfx[sfxName]) {
            try {
                sfx = new Audio(this.audioFiles.sfx[sfxName]);
                sfx.volume = volume !== null ? volume : this.sfxVolume;
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

        // Clone the audio node to allow overlapping sounds
        const sfxClone = sfx.cloneNode();
        sfxClone.volume = volume !== null ? volume : this.sfxVolume;

        sfxClone.play().catch(err => {
            console.warn(`⚠️ Could not play SFX: ${sfxName}`, err);
        });
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
