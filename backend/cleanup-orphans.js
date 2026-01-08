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

db.run(`DELETE FROM match_mistakes WHERE match_id NOT IN (SELECT id FROM matches)`, function(err) {
  if (err) {
    console.error('Error deleting orphaned match_mistakes:', err);
  } else {
    console.log(`✓ Deleted orphaned match_mistakes rows: ${this.changes}`);
  }
  db.close();
});
