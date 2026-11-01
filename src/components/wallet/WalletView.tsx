/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CreditTransaction, TransactionType } from '../../types.ts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';
import { ActiveTab } from '../layout/Sidebar.tsx';

interface WalletViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentUser, userProfile } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const list: CreditTransaction[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<CreditTransaction, 'id'>) });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setTransactions(list);
      } catch (err) {
        console.warn('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  const filtered = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
          Demo Credit Wallet & Balance Ledger
        </h1>
        <p className="text-xs text-gray-400">
          Monitor your practice Demo Credits, review earning breakdown, and audit all transaction logs.
        </p>
      </div>

      {/* Compliance / Transparency Banner */}
      <div className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649] text-xs text-gray-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Transparency Notice — Practice & Demo Economy
          </p>
          <p className="text-gray-400 leading-relaxed">
            Demo Credits earned on Zentro are non-monetary practice units used exclusively for testing, platform training, and gaming benchmarks. Zentro does not process real fiat deposits or direct cash withdrawals in this preview. A certified, compliant rewards pipeline will be integrated in subsequent phases.
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Demo Credits */}
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#D4AF37]/40 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Available Balance</span>
            <Coins className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white">
            {userProfile ? userProfile.demoCredits.toLocaleString() : '100'}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-[#D4AF37] font-semibold">Demo Credits</span>
            <span className="text-gray-400">· Ready for Practice Use</span>
          </div>
        </div>

        {/* Total Credits Earned */}
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Lifetime Earned</span>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#10B981]">
            +{userProfile ? userProfile.totalEarned.toLocaleString() : '100'}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Cumulative credits from tasks, quizzes & games
          </div>
        </div>

        {/* Total Credits Spent */}
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Credits Utilized / Adjusted</span>
            <TrendingDown className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-gray-300">
            {userProfile ? userProfile.totalSpent.toLocaleString() : '0'}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Platform entry fees and adjustments
          </div>
        </div>
      </div>

      {/* Future Roadmap Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101828] to-[#1C2433] border border-[#2A3649] space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-base font-bold font-['Outfit'] text-white">
            Future Compliant Rewards Architecture
          </h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
          The Zentro architecture is prepared for compliant real-world rewards. When regional regulatory clearance and KYC verification modules are approved, users will be eligible to convert verified milestone achievements into gift vouchers and digital rewards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#2A3649]">
            <span className="font-semibold text-white block mb-0.5">Phase 1 (Active)</span>
            <span className="text-gray-400">Demo economy, skill verification, task audits</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#2A3649]">
            <span className="font-semibold text-white block mb-0.5">Phase 2 (Upcoming)</span>
            <span className="text-gray-400">Partner sponsor networks & brand merchandise</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#2A3649]">
            <span className="font-semibold text-white block mb-0.5">Phase 3 (Planned)</span>
            <span className="text-gray-400">Web3 token bridging & gift cards</span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-white">
              Transaction Audit Trail
            </h3>
            <p className="text-xs text-gray-400">Cryptographically ordered records of every credit event</p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'task_reward', label: 'Tasks' },
              { id: 'quiz_reward', label: 'Quizzes' },
              { id: 'game_reward', label: 'Games' },
              { id: 'admin_adjustment', label: 'Admin' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? 'bg-[#D4AF37] text-black font-semibold'
                    : 'text-gray-400 hover:text-white bg-[#101828]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading ledger data...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No transactions found for the selected category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A3649] text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3649]/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#101828]/50 transition-colors">
                    <td className="py-3 pl-2 font-mono text-gray-400">
                      #{tx.id.substring(0, 8)}
                    </td>
                    <td className="py-3 capitalize text-gray-300">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-white font-medium max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 text-gray-400 font-mono">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <span
                        className={`font-mono font-bold tabular-nums text-sm ${
                          tx.amount >= 0 ? 'text-[#10B981]' : 'text-red-400'
                        }`}
                      >
                        {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
