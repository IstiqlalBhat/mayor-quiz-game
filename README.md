# Mane Street Mayor 🏛️

An interactive browser-based city builder game where you play as the mayor of Tiger Central, making strategic political decisions that shape your city's future. Balance happiness, funds, special interests, and personal profit while building a thriving metropolis through narrative-driven gameplay.

![Game Type](https://img.shields.io/badge/Type-City%20Builder-blue)
![Platform](https://img.shields.io/badge/Platform-Browser-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 Game Overview

**Mane Street Mayor** combines narrative storytelling with strategic city planning mechanics. As mayor, you'll:

- 📜 Navigate branching storylines with meaningful choices
- 🏗️ Build and manage a city grid with 5 unique building types
- ⏱️ Make time-sensitive decisions under pressure
- 📊 Balance four key metrics: Happiness, Funds, Special Interest, and Personal Profit
- 🏆 Compete on leaderboards and unlock achievements
- 🎯 Master strategic placement with adjacency bonuses and zone formations

## ✨ Key Features

### Gameplay Mechanics
- **Branching Narrative**: Multiple story paths based on your decisions
- **Strategic Building Placement**: 5 building types with unique adjacency rules
- **Dynamic Timer System**: Visual countdown with time bonuses and penalties
- **Zone Detection**: Form neighborhoods, commercial districts, and more
- **Progressive Unlocks**: Unlock buildings through story choices
- **Efficiency Scoring**: Real-time city planning rating (0-100%)
- **Achievement System**: 7 unlockable achievements

### Game Modes
- **Easy**: 90s timer, $80M starting funds, 5 relocations, 5 undos
- **Normal**: 60s timer, $60M starting funds, 3 relocations, 3 undos
- **Hard**: 40s timer, $40M starting funds, 2 relocations, 2 undos
- **Mayor**: 25s timer, $30M starting funds, 1 relocation, 1 undo

### Technical Features
- **Dual-Mode Architecture**: Play standalone or with backend persistence
- **Mobile Responsive**: Touch support with haptic feedback
- **Auto-Save System**: Progress saved every 30 seconds
- **Leaderboard Integration**: Compare scores across difficulty levels
- **No Build Tools Required**: Pure HTML/CSS/JavaScript

## 🚀 Quick Start

### Option 1: Play Without Backend (Standalone)

No installation required! Simply open the game in your browser:

```bash
# Clone the repository
git clone https://github.com/yourusername/mayor-quiz-game.git
cd mayor-quiz-game

# Open directly in browser
open html/index.html

# OR use a simple HTTP server
cd html
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Note**: Without backend, game progress won't persist between sessions and leaderboard features won't work.

### Option 2: Full Stack with Backend (Recommended)

Get the complete experience with persistence and leaderboards:

```bash
# Install dependencies
npm install

# Set up environment variables (see Configuration section)
cp .env.example .env

# Start the server
npm start

# Visit http://localhost:5000
```

## 📋 Prerequisites

### Standalone Mode
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Full Stack Mode
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/mayor_game

# Server Configuration
PORT=5000

# Optional: Enable debug logging
DEBUG=true
```

### Database Setup

The server automatically creates required tables on startup:

```sql
-- game_sessions: Player sessions and final scores
-- game_saves: JSONB snapshots for save/load functionality
```

To manually set up the database:

```bash
# Create database
createdb mayor_game

# Tables are created automatically on first run
npm start
```

## 🎯 How to Play

### Starting the Game

1. **Enter Your Name**: Personalize your mayoral experience
2. **Choose Difficulty**: Select from Easy, Normal, Hard, or Mayor mode
3. **Read the Story**: Each scene presents a political scenario
4. **Make Decisions**: Choose wisely before the timer runs out
5. **Build Your City**: Place buildings strategically on the grid
6. **Balance Metrics**: Keep happiness, funds, special interest, and profit in check

### Building Types

| Building | Icon | Cost | Effect | Best Placement |
|----------|------|------|--------|----------------|
| **House** | 🏠 | $10M | +5 Happiness | Near parks |
| **Shop** | 🏪 | $15M | +5 Funds | Near houses/offices |
| **Factory** | 🏭 | $20M | +10 Funds, -5 Happiness | Away from houses |
| **Park** | 🌳 | $12M | +8 Happiness | Near houses/shops |
| **Office** | 🏢 | $18M | +8 Interest | Near shops/parks |

### Scoring System

Your final score is calculated based on:
- **Decision Bonuses**: Time remaining after each choice
- **City Efficiency**: Strategic placement and zone formation
- **Balanced Metrics**: Maintaining all four stats
- **Achievements**: Unlocking special accomplishments

## 🏗️ Project Structure

```
mayor-quiz-game/
├── html/                      # Frontend files
│   ├── index.html            # Main HTML structure
│   ├── game.js               # Core game logic (~1,750+ lines)
│   ├── start-screen.js       # Player setup and settings
│   ├── api-client.js         # Backend API integration
│   ├── styles.css            # All styles and animations
│   └── abc.html              # Original backup version
│
├── backend/
│   └── server.js             # Express server with PostgreSQL
│
├── package.json              # Dependencies and scripts
├── CLAUDE.md                 # AI development guide
├── BACKEND_FEATURES.md       # Complete API documentation
├── SETUP.md                  # Detailed setup instructions
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

## 🛠️ Development

### Architecture Overview

**Frontend Flow**:
```
Start Screen → Player Setup → Difficulty Selection
    → API Session Creation → Main Game
    → Auto-save (every 30s) → Leaderboard
```

**Backend Flow**:
```
Express Server → REST API Routes
    → PostgreSQL Database → JSON Responses
```

### Key Technologies

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with JSONB
- **Deployment**: Compatible with Vercel, Heroku, Railway, Replit

### Core Game Systems

1. **Story Engine**: Branching narrative in `gameData` object (game.js:1866)
2. **Timer System**: Dynamic countdown with 4 visual states
3. **Building System**: Drag-and-drop with touch support
4. **Adjacency Engine**: Real-time bonus/penalty calculations
5. **Zone Detection**: Automatic formation of city districts
6. **Progressive Unlocks**: Story-driven building availability
7. **Backend Integration**: Auto-save and leaderboard sync

### Adding New Content

**Add a Building Type** (game.js:150):
```javascript
new_building: {
    name: "Building Name",
    icon: "🏛️",
    cost: 20,
    description: "Description",
    baseEffects: { happiness: 5, cityFunds: 0, specialInterest: 0 },
    adjacencyBonus: {
        near: ['park'],
        effect: { happiness: 3 }
    }
}
```

**Add a Story Scene** (game.js:1866):
```javascript
new_scene: {
    chapter: "Chapter X: Title",
    title: "Scene Title",
    story: `<p>Story content</p>`,
    choices: [
        {
            text: "Choice text",
            icon: "✅",
            effects: { happiness: 10 },
            next: 'next_scene',
            consequence: "Result description",
            unlocks: ['building1']
        }
    ]
}
```

### API Endpoints

The backend provides 8 REST endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/game/new` | POST | Create new session |
| `/api/game/save` | POST | Save game state |
| `/api/game/load/:id` | GET | Load saved game |
| `/api/game/complete` | POST | Submit final score |
| `/api/leaderboard` | GET | Get top scores |
| `/api/stats/:id` | GET | Get session stats |
| `/api/analytics/summary` | GET | Aggregate analytics |

See [BACKEND_FEATURES.md](BACKEND_FEATURES.md) for complete API documentation.

### Testing

**Frontend Testing**:
```javascript
// Browser console commands
gameState                    // View full game state
loadScene('scene_key')       // Navigate to specific scene
gameState.cityGrid           // Inspect building placements
gameAPI.sessionId            // Check session ID
```

**Backend Testing**:
```bash
# Health check
curl http://localhost:5000/api/health

# Create session
curl -X POST http://localhost:5000/api/game/new \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test","difficulty":"normal"}'

# Get leaderboard
curl http://localhost:5000/api/leaderboard?limit=10
```

## 📱 Mobile Support

- **Responsive Grid**: Adjusts from 10×6 (desktop) to 6×4 (mobile)
- **Touch Events**: Full drag-and-drop support for mobile
- **Haptic Feedback**: Vibration on supported devices
- **Performance**: Reduced particles (15 vs 30) on mobile
- **Large Touch Targets**: Minimum 44×44px buttons

## 🐛 Debugging Tips

### Common Issues

**Game won't start**:
- Check browser console for errors
- Ensure JavaScript is enabled
- Try clearing browser cache

**Backend connection fails**:
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure port 5000 is available

**Save/Load not working**:
- Check browser localStorage permissions
- Verify backend is running
- Check network tab for API errors

### Debug Commands

```javascript
// In browser console
gameState.unlockedBuildings = ['house', 'shop', 'factory', 'park', 'office']
gameState.cityFunds = 1000
gameState.happiness = 100
```

## 🚢 Deployment

The game supports multiple deployment platforms:

- **Vercel**: Frontend + Serverless Functions
- **Heroku**: Full stack with PostgreSQL add-on
- **Railway**: Automatic PostgreSQL provisioning
- **Replit**: Integrated hosting and database

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific guides.

## 🎓 Educational Purpose

Mane Street Mayor teaches:
- **Civic Engagement**: Understanding mayoral decision-making
- **Trade-offs**: Balancing competing interests
- **Strategic Planning**: Long-term thinking and consequences
- **Resource Management**: Budget allocation and priorities
- **Systems Thinking**: How city components interconnect

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow existing code style
4. **Test thoroughly**: Both frontend and backend
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Maintain existing code structure and comments
- Test on mobile and desktop
- Update documentation for new features
- Keep `gameState` as single source of truth
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by city-building classics and political decision games
- Built for educational purposes to explore civic engagement
- Thanks to all playtesters and contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mayor-quiz-game/issues)
- **Documentation**: See [CLAUDE.md](CLAUDE.md) for AI development guide
- **API Docs**: See [BACKEND_FEATURES.md](BACKEND_FEATURES.md)

## 🗺️ Roadmap

- [ ] Additional building types
- [ ] More story branches and endings
- [ ] Multiplayer leaderboard integration
- [ ] Achievement sharing
- [ ] Custom city themes
- [ ] Sound effects and music
- [ ] Random event system
- [ ] City statistics dashboard

---

**Made with ❤️ for civic education and strategic gameplay**

*Play now and see if you have what it takes to be Mayor of Tiger Central!*
