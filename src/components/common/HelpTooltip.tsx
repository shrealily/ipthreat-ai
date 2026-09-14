import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export type StandardHelpTerm =
  | 'risk-score'
  | 'ai-confidence'
  | 'precision'
  | 'recall'
  | 'f1-score'
  | 'false-positive-rate'
  | 'threat-dna'
  | 'baseline-deviation'
  | 'unidirectional-traffic';

const TERM_DEFINITIONS: Record<StandardHelpTerm, { title: string; text: string }> = {
  'risk-score': {
    title: 'Risk Score (0–100)',
    text: 'An estimate of how serious the detected network behavior may be.',
  },
  'ai-confidence': {
    title: 'AI Confidence Score',
    text: 'How strongly the model supports its classification.',
  },
  'precision': {
    title: 'Model Precision',
    text: 'Proportion of detected anomalies that were actual security violations.',
  },
  'recall': {
    title: 'Model Recall',
    text: 'Proportion of all true network attacks successfully identified by the model.',
  },
  'f1-score': {
    title: 'F1 Score',
    text: 'Harmonic balance between precision and recall for unbiased accuracy.',
  },
  'false-positive-rate': {
    title: 'False Positive Rate',
    text: 'Percentage of benign normal traffic mistakenly flagged as suspicious.',
  },
  'threat-dna': {
    title: 'Threat DNA',
    text: 'Behavioral signature combining packet rate, port spread, and volume.',
  },
  'baseline-deviation': {
    title: 'Baseline Deviation',
    text: 'How far the current traffic pattern departs from learned normal traffic.',
  },
  'unidirectional-traffic': {
    title: 'Unidirectional Traffic',
    text: 'Physical one-way data diode enforcement preventing reverse return packets.',
  },
};

interface HelpTooltipProps {
  term?: StandardHelpTerm;
  title?: string;
  text?: string;
  className?: string;
  iconSize?: number;
  variant?: 'help' | 'info';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  term,
  title,
  text,
  className = '',
  iconSize = 13,
  variant = 'help',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const displayTitle = title || (term ? TERM_DEFINITIONS[term]?.title : '');
  const displayText = text || (term ? TERM_DEFINITIONS[term]?.text : '');

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const IconComponent = variant === 'info' ? Info : HelpCircle;

  return (
    <span className={`inline-flex items-center relative align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 text-slate-400 hover:text-[#173F4F] transition-colors rounded cursor-pointer focus:outline-none"
        aria-label={displayTitle || 'Information'}
      >
        <IconComponent style={{ width: iconSize, height: iconSize }} />
      </button>

      {isOpen && displayText && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 rounded-lg shadow-lg border border-[#DCE3E3] bg-white text-left text-xs pointer-events-auto"
        >
          {displayTitle && (
            <div className="font-semibold text-[#173F4F] mb-1 text-[11px] font-mono">
              {displayTitle}
            </div>
          )}
          <div className="text-[#263238] text-[11px] leading-relaxed">
            {displayText}
          </div>
          {/* Caret */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}
    </span>
  );
};
