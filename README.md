# LeagueHardstuck

A personal web application to help League of Legends players systematically improve by tracking performance, identifying patterns, and turning match data into actionable insights.

## Features

- **Match Logging**: Log matches with champion, role, KDA, CS/min, result, and reflection notes
- **Performance Dashboard**: View win rates, statistics, and trends over time
- **Mistake Tracking**: Tag matches with common mistakes and identify recurring issues
- **Goal Management**: Set improvement goals and track their progress
- **Match Review**: Add reflection notes to each match with guided prompts

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite

## Quick Start

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

### Quick Setup (Windows)

**Option 1: Automated Startup (Recommended)**
1. Right-click `start.ps1` and select "Run with PowerShell"
   - This will install dependencies (if needed) and start both servers
   - Browser will open automatically after servers start

**Option 2: Manual Setup**
1. Double-click `install-dependencies.bat` to install all dependencies
2. Double-click `start-backend.bat` to start the backend server (keep this window open)
3. Double-click `start-frontend.bat` to start the frontend server (keep this window open)
4. Open your browser and navigate to `http://localhost:3000`

### Manual Setup (All Platforms)

1. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Start the Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000` and automatically create the SQLite database on first run.

3. **Start the Frontend Development Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` and automatically proxy API requests to the backend.

4. **Open your browser** and navigate to `http://localhost:3000`

### Development Mode

For development with auto-reload:
- Backend: Use `npm run dev` (if nodemon is available) or `npm start`
- Frontend: `npm run dev` (Vite's dev server with HMR)

## Project Structure

```
summonersense/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── db/
│       └── database.sqlite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## API Endpoints

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match by ID
- `GET /api/matches/stats` - Get match statistics
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get goal by ID
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Mistakes
- `GET /api/mistakes` - Get all mistake types
- `GET /api/mistakes/stats` - Get mistake statistics

## Database Schema

The SQLite database includes tables for:
- `users` - User accounts (single-user focused)
- `matches` - Match records
- `goals` - Improvement goals
- `mistakes` - Predefined mistake types
- `match_mistakes` - Junction table for match-mistake relationships
- `goal_matches` - Junction table for goal-match relationships

## Development Notes

- This is a personal learning project focused on single-user use
- The database is automatically initialized on first server start
- Default mistake types are pre-populated
- Authentication is simplified for single-user focus

## License

Personal project - use as you wish!

## Publishing to GitHub

To create a Git repository locally and push to GitHub, use PowerShell from the project root. Replace `<REMOTE_URL>` with the GitHub repo URL you create on the website.

```powershell
cd "c:\League Project"
git init
git add .
git commit -m "Initial commit: project files"
git branch -M main
# Replace <REMOTE_URL> with your repository URL (HTTPS or SSH)
git remote add origin <REMOTE_URL>
git push -u origin main
```

If you prefer to create the GitHub repo from the CLI (GitHub CLI `gh` must be installed and authenticated):

```powershell
cd "c:\League Project"
gh repo create <your-username>/<repo-name> --public --source=. --remote=origin --push
```

Update `LICENSE` with your name and year. If you want the SQLite database tracked, remove `db/*.sqlite` from `.gitignore` before committing.

