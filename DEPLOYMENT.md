# Deployment Guide: Render

This guide will walk you through deploying **Mane Street Mayor** to Render with PostgreSQL database.

## Prerequisites

- GitHub account
- Render account (free at https://render.com)
- Your code pushed to a GitHub repository

## Option 1: Deploy with render.yaml (Recommended - Easiest)

This method automatically sets up both the database and web service.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New" → "Blueprint"

3. **Connect your repository**
   - Select "Connect a repository"
   - Authorize Render to access your GitHub
   - Select your `mayor-quiz-game` repository

4. **Render will detect render.yaml**
   - It will automatically create:
     - PostgreSQL database: `mayor-quiz-db`
     - Web service: `mayor-quiz-game`
   - Review the configuration and click "Apply"

5. **Wait for deployment**
   - Database will be created first (2-3 minutes)
   - Web service will build and deploy (3-5 minutes)
   - Watch the logs for any errors

6. **Access your game!**
   - Once deployed, Render will provide a URL like: `https://mayor-quiz-game.onrender.com`
   - Click on it to play your game!

## Option 2: Manual Setup (More Control)

If you prefer manual control or if render.yaml doesn't work:

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Configure:
   - **Name**: `mayor-quiz-db` (or your preferred name)
   - **Database**: `mayor_quiz_game`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free
3. Click "Create Database"
4. Wait for it to provision (2-3 minutes)
5. **Save the connection details** - You'll need the "Internal Database URL" or "External Database URL"

### Step 2: Create Web Service

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `mayor-quiz-game`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (scroll down):
   - Click "Add Environment Variable"
   - Add these:
     ```
     NODE_ENV = production
     DATABASE_URL = [paste your database URL from Step 1]
     ```

5. Click "Create Web Service"

6. **Wait for deployment** (3-5 minutes)
   - Render will:
     - Clone your repo
     - Run `npm install`
     - Start your server with `npm start`
     - The database tables will be created automatically on first run

### Step 3: Verify Deployment

1. Click on the service URL provided by Render
2. Test the game:
   - Try starting a new game
   - Make some decisions
   - Check if leaderboard works
3. Check the logs if anything doesn't work:
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for any error messages

## Important Notes

### Free Tier Limitations

Render's free tier has some limitations:
- **Web Service**: Spins down after 15 minutes of inactivity
  - First request after inactivity takes 30-60 seconds (cold start)
- **Database**: 90-day expiration for free databases
  - You'll need to recreate or upgrade before expiration
- **750 hours/month** of runtime for web services

### Database Connection

Your app automatically:
- Creates tables on first run (`game_sessions` and `game_saves`)
- Uses SSL connection for security
- Handles connection errors gracefully

### Updating Your Deployment

After making changes to your code:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically:
- Detect the push
- Rebuild your app
- Redeploy (takes 3-5 minutes)

## Troubleshooting

### Problem: "Database connection failed"

**Solution:**
1. Check that `DATABASE_URL` environment variable is set correctly
2. Verify database is running (check Render dashboard)
3. Ensure database and web service are in the same region
4. Check server logs for specific error messages

### Problem: "Cannot find module"

**Solution:**
1. Make sure `package.json` has all dependencies listed
2. Verify `npm install` ran successfully in build logs
3. Try triggering a manual redeploy

### Problem: "Application Error" or timeout

**Solution:**
1. Check if the PORT environment variable is being used (already configured in code)
2. Review server logs for startup errors
3. Ensure `backend/server.js` exists and has correct path in package.json

### Problem: Cold starts are slow

**Solution:**
- This is expected on free tier
- Consider upgrading to paid plan ($7/month) for always-on service
- Or accept 30-60 second initial load time after inactivity

### Problem: Game works but database features don't

**Solution:**
1. Check browser console for API errors
2. Verify all API endpoints are responding: `https://your-app.onrender.com/api/health`
3. Check if database tables were created (view server logs on startup)

## Monitoring Your App

### View Logs

1. Go to your service in Render dashboard
2. Click "Logs" tab
3. You'll see:
   - Server startup messages
   - Database connection status
   - API requests
   - Any errors

### Check Metrics

1. Go to your service dashboard
2. View:
   - Request volume
   - Response times
   - Memory usage
   - Error rates

## Custom Domain (Optional)

To use your own domain (e.g., `manestreetmayor.com`):

1. Go to your web service settings
2. Click "Custom Domain"
3. Add your domain
4. Update your domain's DNS records as instructed
5. Render provides free SSL certificates!

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `PORT` | No | Server port (auto-set by Render) | `10000` |

## Costs

**Current setup (Free tier):**
- Database: $0/month (90-day limit)
- Web Service: $0/month (750 hours with cold starts)

**Upgraded (Recommended for production):**
- Database (Starter): $7/month (no expiration, better performance)
- Web Service (Starter): $7/month (always-on, no cold starts)
- **Total: $14/month**

## Next Steps

After successful deployment:

1. Share your game URL with friends!
2. Monitor the leaderboard to see players
3. Check analytics via `/api/analytics/summary`
4. Consider upgrading if you get consistent traffic
5. Set up custom domain for professional URL

## Support

If you encounter issues:
1. Check Render's status page: https://status.render.com
2. Review Render docs: https://render.com/docs
3. Check your repository's GitHub Actions/Issues
4. Render Community: https://community.render.com

---

**Congratulations! Your game is now live!**

Share it with the world: `https://your-app-name.onrender.com`
