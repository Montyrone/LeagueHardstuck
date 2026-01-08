import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

const queries = [
  { name: 'matches_count', sql: 'SELECT COUNT(*) as count FROM matches' },
  { name: 'match_mistakes_count', sql: 'SELECT COUNT(*) as count FROM match_mistakes' },
  { name: 'orphaned_match_mistakes_count', sql: 'SELECT COUNT(*) as count FROM match_mistakes WHERE match_id NOT IN (SELECT id FROM matches)' },
  { name: 'top_mistakes', sql: `SELECT m.id, m.name, COUNT(mm.match_id) as frequency
    FROM mistakes m
    LEFT JOIN match_mistakes mm ON m.id = mm.mistake_id
    GROUP BY m.id, m.name
    ORDER BY frequency DESC` },
  { name: 'sample_orphans', sql: 'SELECT * FROM match_mistakes WHERE match_id NOT IN (SELECT id FROM matches) LIMIT 10' }
];

(async () => {
  for (const q of queries) {
    await new Promise((resolve) => {
      db.all(q.sql, [], (err, rows) => {
        if (err) {
          console.error(`Error running ${q.name}:`, err);
        } else {
          console.log(`--- ${q.name} ---`);
          console.log(JSON.stringify(rows, null, 2));
        }
        resolve();
      });
    });
  }
  db.close();
})();
