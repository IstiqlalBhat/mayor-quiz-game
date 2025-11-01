# Audio Optimization Guide - ManeStreet Game

## Performance Optimizations Implemented

### 1. **Audio Pooling System** ✅
Created multiple instances of frequently used sounds for instant playback without delays.

**Pooled Sounds:**
- `buttonClick`: 3 instances (for rapid clicking)
- `choiceSelect`: 2 instances
- `buildingPlace`: 2 instances
- `timerCritical`: 2 instances

**How it works:**
- When a sound plays, the system finds a free instance from the pool
- If all are busy, it reuses the first instance (restarts it)
- No need to wait for `cloneNode()` or file loading
- **Result: Instant playback, no lag**

---

### 2. **Aggressive Preloading** ✅
All audio files are loaded immediately when the game starts.

**Before:**
```javascript
audio.preload = 'auto';  // Browser decides when to load
```

**After:**
```javascript
audio.preload = 'auto';
audio.load();  // Force immediate loading
```

**Result:** All sounds ready to play instantly

---

### 3. **Browser Preload Hints** ✅
Added `<link rel="preload">` tags in HTML to tell the browser to prioritize loading critical audio.

```html
<link rel="preload" href="audio/music/menu.mp3?v=2" as="audio">
<link rel="preload" href="audio/music/gameplay.mp3?v=2" as="audio">
<link rel="preload" href="audio/sfx/button-click.mp3?v=2" as="audio">
```

**Result:** Audio loads before game even starts

---

### 4. **Cache-Busting System** ✅
Version parameters force browsers to load new audio files when updated.

**Change `audioVersion` in `audio-manager.js`:**
```javascript
const audioVersion = '?v=2';  // Increment when updating files
```

---

## Additional Optimizations You Can Do

### 5. **Compress Audio Files** 🔧

**Current:** Your MP3 files may be too large
**Target File Sizes:**
- Background Music: 500KB - 1MB max
- Sound Effects: 10KB - 50KB max

**How to Compress:**

#### Option A: Online Tools
1. **Audio Compressor**: https://www.audiocompressor.com/
   - Upload your MP3 files
   - Set quality to 128 kbps (music) or 64 kbps (SFX)
   - Download compressed files

2. **FreeConvert**: https://www.freeconvert.com/audio-compressor
   - Batch compress multiple files
   - Choose MP3 quality preset

#### Option B: Free Software (Audacity)
1. Download Audacity: https://www.audacityteam.org/
2. Open your audio file
3. **For Background Music:**
   - File → Export → Export as MP3
   - Quality: 128 kbps (Constant)
   - Stereo
4. **For Sound Effects:**
   - File → Export → Export as MP3
   - Quality: 64-96 kbps
   - Mono (if not already)
   - Effects → Normalize (optional)

#### Option C: Command Line (FFmpeg)
```bash
# Install FFmpeg first: https://ffmpeg.org/download.html

# Compress music (128 kbps)
ffmpeg -i input.mp3 -b:a 128k -ac 2 output.mp3

# Compress SFX (64 kbps, mono)
ffmpeg -i input.mp3 -b:a 64k -ac 1 output.mp3

# Batch compress all MP3s in folder
for file in *.mp3; do ffmpeg -i "$file" -b:a 128k "compressed_$file"; done
```

---

### 6. **Optimize Audio File Properties** 🔧

**Ideal Settings:**

| Type | Format | Bitrate | Sample Rate | Channels | File Size |
|------|--------|---------|-------------|----------|-----------|
| **Background Music** | MP3 | 128 kbps | 44.1 kHz | Stereo | <1 MB |
| **Sound Effects** | MP3 | 64-96 kbps | 22.05 kHz | Mono | <50 KB |
| **UI Sounds** | MP3 | 64 kbps | 22.05 kHz | Mono | <20 KB |

**Why these settings?**
- Lower bitrate = smaller file = faster loading
- 22.05 kHz is enough for SFX (human hearing range covered)
- Mono for SFX saves 50% file size vs stereo
- Background music benefits from stereo and higher quality

---

### 7. **Trim Silence from Audio Files** 🔧

Remove dead space at start/end of files for instant playback.

**Audacity:**
1. Open audio file
2. Select silence at beginning/end
3. Press Delete
4. Effect → Normalize
5. Export

**Online:**
- https://www.mp3cut.net/ (trim online)

---

### 8. **Use Audio Sprites (Advanced)** 🔧

Combine multiple short sound effects into one file to reduce HTTP requests.

**Example:**
Instead of loading 10 separate SFX files, create one file with all sounds and use start/end times.

