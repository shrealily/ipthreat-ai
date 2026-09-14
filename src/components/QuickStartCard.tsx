import React from 'react';
import { Compass, ArrowRight, BookOpen, X } from 'lucide-react';

interface QuickStartCardProps {
  onStartGuide: () => void;
  onExploreDashboard: () => void;
  onDismiss?: () => void;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  onStartGuide,
  onExploreDashboard,
  onDismiss,
}) => {
  return (
    <div
      id="quick-start-card"
      className="p-5 rounded-xl bg-white dark:bg-[#202727] border border-[#DCE3E3] dark:border-[#34403F] shadow-xs relative transition-all"
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-[#718096] dark:text-[#A8B7B4] hover:text-[#263238] dark:hover:text-[#DCE5E2] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss quick start"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#173F4F]/10 dark:bg-[#6D9C98]/15 text-[#173F4F] dark:text-[#6D9C98] shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#263238] dark:text-[#DCE5E2]">
                New to IPthreat AI?
              </h3>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#173F4F]/10 dark:bg-[#6D9C98]/20 text-[#173F4F] dark:text-[#6D9C98]">
                Interactive Onboarding
              </span>
            </div>
            <p className="text-xs text-[#718096] dark:text-[#A8B7B4] mt-1 max-w-xl">
              Learn how to monitor traffic, investigate threats and understand AI detections with an interactive walkthrough.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onExploreDashboard}
            className="min-h-[44px] px-4 py-2.5 text-xs font-medium text-[#263238] dark:text-[#DCE5E2] hover:bg-[#F6F7F5] dark:hover:bg-[#283131] border border-[#DCE3E3] dark:border-[#34403F] rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            Explore Dashboard
          </button>
          <button
            onClick={onStartGuide}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#173F4F] hover:bg-[#2F6978] dark:bg-[#6D9C98] dark:hover:bg-[#507774] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Start Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
