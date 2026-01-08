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

console.log('=== MATCH DATA ===');
db.all('SELECT id, champion, role, result, created_at FROM matches ORDER BY created_at DESC', [], (err, rows) => {
  if (err) console.error('Error:', err);
  else console.log(JSON.stringify(rows, null, 2));
  
  console.log('\n=== MATCH_MISTAKES DATA ===');
  db.all('SELECT * FROM match_mistakes', [], (err, rows) => {
    if (err) console.error('Error:', err);
    else console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
