import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Radio } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hold for 1.6s then smoothly transition out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    if (!isVisible) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          id="ipthreat-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-app)] text-[var(--text-main)] select-none px-6"
        >
          {/* Main Logo & Wordmark Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1.0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-md w-full"
          >
            {/* Logo Emblem */}
            <div className="relative mb-6">
              {/* Subtle ambient glow behind emblem */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-20 blur-xl pointer-events-none"
                style={{ backgroundColor: 'var(--primary-teal)' }}
              />

              <div className="relative w-20 h-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-app)] flex items-center justify-center shadow-lg">
                {/* Diode Shield with Unidirectional Arrow Accent */}
                <div className="relative flex items-center justify-center">
                  <Shield className="w-10 h-10 text-[var(--primary-teal)]" strokeWidth={1.75} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[var(--text-main)]" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Status Dot */}
                <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sev-low)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--sev-low)]"></span>
                </div>
              </div>
            </div>

            {/* Wordmark */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-[var(--text-main)]">
                  IP<span className="text-[var(--primary-teal)]">threat</span>
                </h1>
                <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--primary-teal)]/15 text-[var(--primary-teal)] border border-[var(--primary-teal)]/25">
                  AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium tracking-wide">
                Unidirectional Hardware Security &amp; SOC Defense
              </p>
            </div>

            {/* Subtle Initialization Bar */}
            <div className="mt-8 w-48 space-y-2">
              <div className="h-1 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[var(--primary-teal)] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-[var(--sev-low)] animate-pulse" />
                  Optical link verified
                </span>
                <span>v3.4.2</span>
              </div>
            </div>
          </motion.div>

          {/* Quick skip button on bottom */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute bottom-6 sm:bottom-8 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] px-4 py-2.5 min-h-[44px] rounded-xl hover:bg-[var(--bg-card)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-app)] flex items-center justify-center"
          >
            Press any key or tap to skip &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
