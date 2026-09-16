import React from 'react';
import { motion } from 'motion/react';
import { Crown, Flame, Sparkles, MessageSquareQuote, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { STYLE_OPTIONS, INTENSITY_OPTIONS, QUICK_SAMPLE_PROMPTS } from '../constants';

interface LandingHeroProps {
  onStart: (initialMessage?: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Royal Subtle Ambient Glow Elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-yellow-600/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center text-center justify-center">
        
        {/* Crown & Royal Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm"
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>The Crown Jewel of Roasts</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </motion.div>

        {/* Prominent App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-4"
        >
          Savage King <span className="inline-block hover:scale-110 transition-transform">👑</span>
        </motion.h1>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
            &ldquo;Say less. Roast more.&rdquo;
          </p>
        </motion.div>

        {/* Short Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
        >
          Turn awkward messages into legendary comebacks.
        </motion.p>

        {/* Prominent CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14"
        >
          <button
            id="landing-cta-btn"
            onClick={() => onStart()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-bold text-lg text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-3 group"
          >
            <span>Generate a Comeback 🔥</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Quick Demo Previews / Interactive Hooks for Hangouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-3xl bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-2xl text-left"
        >
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Quick Test Prompts
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Click any message to test the generator
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_SAMPLE_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                id={`sample-prompt-${idx}`}
                onClick={() => onStart(prompt)}
                className="text-xs sm:text-sm text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 hover:text-amber-300 border border-zinc-700/60 hover:border-amber-500/40 rounded-xl px-3.5 py-2 transition-all cursor-pointer text-left flex items-center gap-2 group"
              >
                <span className="text-amber-400 group-hover:scale-110 transition-transform">💬</span>
                <span className="line-clamp-1">{prompt}</span>
              </button>
            ))}
          </div>

          {/* Quick Pillars overview */}
          <div className="mt-5 pt-4 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <span>5 Royal Comedy Styles</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>3 Scalable Roast Tiers</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Pure Wit, Zero Abuse</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Ethos / Safety note */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950/60 py-4 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span>Savage King</span>
            <span>•</span>
            <span className="text-zinc-500">Witty, playful banter rule strictly enforced</span>
          </div>
          <p className="text-zinc-500">
            Engineered for clever comebacks without hate, threats, or harassment.
          </p>
        </div>
      </footer>
    </div>
  );
};