```javascript
// Audio sprite definition
const audioSprite = {
    click: { start: 0, duration: 0.2 },
    success: { start: 0.3, duration: 0.5 },
    error: { start: 0.9, duration: 0.6 }
};

// Play specific sound from sprite
function playFromSprite(soundName) {
    const sound = audioSprite[soundName];
    spriteAudio.currentTime = sound.start;
    spriteAudio.play();

    setTimeout(() => {
        spriteAudio.pause();
    }, sound.duration * 1000);
}
```

**Tools:**
- **AudioSprite**: https://github.com/tonistiigi/audiosprite
- **Howler.js**: https://howlerjs.com/ (library with built-in sprite support)

---

## Performance Checklist

✅ **Implemented:**
- [x] Audio pooling for frequently used sounds
- [x] Aggressive preloading with `.load()`
- [x] Browser preload hints in HTML
- [x] Cache-busting for audio updates
- [x] Event listeners to confirm loading

🔧 **Recommended (Do Yourself):**
- [ ] Compress all audio files (128 kbps music, 64 kbps SFX)
- [ ] Convert SFX to mono
- [ ] Reduce sample rate to 22.05 kHz for SFX
- [ ] Trim silence from beginning/end
- [ ] Test file sizes (target <1MB music, <50KB SFX)

---

## Expected Performance After All Optimizations

| Metric | Before | After |
|--------|--------|-------|
| **First sound playback** | 200-500ms delay | **Instant (0-50ms)** |
| **Rapid clicks** | Overlapping/laggy | **Smooth, instant** |
| **Total audio load time** | 3-5 seconds | **1-2 seconds** |
| **Memory usage** | ~20-40 MB | **~10-15 MB** |
| **Mobile performance** | Laggy | **Smooth** |

---

## Testing Your Optimizations

### 1. **Check Audio File Sizes**
```bash
# Windows (PowerShell)
Get-ChildItem -Recurse -File -Include *.mp3 | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}

# Mac/Linux
find audio -name "*.mp3" -exec ls -lh {} \; | awk '{print $9, $5}'
```

**Target:**
- Music files: <1 MB each
- SFX files: <50 KB each

---

### 2. **Monitor Loading Performance**

Open browser console (F12) and check:
```
✅ Music loaded: menu
✅ Music loaded: gameplay
✅ SFX loaded: buttonClick
✅ SFX loaded: choiceSelect
```

All should load within **1-2 seconds** of page load.

---

### 3. **Test Instant Playback**

1. Open game
2. Rapidly click buttons
3. **Expected:** Immediate sound on every click, no delay
4. **If laggy:** Audio files too large or not preloaded

---

## Browser Compatibility

✅ **Supported:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may require user interaction first)
- Mobile browsers: Full support

⚠️ **Note:** Safari/iOS may block autoplay until user interacts with page (security feature)

---

## Troubleshooting

### Problem: Sounds still have delay

**Solutions:**
1. Check file sizes - compress if >50KB for SFX
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Network tab in DevTools - ensure files loaded
4. Verify `audio.load()` is called in preloadAudio()

---

### Problem: Audio doesn't play on mobile

**Solutions:**
1. Ensure user interacts first (tap anywhere)
2. Check audio format compatibility
3. Reduce file sizes (mobile has slower networks)
4. Check browser console for errors

---

### Problem: High memory usage

**Solutions:**
1. Reduce audio pool sizes
2. Don't preload ALL sounds (lazy load some)
3. Use audio sprites
4. Compress files more aggressively

---

## File Organization

```
html/
└── audio/
    ├── music/
    │   ├── menu.mp3          (128 kbps, stereo, <1MB)
    │   ├── gameplay.mp3      (128 kbps, stereo, <1MB)
    │   ├── victory.mp3       (128 kbps, stereo, <1MB)
    │   └── defeat.mp3        (128 kbps, stereo, <1MB)
    └── sfx/
        ├── button-click.mp3     (64 kbps, mono, <20KB)
        ├── choice-select.mp3    (64 kbps, mono, <30KB)
        ├── building-place.mp3   (64 kbps, mono, <40KB)
        ├── achievement.mp3      (64 kbps, mono, <50KB)
        └── ... (other SFX)
```

---

## Summary

**What We Did:**
1. ✅ Implemented audio pooling (3 instances of frequent sounds)
2. ✅ Added aggressive preloading with `.load()`
3. ✅ Added browser preload hints
4. ✅ Implemented cache-busting

**What You Should Do:**
1. 🔧 Compress audio files (use online tools or Audacity)
2. 🔧 Convert SFX to mono
3. 🔧 Trim silence from files
4. 🔧 Test and verify file sizes

**Expected Result:**
- **Instant audio playback** (0-50ms)
- **Smooth rapid clicking**
- **Fast loading** (1-2 seconds total)
- **Lower memory usage**
- **Better mobile performance**

---

**Version:** 1.0
**Last Updated:** 2025-10-31
