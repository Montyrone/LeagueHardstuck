import { dbAll, dbGet, dbRun } from '../db/database.js';

export const getMistakes = async (req, res) => {
  try {
    const mistakes = await dbAll(`SELECT * FROM mistakes ORDER BY name`);
    res.json(mistakes);
  } catch (error) {
    console.error('Error fetching mistakes:', error);
    res.status(500).json({ error: 'Failed to fetch mistakes' });
  }
};

export const getMistakeStats = async (req, res) => {
  try {
    // First, clean up any orphaned match_mistakes records (mistakes linked to deleted matches)
    await dbRun(`
      DELETE FROM match_mistakes 
      WHERE match_id NOT IN (SELECT id FROM matches)
    `);

    // Get mistake frequency across all matches that still exist
    const stats = await dbAll(`
      SELECT 
        m.id,
        m.name,
        m.description,
        COUNT(mm.match_id) as frequency
      FROM mistakes m
      LEFT JOIN match_mistakes mm ON m.id = mm.mistake_id
      GROUP BY m.id, m.name, m.description
      HAVING frequency > 0
      ORDER BY frequency DESC
    `);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching mistake stats:', error);
    res.status(500).json({ error: 'Failed to fetch mistake stats' });
  }
};

