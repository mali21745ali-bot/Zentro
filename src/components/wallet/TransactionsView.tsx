/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { History, Search, Download, Filter, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CreditTransaction } from '../../types.ts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

export const TransactionsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
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
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Type', 'Description', 'Amount', 'Timestamp'];
    const rows = filtered.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zentro_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
            Transaction History
          </h1>
          <p className="text-xs text-gray-400">
            Immutable audit trail of all task rewards, quiz completions, and demo balance adjustments.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="px-4 py-2 rounded-xl bg-[#1C2433] hover:bg-[#222C3D] text-gray-200 border border-[#2A3649] text-xs font-semibold flex items-center gap-2 self-start disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#1C2433] border border-[#2A3649]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by description or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#101828] border border-[#2A3649] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'task_reward', label: 'Tasks' },
            { id: 'quiz_reward', label: 'Quizzes' },
            { id: 'game_reward', label: 'Games' },
            { id: 'admin_adjustment', label: 'Adjustments' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filterType === item.id
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'text-gray-400 hover:text-white bg-[#101828]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#1C2433] border border-[#2A3649] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101828] text-gray-400 font-semibold border-b border-[#2A3649]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3649]/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#101828]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {tx.id.substring(0, 12)}...
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="text-gray-300">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium max-w-sm truncate">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
