/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

const FAQ_ITEMS = [
  {
    q: 'What are Demo Credits and can they be converted into real money?',
    a: 'Demo Credits are practice virtual units utilized for skill benchmarking, educational progress tracking, and testing platform mechanics on Zentro. They carry no monetary value, cannot be deposited or withdrawn as fiat currency, and are not intended as cash compensation.',
  },
  {
    q: 'How are earning task submissions reviewed?',
    a: 'Simple and quiz tasks are evaluated automatically based on verification criteria. Special feedback and audit tasks are reviewed by platform administrators in the Admin Console within 24 hours. Once approved, Demo Credits are immediately deposited into your practice wallet with an immutable audit record.',
  },
  {
    q: 'Why are Advertisement Tasks marked as inactive?',
    a: 'Zentro enforces strict compliance and anti-fraud policies. Inactive categories remain paused until certified compliant advertising networks with genuine sponsor verification are integrated. Zentro will never simulate fake ad views or phantom impressions.',
  },
  {
    q: 'Are YouTube engagement metrics required for rewards?',
    a: 'No. Zentro strictly prohibits requiring likes, subscriptions, comments, or artificial view retention. Demo Credits are awarded solely for passing the educational comprehension quiz associated with the video material.',
  },
  {
    q: 'How does Zentro prevent duplicate rewards?',
    a: 'Each completed quiz and verified task is indexed by a compound key (UserId + TaskId) in the database. Subsequent attempts on one-time tasks or quizzes are acknowledged but do not issue duplicate credit payouts.',
  },
];

export const SupportView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'terms' | 'privacy'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Contact form state
  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<'general' | 'tasks' | 'wallet' | 'bug' | 'account'>('general');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to submit a support request.');
      return;
    }
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setTicketSuccess(null);

    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        subject: subject.trim(),
        category,
        message: message.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
      });

      setTicketSuccess('Support ticket submitted successfully. Our team will review your inquiry.');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
          Help & Support Center
        </h1>
        <p className="text-xs text-gray-400">
          Find answers, review terms of service, report platform anomalies, or contact support.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#2A3649] pb-3 overflow-x-auto">
        {[
          { id: 'faq', label: 'Knowledge Base & FAQ' },
          { id: 'contact', label: 'Contact Support & Report' },
          { id: 'terms', label: 'Terms & Conditions' },
          { id: 'privacy', label: 'Privacy Policy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#D4AF37] text-black font-semibold'
                : 'text-gray-400 hover:text-white bg-[#1C2433]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'faq' && (
        <div className="space-y-4">
          {/* FAQ Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C2433] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Accordion */}
          <div className="space-y-2.5">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#1C2433] border border-[#2A3649] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#222C3D] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-300 border-t border-[#2A3649]/60 leading-relaxed font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-['Outfit'] text-white">
              Submit Support Ticket or Bug Report
            </h3>
            <p className="text-xs text-gray-400">
              Our administration desk responds to user inquiries within 24–48 hours.
            </p>
          </div>

          {ticketSuccess ? (
            <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
              <p className="text-xs font-semibold text-white">{ticketSuccess}</p>
              <button
                onClick={() => setTicketSuccess(null)}
                className="mt-2 px-4 py-1.5 rounded-lg bg-[#10B981] text-black text-xs font-bold"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#101828] border border-[#2A3649] rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="tasks">Task Verification</option>
                    <option value="wallet">Demo Credits Ledger</option>
                    <option value="bug">Report a Bug / Glitch</option>
                    <option value="account">Account Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue..."
                    className="w-full p-2.5 bg-[#101828] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Message Details
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all relevant details, steps to reproduce, or transaction IDs..."
                  className="w-full p-3 bg-[#101828] border border-[#2A3649] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Dispatching...' : 'Submit Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
          <h3 className="text-base font-bold font-['Outfit'] text-white">
            Terms & Conditions of Service
          </h3>
          <p>
            <strong>1. Nature of Platform:</strong> Zentro is an interactive technology demonstration and educational skill rewards portal. All units referenced as "Demo Credits" are simulation units solely created for testing, training, and gameplay benchmarking.
          </p>
          <p>
            <strong>2. No Cash Value or Monetary Claims:</strong> Under no circumstances do Demo Credits constitute legal tender, electronic money, stored value, or redeemable currency. Users agree not to attempt selling, transacting, or exchanging Demo Credits for fiat currency.
          </p>
          <p>
            <strong>3. Fair Play and Anti-Abuse:</strong> Automated bots, script execution, multiple account creation for credit extraction, and exploit manipulation are strictly prohibited. The administration reserves the right to disable accounts and deduct credits resulting from illicit activities.
          </p>
          <p>
            <strong>4. Intellectual Property:</strong> All trademarks, logos, and materials remain the sole property of their respective creators. Educational YouTube modules are embedded with direct attribution to the respective content creators.
          </p>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
          <h3 className="text-base font-bold font-['Outfit'] text-white">
            Privacy & Data Security Policy
          </h3>
          <p>
            <strong>1. Information Collection:</strong> When you register on Zentro, your authentication credentials and email are managed securely by Firebase Authentication. We never store plain-text passwords on any server or client database.
          </p>
          <p>
            <strong>2. Usage of Data:</strong> User data (such as display names, game scores, and completed task submissions) is collected solely to maintain the integrity of the platform audit ledger.
          </p>
          <p>
            <strong>3. Security Rules & PII Isolation:</strong> In accordance with ABAC and Zero-Trust Firestore Security rules, user records are strictly protected such that only verified owners and authenticated administrators have access to profile parameters.
          </p>
        </div>
      )}
    </div>
  );
};
