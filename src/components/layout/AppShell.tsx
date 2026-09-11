import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GovTopBar } from '../common/GovTopBar';
import { GovEmblem } from '../common/GovEmblem';
import {
  FileSearch,
  Ruler,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Database,
  Lock,
  UserCheck,
  Flame,
  Mail,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Clean Navigation Items
  const navItems = [
    { label: t('nav_verify'), path: '/verify', icon: FileSearch, code: '01' },
    { label: t('nav_reports'), path: '/reports', icon: FileText, code: '02' },
    { label: t('nav_settings'), path: '/settings', icon: Settings, code: '03' },
  ];

  return (
    <div className="min-h-screen bg-gov-paper text-gov-ink flex flex-col selection:bg-gov-navy-800/20 selection:text-gov-navy-900">
      {/* 1. Official National Gov Bar with Accessibility Tools */}
      <GovTopBar showFullHeader={false} />

      {/* 2. Top Advisory Banner */}
      <div className="bg-amber-50/90 border-b border-amber-300/80 px-4 py-1.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <strong>{isHi ? 'सुरक्षा सूचना:' : 'Security Core:'}</strong>{' '}
            {t('security_notice')}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 ml-auto">
          <span className="inline-flex items-center gap-1 text-[11px] text-gov-inksoft font-mono">
            <Lock className="w-3 h-3 text-emerald-700" />
            256-BIT ENCRYPTED
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border bg-amber-50 text-amber-900 border-amber-300 font-mono">
            <Flame className="w-3 h-3 text-amber-600" />
            {isHi ? 'टीम इन्फर्नो कोर' : 'TEAM INFERNO CORE'}
          </span>
        </div>
      </div>

      {/* 3. Main Operational App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gov-line shrink-0 shadow-sm">
          {/* Crest Header */}
          <div className="p-4 border-b border-gov-line bg-slate-50/50">
            <div className="flex items-center gap-3">
              <GovEmblem size="sm" />
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 block font-mono">
                  {t('govt_of_india')}
                </span>
                <span className="font-extrabold tracking-tight text-xs text-gov-navy-950 block leading-tight">
                  {t('portal_title')}
                </span>
                <span className="text-[10px] text-gov-inksoft font-bold font-mono block mt-0.5">
                  {isHi ? 'इन्फर्नो सत्यापन प्रणाली' : 'INFERNO VERIFICATION SUITE'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-widest text-gov-inksoft">
              {isHi ? 'पोर्टल मॉड्यूल' : 'Portal Modules'}
            </div>
            <nav className="space-y-1 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-semibold transition-all duration-150 border-l-4 ${
                      isActive
                        ? 'bg-gov-navy-950 text-white border-gov-saffron shadow-sm'
                        : 'border-transparent text-gov-inksoft hover:text-gov-navy-950 hover:bg-gov-paper hover:border-gov-line'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gov-saffron' : 'text-gov-inksoft'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.code}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-gov-navy-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white border-r border-gov-line p-5 flex flex-col h-full shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gov-line mb-4">
                <div className="flex items-center gap-2.5">
                  <GovEmblem size="sm" />
                  <div>
                    <span className="text-[10px] font-bold text-gov-navy-800 block">{t('govt_of_india')}</span>
                    <span className="font-extrabold text-xs text-gov-navy-950">
                      {t('portal_title')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gov-inksoft hover:text-gov-navy-950 rounded hover:bg-gov-paper"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold ${
                        isActive
                          ? 'bg-gov-navy-950 text-white'
                          : 'text-gov-inksoft hover:text-gov-navy-950 hover:bg-gov-paper'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gov-saffron" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-gov-line mt-auto">
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav_logout')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operational Workspace Body */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gov-paper">
          {/* Mobile Header Bar */}
          <div className="md:hidden bg-white border-b border-gov-line p-3 flex items-center justify-between shadow-xs">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded text-gov-ink hover:bg-gov-paper"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <GovEmblem size="sm" />
              <span className="font-extrabold text-xs text-gov-navy-950 truncate max-w-[200px]">
                {t('portal_title')}
              </span>
            </div>
            <div className="w-6"></div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            <Outlet />
          </div>

          {/* Application Footer with SUPPORT section */}
          <footer className="mt-auto border-t border-gov-line bg-white py-3 px-4 sm:px-6 lg:px-8 text-xs text-gov-inksoft">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gov-navy-950 uppercase tracking-wider text-[11px]">
                  {isHi ? 'सहायता (SUPPORT):' : 'SUPPORT:'}
                </span>
                <a
                  href="mailto:team.inferno.ai@gmail.com"
                  className="inline-flex items-center gap-1.5 font-medium text-gov-navy-900 hover:text-gov-saffron transition-colors group"
                  title="Send email to team.inferno.ai@gmail.com"
                >
                  <Mail className="w-3.5 h-3.5 text-gov-saffron group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Gmail</span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">(team.inferno.ai@gmail.com)</span>
                </a>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono">
                © 2026 {t('govt_of_india')} • SEC 63 BSA COMPLIANT • TEAM INFERNO
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
