import React, { useState } from 'react';
import { X, UserCheck, Shield, Sparkles, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { demoAccounts, switchRole, login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [mode, setMode] = useState<'quick' | 'form'>('quick');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Use standard demo pass or switch to selected role
    switchRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">RoadGuard AI Authentication</h2>
            <p className="text-xs text-slate-500">Access municipal road intelligence workflows</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Switcher vs Custom Form */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1-Click Demo Profiles
          </button>
          <button
            onClick={() => setMode('form')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Sign In
          </button>
        </div>

        {mode === 'quick' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly toggle between the three core stakeholder perspectives:
            </p>

            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => {
                  switchRole(account.role);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{account.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {account.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{account.email}</div>
                  {account.department && (
                    <div className="text-[10px] text-emerald-700 mt-1 font-medium">{account.department}</div>
                  )}
                </div>
                <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                placeholder="jane.doe@citygov.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Role Authority</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="citizen">Citizen (Upload &amp; Community Reports)</option>
                <option value="engineer">Engineer (Verify &amp; Maintenance Operations)</option>
                <option value="admin">Municipal Admin (Network Analytics &amp; Director)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Sign In to RoadGuard AI
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
