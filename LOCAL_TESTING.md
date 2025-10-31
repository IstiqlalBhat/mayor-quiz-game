# Local Testing Guide

This guide explains how to test your game locally before deploying to production.

## Option 1: Frontend Only (Quick Test - No Database)

This is the fastest way to test UI changes and game logic without backend features.

### Steps:

1. **Navigate to the html folder**:
   ```bash
   cd html
   ```

2. **Start a local HTTP server**:

   **Using Python** (recommended - usually pre-installed):
   ```bash
   # Python 3
   python -m http.server 8000

   # Or Python 2 (if you have it)
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js** (if you have it):
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP** (if you have it):
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

### What Works:
- ✅ All game UI and animations
- ✅ Decision-making gameplay
- ✅ City building mechanics
- ✅ Timer system
- ✅ Achievements
- ✅ **NEW: Liquid glass effects**
- ✅ **NEW: Shaking toggle button**

### What Doesn't Work:
- ❌ Database persistence
- ❌ Leaderboard
- ❌ Session creation
- ❌ Auto-save
- ❌ Score submission

**Console warnings**: You'll see API errors (this is normal in frontend-only mode).

---

## Option 2: Full Stack (Complete Testing - With Database)

Test the complete application with all backend features.

### Prerequisites:

1. **Node.js** (v14 or higher)
   - Check: `node --version`
   - Install: https://nodejs.org

2. **PostgreSQL** (v12 or higher)
   - Check: `psql --version`
   - Install: https://www.postgresql.org/download/

### Step 1: Set Up PostgreSQL Database

**On Windows:**
```bash
# Open psql (PostgreSQL command line)
# Usually in: C:\Program Files\PostgreSQL\16\bin\psql.exe

# Create database
CREATE DATABASE mayor_quiz_local;

# Create user (optional, or use default postgres user)
CREATE USER mayor_user WITH PASSWORD 'your_password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE mayor_quiz_local TO mayor_user;
```

**On Mac/Linux:**
```bash
# Start PostgreSQL
brew services start postgresql  # Mac with Homebrew
sudo service postgresql start   # Linux

# Create database
createdb mayor_quiz_local

# Or use psql
psql postgres
CREATE DATABASE mayor_quiz_local;
\q
```

### Step 2: Configure Environment Variables

Create a `.env` file in the **root directory** (mayor-quiz-game folder):

```bash
# In the project root
cd "C:\Users\istiq\OneDrive\Desktop\Game Developemnt\38-factory\mayor-quiz-game"

# Create .env file
```

**Windows (PowerShell):**
```powershell
New-Item .env
notepad .env
```

**Mac/Linux:**
```bash
touch .env
nano .env
```

**Add this content to `.env`**:
```env
# Database Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mayor_quiz_local

# Environment
NODE_ENV=development
PORT=5000
```

**Replace**:
- `postgres` - with your PostgreSQL username
- `your_password` - with your PostgreSQL password
- `mayor_quiz_local` - with your database name

### Step 3: Install Dependencies

```bash
# In the project root
npm install
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
🏛️  ManeStreet Backend Server Started!
📡 API Server: http://0.0.0.0:5000
🎮 Game URL: http://0.0.0.0:5000
💾 Database: Connected to PostgreSQL

📋 Available API Endpoints:
   GET  /api/health - Health check
   POST /api/game/new - Create new game session
   ...

🔧 Initializing database tables...
✅ Database tables initialized successfully!
```

### Step 5: Test in Browser

Open: http://localhost:5000

### What Works (Full Stack):
- ✅ Everything from frontend-only mode
- ✅ Database persistence
- ✅ Session creation
- ✅ Auto-save (every 30 seconds)
- ✅ Score submission
- ✅ Leaderboard
- ✅ Analytics

---

## Testing Checklist

### 1. Test New Visual Changes

**Liquid Glass Overlay:**
- [ ] Start a game
- [ ] Click "Hide" button - overlay should have frosted glass effect
- [ ] City view should blur through the glass overlay
- [ ] Choice cards should have glass effect with glow

**Toggle Button:**
- [ ] Click "Hide" to hide choices
- [ ] Button should stay visible in top-right corner
- [ ] **Button should shake gently** (wiggle side to side)
- [ ] Click "Show" to bring choices back
- [ ] Button should stop shaking

**Choice Cards:**
- [ ] Hover over choice cards
- [ ] Should lift up with light ripple effect
- [ ] Should have glowing borders
- [ ] Should have layered shadow effects

### 2. Test Game Flow

- [ ] Enter player name
- [ ] Select difficulty
- [ ] Make decisions
- [ ] Place buildings
- [ ] Complete the game
- [ ] Check ending screen shows leaderboard

### 3. Test API Endpoints (Full Stack Only)

**Health Check:**
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","message":"ManeStreet Backend API is running!"}`

**Leaderboard:**
```bash
curl http://localhost:5000/api/leaderboard
```
Expected: `{"success":true,"leaderboard":[...]}`

**Analytics:**
```bash
curl http://localhost:5000/api/analytics/summary
```

### 4. Test Database (Full Stack Only)

**Check if tables were created:**
```bash
# Connect to database
psql mayor_quiz_local

# List tables
\dt

# Should see:
# - game_sessions
# - game_saves

# View session data
SELECT * FROM game_sessions;

# View save data
SELECT session_id, score, current_scene FROM game_saves;

# Exit
\q
```

### 5. Test Browser Console

Open Developer Tools (F12) → Console tab:

