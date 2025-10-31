# ManeStreet - Interactive City Builder Game

## Overview
ManeStreet is an interactive city-building decision game where you play as the mayor of Tiger Central. Make tough choices that affect your city's happiness, funds, and special interests while building and managing your city.

## Current State
**Status:** ✅ Fully functional and running
- Server running on Node.js serving static files
- Game accessible via web browser
- All features working: building placement, timer system, achievements, difficulty modes

## Project Structure
```
├── html/                    # Game files
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # All CSS styles and animations
│   ├── game.js             # Game logic and functionality
│   ├── abc.html            # Original single-file version (backup)
│   └── *.md                # Documentation files
├── server.js               # Node.js static file server
├── package.json            # Node.js configuration
└── .gitignore             # Git ignore rules
```

## Technology Stack
- **Frontend:** Pure HTML5, CSS3, JavaScript (no frameworks)
- **Backend:** Node.js HTTP server (static file serving)
- **Deployment:** Configured for Replit autoscale

## Game Features
- 🎮 Interactive decision-making with consequences
- 🏗️ Drag-and-drop building system
- ⏱️ Timed decisions with countdown
- 🏆 Achievement system (13 achievements)
- 📊 City planning efficiency scoring
- 🎯 Multiple difficulty modes (Easy, Normal, Hard, Expert)
- 📱 Mobile-responsive design

## Recent Setup (October 31, 2025)
- Imported from GitHub
- Created Node.js server for static file serving
- Configured workflow to run on port 5000
- Set up deployment configuration
- Verified all game features working correctly

## User Preferences
(To be updated as preferences are discovered)

## Next Steps
Backend features can be added such as:
- User authentication and profiles
- Save/load game state to database
- Leaderboards and high scores
- Multiplayer features
- Analytics and statistics tracking
