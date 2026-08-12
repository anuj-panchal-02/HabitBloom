import { useMemo, useState, useRef, useEffect, Fragment } from 'react';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { format } from 'date-fns';
import {
  getHabitsForDay,
  getEntryForHabitAndDay,
  getForestState,
  getMissRecoveryState,
  cycleStatus,
} from '../lib/stats';
import {
  formatStackSentence,
  getCompletionMessage,
  getDailyInsight,
  getMissRecoveryMessage,
  getTodaysIdentityFocus,
} from '../lib/atomic-habits';
import { Habit } from '../lib/types';
import { Plus, Check, X, Minus, Sparkles, Leaf, ArrowDown } from 'lucide-react';
import { Link } from 'wouter';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

const RECOVERY_BANNER_KEY_PREFIX = 'habitbloom_recovery_banner_dismissed_';

export function Dashboard() {
  const { data, setEntry, removeEntry } = useStore();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [burst, setBurst] = useState<{ id: string; seq: number } | null>(null);
  const [highlightHabitId, setHighlightHabitId] = useState<string | null>(null);
  const [recoveryBannerDismissed, setRecoveryBannerDismissed] = useState(
    () => sessionStorage.getItem(`${RECOVERY_BANNER_KEY_PREFIX}${todayStr}`) === 'true',
  );
  const habitsSectionRef = useRef<HTMLDivElement>(null);
  const habitCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const habitsList = Object.values(data.habits);
  const entriesList = Object.values(data.entries);

  const todaysHabits = useMemo(() => getHabitsForDay(habitsList, today), [habitsList, today]);
  const forest = useMemo(() => getForestState(habitsList, entriesList), [habitsList, entriesList]);
  const missRecovery = useMemo(
    () => getMissRecoveryState(habitsList, entriesList, today),
    [habitsList, entriesList, today],
  );

  const prevStageRef = useRef(forest.stage);
  const stageChanged = forest.stage !== prevStageRef.current;
  const stageUp = forest.stage > prevStageRef.current;
  useEffect(() => {
    prevStageRef.current = forest.stage;
  }, [forest.stage]);

  const dailyInsight = useMemo(() => getDailyInsight(today), [today]);
  const identityFocus = useMemo(() => getTodaysIdentityFocus(todaysHabits, today), [todaysHabits, today]);
  const forestMessage = useMemo(
    () => getMissRecoveryMessage({ isRecoveryDay: missRecovery.isRecoveryDay, wilting: forest.wilting }),
    [missRecovery.isRecoveryDay, forest.wilting],
  );

  const firstIncompleteHabit = useMemo(() => {
    for (const habit of todaysHabits) {
      const entry = getEntryForHabitAndDay(entriesList, habit.id, today);
      if (!entry || entry.status === 'miss') {
        const anchor = habit.anchorHabitId ? data.habits[habit.anchorHabitId] : undefined;
        const anchorEntry = habit.anchorHabitId
          ? getEntryForHabitAndDay(entriesList, habit.anchorHabitId, today)
          : undefined;
        const isLocked =
          !!anchor && anchorEntry?.status !== 'complete' && anchorEntry?.status !== 'skip';
        if (!isLocked) return habit;
      }
    }
    return todaysHabits.find((habit) => {
      const entry = getEntryForHabitAndDay(entriesList, habit.id, today);
      return !entry || entry.status === 'miss';
    });
  }, [todaysHabits, entriesList, today, data.habits]);

  const showRecoveryBanner =
    missRecovery.isRecoveryDay && !recoveryBannerDismissed && !!firstIncompleteHabit;

  // Chain-aware grouping: habits stacked onto an anchor scheduled today render
  // directly under it; everything else stays a standalone root card.
  const { roots, childrenByAnchor } = useMemo(() => {
    const todaysIds = new Set(todaysHabits.map((h) => h.id));
    const childrenByAnchor = new Map<string, Habit[]>();
    const roots: Habit[] = [];
    for (const h of todaysHabits) {
      if (h.anchorHabitId && todaysIds.has(h.anchorHabitId)) {
        const list = childrenByAnchor.get(h.anchorHabitId) ?? [];
        list.push(h);
        childrenByAnchor.set(h.anchorHabitId, list);
      } else {
        roots.push(h);
      }
    }
    return { roots, childrenByAnchor };
  }, [todaysHabits]);

  const handleStatus = (habitId: string, status: 'complete' | 'skip' | 'miss') => {
    const habit = data.habits[habitId];
    if (status === 'complete') {
      setBurst({ id: habitId, seq: Date.now() });
      if (habit) {
        toast.success(habit.name, {
          description: getCompletionMessage(habit, today),
        });
      }
    }
    setEntry({
      id: `${habitId}_${todayStr}`,
      habitId,
      date: todayStr,
      status,
    });
  };

  const handleCycle = (habitId: string) => {
    const current = getEntryForHabitAndDay(entriesList, habitId, today)?.status;
    const next = cycleStatus(current);
    if (next) {
      handleStatus(habitId, next);
    } else {
      removeEntry(`${habitId}_${todayStr}`);
    }
  };

  const dismissRecoveryBanner = () => {
    sessionStorage.setItem(`${RECOVERY_BANNER_KEY_PREFIX}${todayStr}`, 'true');
    setRecoveryBannerDismissed(true);
  };

  const focusFirstIncompleteHabit = () => {
    if (!firstIncompleteHabit) return;
    setHighlightHabitId(firstIncompleteHabit.id);
    habitCardRefs.current[firstIncompleteHabit.id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    window.setTimeout(() => setHighlightHabitId(null), 2000);
  };

  const renderForest = () => {
    const stageNodes = [
      <div key="0" className="w-8 h-8 rounded-full border-2 border-primary border-dashed flex items-center justify-center opacity-50"><div className="w-2 h-2 bg-primary rounded-full" /></div>,
      <Leaf key="1" className="w-8 h-8 text-primary" />,
      <LucideIcons.Flower2 key="2" className="w-10 h-10 text-primary" />,
      <LucideIcons.TreePine key="3" className="w-12 h-12 text-primary" />,
      <div key="4" className="flex items-end gap-1"><LucideIcons.TreePine className="w-10 h-10 text-primary opacity-80" /><LucideIcons.TreeDeciduous className="w-14 h-14 text-primary" /><LucideIcons.TreePine className="w-8 h-8 text-primary opacity-70" /></div>,
      <div key="5" className="flex items-end gap-1 relative"><Sparkles className="w-4 h-4 text-accent absolute -top-4 right-2 animate-pulse" /><LucideIcons.TreeDeciduous className="w-12 h-12 text-primary" /><LucideIcons.TreePine className="w-16 h-16 text-primary" /><LucideIcons.TreeDeciduous className="w-10 h-10 text-primary" /></div>,
      <div key="6" className="flex items-end gap-1 relative"><Sparkles className="w-4 h-4 text-accent absolute -top-4 right-2 animate-pulse" /><LucideIcons.TreePine className="w-10 h-10 text-primary opacity-90" /><LucideIcons.TreeDeciduous className="w-14 h-14 text-primary" /><LucideIcons.TreePine className="w-16 h-16 text-primary" /><LucideIcons.TreeDeciduous className="w-10 h-10 text-primary opacity-80" /></div>,
      <div key="7" className="flex items-end gap-1 relative"><Sparkles className="w-4 h-4 text-accent absolute -top-4 right-2 animate-pulse" /><LucideIcons.TreeDeciduous className="w-10 h-10 text-primary opacity-90" /><LucideIcons.TreePine className="w-12 h-12 text-primary" /><LucideIcons.TreeDeciduous className="w-14 h-14 text-primary" /><LucideIcons.TreePine className="w-12 h-12 text-primary" /><LucideIcons.TreeDeciduous className="w-10 h-10 text-primary opacity-80" /></div>,
      <div key="8" className="flex items-end gap-1 relative"><Sparkles className="w-5 h-5 text-accent absolute -top-5 right-2 animate-pulse" /><Sparkles className="w-4 h-4 text-accent absolute -bottom-1 left-0 animate-pulse" /><LucideIcons.TreePine className="w-12 h-12 text-primary" /><LucideIcons.TreeDeciduous className="w-16 h-16 text-primary" /><LucideIcons.TreePine className="w-16 h-16 text-primary" /><LucideIcons.TreeDeciduous className="w-12 h-12 text-primary" /></div>,
    ];
    return stageNodes[Math.min(forest.stage, 8)];
  };

  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  let cardIndex = 0;

  const renderHabitCard = (habit: Habit) => {
    const index = cardIndex++;
    const entry = getEntryForHabitAndDay(entriesList, habit.id, today);
    const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
    const isCompleted = entry?.status === 'complete';
    const isSkipped = entry?.status === 'skip';

    const anchor = habit.anchorHabitId ? data.habits[habit.anchorHabitId] : undefined;
    const anchorEntry = habit.anchorHabitId
      ? getEntryForHabitAndDay(entriesList, habit.anchorHabitId, today)
      : undefined;
    const isLocked =
      !!anchor && anchorEntry?.status !== 'complete' && anchorEntry?.status !== 'skip';
    const isHighlighted = highlightHabitId === habit.id;

    return (
      <div
        key={habit.id}
        ref={(node) => {
          habitCardRefs.current[habit.id] = node;
        }}
        className={`group relative bg-card rounded-2xl p-4 shadow-sm border overflow-hidden transition-all duration-300 ${
          isHighlighted ? 'border-primary ring-2 ring-primary/30' : 'border-card-border'
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {isCompleted && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}
        {burst?.id === habit.id && (
          <span
            key={burst.seq}
            className="animate-burst pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/60"
            onAnimationEnd={() => setBurst(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <Link href={`/habit/${habit.id}`} className="flex-1 flex items-center gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-semibold text-lg truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {habit.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{habit.tinyHabit}</p>
              <p className="text-xs text-muted-foreground/80 italic truncate mt-0.5">
                {habit.identityGoal}
              </p>
              {anchor && (
                <p className={`text-xs mt-1 flex items-start gap-1 ${isLocked ? 'text-destructive/80' : 'text-muted-foreground/70'}`}>
                  {isLocked ? (
                    <LucideIcons.Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  ) : (
                    <LucideIcons.Link2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-2">
                    {isLocked
                      ? `Locked — complete ${anchor.name} first`
                      : formatStackSentence(anchor, habit)}
                  </span>
                </p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {entry ? (
              <button
                onClick={() => handleCycle(habit.id)}
                title="Tap to change status (complete → skip → missed → clear)"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted ? 'bg-primary text-primary-foreground' :
                  isSkipped ? 'bg-secondary text-secondary-foreground' :
                  'bg-destructive/10 text-destructive'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : isSkipped ? <Minus className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={() => handleStatus(habit.id, 'skip')}
                  title="Skip"
                  className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleStatus(habit.id, 'complete')}
                  title="Complete"
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform shadow-md"
                >
                  <Check className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleStatus(habit.id, 'miss')}
                  title="Mark as missed"
                  className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderChildren = (habit: Habit) => {
    const kids = childrenByAnchor.get(habit.id);
    if (!kids || kids.length === 0) return null;
    return (
      <div className="ml-6 pl-4 border-l-2 border-primary/15 space-y-3">
        {kids.map((kid) => (
          <Fragment key={kid.id}>
            {renderHabitCard(kid)}
            {renderChildren(kid)}
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 animate-slide-up">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">{greeting}</h1>
          <p className="text-muted-foreground">{format(today, 'EEEE, MMMM do')}</p>
          {identityFocus && (
            <p className="text-sm text-primary/90 font-serif italic mt-3">
              Today you&apos;re becoming: {identityFocus}
            </p>
          )}
        </header>

        <section className={`bg-card rounded-3xl p-6 shadow-sm border mb-8 flex items-center justify-between ${forest.wilting ? 'border-destructive/30' : 'border-card-border'}`}>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-1 tracking-wider uppercase">Your Forest</h2>
            <div className="text-2xl font-bold font-serif">{forest.effectiveStreak} Day Streak</div>
            <p className={`text-sm mt-1 ${forest.wilting || missRecovery.isRecoveryDay ? 'text-destructive/80 font-medium' : 'text-muted-foreground'}`}>
              {forestMessage}
            </p>
          </div>
          <div
            key={forest.stage}
            className={`h-20 w-24 flex items-end justify-center ${stageChanged ? (stageUp ? 'animate-forest-grow' : 'animate-forest-wilt') : ''}`}
          >
            {renderForest()}
          </div>
        </section>

        {showRecoveryBanner && (
          <section className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-destructive/90 uppercase tracking-wide mb-1">
                  Recovery day
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Missing once is human. Today is about not missing twice. Start with your smallest habit.
                </p>
              </div>
              <button
                onClick={dismissRecoveryBanner}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss recovery reminder"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={focusFirstIncompleteHabit}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <ArrowDown className="w-4 h-4" />
              Start with {firstIncompleteHabit?.tinyHabit ?? 'your next seed'}
            </button>
          </section>
        )}

        <section className="mb-8" ref={habitsSectionRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold">Today&apos;s Seeds</h2>
            <Link href="/habit/new" className="p-2 bg-primary/10 text-primary rounded-full active:scale-95 transition-transform">
              <Plus className="w-5 h-5" />
            </Link>
          </div>

          {todaysHabits.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-3xl border border-card-border">
              <Leaf className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">No habits planted for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roots.map((habit) => (
                <Fragment key={habit.id}>
                  {renderHabitCard(habit)}
                  {renderChildren(habit)}
                </Fragment>
              ))}
            </div>
          )}
        </section>

        <section className="bg-secondary/30 rounded-3xl p-6 relative overflow-hidden">
          <Sparkles className="absolute -top-4 -right-4 w-16 h-16 text-secondary opacity-50" />
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <LucideIcons.Quote className="w-4 h-4" /> Insight
          </h2>
          <p className="text-foreground/80 font-serif leading-relaxed italic">
            &ldquo;{dailyInsight}&rdquo;
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
