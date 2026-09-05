import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  FileSearch,
  GitCompare,
  History,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Database,
  ExternalLink,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: ShieldCheck },
    { label: 'Verify Document', path: '/verify', icon: FileSearch },
    { label: 'Compare (Real vs Tampered)', path: '/compare', icon: GitCompare },
    { label: 'Verification History', path: '/history', icon: History },
    { label: 'Forensic Reports', path: '/reports', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Advisory Banner (Section 19: Product Positioning) */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300/90 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>AI Forensic Advisory:</strong> DocVerify AI outputs are forensic anomaly indicators. Not certified for legal/government certification without official institutional integration.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
            isConfigured 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
          }`}>
            <Database className="w-3 h-3" />
            {isConfigured ? 'Supabase Connected' : 'Forensic Sandbox Engine'}
          </span>
        </div>
      </div>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800/80 p-4 shrink-0">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white block">DocVerify <span className="text-indigo-400">AI</span></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-0.5">Tamper Inspector</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="pt-4 border-t border-slate-800/80 mt-auto">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                  {user?.full_name ? user.full_name[0] : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Forensic Auditor'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">DocVerify AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Topbar */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span className="font-bold text-base">DocVerify AI</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
