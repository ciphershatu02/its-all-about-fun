import React from 'react';
import { Crown, Sparkles, Shield, ArrowLeft } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          id="navbar-brand-btn"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left cursor-pointer transition-transform active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm group-hover:border-amber-400/60 group-hover:text-amber-300 transition-colors">
            <Crown className="w-5 h-5 transition-transform group-hover:rotate-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display font-bold text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
              <span>Savage King</span>
              <span className="text-amber-400">👑</span>
            </div>
            <p className="text-[11px] font-medium text-zinc-400 leading-none hidden sm:block">
              Say less. Roast more.
            </p>
          </div>
        </button>

        {/* Actions / Nav */}
        <div className="flex items-center gap-3">
          {currentView !== 'landing' && (
            <button
              id="navbar-home-btn"
              onClick={() => onNavigate('landing')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          )}

          {currentView === 'landing' ? (
            <button
              id="navbar-generator-cta"
              onClick={() => onNavigate('generator')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-98 transition-all shadow-md shadow-amber-500/15 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>Launch App 🔥</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Playful Banter Mode</span>
              <span className="sm:hidden">Banter Mode</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
