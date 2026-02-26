import db from '../config/database';
import bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';

/**
 * User model - handles database operations for users
 */

export interface UserData {
  id: string;
  email: string;
  password_hash: string;
  role: string | null;
  team_size: string | null;
  goal: string | null;
  assigned_path: string | null;
  created_at: string;
  updated_at: string;
}

export class User {
  /**
   * Create a new user with email and password
   */
  static async create(
    email: string,
    password: string
  ): Promise<UserData> {
    return new Promise(async (resolve, reject) => {
      try {
        const id = randomBytes(16).toString('hex');
        const password_hash = await bcryptjs.hash(password, 10);

        db.run(
          `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
          [id, email, password_hash],
          function (err: Error | null) {
            if (err) {
              reject(err);
            } else {
              User.findById(id)
                .then((user) => {
                  if (user) resolve(user);
                  else reject(new Error('User not found after creation'));
                })
                .catch(reject);
            }
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  /**
   * Verify password
   */
  static async verifyPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcryptjs.compare(password, passwordHash);
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    id: string,
    data: { role?: string; team_size?: string; goal?: string; assigned_path?: string }
  ): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.role !== undefined) {
        updates.push('role = ?');
        values.push(data.role);
      }
      if (data.team_size !== undefined) {
        updates.push('team_size = ?');
        values.push(data.team_size);
      }
      if (data.goal !== undefined) {
        updates.push('goal = ?');
        values.push(data.goal);
      }
      if (data.assigned_path !== undefined) {
        updates.push('assigned_path = ?');
        values.push(data.assigned_path);
      }

      if (updates.length === 0) {
        resolve(null);
        return;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values,
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            User.findById(id)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  }

  /**
   * Get all users (for admin dashboard)
   */
  static async getAllUsers(): Promise<UserData[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, email, role, team_size, goal, assigned_path, created_at FROM users ORDER BY created_at DESC`,
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
}
