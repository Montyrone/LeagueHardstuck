import { dbRun, dbGet, dbAll } from '../db/database.js';

export class Match {
  static async create(matchData) {
    const {
      champion,
      role,
      result,
      kills = 0,
      deaths = 0,
      assists = 0,
      cs_per_min = 0,
      game_duration = 0,
      notes = null,
      user_id = 1
    } = matchData;

    // Convert empty string notes to null
    const notesValue = (notes && notes.trim()) ? notes.trim() : null;

    const sql = `
      INSERT INTO matches (user_id, champion, role, result, kills, deaths, assists, cs_per_min, game_duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const dbResult = await dbRun(sql, [
      user_id,
      champion,
      role,
      result,
      kills,
      deaths,
      assists,
      cs_per_min,
      game_duration,
      notesValue
    ]);

    return dbResult.lastID;
  }

  static async findAll(userId = 1, limit = null, offset = 0) {
    let sql = `
      SELECT * FROM matches 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      return dbAll(sql, [userId, limit, offset]);
    }

    return dbAll(sql, [userId]);
  }

  static async findById(id, userId = 1) {
    const sql = `SELECT * FROM matches WHERE id = ? AND user_id = ?`;
    return dbGet(sql, [id, userId]);
  }

  static async update(id, matchData, userId = 1) {
    const {
      champion,
      role,
      result,
      kills,
      deaths,
      assists,
      cs_per_min,
      game_duration,
      notes
    } = matchData;

    const sql = `
      UPDATE matches 
      SET champion = ?, role = ?, result = ?, kills = ?, deaths = ?, assists = ?,
          cs_per_min = ?, game_duration = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `;

    return dbRun(sql, [
      champion,
      role,
      result,
      kills,
      deaths,
      assists,
      cs_per_min,
      game_duration,
      notes,
      id,
      userId
    ]);
  }

  static async delete(id, userId = 1) {
    // Delete associated match_mistakes first (in case cascade isn't working)
    await dbRun(`DELETE FROM match_mistakes WHERE match_id = ?`, [id]);
    
    // Delete associated goal_matches
    await dbRun(`DELETE FROM goal_matches WHERE match_id = ?`, [id]);
    
    // Delete the match itself
    const sql = `DELETE FROM matches WHERE id = ? AND user_id = ?`;
    return dbRun(sql, [id, userId]);
  }

  static async getStats(userId = 1) {
    const stats = {};

    // Overall stats
    const overall = await dbGet(`
      SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        AVG(kills) as avg_kills,
        AVG(deaths) as avg_deaths,
        AVG(assists) as avg_assists,
        AVG(cs_per_min) as avg_cs_per_min
      FROM matches
      WHERE user_id = ?
    `, [userId]);

    stats.overall = {
      totalGames: overall.total_games || 0,
      wins: overall.wins || 0,
      losses: (overall.total_games || 0) - (overall.wins || 0),
      winRate: overall.total_games > 0 ? ((overall.wins / overall.total_games) * 100).toFixed(1) : 0,
      avgKills: overall.avg_kills ? parseFloat(overall.avg_kills).toFixed(1) : 0,
      avgDeaths: overall.avg_deaths ? parseFloat(overall.avg_deaths).toFixed(1) : 0,
      avgAssists: overall.avg_assists ? parseFloat(overall.avg_assists).toFixed(1) : 0,
      avgCSPerMin: overall.avg_cs_per_min ? parseFloat(overall.avg_cs_per_min).toFixed(2) : 0
    };

    // Win rate by champion
    const byChampion = await dbAll(`
      SELECT 
        champion,
        COUNT(*) as games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        AVG(kills) as avg_kills,
        AVG(deaths) as avg_deaths,
        AVG(assists) as avg_assists,
        AVG(cs_per_min) as avg_cs_per_min
      FROM matches
      WHERE user_id = ?
      GROUP BY champion
      ORDER BY games DESC
    `, [userId]);

    stats.byChampion = byChampion.map(champ => ({
      champion: champ.champion,
      games: champ.games,
      wins: champ.wins,
      losses: champ.games - champ.wins,
      winRate: ((champ.wins / champ.games) * 100).toFixed(1),
      avgKDA: `${parseFloat(champ.avg_kills).toFixed(1)}/${parseFloat(champ.avg_deaths).toFixed(1)}/${parseFloat(champ.avg_assists).toFixed(1)}`,
      avgCSPerMin: parseFloat(champ.avg_cs_per_min).toFixed(2)
    }));

    // Win rate by role
    const byRole = await dbAll(`
      SELECT 
        role,
        COUNT(*) as games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        AVG(cs_per_min) as avg_cs_per_min
      FROM matches
      WHERE user_id = ?
      GROUP BY role
      ORDER BY games DESC
    `, [userId]);

    stats.byRole = byRole.map(role => ({
      role: role.role,
      games: role.games,
      wins: role.wins,
      losses: role.games - role.wins,
      winRate: ((role.wins / role.games) * 100).toFixed(1),
      avgCSPerMin: parseFloat(role.avg_cs_per_min).toFixed(2)
    }));

    // Recent performance (last 10 vs last 30)
    const last10 = await dbGet(`
      SELECT 
        COUNT(*) as games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        AVG(cs_per_min) as avg_cs_per_min
      FROM (
        SELECT result, cs_per_min FROM matches
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      )
    `, [userId]);

    const last30 = await dbGet(`
      SELECT 
        COUNT(*) as games,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
        AVG(cs_per_min) as avg_cs_per_min
      FROM (
        SELECT result, cs_per_min FROM matches
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 30
      )
    `, [userId]);

    stats.recentPerformance = {
      last10: {
        games: last10.games || 0,
        wins: last10.wins || 0,
        winRate: last10.games > 0 ? ((last10.wins / last10.games) * 100).toFixed(1) : 0,
        avgCSPerMin: last10.avg_cs_per_min ? parseFloat(last10.avg_cs_per_min).toFixed(2) : 0
      },
      last30: {
        games: last30.games || 0,
        wins: last30.wins || 0,
        winRate: last30.games > 0 ? ((last30.wins / last30.games) * 100).toFixed(1) : 0,
        avgCSPerMin: last30.avg_cs_per_min ? parseFloat(last30.avg_cs_per_min).toFixed(2) : 0
      }
    };

    return stats;
  }
}

