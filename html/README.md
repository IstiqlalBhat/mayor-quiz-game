# 🏛️ Mane Street Mayor - Interactive City Builder

A political decision-making game where you play as the mayor of Tiger Central, making tough choices that affect your city's happiness, funds, and special interests.

## 📁 File Structure

```
html/
├── index.html       # Main HTML structure
├── styles.css       # All CSS styles and animations
├── game.js          # Game logic and functionality
├── abc.html         # Original single-file version (backup)
└── README.md        # This file
```

## 🎮 Features

### Core Gameplay
- **Interactive Storytelling**: Make decisions that shape your city's future
- **Multiple Stats**: Track happiness, city funds, special interests, and personal profit
- **Dynamic Building System**: Watch your city grow with each decision
- **Consequence System**: See immediate feedback on your choices

### Recent Additions
- **⏰ Countdown Timer**: 60-second timer for each decision
  - Color-coded progress bar (green → yellow → red)
  - Auto-selects random choice when time runs out
  - Pauses during consequence displays

## 🚀 Getting Started

### Option 1: Run Locally
1. Open `index.html` in any modern web browser
2. No server required - it's a static HTML game!

### Option 2: Open Original Version
- Open `abc.html` for the single-file version

## 🎨 Code Organization

### HTML (`index.html`)
- Clean semantic structure
- Minimal inline styles
- External CSS and JS references

### CSS (`styles.css`)
Organized into clear sections:
- Reset & Base Styles
- Particle Background
- Header & Timer
- City View & Buildings
- Stats Panel
- Game Content
- Choices & Consequences
- Responsive Design

### JavaScript (`game.js`)
Modular functions organized by purpose:
- **Particle Background**: Creates animated background
- **Tooltip System**: Hover information
- **Game State**: Central state management
- **Building System**: Dynamic building rendering
- **Timer System**: Countdown functionality
- **Game Data**: All story content and choices
- **Scene Rendering**: Display logic
- **Stats Management**: Track and update stats

## 🛠️ Customization

### Adding New Buildings
Edit `buildingTypes` in `game.js`:
```javascript
const buildingTypes = {
    'your-building': {
        width: 100,
        height: 120,
        windows: 8,
        color: '#yourcolor',
        icon: '🏢'
    }
};
```

### Adding New Story Scenes
Add to `gameData` object in `game.js`:
```javascript
choice_new: {
    chapter: "Chapter X",
    title: "Your Title",
    story: `<p>Your story text</p>`,
    choices: [
        {
            text: "Choice 1",
            icon: "✅",
            effects: { happiness: 10, cityFunds: -5 },
            next: 'next_scene',
            consequence: "What happens",
            building: 'building_type'  // optional
        }
    ]
}
```

### Adjusting Timer Duration
In `game.js`, change the `startTimer()` function:
```javascript
gameState.timerSeconds = 60; // Change to desired seconds
```

### Styling Changes
All visual styles are in `styles.css`. Each section is clearly labeled with comments.

## 📊 Game Stats

1. **Population Happiness** (0-100)
   - Affected by: Quality of life decisions
   - Visual: 😊 emoji with progress bar

2. **City Funds** (0-100)
   - Affected by: Economic decisions
   - Visual: 💰 emoji with progress bar

3. **Special Interest Support** (0-100)
   - Affected by: Relationships with businesses/organizations
   - Visual: 🏛️ emoji with progress bar

4. **Personal Profit** (can go negative)
   - Affected by: Corruption vs. ethical choices
   - Visual: 💵 emoji

## 🎯 Endings

Your performance is rated based on average of first 3 stats:
- **70+**: 🌟 Excellent Mayor
- **50-69**: 👍 Decent Mayor
- **30-49**: 😬 Struggling Mayor
- **<30**: ❌ Failed Mayor

Personal profit also affects your reputation!

## 🔧 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📝 Development Notes

### Why Separate Files?
- **Maintainability**: Easier to find and edit specific code
- **Collaboration**: Multiple people can work on different files
- **Performance**: Browser can cache CSS/JS separately
- **Organization**: Clear separation of concerns

### File Sizes
- `index.html`: ~4 KB
- `styles.css`: ~15 KB
- `game.js`: ~25 KB
- **Total**: ~44 KB (vs 58 KB single file)

## 🎓 Learning Objectives

This game teaches:
- **Critical Thinking**: Every choice has trade-offs
- **Civic Engagement**: Understanding political decisions
- **Systems Thinking**: How decisions ripple through communities
- **Ethical Leadership**: Balancing personal gain vs. public good

## 📜 License

Educational project - feel free to modify and use for learning purposes!

## 🙏 Credits

Created as an interactive educational tool to help students understand political decision-making and civic responsibility.

---

**Enjoy playing Mane Street Mayor! 🏛️**

