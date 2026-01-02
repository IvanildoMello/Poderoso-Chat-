export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
  read?: boolean; // New: Read receipt status
}

export interface UserProfile {
  username: string;
  accessLevel: 'OMEGA' | 'ALPHA' | 'BETA';
}

export interface UserProfileDetails {
  name: string;
  bio: string;
  avatarUrl: string | null;
  coverImageUrl?: string | null;
  githubUrl: string;
  linkedinUrl: string;
}

export interface UserStats {
  interactionCount: number;
  neuralSyncLevel: number; // 0-100%
  evolutionStage: number; // Level 1-10
  cognitiveAlignment: 'CHAOTIC' | 'NEUTRAL' | 'LAWFUL';
}

export enum ConnectionStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO Date string
  priority: TaskPriority;
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  timestamp: Date;
  read: boolean;
}

// NEW: Persistent System Log History
export interface SystemLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string; // ISO string for easy storage
  category: 'SECURITY' | 'TASK' | 'SYSTEM' | 'NETWORK';
}