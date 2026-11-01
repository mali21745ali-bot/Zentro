/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Bell, Shield, Eye, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const SettingsView: React.FC = () => {
  const { userProfile } = useAuth();
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  const [taskAlerts, setTaskAlerts] = useState<boolean>(true);
  const [marketingEmails, setMarketingEmails] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
          Platform Settings
        </h1>
        <p className="text-xs text-gray-400">
          Customize notifications, interface sounds, and privacy preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Bell className="w-5 h-5" />
          <h2 className="text-base font-bold font-['Outfit'] text-white">Notifications</h2>
        </div>

        <div className="divide-y divide-[#2A3649]">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Task Review Notifications</p>
              <p className="text-[11px] text-gray-400">Receive in-app alerts when submissions are reviewed</p>
            </div>
            <input
              type="checkbox"
              checked={taskAlerts}
              onChange={(e) => setTaskAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Audio & Confetti Effects</p>
              <p className="text-[11px] text-gray-400">Play celebrations on task completion and game wins</p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Platform News & Updates</p>
              <p className="text-[11px] text-gray-400">Occasional announcements regarding new reward channels</p>
            </div>
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Brand Theme Info */}
      <div className="p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Shield className="w-5 h-5" />
          <h2 className="text-base font-bold font-['Outfit'] text-white">Brand Visual Theme</h2>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Zentro employs an exclusive Dark Navy (<code className="text-[#D4AF37]">#101828</code>) and Metallic Gold (<code className="text-[#D4AF37]">#D4AF37</code>) theme designed for high contrast and executive elegance.
        </p>
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="w-6 h-6 rounded-full bg-[#101828] border border-[#2A3649]" title="Dark Navy" />
          <span className="w-6 h-6 rounded-full bg-[#080B12] border border-[#2A3649]" title="Black" />
          <span className="w-6 h-6 rounded-full bg-[#D4AF37]" title="Metallic Gold" />
          <span className="w-6 h-6 rounded-full bg-[#10B981]" title="Emerald Green" />
          <span className="w-6 h-6 rounded-full bg-[#1C2433] border border-[#2A3649]" title="Dark Grey Card" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold shadow-md transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
