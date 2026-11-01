/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Coins,
  AlertCircle,
  FileText,
  Send,
  X,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.tsx';
import { TaskItem, TaskCategory, TaskSubmission } from '../../types.ts';
import { DEFAULT_TASKS } from '../../lib/defaultData.ts';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface TasksViewProps {
  onOpenAuth: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenAuth }) => {
  const { currentUser, userProfile, addDemoCredits } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userSubmissions, setUserSubmissions] = useState<Record<string, TaskSubmission>>({});
  const [activeTaskModal, setActiveTaskModal] = useState<TaskItem | null>(null);
  const [proofText, setProofText] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch user's submissions to show completion statuses
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'taskSubmissions'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const map: Record<string, TaskSubmission> = {};
        snap.forEach((docSnap) => {
          const sub = { id: docSnap.id, ...(docSnap.data() as Omit<TaskSubmission, 'id'>) };
          map[sub.taskId] = sub;
        });
        setUserSubmissions(map);
      } catch (err) {
        console.warn('Could not load user submissions:', err);
      }
    };

    fetchSubmissions();
  }, [currentUser]);

  // Load custom tasks created in Firestore if any
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snap = await getDocs(collection(db, 'tasks'));
        if (!snap.empty) {
          const list: TaskItem[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<TaskItem, 'id'>) });
          });
          // Merge with default tasks if not existing
          const merged = [...DEFAULT_TASKS];
          list.forEach((t) => {
            if (!merged.find((m) => m.id === t.id)) {
              merged.push(t);
            }
          });
          setTasks(merged);
        }
      } catch {
        // Fall back to default tasks
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === 'all' || task.category === selectedCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenTask = (task: TaskItem) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setActiveTaskModal(task);
    setProofText('');
    setProofUrl('');
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeTaskModal || !userProfile) return;

    if (!proofText.trim()) {
      setSubmitError('Please enter your submission response or proof notes.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Check if already submitted
      if (userSubmissions[activeTaskModal.id]) {
        setSubmitError('You have already submitted a response for this task.');
        setSubmitting(false);
        return;
      }

      // Auto-approve simple/quiz tasks or set to pending for special review
      const isAutoApprovable = activeTaskModal.category === 'simple' || activeTaskModal.category === 'quiz';
      const status = isAutoApprovable ? 'approved' : 'pending';

      const newSubmission: Omit<TaskSubmission, 'id'> = {
        taskId: activeTaskModal.id,
        taskTitle: activeTaskModal.title,
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userDisplayName: userProfile.displayName,
        proofText: proofText.trim(),
        proofUrl: proofUrl.trim() || undefined,
        rewardCredits: activeTaskModal.rewardCredits,
        status: status,
        submittedAt: new Date().toISOString(),
        reviewedAt: isAutoApprovable ? new Date().toISOString() : undefined,
        reviewerNotes: isAutoApprovable ? 'Auto-verified by task criteria' : undefined,
      };

      const docRef = await addDoc(collection(db, 'taskSubmissions'), newSubmission);

      // If auto approved, grant demo credits immediately
      if (isAutoApprovable) {
        await addDemoCredits(
          activeTaskModal.rewardCredits,
          'task_reward',
          `Task Completed: ${activeTaskModal.title}`,
          activeTaskModal.id
        );
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }

      // Update local submissions map
      setUserSubmissions((prev) => ({
        ...prev,
        [activeTaskModal.id]: { id: docRef.id, ...newSubmission },
      }));

      setSubmitSuccess(
        isAutoApprovable
          ? `Task approved! +${activeTaskModal.rewardCredits} Demo Credits credited to your wallet.`
          : 'Task submitted for review! Platform administrators will audit your submission within 24 hours.'
      );
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError('Failed to record submission. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (taskId: string, category: TaskCategory) => {
    if (category === 'ad') {
      return (
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Inactive (Future Partner Integration)</span>
        </span>
      );
    }

    const sub = userSubmissions[taskId];
    if (!sub) {
      return (
        <span className="text-xs text-[#10B981] flex items-center gap-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Available</span>
        </span>
      );
    }

    if (sub.status === 'approved') {
      return (
        <span className="text-xs text-[#D4AF37] flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Completed</span>
        </span>
      );
    }

    if (sub.status === 'pending') {
      return (
        <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </span>
      );
    }

    if (sub.status === 'rejected') {
      return (
        <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
            Task Marketplace
          </h1>
          <p className="text-xs text-gray-400">
            Browse verified knowledge tasks, research challenges, and educational questionnaires.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Category Filter Tabs (Zero-pill button segmented bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'simple', label: 'Simple' },
          { id: 'quiz', label: 'Quizzes' },
          { id: 'educational', label: 'Educational' },
          { id: 'special', label: 'Special' },
          { id: 'ad', label: 'Sponsored Ads (Inactive)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === tab.id
                ? 'bg-[#D4AF37] text-[#080B12] font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#1C2433] hover:bg-[#222C3D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const isAd = task.category === 'ad';
          const submission = userSubmissions[task.id];
          const isCompleted = submission?.status === 'approved';
          const isPending = submission?.status === 'pending';

          return (
            <div
              key={task.id}
              className={`flex flex-col justify-between p-5 rounded-xl bg-[#1C2433] border transition-all ${
                isAd
                  ? 'border-[#2A3649]/50 opacity-70'
                  : 'border-[#2A3649] hover:border-[#D4AF37]/50'
              }`}
            >
              <div>
                {/* Unboxed Metadata Header */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <div className="flex items-center gap-1.5 capitalize font-medium">
                    <span className="text-[#D4AF37]">{task.category} Task</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.estimatedMinutes} min
                    </span>
                  </div>
                  {getStatusBadge(task.id, task.category)}
                </div>

                <h3 className="text-base font-bold font-['Outfit'] text-white mb-2 leading-snug">
                  {task.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {task.description}
                </p>

                {/* Instructions snippet */}
                <div className="p-2.5 rounded-lg bg-[#080B12]/60 border border-[#2A3649]/60 text-[11px] text-gray-400 line-clamp-2 mb-4 font-mono">
                  {task.instructions}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-[#2A3649] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-bold font-mono tabular-nums text-white">
                    +{task.rewardCredits}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Credits</span>
                </div>

                {isAd ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-[#2A3649]/50 text-gray-500 text-xs font-medium cursor-not-allowed"
                  >
                    Partner Inactive
                  </button>
                ) : isCompleted ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold cursor-default"
                  >
                    Reward Claimed
                  </button>
                ) : isPending ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-default"
                  >
                    In Review
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenTask(task)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold transition-colors shadow-sm"
                  >
                    Start Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 p-6 rounded-xl bg-[#1C2433] border border-[#2A3649]">
          <p className="text-sm text-gray-400">No tasks found matching your filter criteria.</p>
        </div>
      )}

      {/* Task Execution / Submission Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#101828] border border-[#2A3649] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#2A3649] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium mb-1">
                  <span className="capitalize">{activeTaskModal.category} Task</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. {activeTaskModal.estimatedMinutes} Minutes</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-white font-mono font-bold">
                    +{activeTaskModal.rewardCredits} Demo Credits
                  </span>
                </div>
                <h2 className="text-lg font-bold font-['Outfit'] text-white">
                  {activeTaskModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTaskModal(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Description & Instructions */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                  Task Overview
                </h4>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {activeTaskModal.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                  Step-by-Step Instructions
                </h4>
                <div className="p-3.5 rounded-xl bg-[#1C2433] border border-[#2A3649] text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                  {activeTaskModal.instructions}
                </div>
              </div>
            </div>

            {/* Submission Form */}
            {submitSuccess ? (
              <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                <p className="text-sm font-semibold text-white">{submitSuccess}</p>
                <button
                  onClick={() => setActiveTaskModal(null)}
                  className="mt-2 px-4 py-1.5 bg-[#10B981] text-black text-xs font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Proof / Audit Response <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Enter your completed task response, verification notes, or answers here..."
                    className="w-full p-3 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Supporting URL or Screenshot Link <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTaskModal(null)}
                    className="px-4 py-2 rounded-xl bg-[#1C2433] text-gray-300 text-xs font-medium hover:bg-[#222C3D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Validating...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
