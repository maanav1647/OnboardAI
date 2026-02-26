import db from '../config/database';
import { randomBytes } from 'crypto';

/**
 * Onboarding paths - represents the different user journeys
 * Tied to user types/roles
 */

export interface ChecklistItem {
  title: string;
  description: string;
}

export interface PathData {
  id: string;
  name: string;
  description: string;
  user_type: string;
  checklist_items: string; // JSON string
  created_at: string;
}

// Default onboarding paths for different user types
const DEFAULT_PATHS = [
  {
    user_type: 'Operations Manager',
    name: 'Operations Manager Onboarding',
    description: 'Streamline workflows, automate processes, and manage team efficiency',
    checklist: [
      { title: 'Set up team members', description: 'Invite and manage your team' },
      { title: 'Create approval workflows', description: 'Define custom workflows for your process' },
      { title: 'Configure automated reports', description: 'Set up weekly/monthly reports' },
      { title: 'Integrate with your tools', description: 'Connect Slack, Jira, or other tools' },
    ],
  },
  {
    user_type: 'Sales Lead',
    name: 'Sales Lead Onboarding',
    description: 'Boost productivity, manage pipeline, and track team performance',
    checklist: [
      { title: 'Import your contacts', description: 'Build your initial contact database' },
      { title: 'Create sales stages', description: 'Customize your pipeline stages' },
      { title: 'Set team goals', description: 'Define quarterly targets' },
      { title: 'Enable forecasting', description: 'Track pipeline health and predictions' },
    ],
  },
  {
    user_type: 'Founder',
    name: 'Founder Onboarding',
    description: 'Get complete control with advanced analytics and team management',
    checklist: [
      { title: 'Complete company profile', description: 'Set org name, industry, and details' },
      { title: 'Create teams and roles', description: 'Organize users by department' },
      { title: 'Set up integrations', description: 'Connect all your existing tools' },
      { title: 'Configure permissions', description: 'Manage who can do what' },
      { title: 'Enable analytics dashboard', description: 'Track all key metrics in one place' },
    ],
  },
  {
    user_type: 'Support Manager',
    name: 'Support Manager Onboarding',
    description: 'Deliver better support, faster response, and higher satisfaction',
    checklist: [
      { title: 'Set up help desk', description: 'Configure support channels' },
      { title: 'Create ticket templates', description: 'Standardize issue handling' },
      { title: 'Configure SLAs', description: 'Set response and resolution times' },
      { title: 'Create knowledge base', description: 'Build self-service articles' },
    ],
  },
  {
    user_type: 'Marketing Manager',
    name: 'Marketing Manager Onboarding',
    description: 'Plan campaigns, track results, and optimize marketing spend',
    checklist: [
      { title: 'Create marketing calendar', description: 'Plan campaigns and content' },
      { title: 'Set up email templates', description: 'Design automated email flows' },
      { title: 'Create assets library', description: 'Organize brand assets' },
      { title: 'Connect analytics', description: 'Track campaign performance' },
    ],
  },
];

export class OnboardingPath {
  /**
   * Initialize default paths (run once at startup)
   */
  static async seedDefaultPaths(): Promise<void> {
    for (const path of DEFAULT_PATHS) {
      const existing = await this.findByUserType(path.user_type);
      if (!existing) {
        await this.create(
          path.user_type,
          path.name,
          path.description,
          path.checklist
        );
      }
    }
  }

  /**
   * Create a new onboarding path
   */
  static async create(
    user_type: string,
    name: string,
    description: string,
    checklist_items: ChecklistItem[]
  ): Promise<PathData> {
    return new Promise((resolve, reject) => {
      const id = randomBytes(16).toString('hex');
      const checklistJson = JSON.stringify(checklist_items);

      db.run(
        `INSERT INTO onboarding_paths (id, user_type, name, description, checklist_items) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, user_type, name, description, checklistJson],
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            this.findById(id)
              .then((path) => {
                if (!path) reject(new Error('Path not found after creation'));
                else resolve(path);
              })
              .catch(reject);
          }
        }
      );
    });
  }

  /**
   * Find path by ID
   */
  static async findById(id: string): Promise<PathData | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM onboarding_paths WHERE id = ?`,
        [id],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  /**
   * Find path by user type
   */
  static async findByUserType(user_type: string): Promise<PathData | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM onboarding_paths WHERE user_type = ?`,
        [user_type],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  /**
   * Get all paths
   */
  static async getAll(): Promise<PathData[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM onboarding_paths ORDER BY user_type`,
        (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Parse checklist items from JSON
   */
  static parseChecklist(pathData: PathData): ChecklistItem[] {
    try {
      return JSON.parse(pathData.checklist_items);
    } catch {
      return [];
    }
  }
}
