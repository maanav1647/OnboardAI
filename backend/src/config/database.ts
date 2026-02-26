import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Database path from .env or default
const dbPath = process.env.DB_PATH || './data/onboard.db';

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database schema
 * Creates tables for users, onboarding paths, and checklists
 */
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT,
          team_size TEXT,
          goal TEXT,
          assigned_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err: Error | null) => {
          if (err) reject(err);
        }
      );

      // Onboarding paths table
      db.run(
        `CREATE TABLE IF NOT EXISTS onboarding_paths (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          user_type TEXT NOT NULL,
          checklist_items TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err: Error | null) => {
          if (err) reject(err);
        }
      );

      // User checklist progress table
      db.run(
        `CREATE TABLE IF NOT EXISTS user_checklists (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          path_id TEXT NOT NULL,
          item_index INTEGER,
          completed BOOLEAN DEFAULT 0,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (path_id) REFERENCES onboarding_paths(id)
        )`,
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

export default db;
