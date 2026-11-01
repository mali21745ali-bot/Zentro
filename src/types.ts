/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  demoCredits: number;
  totalEarned: number;
  totalSpent: number;
  tasksCompleted: number;
  gamesPlayed: number;
  role: UserRole;
  disabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type TaskCategory = 'simple' | 'quiz' | 'educational' | 'ad' | 'special';

export type TaskStatus = 'active' | 'inactive';

export type SubmissionStatus = 'available' | 'in_progress' | 'pending' | 'approved' | 'rejected' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardCredits: number;
  estimatedMinutes: number;
  instructions: string;
  status: TaskStatus;
  requirements?: string[];
  createdAt: string;
  createdBy?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  proofText: string;
  proofUrl?: string;
  rewardCredits: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface YouTubeTaskItem {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  channelName: string;
  description: string;
  rewardCredits: number;
  questions: QuizQuestion[];
  active: boolean;
  createdAt: string;
  duration?: string;
}

export interface YouTubeCompletion {
  id: string;
  userId: string;
  youtubeTaskId: string;
  score: number;
  rewardCredits: number;
  completedAt: string;
}

export type GameType = 'quick-math' | 'pattern-sprint' | 'memory-challenge';

export interface GameResult {
  id: string;
  userId: string;
  gameType: GameType;
  score: number;
  difficulty?: string;
  rewardCredits: number;
  playedAt: string;
}

export type TransactionType = 'task_reward' | 'quiz_reward' | 'game_reward' | 'admin_adjustment';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'quiz' | 'game' | 'system' | 'wallet';
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'general' | 'tasks' | 'wallet' | 'bug' | 'account';
  message: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  targetUserId?: string;
  timestamp: string;
}

export interface PlatformSettings {
  appName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  adTasksNotice: string;
  minWithdrawalPlaceholder: number;
}
