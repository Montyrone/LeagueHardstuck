import { Match } from '../models/Match.js';
import { dbAll, dbRun, dbGet } from '../db/database.js';

export const getMatches = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    
    const matches = await Match.findAll(1, limit, offset);
    
    // Get mistakes for each match
    const matchesWithMistakes = await Promise.all(
      matches.map(async (match) => {
        const mistakes = await dbAll(`
          SELECT m.id, m.name, m.description
          FROM mistakes m
          INNER JOIN match_mistakes mm ON m.id = mm.mistake_id
          WHERE mm.match_id = ?
        `, [match.id]);

        return {
          ...match,
          mistakes: mistakes
        };
      })
    );

    res.json(matchesWithMistakes);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get mistakes for this match
    const mistakes = await dbAll(`
      SELECT m.id, m.name, m.description
      FROM mistakes m
      INNER JOIN match_mistakes mm ON m.id = mm.mistake_id
      WHERE mm.match_id = ?
    `, [id]);

    res.json({
      ...match,
      mistakes: mistakes
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};

export const createMatch = async (req, res) => {
  try {
    const matchData = req.body;
    
    // Validate required fields
    if (!matchData.champion || !matchData.champion.trim()) {
      return res.status(400).json({ error: 'Champion is required' });
    }
    if (!matchData.role || !matchData.role.trim()) {
      return res.status(400).json({ error: 'Role is required' });
    }
    if (!matchData.result || !['win', 'loss'].includes(matchData.result)) {
      return res.status(400).json({ error: 'Result must be either "win" or "loss"' });
    }
    
    const matchId = await Match.create(matchData);

    // Link mistakes if provided
    if (matchData.mistakeIds && Array.isArray(matchData.mistakeIds)) {
      for (const mistakeId of matchData.mistakeIds) {
        await dbRun(`
          INSERT OR IGNORE INTO match_mistakes (match_id, mistake_id)
          VALUES (?, ?)
        `, [matchId, mistakeId]);
      }
    }

    const newMatch = await Match.findById(matchId);
    const mistakes = await dbAll(`
      SELECT m.id, m.name, m.description
      FROM mistakes m
      INNER JOIN match_mistakes mm ON m.id = mm.mistake_id
      WHERE mm.match_id = ?
    `, [matchId]);

    res.status(201).json({
      ...newMatch,
      mistakes: mistakes
    });
  } catch (error) {
    console.error('Error creating match:', error);
    // Provide more detailed error message
    const errorMessage = error.message || 'Failed to create match';
    const statusCode = error.message && error.message.includes('NOT NULL') ? 400 : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const matchData = req.body;

    // Update match
    await Match.update(id, matchData);

    // Update mistakes if provided
    if (matchData.mistakeIds !== undefined) {
      // Delete existing mistake links
      await dbRun(`DELETE FROM match_mistakes WHERE match_id = ?`, [id]);

      // Add new mistake links
      if (Array.isArray(matchData.mistakeIds)) {
        for (const mistakeId of matchData.mistakeIds) {
          await dbRun(`
            INSERT INTO match_mistakes (match_id, mistake_id)
            VALUES (?, ?)
          `, [id, mistakeId]);
        }
      }
    }

    const updatedMatch = await Match.findById(id);
    const mistakes = await dbAll(`
      SELECT m.id, m.name, m.description
      FROM mistakes m
      INNER JOIN match_mistakes mm ON m.id = mm.mistake_id
      WHERE mm.match_id = ?
    `, [id]);

    res.json({
      ...updatedMatch,
      mistakes: mistakes
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    await Match.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
};

export const getMatchStats = async (req, res) => {
  try {
    const stats = await Match.getStats(1);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({ error: 'Failed to fetch match stats' });
  }
};

