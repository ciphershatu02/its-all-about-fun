import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Clipboard, Trash2, ArrowLeft, Info, Flame, AlertCircle, RotateCw, Sparkles, MessageCircle } from 'lucide-react';
import { ComebackStyle, ComebackIntensity } from '../types';
import { STYLE_OPTIONS, INTENSITY_OPTIONS, INSPIRATION_PROMPTS, MAX_MESSAGE_LENGTH } from '../constants';

interface ComebackGeneratorProps {
  initialMessage?: string;
  initialStyle?: ComebackStyle;
  initialIntensity?: ComebackIntensity;
  isLoading?: boolean;
  apiError?: string | null;
  onGenerate: (message: string, style: ComebackStyle, intensity: ComebackIntensity) => void;
  onBackToLanding: () => void;
  onClearError?: () => void;
}

export const ComebackGenerator: React.FC<ComebackGeneratorProps> = ({
  initialMessage = '',
  initialStyle = 'sarcastic',
  initialIntensity = 'medium',
  isLoading = false,
  apiError = null,
  onGenerate,
  onBackToLanding,
  onClearError,
}) => {
  const [message, setMessage] = useState<string>(initialMessage);
  const [selectedStyle, setSelectedStyle] = useState<ComebackStyle>(initialStyle);
  const [selectedIntensity, setSelectedIntensity] = useState<ComebackIntensity>(initialIntensity);
  const [validationError, setValidationError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial state if changed externally (e.g. on reset or preset click)
  useEffect(() => {
    setMessage(initialMessage);
    if (!initialMessage) {
      setValidationError(null);
    }
  }, [initialMessage]);

  useEffect(() => {
    setSelectedStyle(initialStyle);
  }, [initialStyle]);

  useEffect(() => {
    setSelectedIntensity(initialIntensity);
  }, [initialIntensity]);

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const truncated = text.slice(0, MAX_MESSAGE_LENGTH);
          setMessage(truncated);
          setValidationError(null);
          onClearError?.();
          textareaRef.current?.focus();
        }
      }
    } catch {
      // Clipboard permissions handled silently
    }
  };

  const handleClear = () => {
    if (isLoading) return;
    setMessage('');
    setValidationError(null);
    onClearError?.();
    textareaRef.current?.focus();
  };

  const handleSelectInspiration = (prompt: string) => {
    if (isLoading) return;
    setMessage(prompt);
    setValidationError(null);
    onClearError?.();
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 1. EMPTY INPUT VALIDATION: Friendly validation message, do not call AI
    if (!message || !message.trim()) {
      setValidationError('Please enter or paste the message you received first! The Savage King needs something to roast. 👑');
      textareaRef.current?.focus();
      return;
    }

    setValidationError(null);
    onClearError?.();
    onGenerate(message.trim(), selectedStyle, selectedIntensity);
  };

  const charCount = message.length;
  const isAtLimit = charCount >= MAX_MESSAGE_LENGTH;
  const isNearLimit = charCount >= MAX_MESSAGE_LENGTH * 0.9;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          id="gen-back-btn"
          onClick={onBackToLanding}
          disabled={isLoading}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Roast Calibration</span>
        </div>
      </div>

      {/* Main Generator Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Message Input */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="message-input"
                className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2"
              >
                <span>What did they say?</span>
                <span className="text-amber-400">💬</span>
              </label>

              <div className="flex items-center gap-2">
                {message && !isLoading && (
                  <button
                    type="button"
                    id="clear-message-btn"
                    onClick={handleClear}
                    className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer"
                    title="Clear text"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}

                <button
                  type="button"
                  id="paste-message-btn"
                  onClick={handlePaste}
                  disabled={isLoading}
                  className="text-xs text-amber-400/90 hover:text-amber-300 disabled:opacity-50 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-3">
              Paste the text message, DM, rude comment, or unsolicited advice you need a royal comeback for.
            </p>

            <div className="relative">
              <textarea
                ref={textareaRef}
                id="message-input"
                value={message}
                disabled={isLoading}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationError) setValidationError(null);
                  if (apiError) onClearError?.();
                }}
                rows={4}
                placeholder="Type or paste the message here..."
                className={`w-full bg-zinc-950/80 border rounded-2xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 text-base leading-relaxed transition-all resize-y min-h-[120px] ${
                  validationError
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                    : isAtLimit
                    ? 'border-amber-500/80 focus:border-amber-400 focus:ring-amber-400/20'
                    : 'border-zinc-700/80 focus:border-amber-400 focus:ring-amber-400/20'
                }`}
              />
            </div>

            {/* 2. CHARACTER COUNTER & Limit Notice */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div>
                {isAtLimit && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Maximum message limit reached ({MAX_MESSAGE_LENGTH}/{MAX_MESSAGE_LENGTH})
                  </span>
                )}
              </div>

              <div
                id="character-counter"
                className={`font-mono transition-colors ${
                  isAtLimit
                    ? 'text-amber-400 font-semibold'
                    : isNearLimit
                    ? 'text-amber-300/80'
                    : 'text-zinc-500'
                }`}
              >
                {charCount} / {MAX_MESSAGE_LENGTH} characters
              </div>
            </div>

            {/* 1. FRIENDLY VALIDATION ERROR / API ERROR */}
            <AnimatePresence>
              {(validationError || apiError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-start justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{validationError || apiError}</span>
                  </div>
                  {apiError && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="underline text-amber-300 hover:text-amber-200 cursor-pointer shrink-0 font-semibold text-xs"
                    >
                      Try Again
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 7. EXAMPLE PROMPTS: "Need inspiration? Try these 👀" */}
            <div className="mt-4 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center gap-1.5 mb-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-300">
                  Need inspiration? Try these 👀
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INSPIRATION_PROMPTS.map((prompt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    id={`inspiration-prompt-${idx}`}
                    disabled={isLoading}
                    onClick={() => handleSelectInspiration(prompt)}
                    className="text-xs text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 hover:text-amber-300 hover:border-amber-500/40 active:scale-97 disabled:opacity-50 px-3 py-1.5 rounded-xl border border-zinc-700/60 transition-all cursor-pointer text-left"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Response Style */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Response Style</span>
                <span className="text-amber-400">🎭</span>
              </label>
              <span className="text-xs text-zinc-400 font-mono">
                {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Select the comedic style and tonal angle of your comeback.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    type="button"
                    key={style.id}
                    id={`style-btn-${style.id}`}
                    disabled={isLoading}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      onClearError?.();
                    }}
                    className={`relative p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between disabled:opacity-50 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/80 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{style.emoji}</span>
                        <span
                          className={`font-display font-bold text-sm ${
                            isSelected ? 'text-amber-300' : 'text-zinc-200'
                          }`}
                        >
                          {style.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Intensity */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Intensity</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </label>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                {selectedIntensity}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Decide how hard the punchline should land.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTENSITY_OPTIONS.map((intensity) => {
                const isSelected = selectedIntensity === intensity.id;
                return (
                  <button
                    type="button"
                    key={intensity.id}
                    id={`intensity-btn-${intensity.id}`}
                    disabled={isLoading}
                    onClick={() => {
                      setSelectedIntensity(intensity.id);
                      onClearError?.();
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 text-white shadow-md shadow-amber-500/10'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-display font-bold text-sm ${
                          isSelected ? 'text-amber-300' : 'text-zinc-200'
                        }`}
                      >
                        {intensity.label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <span
                          className={`w-1.5 h-3 rounded-sm ${
                            intensity.id === 'light' ||
                            intensity.id === 'medium' ||
                            intensity.id === 'savage'
                              ? isSelected
                                ? 'bg-amber-400'
                                : 'bg-zinc-600'
                              : 'bg-zinc-800'
                          }`}
                        />
                        <span
                          className={`w-1.5 h-3 rounded-sm ${
                            intensity.id === 'medium' || intensity.id === 'savage'
                              ? isSelected
                                ? 'bg-amber-400'
                                : 'bg-zinc-600'
                              : 'bg-zinc-800'
                          }`}
                        />
                        <span
                          className={`w-1.5 h-3 rounded-sm ${
                            intensity.id === 'savage'
                              ? isSelected
                                ? 'bg-amber-400'
                                : 'bg-zinc-600'
                              : 'bg-zinc-800'
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {intensity.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="generate-comeback-btn"
              disabled={isLoading}
              className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-display font-extrabold text-base sm:text-lg tracking-wide uppercase text-zinc-950 transition-all flex items-center justify-center gap-2.5 shadow-xl ${
                isLoading
                  ? 'bg-amber-500/80 cursor-not-allowed opacity-90'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-99 shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 text-zinc-950 animate-spin" />
                  <span>CONSULTING THE SAVAGE KING... 👑</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 text-zinc-950" />
                  <span>GENERATE COMEBACK 👑</span>
                </>
              )}
            </button>
          </div>

          {/* Loading status details when AI is working */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-200"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-300">
                    Formulating 3 razor-sharp comeback perspectives...
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Matching {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.label} style at {selectedIntensity} intensity.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Safety & Design notice */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center">
            <Info className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            <span>
              Savage King focuses on clever wit and playful sarcasm. Zero hateful content, threats, or harassment.
            </span>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
