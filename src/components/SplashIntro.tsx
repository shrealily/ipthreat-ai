import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Radio } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hold for 1.8s then smoothly transition out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

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
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#171B1B] text-[#DCE5E2] select-none px-4 sm:px-6 cursor-pointer"
        >
          {/* Main Logo & Wordmark Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1.0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-sm sm:max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo Emblem */}
            <div className="relative mb-5 sm:mb-6">
              {/* Ambient glow behind emblem */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-25 blur-xl pointer-events-none bg-[#6D9C98]"
              />

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#202727] border border-[#34403F] flex items-center justify-center shadow-2xl">
                {/* Diode Shield with Unidirectional Arrow Accent */}
                <div className="relative flex items-center justify-center">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-[#6D9C98]" strokeWidth={1.75} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DCE5E2]" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Status Dot */}
                <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8D6B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5C8D6B]"></span>
                </div>
              </div>
            </div>

            {/* Wordmark */}
            <div className="space-y-1.5 px-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-[#DCE5E2]">
                  IP<span className="text-[#6D9C98]">threat</span>
                </h1>
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#6D9C98]/15 text-[#6D9C98] border border-[#6D9C98]/25">
                  AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A8B7B4] font-medium tracking-wide">
                Unidirectional Hardware Security &amp; SOC Defense
              </p>
            </div>

            {/* Subtle Initialization Bar */}
            <div className="mt-6 sm:mt-8 w-40 sm:w-48 space-y-2">
              <div className="h-1 w-full bg-[#293433] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[#6D9C98] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A8B7B4]">
                <span className="flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-[#5C8D6B] animate-pulse" />
                  Optical link verified
                </span>
                <span>v3.4.2</span>
              </div>
            </div>
          </motion.div>

          {/* Quick skip button on bottom */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute bottom-6 sm:bottom-8 text-xs font-mono text-[#A8B7B4] hover:text-[#DCE5E2] px-4 py-2.5 min-h-[44px] rounded-xl hover:bg-[#202727] transition-colors cursor-pointer border border-transparent hover:border-[#34403F] flex items-center justify-center"
          >
            Tap anywhere to enter &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
