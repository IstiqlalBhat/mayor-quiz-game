# ⏰ Timer Visual States Reference

## Overview
The timer has 4 distinct visual states that progressively intensify as time runs out, creating urgency and excitement.

---

## 🟢 State 1: CALM (60-30 seconds)
**Visual Characteristics:**
- Color: Green (`#00b894`)
- Border: Semi-transparent green
- Background: Light green tint
- Icon animation: Gentle pulse (2s interval)
- Progress bar: Green gradient

**Purpose:** 
Player has plenty of time to consider their decision thoughtfully.

**CSS Classes:**
- `.timer-container.calm`
- No additional bar classes

---

## 🟡 State 2: WARNING (29-10 seconds)
**Visual Characteristics:**
- Color: Yellow/Orange (`#fdcb6e`)
- Border: Semi-transparent orange
- Background: Light orange tint
- Icon animation: Faster pulse with rotation (1.2s interval)
- Container pulse: Subtle scale animation (1.5s)
- Progress bar: Yellow-orange gradient
- Timer text: Yellow color with glow

**Purpose:**
Alert player that time is becoming limited - make a decision soon.

**CSS Classes:**
- `.timer-container.warning`
- `.timer-bar-fill.warning`

**Audio Hook:**
- Triggers at exactly 29 seconds
- `data-sound-trigger="warning"`

---

## 🔴 State 3: DANGER (9-6 seconds)
**Visual Characteristics:**
- Color: Red (`#ff7675`)
- Border: Red with high opacity
- Background: Light red tint
- Icon animation: Fast pulse with scale (0.6s interval)
- Container pulse: Noticeable scale + shadow (0.8s)
- Progress bar: Red gradient with glow
- Timer text: Red with pulsing scale and glow
- **"⚠️ HURRY! ⚠️" text appears**

**Purpose:**
Create urgency - player needs to decide NOW.

**CSS Classes:**
- `.timer-container.danger`
- `.timer-bar-fill.danger`
- `.timer-urgent-text` (visible)

**Audio Hook:**
- Triggers at exactly 9 seconds
- `data-sound-trigger="danger"`

---

## 🔥 State 4: CRITICAL (5-0 seconds)
**Visual Characteristics:**
- Color: Dark Red (`#d63031`)
- Border: Dark red, fully opaque
- Background: Strong red tint with box shadow
- **Shake animation: Entire container shakes (0.4s interval)**
- Icon animation: Very fast pulse (0.6s)
- Container pulse: Large scale + intense shadow
- Progress bar: Dark red with intense pulsing glow
- Timer text: Maximum scale pulse
- **"⚠️ HURRY! ⚠️" text blinks rapidly**

**Purpose:**
Maximum urgency - final warning before auto-selection.

**CSS Classes:**
- `.timer-container.critical`
- `.timer-bar-fill.critical`
- `.timer-urgent-text` (visible, blinking)

**Audio Hook:**
- Triggers at exactly 5 seconds
- `data-sound-trigger="critical"`
- Optional tick sound every second: `data-sound-trigger="tick"`

---

## 🎨 Animation Details

### Pulse Speeds
| State | Icon Pulse | Container Pulse | Number Pulse |
|-------|-----------|----------------|--------------|
| Calm | 2.0s | None | None |
| Warning | 1.2s | 1.5s | None |
| Danger | 0.6s | 0.8s | 0.5s |
| Critical | 0.6s | 0.4s (shake) | 0.5s |

### Color Progression
```
Green (#00b894) → Yellow (#fdcb6e) → Red (#ff7675) → Dark Red (#d63031)
```

### Box Shadow Intensity
```
Calm:     0 0 10px (subtle)
Warning:  0 0 15px (moderate)
Danger:   0 0 20px (strong)
Critical: 0 0 30px (intense)
```

---

## 🔊 Audio Integration Points

Ready for future audio implementation:

```javascript
// At 29 seconds
if (gameState.timerSeconds === 29) {
    // Play: gentle chime or beep
}

// At 9 seconds  
if (gameState.timerSeconds === 9) {
    // Play: warning beep (higher pitch)
}

// At 5 seconds
if (gameState.timerSeconds === 5) {
    // Play: urgent alarm sound
}

// At 10-0 seconds
if (gameState.timerSeconds <= 10) {
    // Play: tick sound each second
}
```

**Suggested Sounds:**
- 29s: Single soft beep
- 9s: Double beep (higher pitch)
- 5s: Urgent alarm or siren
- 1-10s: Clock tick (optional)

---

## 💻 Implementation Notes

### State Management
States are managed in `updateTimerDisplay()` function in `game.js`:

```javascript
if (timerSeconds <= 5) {
    // Critical state
} else if (timerSeconds <= 9) {
    // Danger state
} else if (timerSeconds <= 29) {
    // Warning state
} else {
    // Calm state
}
```

### CSS Class Structure
```html
<div class="timer-container active calm">
  <div class="timer-display">
    <span class="timer-icon">⏰</span>
    <span class="timer-seconds">45</span>
    <span class="timer-label">seconds</span>
  </div>
  <div class="timer-bar-container">
    <div class="timer-bar-fill"></div>
  </div>
  <div class="timer-urgent-text">⚠️ HURRY! ⚠️</div>
</div>
```

### Key Features
✅ Smooth color transitions (0.3s ease)
✅ Progressive animation intensity
✅ Visual hierarchy (calm → critical)
✅ Screen shake for maximum urgency
✅ "HURRY!" text for danger/critical states
✅ Audio hooks ready for sound effects
✅ Progress bar visual feedback
✅ No performance impact (CSS animations)

---

## 🎮 User Experience

**Design Goals:**
1. **Clear Communication** - Player always knows urgency level
2. **Progressive Intensity** - Gradual escalation prevents shock
3. **Visual Variety** - Each state feels distinct
4. **Accessibility** - Color + animation + text for redundancy
5. **No Stress** - Early states are calm to encourage thoughtful play

**Testing Recommendations:**
- Verify smooth transitions between states
- Ensure animations maintain 60fps
- Test on various screen sizes
- Check color contrast for accessibility
- Verify "HURRY!" text is readable

---

## 🚀 Future Enhancements (Phase 1.3)

When implementing time bonuses:
- Add "+2 points" notification per second saved
- Show time bonus in consequence display
- Track fastest decision times
- Award achievements for speed
- Add difficulty modifiers to timer duration

---

## 📝 Quick Reference

| Seconds | State | Color | Shake | HURRY! | Audio |
|---------|-------|-------|-------|--------|-------|
| 60-30 | Calm | Green | No | No | No |
| 29-10 | Warning | Yellow | No | No | @29s |
| 9-6 | Danger | Red | No | Yes | @9s |
| 5-0 | Critical | Dark Red | Yes | Yes | @5s |

---

**Phase 1.2 Status:** ✅ Complete
**Next Phase:** 1.3 - Time Bonuses & Scoring

