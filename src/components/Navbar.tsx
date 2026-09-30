import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Camera,
  MapPin,
  ClipboardList,
  Wrench,
  BarChart3,
  Bell,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalCount: number;
  onOpenAlerts: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  onOpenAlerts,
  onOpenLogin,
}) => {
  const { currentUser, switchRole, logout, isAuthenticated } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const userRole: UserRole = currentUser?.role || 'citizen';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'engineer', 'citizen'] },
    { id: 'detect', label: 'Detect Damage', icon: Camera, roles: ['citizen', 'engineer', 'admin'], highlight: true },
    { id: 'map', label: 'Road Map', icon: MapPin, roles: ['citizen', 'engineer', 'admin'] },
    { id: 'reports', label: 'Reports', icon: ClipboardList, roles: ['citizen', 'engineer', 'admin'] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['engineer', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'engineer'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(userRole));

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'engineer':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'citizen':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white font-black text-xl border border-emerald-500/30">
              RG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-slate-900">ROADGUARD</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block tracking-wider uppercase font-medium">
                Detect • Analyze • Map • Prioritize
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${
                    item.highlight && !isActive
                      ? 'text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                      : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Alerts, User Info & Profile/Role Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Critical Alert Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Critical Road Alerts"
            >
              <Bell className="w-4 h-4" />
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {criticalCount}
                </span>
              )}
            </button>

            {/* Logged in User Profile & Role Switcher */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${getRoleBadgeColor(
                    userRole
                  )}`}
                >
                  <div className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold leading-none truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] opacity-80 uppercase leading-tight font-mono">
                      {userRole}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                </button>

                {roleMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
                    onMouseLeave={() => setRoleMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                          Authenticated Session
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${getRoleBadgeColor(userRole)}`}>
                          {userRole}
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 font-bold truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.department && (
                        <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                          {currentUser.department}
                        </p>
                      )}
                    </div>

                    {/* Switch role perspective */}
                    <div className="p-1.5 space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                        Switch Role Perspective
                      </div>

                      <button
                        onClick={() => {
                          switchRole('citizen');
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          userRole === 'citizen'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Citizen Dashboard</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Upload &amp; Report</span>
                      </button>

                      <button
                        onClick={() => {
                          switchRole('engineer');
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          userRole === 'engineer'
                            ? 'bg-blue-50 text-blue-800 border border-blue-300'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Engineer Dashboard</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Review &amp; Fix</span>
                      </button>

                      <button
                        onClick={() => {
                          switchRole('admin');
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          userRole === 'admin'
                            ? 'bg-purple-50 text-purple-800 border border-purple-300'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>Admin Dashboard</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Full Oversight</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1.5 mt-1 border-t border-slate-100 px-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setRoleMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">End Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-200 scrollbar-none">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
