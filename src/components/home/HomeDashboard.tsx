/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Coins,
  CheckSquare,
  Gamepad2,
  Tv,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ActiveTab } from '../layout/Sidebar.tsx';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { CreditTransaction } from '../../types.ts';
import { DEFAULT_TASKS, DEFAULT_YOUTUBE_TASKS } from '../../lib/defaultData.ts';

interface HomeDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentUser, userProfile } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!currentUser) {
        setRecentTransactions([]);
        setLoadingActivity(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          limit(5)
        );
        const snap = await getDocs(q);
        const list: CreditTransaction[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<CreditTransaction, 'id'>) });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentTransactions(list);
      } catch (err) {
        console.warn('Failed to load recent activity:', err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [currentUser]);

  const activeTaskCount = DEFAULT_TASKS.filter((t) => t.status === 'active').length;
  const ytCount = DEFAULT_YOUTUBE_TASKS.filter((y) => y.active).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101828] via-[#1C2433] to-[#080B12] border border-[#2A3649] p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-[#D4AF37] font-medium">Practice Rewards Ecosystem</span>
              <span aria-hidden="true">·</span>
              <span>Next-Gen Micro-Earning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white tracking-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
                {userProfile?.displayName || 'Explorer'}
              </span>
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Earn Demo Credits through real knowledge tasks, educational video quizzes, and skill-testing
              games. Track your performance with full audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => onNavigate('tasks')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29D2C] hover:from-[#E5C358] hover:to-[#D4AF37] text-[#080B12] font-bold text-sm tracking-wide shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
              >
                <span>Browse Tasks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-bold text-sm tracking-wide shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onNavigate('games')}
              className="px-4 py-2.5 rounded-xl bg-[#1C2433] hover:bg-[#222C3D] text-gray-200 border border-[#2A3649] font-medium text-sm flex items-center gap-2 transition-all"
            >
              <Gamepad2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Play Games</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Demo Credits */}
        <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#D4AF37]/40 transition-colors">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Available Balance</span>
            <Coins className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
            {userProfile ? userProfile.demoCredits.toLocaleString() : '100'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-[#10B981] font-medium">Demo Credits</span>
            <span aria-hidden="true">·</span>
            <span>Practice Wallet</span>
          </div>
        </div>

        {/* Total Tasks Completed */}
        <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#2A3649] transition-colors">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Completed Tasks</span>
            <CheckSquare className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
            {userProfile ? userProfile.tasksCompleted : 0}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <span>Verified Submissions</span>
            <span aria-hidden="true">·</span>
            <span>100% Audited</span>
          </div>
        </div>

        {/* Tasks Available */}
        <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#2A3649] transition-colors">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Marketplace Tasks</span>
            <Award className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
            {activeTaskCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <span>Simple, Quiz & Special</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#D4AF37]">Active</span>
          </div>
        </div>

        {/* Skill Games & Quizzes */}
        <div className="p-5 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#2A3649] transition-colors">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Games & Quizzes</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
            {3 + ytCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <span>3 Skill Games</span>
            <span aria-hidden="true">·</span>
            <span>{ytCount} Video Quizzes</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-['Outfit'] text-white">Earning Sectors</h2>
          <span className="text-xs text-gray-400">Select an activity to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Earning Tasks */}
          <div
            onClick={() => onNavigate('tasks')}
            className="group cursor-pointer p-6 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#D4AF37]/50 transition-all hover:translate-y-[-2px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-['Outfit'] text-white group-hover:text-[#D4AF37] transition-colors mb-1">
              Task Marketplace
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Complete simple audits, security checklists, and educational questionnaires with instant submission review.
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#2A3649]/60">
              <span className="text-gray-400">Up to 150 Credits/Task</span>
              <span className="text-[#D4AF37] font-medium flex items-center gap-1">
                Enter <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Interactive Skill Games */}
          <div
            onClick={() => onNavigate('games')}
            className="group cursor-pointer p-6 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-[#10B981]/50 transition-all hover:translate-y-[-2px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-4 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-['Outfit'] text-white group-hover:text-[#10B981] transition-colors mb-1">
              Skill Games
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Test your cognitive agility in Quick Math, Pattern Sprint, and Memory Challenge. Practice and improve skills.
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#2A3649]/60">
              <span className="text-gray-400">3 Fully Playable Games</span>
              <span className="text-[#10B981] font-medium flex items-center gap-1">
                Play <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Educational YouTube Tasks */}
          <div
            onClick={() => onNavigate('youtube')}
            className="group cursor-pointer p-6 rounded-xl bg-[#1C2433] border border-[#2A3649] hover:border-red-500/50 transition-all hover:translate-y-[-2px]"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 group-hover:scale-105 transition-transform">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-['Outfit'] text-white group-hover:text-red-400 transition-colors mb-1">
              YouTube Learning
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Watch curated educational videos on blockchain, security, and digital finance, then pass quizzes to earn.
            </p>
            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#2A3649]/60">
              <span className="text-gray-400">{ytCount} Video Modules</span>
              <span className="text-red-400 font-medium flex items-center gap-1">
                Learn <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Ledger Preview */}
      <div className="p-6 rounded-xl bg-[#1C2433] border border-[#2A3649]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold font-['Outfit'] text-white">Recent Activity</h2>
            <p className="text-xs text-gray-400">Latest credit rewards and system adjustments</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-[#D4AF37] hover:underline font-medium flex items-center gap-1"
          >
            View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingActivity ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading audit history...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No transactions yet. Complete a task or game to generate your first audit record!
          </div>
        ) : (
          <div className="divide-y divide-[#2A3649]/60">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.amount >= 0
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {tx.amount >= 0 ? <TrendingUp className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{tx.description}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      tx.amount >= 0 ? 'text-[#10B981]' : 'text-red-400'
                    }`}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Demo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
