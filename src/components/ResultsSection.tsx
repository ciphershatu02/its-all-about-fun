import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Copy,
  Check,
  RotateCw,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Share2,
  Heart,
} from 'lucide-react';
import { ComebackResponse, ComebackStyle, ComebackIntensity } from '../types';
import { STYLE_OPTIONS, INTENSITY_OPTIONS } from '../constants';

interface ResultsSectionProps {
  originalMessage: string;
  style: ComebackStyle;
  intensity: ComebackIntensity;
  responses: ComebackResponse[];
  regeneratingId: string | null;
  isRegeneratingAll: boolean;
  error?: string | null;
  onToggleFavorite: (responseId: string) => void;
  onTryAnotherMessage: () => void;
  onRegenerateResponse: (responseId: string) => void;
  onRegenerateAll: () => void;
  onClearError?: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  originalMessage,
  style,
  intensity,
  responses,
  regeneratingId,
  isRegeneratingAll,
  error,
  onToggleFavorite,
  onTryAnotherMessage,
  onRegenerateResponse,
  onRegenerateAll,
  onClearError,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);

  const styleObj = STYLE_OPTIONS.find((s) => s.id === style) || STYLE_OPTIONS[0];
  const intensityObj = INTENSITY_OPTIONS.find((i) => i.id === intensity) || INTENSITY_OPTIONS[1];

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 3. SHARE FEATURE with native Web Share API and graceful fallback
  const handleShare = async (id: string, text: string) => {
    const shareData = {
      title: 'Savage King Comeback 👑',
      text: `"${text}" — Crafted by Savage King ("Say less. Roast more.")`,
    };

    if (navigator?.share) {
      try {
        await navigator.share(shareData);
        setSharedId(id);
        setTimeout(() => setSharedId(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User cancelled native share sheet; do nothing
          return;
        }
      }
    }

    // Fallback: Copy to clipboard for sharing
    await copyToClipboard(shareData.text);
    setSharedId(id);
    setTimeout(() => setSharedId(null), 2500);
  };

  const favoriteCount = responses.filter((r) => r.isFavorite).length;
  const displayedResponses = filterFavorites
    ? responses.filter((r) => r.isFavorite)
    : responses;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* 8. RESET: "Try Another Message" clears input, responses, and returns to generator while preserving style/intensity */}
        <button
          type="button"
          id="results-try-another-top-btn"
          onClick={onTryAnotherMessage}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Try Another Message</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorite filter toggle if user has favorited any */}
          {favoriteCount > 0 && (
            <button
              type="button"
              id="filter-favorites-btn"
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                filterFavorites
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
              <span>{filterFavorites ? 'Show All (3)' : `Favorites (${favoriteCount})`}</span>
            </button>
          )}

          <button
            type="button"
            id="results-refresh-all-btn"
            disabled={isRegeneratingAll || Boolean(regeneratingId)}
            onClick={onRegenerateAll}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-amber-400/60 disabled:opacity-50 text-xs text-zinc-300 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegeneratingAll ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRegeneratingAll ? 'Regenerating All...' : 'Regenerate All'}</span>
          </button>

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Royal Results</span>
          </span>
        </div>
      </div>

      {/* Target Message Context Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>What they said:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
              {styleObj.emoji} {styleObj.label}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
              {intensityObj.label} Intensity
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-zinc-200 font-medium italic border-l-2 border-amber-400/60 pl-3 py-1">
          &ldquo;{originalMessage}&rdquo;
        </p>
      </motion.div>

      {/* Error alert if regeneration failed */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="underline text-amber-300 hover:text-amber-200 cursor-pointer text-xs"
              >
                Dismiss
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Response Cards */}
      <div className="space-y-5 mb-10">
        {displayedResponses.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
            <Heart className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No favorited comebacks in this filter yet.</p>
            <button
              type="button"
              onClick={() => setFilterFavorites(false)}
              className="mt-3 text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Show all responses
            </button>
          </div>
        ) : (
          displayedResponses.map((response, idx) => {
            const isCopied = copiedId === response.id;
            const isShared = sharedId === response.id;
            const isRegenerating = regeneratingId === response.id;
            const isFavorite = Boolean(response.isFavorite);

            return (
              <motion.div
                key={response.id}
                id={`response-card-${response.number}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`group relative bg-zinc-900/90 border transition-all rounded-2xl p-5 sm:p-6 shadow-xl ${
                  isRegenerating
                    ? 'border-amber-400/60 bg-zinc-900/70 shadow-amber-500/10'
                    : isFavorite
                    ? 'border-amber-500/40 bg-zinc-900/95'
                    : 'border-zinc-800 hover:border-amber-400/40'
                }`}
              >
                {/* Card Header: Response Number, Favorite Heart/Crown Toggle, AI Badge */}
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-display font-bold text-xs text-amber-400">
                      #{response.number}
                    </div>
                    <span className="font-display font-bold text-sm text-zinc-100">
                      Comeback Option {response.number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 4. FAVORITE RESPONSE: Heart / Crown toggle */}
                    <button
                      type="button"
                      id={`favorite-btn-${response.number}`}
                      onClick={() => onToggleFavorite(response.id)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isFavorite
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 font-medium'
                          : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-rose-300'
                      }`}
                      title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-zinc-400'
                        }`}
                      />
                      <span className="text-[11px] hidden xs:inline">
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </span>
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/90 text-[11px] font-mono text-zinc-300 border border-zinc-700">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Savage King AI</span>
                    </div>
                  </div>
                </div>

                {/* Comeback Text or 5. IMPROVE REGENERATION: Loading state only on the card being regenerated */}
                <div className="mb-6">
                  {isRegenerating ? (
                    <div className="bg-zinc-950/60 p-5 rounded-xl border border-amber-500/20 flex items-center gap-3 py-6">
                      <RotateCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-300">
                          Formulating a fresh, noticeably different angle...
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Keeping your message, &ldquo;{styleObj.label}&rdquo; style, and &ldquo;{intensityObj.label}&rdquo; intensity.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg text-zinc-100 leading-relaxed font-sans select-all bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/70 shadow-inner">
                      {response.text}
                    </p>
                  )}
                </div>

                {/* Action Buttons: Regenerate, Share, Copy */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">
                    Tap to copy, share, or get another angle
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    {/* 5. Regenerate Single Button */}
                    <button
                      type="button"
                      id={`regenerate-btn-${response.number}`}
                      disabled={isRegenerating || Boolean(regeneratingId) || isRegeneratingAll}
                      onClick={() => onRegenerateResponse(response.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 disabled:opacity-50 border border-zinc-700/80 hover:border-zinc-600 active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Generate a noticeably different comeback for this slot"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>

                    {/* 3. SHARE FEATURE Button */}
                    <button
                      type="button"
                      id={`share-btn-${response.number}`}
                      disabled={isRegenerating}
                      onClick={() => handleShare(response.id, response.text)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer ${
                        isShared
                          ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-bold'
                          : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-700/80 hover:border-zinc-600 text-zinc-200'
                      }`}
                      title="Share comeback with friends or to chat"
                    >
                      {isShared ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Shared!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      id={`copy-btn-${response.number}`}
                      disabled={isRegenerating}
                      onClick={() => handleCopy(response.id, response.text)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isCopied
                          ? 'bg-emerald-500 text-zinc-950 font-bold'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950'
                      }`}
                      title="Copy comeback to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 8. RESET: "Try Another Message" Primary CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-zinc-800"
      >
        <button
          type="button"
          id="try-another-message-btn"
          onClick={onTryAnotherMessage}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-bold text-base text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Try Another Message</span>
        </button>
      </motion.div>
    </div>
  );
};
