import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { format, subDays } from 'date-fns';
import { BookOpen, Check } from 'lucide-react';

const PROMPTS = [
  "What made today easier?",
  "What is one small win you had today?",
  "How did you honor your identity today?",
  "What did you learn about yourself today?",
  "What are you looking forward to tomorrow?"
];

export function Reflections() {
  const { data, setReflection } = useStore();
  const today = new Date();
  
  // Show the last 7 days of reflections
  const days = Array.from({length: 7}, (_, i) => subDays(today, i));

  const [activeDateStr, setActiveDateStr] = useState<string>(format(today, 'yyyy-MM-dd'));
  
  const activeDate = useMemo(() => new Date(activeDateStr), [activeDateStr]);
  const activePrompt = useMemo(() => PROMPTS[activeDate.getDate() % PROMPTS.length], [activeDateStr]);
  const activeReflection = data.reflections[activeDateStr];

  const [answer, setAnswer] = useState(activeReflection?.answer || '');

  useEffect(() => {
    setAnswer(activeReflection?.answer || '');
  }, [activeDateStr, activeReflection]);

  const handleSave = () => {
    if (!answer.trim()) return;
    setReflection({
      id: `ref_${activeDateStr}`,
      date: activeDateStr,
      question: activePrompt,
      answer: answer.trim()
    });
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 animate-slide-up h-full flex flex-col">
        <header className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Journal
          </h1>
          <p className="text-muted-foreground">A quiet moment to reflect.</p>
        </header>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x mb-2 hide-scrollbar">
          {days.reverse().map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === activeDateStr;
            const hasEntry = !!data.reflections[dateStr];

            return (
              <button
                key={dateStr}
                onClick={() => setActiveDateStr(dateStr)}
                className={`flex-shrink-0 snap-center flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-md scale-110' 
                    : 'bg-card text-muted-foreground border border-card-border'
                }`}
              >
                <span className="text-xs font-semibold uppercase">{format(date, 'EEE')}</span>
                <span className="text-lg font-bold font-serif">{format(date, 'd')}</span>
                {hasEntry && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-card rounded-3xl p-6 shadow-sm border border-card-border flex flex-col">
          <h2 className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">
            {format(activeDate, 'MMMM do, yyyy')}
          </h2>
          <p className="text-xl font-serif font-bold text-foreground mb-6 leading-snug">
            {activeReflection ? activeReflection.question : activePrompt}
          </p>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tap to write..."
            className="flex-1 w-full bg-transparent border-none resize-none focus:outline-none text-foreground/80 leading-relaxed text-lg"
          />

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={answer.trim() === (activeReflection?.answer || '')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Check className="w-5 h-5" />
              Save
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
