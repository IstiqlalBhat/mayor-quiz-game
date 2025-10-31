# Adding Music and Sound Effects to Mayor Quiz Game

Complete guide for adding audio to your game.

## Table of Contents
1. [Quick Setup](#quick-setup)
2. [File Structure](#file-structure)
3. [Getting Audio Files](#getting-audio-files)
4. [Integration Steps](#integration-steps)
5. [Testing](#testing)
6. [Customization](#customization)

---

## Quick Setup

### Step 1: Create Audio Folders

Create this folder structure in your `html/` directory:

```
html/
├── audio/
│   ├── music/
│   │   ├── menu.mp3
│   │   ├── gameplay.mp3
│   │   ├── victory.mp3
│   │   └── defeat.mp3
│   └── sfx/
│       ├── button-click.mp3
│       ├── choice-select.mp3
│       ├── building-place.mp3
│       ├── achievement.mp3
│       ├── timer-critical.mp3
│       ├── success.mp3
│       └── error.mp3
├── audio-manager.js (already created)
├── index.html
└── ... (other files)
```

**Windows (PowerShell)**:
```powershell
cd html
New-Item -ItemType Directory -Path "audio/music"
New-Item -ItemType Directory -Path "audio/sfx"
```

**Mac/Linux**:
```bash
cd html
mkdir -p audio/music audio/sfx
```

### Step 2: Add Audio Manager to HTML

Open `html/index.html` and add this script BEFORE `game.js`:

```html
<!-- Add this in the <head> or before closing </body> -->
<script src="audio-manager.js"></script>
<script src="start-screen.js"></script>
<script src="game.js"></script>
```

### Step 3: Update Settings Buttons

The audio manager is already integrated with your existing settings! Just update the toggle functions in `start-screen.js`:

```javascript
// In start-screen.js - Update these functions:

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
```

---

## File Structure

### Recommended Audio Files

**Background Music** (4 files):
- `menu.mp3` - Calm, welcoming music for start screen (loops)
- `gameplay.mp3` - Upbeat decision-making music (loops)
- `victory.mp3` - Triumphant music for high scores
- `defeat.mp3` - Somber music for low scores

**Sound Effects** (Minimum 7, Optional 20+):

**Essential (Start with these)**:
- `button-click.mp3` - UI button clicks
- `choice-select.mp3` - Making a decision
- `building-place.mp3` - Placing a building
- `achievement.mp3` - Unlocking achievements
- `timer-critical.mp3` - Timer running out
- `success.mp3` - Positive feedback
- `error.mp3` - Negative feedback

**Optional (Add later)**:
- `button-hover.mp3` - Button hover feedback
- `modal-open.mp3` - Opening dialogs
- `modal-close.mp3` - Closing dialogs
- `building-unlock.mp3` - Unlocking new buildings
- `happiness-up.mp3` - Happiness increases
- `happiness-down.mp3` - Happiness decreases
- `money-gain.mp3` - Money increases
- `money-loss.mp3` - Money decreases
- `timer-tick.mp3` - Clock ticking
- `timer-warning.mp3` - Timer warning state
- `timer-danger.mp3` - Timer danger state
- `timeout.mp3` - Timer expired
- `level-complete.mp3` - Completing a chapter
- `zone-formed.mp3` - Zone detection
- `notification.mp3` - General notifications

---

## Getting Audio Files

### Option 1: Free Royalty-Free Audio Sites

**Music**:
1. **Incompetech** - https://incompetech.com/music/royalty-free/
   - Search: "corporate", "calm", "upbeat", "victory"
   - License: Attribution required (credit Kevin MacLeod)
   - Format: MP3
   - Perfect for: Menu and gameplay music

2. **Free Music Archive** - https://freemusicarchive.org
   - Filter by "Commercial use allowed"
   - Great variety of genres
   - Check individual licenses

3. **Purple Planet Music** - https://www.purple-planet.com
   - Free for non-commercial and commercial use
   - Just credit them
   - Good selection of game music

4. **Bensound** - https://www.bensound.com
   - Free with attribution
   - High-quality tracks
   - Good for background music

**Sound Effects**:
1. **Freesound** - https://freesound.org
   - Huge library of sound effects
   - Search terms: "button", "click", "success", "achievement", "error"
   - Filter by license (CC0 = no attribution needed)
   - Format: Multiple (convert to MP3)

2. **Zapsplat** - https://www.zapsplat.com
   - Free with attribution
   - Game UI sounds section
   - High quality
   - Easy download

3. **Mixkit** - https://mixkit.co/free-sound-effects/
   - 100% free, no attribution required
   - Video game sound effects section
   - MP3 format

4. **Pixabay Audio** - https://pixabay.com/sound-effects/
   - Free, no attribution required
   - Search: "game", "button", "notification"
   - Good quality

### Option 2: AI-Generated Audio

**Music**:
- **Soundraw** - https://soundraw.io (free tier available)
- **AIVA** - https://www.aiva.ai (free tier)
- **Mubert** - https://mubert.com/render (AI-generated)

**Sound Effects**:
- **Riffusion** - Can generate short sound effects
- **Audio generators** on Hugging Face Spaces

### Option 3: Create Your Own

**Music**:
- **Garage Band** (Mac) - Free, easy to use
- **LMMS** (Windows/Mac/Linux) - Free, powerful
- **Bosca Ceoil** - Free, simple music maker

**Sound Effects**:
- **Audacity** - Free audio editor, record your own
- **Bfxr** - https://www.bfxr.net/ - Generate retro game sounds
- **ChipTone** - https://sfbgames.itch.io/chiptone - 8-bit sound generator

---

## Integration Steps

### Step 1: Add Audio to Start Screen

In `start-screen.js`, add music when the start screen loads:

```javascript
// Add this to initializeStartScreen() function:
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

// When clicking "Start Game":
function handleConfirmStart() {
    // ... existing code ...

    // Play button click sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playButtonClick();
    }

    // ... rest of code ...
}
```

### Step 2: Add Audio to Game Events

In `game.js`, add these sound effects:

```javascript
// When game starts (in transitionToGame function):
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

// When making a choice (in makeChoice function):
function makeChoice(sceneKey, choiceIndex, isTimedOut = false) {
    // ... existing code ...

    // Play choice sound
    if (!isTimedOut && typeof audioManager !== 'undefined') {
        audioManager.playChoiceSelect();
    }

    // ... rest of code ...
}

// When placing a building (in placeBuilding function):
function placeBuilding(cellIndex, building) {
    // ... existing code after successful placement ...

    if (typeof audioManager !== 'undefined') {
        audioManager.playBuildingPlace();
    }

    // ... rest of code ...
}

// When unlocking buildings (in unlockBuildings function):
function unlockBuildings(buildingIds) {
    // ... existing code ...

    if (typeof audioManager !== 'undefined') {
        audioManager.playBuildingUnlock();
    }

    // ... rest of code ...
}

// When unlocking achievement (in unlockAchievement function):
function unlockAchievement(achievementId) {
    // ... existing code ...

    if (typeof audioManager !== 'undefined') {
        audioManager.playAchievement();
    }

    // ... rest of code ...
}

// When timer is critical (in updateTimerDisplay function):
function updateTimerDisplay() {
    // ... existing code ...

    if (gameState.timerSeconds <= criticalThreshold) {
        // ... existing code ...

        // Play critical sound once
        if (Math.ceil(criticalThreshold) === gameState.timerSeconds) {
            if (typeof audioManager !== 'undefined') {
                audioManager.playTimerCritical();
            }
        }
    }
}

// When timer runs out (in handleTimeout function):
function handleTimeout() {
    stopTimer();
    gameState.timerExpired = true;

    if (typeof audioManager !== 'undefined') {
        audioManager.playTimeOut();
    }

    // ... rest of code ...
}

// When game ends (in renderEnding function):
function renderEnding() {
    // ... existing code to calculate finalScore ...

    // Play victory or defeat music based on score
    if (typeof audioManager !== 'undefined') {
        if (finalScore >= 70) {
            audioManager.playMusic('victory', true);
        } else if (finalScore < 30) {
            audioManager.playMusic('defeat', true);
        } else {
            audioManager.playMusic('victory', true); // Decent mayors get victory too
        }
    }

    // ... rest of code ...
}
```

### Step 3: Add Button Sounds

Add to all buttons in your game:

```javascript
// Example: Add to any button click handler
document.querySelector('.some-button').addEventListener('click', () => {
    if (typeof audioManager !== 'undefined') {
        audioManager.playButtonClick();
    }
    // ... your button logic ...
});

// Example: Add hover sounds
document.querySelector('.some-button').addEventListener('mouseenter', () => {
    if (typeof audioManager !== 'undefined') {
        audioManager.playButtonHover();
    }
});
```

---

## Testing

### 1. Test Audio Manager Initialization

Open browser console (F12) and check for:
```
🎵 Audio Manager initialized
🎵 Music: ON
🔊 Sound: ON
🎵 Audio files preloaded
```

### 2. Test Settings Toggle

Click the music/sound buttons on start screen:
```javascript
// In console, test manually:
audioManager.toggleMusic();  // Should pause/resume music
audioManager.toggleSound();  // Should enable/disable sound effects
```

### 3. Test Individual Sounds

In browser console:
```javascript
// Test background music
audioManager.playMusic('menu');
audioManager.playMusic('gameplay');

// Test sound effects
audioManager.playButtonClick();
audioManager.playChoiceSelect();
audioManager.playAchievement();
audioManager.playTimerCritical();
```

### 4. Test Volume Control

```javascript
// Adjust volumes (0.0 to 1.0)
audioManager.setMusicVolume(0.3);  // 30% volume
audioManager.setSfxVolume(0.5);    // 50% volume
```

### 5. Check if Audio Files Load

Look for warnings in console:
```
✅ Good: No warnings = all audio files loaded
⚠️ Warning: "Could not load music: menu" = file missing or wrong path
```

---

## Customization

### Change Audio File Paths

Edit `audio-manager.js`:

```javascript
this.audioFiles = {
    music: {
        menu: 'assets/sounds/music/start-music.mp3',  // Custom path
        gameplay: 'sounds/bg-music.mp3',              // Different folder
        // ...
    },
    sfx: {
        buttonClick: 'sfx/click.wav',  // Can use .wav files too
        // ...
    }
};
```

### Add More Sound Effects

In `audio-manager.js`, add to the `sfx` object:

```javascript
sfx: {
    // ... existing sounds ...

    // Your custom sounds
    buildingDemolish: 'audio/sfx/demolish.mp3',
    gridHover: 'audio/sfx/grid-hover.mp3',
    coinCollect: 'audio/sfx/coin.mp3'
}
```

Then add convenience method:

```javascript
playBuildingDemolish() { this.playSfx('buildingDemolish'); }
```

### Adjust Volume Levels

In `audio-manager.js` constructor:

```javascript
constructor() {
    // ...
    this.musicVolume = 0.3;  // 30% (quieter background music)
    this.sfxVolume = 0.7;    // 70% (louder sound effects)
}
```

### Change Music Looping

```javascript
// In preloadAudio() function:
audio.loop = (key === 'menu' || key === 'gameplay'); // Loop these tracks

// To make ALL music loop:
audio.loop = true;

// To make NO music loop:
audio.loop = false;
```

---

## File Format Tips

### Recommended Formats

**Best**: MP3
- Widely supported
- Good compression
- Small file size

**Also Good**: OGG, M4A
- Better quality
- Smaller than WAV

**Avoid**: WAV (too large for web)

### Converting Audio Files

**Using Online Tools**:
- **CloudConvert** - https://cloudconvert.com/
- **Online Audio Converter** - https://online-audio-converter.com/

**Using Software**:
- **Audacity** (Free) - Export as MP3
- **FFmpeg** (Command line):
  ```bash
  ffmpeg -i input.wav -b:a 128k output.mp3
  ```

### Recommended Settings

- **Music**: 128 kbps MP3, 44.1kHz
- **SFX**: 96 kbps MP3, 44.1kHz (shorter = lower bitrate OK)
- **Keep files under**:
  - Music: 3-5 MB per track
  - SFX: 50-200 KB per sound

---

## Troubleshooting

### Issue: "Audio won't play"

**Fix 1**: Browser autoplay policy
```javascript
// User must interact first
// Add this to your start button:
document.getElementById('start-btn').addEventListener('click', () => {
    audioManager.playMusic('menu');
});
```

**Fix 2**: Check file paths
```javascript
// In console:
new Audio('audio/music/menu.mp3').play();
// If error = wrong path
```

### Issue: "Sounds cut off"

**Fix**: Use `.cloneNode()` (already implemented in audio-manager.js)

### Issue: "Music doesn't fade smoothly"

**Fix**: Adjust fade duration in audio-manager.js:
```javascript
this.fadeVolume(track, this.musicVolume, 3000); // 3 seconds instead of 2
```

### Issue: "Too many sounds at once"

**Fix**: Limit simultaneous sounds:
```javascript
playSfx(sfxName) {
    if (!this.soundEnabled) return;

    // Only play if not already playing
    if (this.soundEffects[sfxName] && !this.soundEffects[sfxName].paused) {
        return;
    }

    // ... rest of code ...
}
```

---

## Performance Tips

1. **Preload only essential sounds** (already done in audio-manager.js)
2. **Lazy load** less common sounds
3. **Use compressed audio** (MP3 at 128 kbps)
4. **Keep total audio size under 10 MB** for fast loading
5. **Test on slow connections** (Chrome DevTools → Network → Slow 3G)

---

## Credits & Attribution

If using free music that requires attribution:

**Add to your game** (in a credits modal or at the end):

```
Music by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

Sound Effects from Freesound.org
- "button-click.wav" by user123
- "achievement.wav" by user456
```

**Or in your code** (console message):
```javascript
console.log('🎵 Music: Kevin MacLeod (incompetech.com)');
console.log('🔊 SFX: Freesound.org community');
```

---

## Quick Reference

### Play Music
```javascript
audioManager.playMusic('menu');      // Start screen
audioManager.playMusic('gameplay');  // Main game
audioManager.playMusic('victory');   // High score ending
audioManager.playMusic('defeat');    // Low score ending
```

### Play Sound Effects
```javascript
// UI
audioManager.playButtonClick();
audioManager.playChoiceSelect();

// Game
audioManager.playBuildingPlace();
audioManager.playAchievement();

// Timer
audioManager.playTimerCritical();
audioManager.playTimeOut();

// Feedback
audioManager.playSuccess();
audioManager.playError();
```

### Control
```javascript
audioManager.toggleMusic();     // Enable/disable music
audioManager.toggleSound();     // Enable/disable SFX
audioManager.setMusicVolume(0.5); // 50% volume
audioManager.setSfxVolume(0.7);   // 70% volume
```

---

## Next Steps

1. ✅ Create audio folders
2. ✅ Download/create audio files
3. ✅ Add audio-manager.js to index.html
4. ✅ Update start-screen.js toggle functions
5. ✅ Add sound effects to game.js events
6. ✅ Test in browser
7. ✅ Adjust volumes as needed
8. ✅ Deploy to production

**Happy Sound Designing! 🎵🎮**