**Expected messages:**
```
✨ Start screen module loaded
🏥 Backend health: {status: "ok", ...}
🎮 Start screen initialized
📝 Creating session for: [Name] Difficulty: normal
✅ New game session created: [uuid]
🔄 Auto-save enabled (every 30 seconds)
💾 Game saved successfully  (every 30s)
🏆 Game score submitted successfully!  (at game end)
📊 Leaderboard fetched
```

**No red errors** (warnings about missing audio files are OK)

---

## Common Issues & Fixes

### Issue 1: "Port 5000 already in use"

**Fix**: Change port in `.env`:
```env
PORT=3000
```

Then access at: http://localhost:3000

### Issue 2: "Database connection failed"

**Fixes**:
1. Check PostgreSQL is running:
   ```bash
   # Windows (Services)
   services.msc  # Look for "postgresql-x64-16"

   # Mac
   brew services list

   # Linux
   sudo service postgresql status
   ```

2. Verify DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DBNAME
   ```

3. Test connection manually:
   ```bash
   psql -h localhost -U postgres -d mayor_quiz_local
   ```

### Issue 3: "Cannot find module"

**Fix**: Reinstall dependencies:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue 4: CORS errors in browser console

**Fix**: This only happens if you open `html/index.html` directly as a file (file://). Always use a web server (http://localhost).

### Issue 5: ".env file not loading"

**Fix**: Make sure `.env` is in the **root directory**, not in `backend/` or `html/`.

```
mayor-quiz-game/
├── .env              ← HERE
├── backend/
├── html/
└── package.json
```

---

## Hot Reloading (Auto-refresh on changes)

The server doesn't auto-reload by default. After making changes:

**Option 1: Use nodemon** (recommended)
```bash
# Install
npm install -g nodemon

# Run with auto-reload
nodemon server.js
```

**Option 2: Manual restart**
```bash
# Stop server: Ctrl+C
# Restart: npm start
```

**Option 3: Just refresh browser**
- Frontend changes (HTML/CSS/JS): Just refresh (Ctrl+R or F5)
- Backend changes: Restart server

---

## Quick Test Script

Save this as `test-local.sh` (Mac/Linux) or `test-local.bat` (Windows):

**Mac/Linux (`test-local.sh`):**
```bash
#!/bin/bash

echo "🧪 Testing Mayor Quiz Game Locally..."

# Test 1: Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    exit 1
fi
echo "✅ Node.js installed: $(node --version)"

# Test 2: Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found (optional for frontend-only testing)"
else
    echo "✅ PostgreSQL installed: $(psql --version)"
fi

# Test 3: Check .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found (needed for full-stack testing)"
else
    echo "✅ .env file found"
fi

# Test 4: Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi
echo "✅ Dependencies installed"

# Test 5: Start server
echo "🚀 Starting server..."
npm start
```

**Windows (`test-local.bat`):**
```batch
@echo off

echo Testing Mayor Quiz Game Locally...

REM Test 1: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not installed
    exit /b 1
)
echo Node.js installed:
node --version

REM Test 2: Check if .env exists
if not exist .env (
    echo .env file not found
)

REM Test 3: Install dependencies
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Test 4: Start server
echo Starting server...
npm start
```

**Run it:**
```bash
# Mac/Linux
chmod +x test-local.sh
./test-local.sh

# Windows
test-local.bat
```

---

## Recommended Testing Workflow

1. **Make changes** to code
2. **Test frontend-only** first (faster, good for UI changes):
   ```bash
   cd html
   python -m http.server 8000
   # Open http://localhost:8000
   ```
3. **Test full-stack** if you changed backend code:
   ```bash
   npm start
   # Open http://localhost:5000
   ```
4. **Check browser console** for errors
5. **Test all features** from checklist above
6. **Commit and push** to production:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

---

## Database Cleanup (Between Tests)

If you want to reset your local database:

```bash
# Connect to database
psql mayor_quiz_local

# Clear all data
TRUNCATE game_sessions CASCADE;
TRUNCATE game_saves CASCADE;

# Or drop and recreate tables
DROP TABLE game_saves;
DROP TABLE game_sessions;
\q

# Restart server (tables will be recreated automatically)
npm start
```

---

## Production vs Local Differences

| Feature | Local | Production (Render) |
|---------|-------|---------------------|
| URL | http://localhost:5000 | https://mayor-quiz-game.onrender.com |
| Database | Local PostgreSQL | Render PostgreSQL |
| SSL | No HTTPS | Automatic HTTPS |
| Port | 5000 (or custom) | Dynamic (Render assigns) |
| Environment | NODE_ENV=development | NODE_ENV=production |
| Cold starts | Never | After 15 min inactivity (free tier) |
| Logs | Terminal | Render dashboard |

---

## Tips for Efficient Testing

1. **Use browser DevTools** (F12):
   - Console: See all logs
   - Network: Check API calls
   - Application: View localStorage

2. **Test on multiple browsers**:
   - Chrome (best DevTools)
   - Firefox
   - Safari (Mac)
   - Edge

3. **Test responsive design**:
   - F12 → Toggle device toolbar
   - Test mobile, tablet, desktop views

4. **Use incognito mode**:
   - Clears localStorage/cookies
   - Tests fresh user experience

5. **Check mobile on real device**:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from phone: `http://YOUR_IP:5000`
   - Make sure phone is on same WiFi

---

## Next Steps

After local testing passes:

```bash
# Commit your changes
git add .
git commit -m "Add liquid glass effects and shaking toggle button"

# Push to production
git push origin main
```

Render will auto-deploy in 3-5 minutes!

---

**Happy Testing! 🧪**

Need help? Check the console logs or Render deployment logs for specific errors.
