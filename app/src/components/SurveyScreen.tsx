import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OAAssessmentContent } from '../services/oa-api';

interface SurveyScreenProps {
  bundleTitle: string;
  partNumber: number;
  totalParts: number;
  assessments: OAAssessmentContent[];
  onClose: () => void;
  onComplete: () => void;
}

export default function SurveyScreen({
  bundleTitle,
  partNumber,
  totalParts,
  assessments,
  onClose,
  onComplete,
}: SurveyScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const current = assessments[currentIdx];
  const isLast = currentIdx === assessments.length - 1;

  if (!current) return null;

  const handleSelect = (optionId: number) => {
    if (answered) return;
    setSelectedId(optionId);
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  const handleSkip = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <p className="font-serif italic text-[16px] text-white leading-normal">{bundleTitle}</p>
          <p className="type-pre-text text-white/70">Part {partNumber} of {totalParts}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Content — centered */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-6 max-w-[600px] mx-auto w-full">
        {/* Survey label + progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="type-tags text-white/50 uppercase tracking-wider">Survey</span>
          {assessments.length > 1 && (
            <span className="type-pre-text text-white/40">{currentIdx + 1} / {assessments.length}</span>
          )}
        </div>

        {/* Question */}
        <h2 className="font-serif italic text-[28px] md:text-[36px] leading-[1.2] text-white mb-8">
          {current.title}
        </h2>

        {/* Answer options */}
        <div className="flex flex-col gap-3">
          {current.assessments.map(opt => {
            const isSelected = selectedId === opt.id;
            const isCorrect = opt.isCorrect;
            const showResult = answered && isSelected;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
                className={cn(
                  'w-full text-left px-6 py-5 rounded-[16px] transition-all type-body-default',
                  answered && isSelected && isCorrect
                    ? 'bg-accent-green/20 text-accent-green border-2 border-accent-green'
                    : answered && isSelected && !isCorrect
                    ? 'bg-accent-magenta/20 text-accent-magenta border-2 border-accent-magenta'
                    : answered && isCorrect
                    ? 'bg-accent-green/10 text-accent-green/70 border border-accent-green/30'
                    : 'bg-white text-text-primary hover:bg-white/90',
                  !answered && 'border border-transparent'
                )}
              >
                {opt.answer}
                {showResult && (
                  <span className="ml-2 type-pre-text">
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Next / Skip button */}
        <div className="mt-8">
          {answered ? (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-[12px] bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 type-button text-white"
            >
              {isLast ? 'Continue' : 'Next Question'}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="w-full py-4 rounded-[12px] bg-white/10 hover:bg-white/15 transition-colors type-button text-white/50"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
