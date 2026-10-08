import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Globe, 
  Sun, 
  Moon, 
  MessageSquareHeart,
  Sparkles
} from 'lucide-react';
import { LANGUAGES } from '../translations';
import { PatientProfile } from '../types';

interface NavbarProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  patient: PatientProfile | null;
  onOpenAbhaModal: () => void;
  onToggleChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  theme,
  onToggleTheme,
  patient,
  onOpenAbhaModal,
  onToggleChat
}) => {
  const t = LANGUAGES[currentLang]?.translations || LANGUAGES.en.translations;

  return (
    <header className="glass-nav px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight font-display">
                PENTABYTE <span className="text-cyan-500">Health Copilot</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-500" /> Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* ABHA Status Pill */}
          <button
            onClick={onOpenAbhaModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-cyan-500/30 text-slate-700 dark:text-slate-200 transition-all cursor-pointer group"
            title="Click to view ABDM ABHA Digital Health Card"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-500 dark:text-slate-400">ABHA:</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold">
              {patient?.abha_id || "91-8472-1092-3841"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          </button>

          {/* Regional Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              {Object.values(LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* AI Copilot Chat Toggle */}
          <button
            onClick={onToggleChat}
            className="btn-primary text-xs !py-1.5 !px-3.5"
            title="Chat with AI Health Copilot"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>{t.askCopilot}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
