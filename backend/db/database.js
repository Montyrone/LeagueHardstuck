import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');

let db = null;

export const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
};

// Promisify database methods
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const initializeDatabase = () => {
  const database = getDatabase();

  // Users table (single user for now, but structured for future expansion)
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Matches table
  database.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      champion TEXT NOT NULL,
      role TEXT NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('win', 'loss')),
      kills INTEGER DEFAULT 0,
      deaths INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      cs_per_min REAL DEFAULT 0,
      game_duration INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Goals table
  database.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Mistakes table (predefined mistake types)
  database.run(`
    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  // Match mistakes junction table
  database.run(`
    CREATE TABLE IF NOT EXISTS match_mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      mistake_id INTEGER NOT NULL,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (mistake_id) REFERENCES mistakes(id),
      UNIQUE(match_id, mistake_id)
    )
  `);

  // Goal matches junction table (linking goals to matches)
  database.run(`
    CREATE TABLE IF NOT EXISTS goal_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      UNIQUE(goal_id, match_id)
    )
  `);

  // Insert default mistakes
  const defaultMistakes = [
    { name: 'Overextending', description: 'Pushed too far without vision' },
    { name: 'Poor Vision Control', description: 'Did not ward enough or cleared wards' },
    { name: 'Bad Recalls', description: 'Poor timing on recalls' },
    { name: 'Tilt / Emotional Decisions', description: 'Made decisions based on emotion' },
    { name: 'Missed Objectives', description: 'Failed to secure or contest objectives' },
    { name: 'Poor Positioning', description: 'Positioned poorly in teamfights' },
    { name: 'CS Mistakes', description: 'Missed too much CS' },
    { name: 'Map Awareness', description: 'Did not pay attention to minimap' }
  ];

  defaultMistakes.forEach(mistake => {
    database.run(`
      INSERT OR IGNORE INTO mistakes (name, description) 
      VALUES (?, ?)
    `, [mistake.name, mistake.description]);
  });

  console.log('Database initialized');
};

