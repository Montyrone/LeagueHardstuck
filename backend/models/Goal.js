import { dbRun, dbGet, dbAll } from '../db/database.js';

export class Goal {
  static async create(goalData) {
    const {
      title,
      description = null,
      status = 'active',
      user_id = 1
    } = goalData;

    const sql = `
      INSERT INTO goals (user_id, title, description, status)
      VALUES (?, ?, ?, ?)
    `;

    const result = await dbRun(sql, [user_id, title, description, status]);
    return result.lastID;
  }

  static async findAll(userId = 1, status = null) {
    let sql = `
      SELECT * FROM goals 
      WHERE user_id = ?
    `;

    const params = [userId];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    return dbAll(sql, params);
  }

  static async findById(id, userId = 1) {
    const sql = `SELECT * FROM goals WHERE id = ? AND user_id = ?`;
    return dbGet(sql, [id, userId]);
  }

  static async update(id, goalData, userId = 1) {
    const {
      title,
      description,
      status,
      completed_at
    } = goalData;

    const sql = `
      UPDATE goals 
      SET title = ?, description = ?, status = ?, completed_at = ?
      WHERE id = ? AND user_id = ?
    `;

    return dbRun(sql, [title, description, status, completed_at, id, userId]);
  }

  static async delete(id, userId = 1) {
    const sql = `DELETE FROM goals WHERE id = ? AND user_id = ?`;
    return dbRun(sql, [id, userId]);
  }

  static async linkToMatch(goalId, matchId) {
    const sql = `
      INSERT OR IGNORE INTO goal_matches (goal_id, match_id)
      VALUES (?, ?)
    `;
    return dbRun(sql, [goalId, matchId]);
  }
}

