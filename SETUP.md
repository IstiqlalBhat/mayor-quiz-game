# 🚀 ManeStreet Mayor Game - Complete Setup Guide

This guide will walk you through setting up your own server and database for the ManeStreet Mayor game.

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - See installation options below
- **npm** (comes with Node.js)

---

## Step 1: Install PostgreSQL

Choose one of these options:

### Option A: macOS (using Homebrew)
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Option B: macOS (using Postgres.app)
1. Download from [https://postgresapp.com/](https://postgresapp.com/)
2. Drag to Applications folder
3. Open Postgres.app
4. Click "Initialize" to create a new server

### Option C: Windows
1. Download installer from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run installer (remember your password!)
3. Default port: 5432

### Option D: Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Option E: Docker (All platforms)
```bash
# Run PostgreSQL in a container
docker run --name manestreet-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=manestreet_game \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

---

## Step 2: Create the Database

### If using local PostgreSQL:
```bash
# Connect to PostgreSQL (use 'postgres' as username on macOS/Linux)
psql postgres

# OR on Windows, use:
# psql -U postgres
```

Then in the PostgreSQL prompt:
```sql
-- Create the database
CREATE DATABASE manestreet_game;

-- Create a user (optional but recommended)
CREATE USER manestreet_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE manestreet_game TO manestreet_user;

-- Exit
\q
```

### If using Docker:
```bash
# Connect to the container
docker exec -it manestreet-db psql -U postgres

# Database is already created if you used POSTGRES_DB env var
# Otherwise, create it:
CREATE DATABASE manestreet_game;
\q
```

---

## Step 3: Initialize the Database Schema

```bash
# Navigate to your project directory
cd /Users/istiqlalaurangzeb/Downloads/CodeMayor/mayorfull/mayor-quiz-game

# Run the initialization script
psql -U manestreet_user -d manestreet_game -f backend/init-db.sql

# OR if using Docker:
docker exec -i manestreet-db psql -U postgres -d manestreet_game < backend/init-db.sql
```

This will create:
- `game_sessions` table (stores player sessions and scores)
- `game_saves` table (stores game state snapshots)
- Indexes for performance
- A leaderboard view

---

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your database credentials:
```bash
# Open in your text editor
nano .env
# OR
code .env
# OR
vim .env
```

3. Update the `DATABASE_URL` with your actual credentials:

**Format:**
```
DATABASE_URL=postgresql://username:password@host:port/database
```

**Examples:**

Local PostgreSQL:
```
DATABASE_URL=postgresql://manestreet_user:your_secure_password@localhost:5432/manestreet_game
```

Docker PostgreSQL:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/manestreet_game
```

Remote PostgreSQL (e.g., Heroku, Render, Supabase):
```
DATABASE_URL=postgresql://user:pass@host.region.provider.com:5432/database
```

---

## Step 5: Install Node.js Dependencies

```bash
# Make sure you're in the project directory
cd /Users/istiqlalaurangzeb/Downloads/CodeMayor/mayorfull/mayor-quiz-game

# Install dependencies
npm install
```

This will install:
- `express` - Web server framework
- `pg` - PostgreSQL client
- `cors` - Cross-origin resource sharing
- `uuid` - Session ID generation
- `dotenv` - Environment variable management

---

## Step 6: Test Database Connection

Create a quick test script:

```bash
# Test database connectivity
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    console.log('   Server time:', res.rows[0].now);
  }
  pool.end();
});
"
```

You should see:
```
✅ Database connected successfully!
   Server time: 2024-01-01 12:00:00.000000+00
```

---

## Step 7: Start the Server

```bash
# Start the backend server
npm start

# OR use Node directly
node backend/server.js
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
```

---

## Step 8: Test the Application

### Test the API:
```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"ManeStreet Backend API is running!"}
```

### Play the game:
1. Open your browser
2. Go to: `http://localhost:5000`
3. You should see the start screen
4. Enter your name and start playing!

---

## Troubleshooting

### Problem: "Cannot find module 'pg'"
**Solution:**
```bash
npm install
```

### Problem: "Connection refused" or "ECONNREFUSED"
**Solution:**
- Make sure PostgreSQL is running:
```bash
# macOS/Linux
sudo systemctl status postgresql

# OR check if the process is running
ps aux | grep postgres

# Docker
docker ps
```

### Problem: "password authentication failed"
**Solution:**
- Double-check your `.env` file credentials
- Make sure you created the user and granted permissions
- Try connecting manually: `psql -U manestreet_user -d manestreet_game`

### Problem: "database does not exist"
**Solution:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE manestreet_game;"
```

### Problem: "relation does not exist"
**Solution:**
```bash
# Re-run the schema initialization
psql -U manestreet_user -d manestreet_game -f backend/init-db.sql
```

### Problem: Port 5000 already in use
**Solution:**
Edit `backend/server.js` and change the PORT:
```javascript
const PORT = 3000; // or any available port
```

---

## Production Deployment

### Option 1: Deploy to Render.com (Free)
1. Sign up at [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Create a new Web Service
4. Connect your GitHub repo
5. Set environment variables in Render dashboard
6. Deploy!

### Option 2: Deploy to Railway.app (Free)
1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Deploy from GitHub
5. Railway auto-detects Node.js and runs `npm start`

### Option 3: Deploy to Heroku
1. Install Heroku CLI
2. Create app: `heroku create manestreet-game`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
4. Deploy: `git push heroku main`
5. Run schema: `heroku pg:psql < backend/init-db.sql`

---

## Database Management

### View all sessions:
```sql
psql -U manestreet_user -d manestreet_game

SELECT session_id, player_name, difficulty, final_score, completed_at
FROM game_sessions
ORDER BY created_at DESC
LIMIT 10;
```

### View leaderboard:
```sql
SELECT * FROM leaderboard_view LIMIT 10;
```

### Clear all data (reset):
```sql
TRUNCATE TABLE game_saves CASCADE;
TRUNCATE TABLE game_sessions CASCADE;
```

### Backup database:
```bash
pg_dump -U manestreet_user manestreet_game > backup.sql
```

### Restore database:
```bash
psql -U manestreet_user -d manestreet_game < backup.sql
```

---

## Next Steps

- ✅ Game is running locally
- 📊 Check analytics: `http://localhost:5000/api/analytics/summary`
- 🏆 View leaderboard: `http://localhost:5000/api/leaderboard`
- 🎮 Start playing and building your city!

---

## Need Help?

- Check `BACKEND_FEATURES.md` for API documentation
- Check `CLAUDE.md` for architecture details
- Review `backend/server.js` for endpoint implementations

Happy building! 🏛️🎮
