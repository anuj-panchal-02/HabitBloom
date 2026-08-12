import { useState } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '../hooks/use-store';
import { Leaf, User, Link2, ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    icon: Leaf,
    title: 'Plant tiny seeds',
    body: 'Make habits so small you cannot say no. One page, one sip, one minute — that is enough.',
  },
  {
    icon: User,
    title: 'Become someone',
    body: 'Focus on identity, not outcomes. Every habit is a vote for who you are becoming.',
  },
  {
    icon: Link2,
    title: 'Stack what works',
    body: 'Attach new habits to routines you already do: "After I X, I will Y."',
  },
] as const;

export function Splash() {
  const [, setLocation] = useLocation();
  const { setAppState } = useStore();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleStart = () => {
    setAppState({ hasSeenSplash: true });
    setLocation('/habit/new');
  };

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10 animate-slide-up bg-background max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-8 animate-pop">
          <Icon className="w-12 h-12" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Step {step + 1} of {STEPS.length}
        </p>

        <h1 className="text-3xl font-serif font-bold mb-4 text-foreground">
          {current.title}
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-sm">
          {current.body}
        </p>

        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step ? 'w-6 bg-primary' : 'w-2 bg-primary/25'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {step > 0 ? (
          <button
            onClick={() => setStep((prev) => prev - 1)}
            className="h-14 px-5 rounded-2xl border border-border text-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div className="w-[88px]" />
        )}

        {isLast ? (
          <button
            onClick={handleStart}
            className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg flex items-center justify-center shadow-lg active:scale-[0.98] transition-transform"
          >
            Plant the first seed
          </button>
        ) : (
          <button
            onClick={() => setStep((prev) => prev + 1)}
            className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg flex items-center justify-center shadow-lg active:scale-[0.98] transition-transform"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
