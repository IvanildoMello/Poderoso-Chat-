import Dexie, { Table } from 'dexie';
import { Message, Task, SystemLogEntry, UserProfileDetails, UserStats } from '../types';

export class NeuroDatabase extends Dexie {
  tasks!: Table<Task>;
  logs!: Table<SystemLogEntry>;
  messages!: Table<Message>;
  profile!: Table<UserProfileDetails>;
  stats!: Table<UserStats>;
  settings!: Table<{id: string, value: any}>;

  constructor() {
    super('NeuroCoreDB');
    
    // Define schema
    (this as any).version(1).stores({
      tasks: 'id, title, priority, completed, dueDate',
      logs: 'id, category, timestamp',
      messages: 'id, role, timestamp, read',
      profile: 'name', // Singular object usually, but indexed by name or a fixed key
      stats: 'id', // Singleton
      settings: 'id' // Key-value store
    });
  }
}

export const db = new NeuroDatabase();

// --- Database Helpers ---

export const saveLog = async (log: SystemLogEntry) => {
    try {
        await db.logs.add(log);
        // Keep only last 200 logs to prevent bloat
        const count = await db.logs.count();
        if (count > 200) {
            const oldest = await db.logs.orderBy('timestamp').limit(count - 200).keys();
            await db.logs.bulkDelete(oldest);
        }
    } catch (error) {
        console.error("DB Error (Log):", error);
    }
};

export const getLogs = async () => {
    return await db.logs.orderBy('timestamp').reverse().limit(100).toArray();
};

export const saveMessage = async (msg: Message) => {
    await db.messages.put(msg);
};

export const getMessages = async () => {
    return await db.messages.orderBy('timestamp').toArray();
};

export const saveUserProfile = async (profile: UserProfileDetails) => {
    // We use a fixed key 'current_user' for the single profile
    await db.profile.put({ ...profile }, 'current_user' as any);
};

export const getUserProfile = async (): Promise<UserProfileDetails | undefined> => {
    return await db.profile.get('current_user' as any);
};

export const saveUserStats = async (stats: UserStats) => {
    await db.stats.put({ ...stats, id: 'current_stats' } as any);
};

export const getUserStats = async (): Promise<UserStats | undefined> => {
    return await db.stats.get('current_stats' as any);
};

// --- Sync Simulation ---
export const syncWithCloud = async () => {
    // This is a placeholder for real API calls to Firebase/Supabase
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 1500 + Math.random() * 1000); // Simulate network latency
    });
};