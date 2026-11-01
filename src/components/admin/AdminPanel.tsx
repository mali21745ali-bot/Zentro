/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckSquare,
  Tv,
  Gamepad2,
  Coins,
  Activity,
  Settings,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  KeyRound,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  UserProfile,
  TaskItem,
  TaskSubmission,
  YouTubeTaskItem,
  AdminLog,
  CreditTransaction,
} from '../../types.ts';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { DEFAULT_TASKS, DEFAULT_YOUTUBE_TASKS } from '../../lib/defaultData.ts';

type AdminTab =
  | 'overview'
  | 'users'
  | 'tasks'
  | 'submissions'
  | 'youtube'
  | 'games'
  | 'credits'
  | 'logs'
  | 'settings'
  | 'security_guide';

export const AdminPanel: React.FC = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Admin Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [youtubeTasks, setYoutubeTasks] = useState<YouTubeTaskItem[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search queries
  const [userSearch, setUserSearch] = useState<string>('');
  const [taskSearch, setTaskSearch] = useState<string>('');

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isCreateYoutubeOpen, setIsCreateYoutubeOpen] = useState<boolean>(false);
  const [adjustingUser, setAdjustingUser] = useState<UserProfile | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(50);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Fetch all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        const uList: UserProfile[] = [];
        userSnap.forEach((d) => uList.push(d.data() as UserProfile));
        setUsers(uList);
      } catch {
        if (userProfile) setUsers([userProfile]);
      }

      // 2. Fetch Tasks
      try {
        const taskSnap = await getDocs(collection(db, 'tasks'));
        const tList: TaskItem[] = [];
        taskSnap.forEach((d) => tList.push({ id: d.id, ...(d.data() as Omit<TaskItem, 'id'>) }));
        const merged = [...DEFAULT_TASKS];
        tList.forEach((t) => {
          if (!merged.find((m) => m.id === t.id)) merged.push(t);
        });
        setTasks(merged);
      } catch {
        setTasks(DEFAULT_TASKS);
      }

      // 3. Fetch Submissions
      try {
        const subSnap = await getDocs(collection(db, 'taskSubmissions'));
        const sList: TaskSubmission[] = [];
        subSnap.forEach((d) => sList.push({ id: d.id, ...(d.data() as Omit<TaskSubmission, 'id'>) }));
        sList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(sList);
      } catch {
        setSubmissions([]);
      }

      // 4. Fetch YouTube Tasks
      try {
        const ytSnap = await getDocs(collection(db, 'youtubeTasks'));
        const yList: YouTubeTaskItem[] = [];
        ytSnap.forEach((d) => yList.push({ id: d.id, ...(d.data() as Omit<YouTubeTaskItem, 'id'>) }));
        const mergedYt = [...DEFAULT_YOUTUBE_TASKS];
        yList.forEach((y) => {
          if (!mergedYt.find((m) => m.id === y.id)) mergedYt.push(y);
        });
        setYoutubeTasks(mergedYt);
      } catch {
        setYoutubeTasks(DEFAULT_YOUTUBE_TASKS);
      }

      // 5. Fetch Admin Logs
      try {
        const logSnap = await getDocs(collection(db, 'adminLogs'));
        const lList: AdminLog[] = [];
        logSnap.forEach((d) => lList.push({ id: d.id, ...(d.data() as Omit<AdminLog, 'id'>) }));
        lList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAdminLogs(lList);
      } catch {
        setAdminLogs([]);
      }
    } catch (err) {
      console.error('Failed to load admin datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const recordAdminAction = async (action: string, details: string, targetUserId?: string) => {
    try {
      const logItem: Omit<AdminLog, 'id'> = {
        adminId: currentUser?.uid || 'admin',
        adminEmail: currentUser?.email || 'admin@zentro.com',
        action,
        details,
        targetUserId,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'adminLogs'), logItem);
      setAdminLogs((prev) => [{ id: `log-${Date.now()}`, ...logItem }, ...prev]);
    } catch {}
  };

  // Toggle user account disabled
  const handleToggleUserAccount = async (targetUser: UserProfile) => {
    try {
      const newDisabledState = !targetUser.disabled;
      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, { disabled: newDisabledState });

      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, disabled: newDisabledState } : u))
      );

      await recordAdminAction(
        newDisabledState ? 'USER_DISABLED' : 'USER_ENABLED',
        `Admin changed account status for ${targetUser.email}`,
        targetUser.uid
      );

      setStatusMessage({
        type: 'success',
        text: `Account for ${targetUser.displayName} ${newDisabledState ? 'disabled' : 'enabled'}.`,
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update user status.' });
    }
  };

  // Submission review (Approve / Reject)
  const handleReviewSubmission = async (
    sub: TaskSubmission,
    status: 'approved' | 'rejected',
    notes: string = ''
  ) => {
    try {
      const subRef = doc(db, 'taskSubmissions', sub.id);
      await updateDoc(subRef, {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.email || 'Admin',
        reviewerNotes: notes || (status === 'approved' ? 'Verified by Admin' : 'Incomplete submission criteria'),
      });

      // If approved, update target user's demo credits
      if (status === 'approved') {
        const userRef = doc(db, 'users', sub.userId);
        const targetUser = users.find((u) => u.uid === sub.userId);
        const currentCredits = targetUser ? targetUser.demoCredits : 0;
        const newCredits = currentCredits + sub.rewardCredits;

        await updateDoc(userRef, {
          demoCredits: newCredits,
          tasksCompleted: (targetUser?.tasksCompleted || 0) + 1,
          totalEarned: (targetUser?.totalEarned || 0) + sub.rewardCredits,
        });

        // Add transaction
        await addDoc(collection(db, 'transactions'), {
          userId: sub.userId,
          type: 'task_reward',
          amount: sub.rewardCredits,
          description: `Submission Approved: ${sub.taskTitle}`,
          referenceId: sub.id,
          timestamp: new Date().toISOString(),
        });

        // Add notification
        await addDoc(collection(db, 'notifications'), {
          userId: sub.userId,
          title: `Task Approved: +${sub.rewardCredits} Demo Credits`,
          message: `Your submission for "${sub.taskTitle}" has been verified and approved.`,
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Notification for rejection
        await addDoc(collection(db, 'notifications'), {
          userId: sub.userId,
          title: 'Task Submission Rejected',
          message: `Your submission for "${sub.taskTitle}" did not meet verification criteria.`,
          type: 'task',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status } : s))
      );

      await recordAdminAction(
        `TASK_${status.toUpperCase()}`,
        `Admin reviewed task "${sub.taskTitle}" for user ${sub.userEmail}`,
        sub.userId
      );

      setStatusMessage({
        type: 'success',
        text: `Submission successfully marked as ${status}.`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to process submission review.' });
    }
  };

  // Adjust User Demo Credits
  const handleAdjustCredits = async () => {
    if (!adjustingUser || !adjustmentReason.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid audit reason.' });
      return;
    }

    try {
      const userRef = doc(db, 'users', adjustingUser.uid);
      const newCredits = Math.max(0, adjustingUser.demoCredits + adjustmentAmount);

      await updateDoc(userRef, {
        demoCredits: newCredits,
        totalEarned: adjustmentAmount > 0 ? adjustingUser.totalEarned + adjustmentAmount : adjustingUser.totalEarned,
        totalSpent: adjustmentAmount < 0 ? adjustingUser.totalSpent + Math.abs(adjustmentAmount) : adjustingUser.totalSpent,
      });

      // Add transaction audit record
      await addDoc(collection(db, 'transactions'), {
        userId: adjustingUser.uid,
        type: 'admin_adjustment',
        amount: adjustmentAmount,
        description: `Admin Adjustment: ${adjustmentReason.trim()}`,
        timestamp: new Date().toISOString(),
      });

      // Add notification to user
      await addDoc(collection(db, 'notifications'), {
        userId: adjustingUser.uid,
        title: 'Demo Credit Adjustment',
        message: `An administrator adjusted your practice balance by ${adjustmentAmount > 0 ? `+${adjustmentAmount}` : adjustmentAmount} credits. Reason: ${adjustmentReason}`,
        type: 'wallet',
        read: false,
        createdAt: new Date().toISOString(),
      });

      setUsers((prev) =>
        prev.map((u) => (u.uid === adjustingUser.uid ? { ...u, demoCredits: newCredits } : u))
      );

      await recordAdminAction(
        'CREDIT_ADJUSTMENT',
        `Adjusted balance of ${adjustingUser.email} by ${adjustmentAmount} credits. Reason: ${adjustmentReason}`,
        adjustingUser.uid
      );

      setStatusMessage({
        type: 'success',
        text: `Adjusted balance for ${adjustingUser.displayName} by ${adjustmentAmount} credits.`,
      });

      setAdjustingUser(null);
      setAdjustmentReason('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to adjust demo credits.' });
    }
  };

  // KPIs
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.disabled).length;
  const totalTasks = tasks.length;
  const completedTasks = submissions.filter((s) => s.status === 'approved').length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending').length;
  const totalCreditsIssued = users.reduce((sum, u) => sum + (u.totalEarned || 0), 0);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#101828] border border-[#D4AF37]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-['Outfit'] text-white">
                Zentro Administration Console
              </h1>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                SECURE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Authenticated Administrator: <span className="text-white font-mono">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('security_guide')}
          className="px-3.5 py-1.5 rounded-xl bg-[#1C2433] hover:bg-[#222C3D] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold flex items-center gap-1.5 self-start"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Security Guide</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981]'
              : 'bg-red-500/15 border border-red-500/40 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#2A3649] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'tasks', label: 'Task Catalog', icon: CheckSquare },
          { id: 'submissions', label: `Pending Reviews (${pendingSubmissions})`, icon: FileText },
          { id: 'youtube', label: 'YouTube Quizzes', icon: Tv },
          { id: 'credits', label: 'Demo Credit Ledger', icon: Coins },
          { id: 'logs', label: 'Audit Activity Logs', icon: FileText },
          { id: 'security_guide', label: 'Security & Access', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'text-gray-400 hover:text-white bg-[#1C2433]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">Total Registered Users</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{totalUsers}</div>
              <div className="text-[11px] text-[#10B981] mt-1">{activeUsers} Active Accounts</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">Pending Task Submissions</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                {pendingSubmissions}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Requires Administrator Audit</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">Completed Task Reviews</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#10B981]">
                {completedTasks}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Approved Submissions</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">Active Marketplace Tasks</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{totalTasks}</div>
              <div className="text-[11px] text-gray-400 mt-1">Simple, Quiz & Special</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">YouTube Educational Quizzes</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {youtubeTasks.length}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Active Learning Modules</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649]">
              <div className="text-xs text-gray-400 mb-1">Total Demo Credits Issued</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#D4AF37]">
                {totalCreditsIssued.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Practice Balance Issued</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-['Outfit'] text-white">User Accounts</h3>
              <p className="text-xs text-gray-400">Search registered users, adjust balances, or disable accounts</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#101828] border border-[#2A3649] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101828] text-gray-400 font-semibold border-b border-[#2A3649]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Completed Tasks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3649]/60">
                {users
                  .filter(
                    (u) =>
                      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.displayName.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.uid} className="hover:bg-[#101828]/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{u.displayName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono uppercase text-[10px] bg-[#2A3649] px-2 py-0.5 rounded text-gray-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                        {u.demoCredits?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-white">{u.tasksCompleted || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-medium ${
                            u.disabled ? 'text-red-400' : 'text-[#10B981]'
                          }`}
                        >
                          {u.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustmentAmount(50);
                            setAdjustmentReason('');
                          }}
                          className="px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-[11px] font-medium"
                        >
                          Adjust Credits
                        </button>
                        <button
                          onClick={() => handleToggleUserAccount(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                            u.disabled
                              ? 'bg-[#10B981]/20 text-[#10B981]'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {u.disabled ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TASK CATALOG */}
      {activeTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-['Outfit'] text-white">Task Catalog</h3>
              <p className="text-xs text-gray-400">Add, edit, or toggle marketplace tasks</p>
            </div>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-black text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-[#101828] border border-[#2A3649] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#D4AF37] uppercase font-mono font-semibold">{t.category}</span>
                  <span className="font-mono text-white font-bold">+{t.rewardCredits} Credits</span>
                </div>
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
                <p className="text-xs text-gray-300 line-clamp-2">{t.description}</p>
                <div className="pt-2 border-t border-[#2A3649]/60 flex items-center justify-between text-xs text-gray-400">
                  <span>Status: <strong className="text-white capitalize">{t.status}</strong></span>
                  <span>Est: {t.estimatedMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENDING SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-white">Task Submissions Review</h3>
            <p className="text-xs text-gray-400">Audit user proof, approve rewards, or reject invalid entries</p>
          </div>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No pending task submissions currently awaiting review.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-[#101828] border border-[#2A3649] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3649]/60 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.taskTitle}</h4>
                      <p className="text-xs text-gray-400 font-mono">
                        User: {sub.userEmail} ({sub.userDisplayName}) · Submitted {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">
                        +{sub.rewardCredits} Demo Credits
                      </span>
                      <span
                        className={`text-xs font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          sub.status === 'approved'
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : sub.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">Submitted Proof Response:</span>
                    <div className="p-3 rounded-lg bg-[#080B12] border border-[#2A3649] text-xs text-gray-200 whitespace-pre-line font-mono">
                      {sub.proofText}
                    </div>
                  </div>

                  {sub.proofUrl && (
                    <div className="text-xs">
                      <span className="text-gray-400">Supporting URL: </span>
                      <a
                        href={sub.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#D4AF37] underline break-all"
                      >
                        {sub.proofUrl}
                      </a>
                    </div>
                  )}

                  {sub.status === 'pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReviewSubmission(sub, 'rejected', 'Verification criteria not met')}
                        className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleReviewSubmission(sub, 'approved', 'Audit verified by admin')}
                        className="px-4 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Grant Credits</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: YOUTUBE QUIZZES */}
      {activeTab === 'youtube' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-['Outfit'] text-white">YouTube Educational Catalog</h3>
              <p className="text-xs text-gray-400">Manage video lessons, comprehension quizzes, and credit rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {youtubeTasks.map((yt) => (
              <div key={yt.id} className="p-4 rounded-xl bg-[#101828] border border-[#2A3649] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{yt.channelName}</span>
                  <span className="font-mono text-[#D4AF37] font-bold">+{yt.rewardCredits} Credits</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{yt.title}</h4>
                <p className="text-xs text-gray-300 line-clamp-2">{yt.description}</p>
                <div className="text-[11px] text-gray-400">
                  {yt.questions.length} Quiz Questions Configured
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-white">Administrative Audit Logs</h3>
            <p className="text-xs text-gray-400">Track moderation decisions, credit adjustments, and status changes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101828] text-gray-400 font-semibold border-b border-[#2A3649]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3649]/60">
                {adminLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#101828]/50">
                    <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono">{log.adminEmail}</td>
                    <td className="py-3 px-4 text-white max-w-sm">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & ACCESS GUIDE */}
      {activeTab === 'security_guide' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-5 text-xs text-gray-300 leading-relaxed font-sans">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <Lock className="w-6 h-6" />
            <h3 className="text-base font-bold font-['Outfit'] text-white">
              Administrator Access & Security Guide
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#101828] border border-[#D4AF37]/40 space-y-2">
            <p className="font-semibold text-white">
              Bootstrapped Super-Administrator Account:
            </p>
            <p className="font-mono text-[#D4AF37] text-sm">mali21745ali@gmail.com</p>
            <p className="text-gray-400">
              When signed in with this Gmail address through Firebase Authentication, administrative privileges are automatically verified and granted in Firestore Security Rules.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">How to Grant Admin Access to Another User</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
              <li>
                Ask the user to register an account using the normal Registration form.
              </li>
              <li>
                In the Firebase Console, go to <strong>Firestore Database</strong> &gt; Collection <code>admins</code>.
              </li>
              <li>
                Add a new document where the <strong>Document ID</strong> is the user's Firebase Auth <strong>UID</strong> (e.g. <code>Wv8X...</code>).
              </li>
              <li>
                Set the document fields: <code>role: "admin"</code>, <code>email: "user@example.com"</code>, <code>addedAt: [Timestamp]</code>.
              </li>
              <li>
                The security rules will instantaneously recognize <code>exists(/databases/$(database)/documents/admins/$(request.auth.uid))</code>.
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <strong>Security Invariant:</strong> Standard users can never escalate their privileges or assign themselves roles via client JavaScript. All administrative actions require verified credentials.
          </div>
        </div>
      )}

      {/* Adjust Demo Credits Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#101828] border border-[#2A3649] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A3649] pb-3">
              <h3 className="text-base font-bold text-white">Adjust Demo Credits</h3>
              <button
                onClick={() => setAdjustingUser(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-400">User: <strong className="text-white">{adjustingUser.displayName}</strong> ({adjustingUser.email})</p>
              <p className="text-xs text-gray-400">Current Balance: <strong className="text-[#D4AF37] font-mono">{adjustingUser.demoCredits} Credits</strong></p>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Adjustment Amount (+ to add, - to deduct)
              </label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Mandatory Audit Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Manual compensation, bonus award, correction..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full p-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustingUser(null)}
                className="px-4 py-2 rounded-xl bg-[#1C2433] text-gray-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCredits}
                className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
