import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ComebackGenerator } from './components/ComebackGenerator';
import { ResultsSection } from './components/ResultsSection';
import { AppView, ComebackStyle, ComebackIntensity, ComebackResponse } from './types';
import { generateComebackSuggestions, regenerateSingleComeback } from './services/aiService';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeMessage, setActiveMessage] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<ComebackStyle>('sarcastic');
  const [activeIntensity, setActiveIntensity] = useState<ComebackIntensity>('medium');
  const [responses, setResponses] = useState<ComebackResponse[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Navigation handlers
  const handleStart = (initialMessage?: string) => {
    if (initialMessage) {
      setActiveMessage(initialMessage);
    }
    setErrorMessage(null);
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate 3 comebacks via Gemini
  const handleGenerate = async (
    message: string,
    style: ComebackStyle,
    intensity: ComebackIntensity
  ) => {
    // 1. Guard against empty input
    if (!message || !message.trim()) {
      return;
    }

    setActiveMessage(message);
    setActiveStyle(style);
    setActiveIntensity(intensity);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const generated = await generateComebackSuggestions({
        message,
        style,
        intensity,
      });

      setResponses(generated);
      setCurrentView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Comeback generation failed:', err);
      const msg =
        err?.message?.includes('Failed to fetch') || err?.name === 'TypeError'
          ? 'Unable to connect to the server. Please check your connection and tap Try Again.'
          : err?.message || 'Could not generate comebacks at this moment. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. RESET: "Try Another Message"
  // - Clear the message input
  // - Clear generated responses
  // - Reset loading states
  // - Return user to generator
  // - Do NOT remove the user's selected style and intensity
  const handleTryAnotherMessage = () => {
    setActiveMessage('');
    setResponses([]);
    setIsLoading(false);
    setRegeneratingId(null);
    setIsRegeneratingAll(false);
    setErrorMessage(null);
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. FAVORITE RESPONSE: Session-based toggle
  const handleToggleFavorite = (responseId: string) => {
    setResponses((prev) =>
      prev.map((item) =>
        item.id === responseId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // 5. IMPROVE REGENERATION:
  // - Regenerate only that individual response
  // - Keep original user message, style, intensity
  // - Make new response noticeably different from previous one
  // - Show loading state only on that card
  const handleRegenerateResponse = async (responseId: string) => {
    const targetItem = responses.find((r) => r.id === responseId);
    if (!targetItem) return;

    setRegeneratingId(responseId);
    setErrorMessage(null);

    try {
      // Gather all current comebacks so the AI knows specifically what to avoid duplicating
      const allCurrentComebacks = responses.map((r) => r.text);

      const freshResponse = await regenerateSingleComeback({
        responseId,
        message: activeMessage,
        style: activeStyle,
        intensity: activeIntensity,
        number: targetItem.number,
        previousComebacks: allCurrentComebacks,
      });

      setResponses((prev) =>
        prev.map((item) =>
          item.id === responseId
            ? { ...freshResponse, isFavorite: item.isFavorite }
            : item
        )
      );
    } catch (err: any) {
      console.error('Failed to regenerate single comeback:', err);
      const msg =
        err?.message?.includes('Failed to fetch') || err?.name === 'TypeError'
          ? 'Unable to connect to the server. Please tap Try Again.'
          : err?.message || `Failed to regenerate Comeback #${targetItem.number}. Please try again.`;
      setErrorMessage(msg);
    } finally {
      setRegeneratingId(null);
    }
  };

  // Regenerate all 3 responses
  const handleRegenerateAll = async () => {
    setIsRegeneratingAll(true);
    setErrorMessage(null);

    try {
      const freshResponses = await generateComebackSuggestions({
        message: activeMessage,
        style: activeStyle,
        intensity: activeIntensity,
      });
      setResponses(freshResponses);
    } catch (err: any) {
      console.error('Failed to regenerate all comebacks:', err);
      const msg =
        err?.message?.includes('Failed to fetch') || err?.name === 'TypeError'
          ? 'Unable to connect to the server. Please tap Try Again.'
          : err?.message || 'Failed to regenerate all comebacks. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 royal-mesh relative">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LandingHero onStart={handleStart} />
            </motion.div>
          )}

          {currentView === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ComebackGenerator
                initialMessage={activeMessage}
                initialStyle={activeStyle}
                initialIntensity={activeIntensity}
                isLoading={isLoading}
                apiError={errorMessage}
                onGenerate={handleGenerate}
                onBackToLanding={() => {
                  setErrorMessage(null);
                  setCurrentView('landing');
                }}
                onClearError={() => setErrorMessage(null)}
              />
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ResultsSection
                originalMessage={activeMessage}
                style={activeStyle}
                intensity={activeIntensity}
                responses={responses}
                regeneratingId={regeneratingId}
                isRegeneratingAll={isRegeneratingAll}
                error={errorMessage}
                onToggleFavorite={handleToggleFavorite}
                onTryAnotherMessage={handleTryAnotherMessage}
                onRegenerateResponse={handleRegenerateResponse}
                onRegenerateAll={handleRegenerateAll}
                onClearError={() => setErrorMessage(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
