import { useMemo } from 'react';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { format } from 'date-fns';
import { getHabitsForDay, getEntryForHabitAndDay, getOverallStreak, getForestStage } from '../lib/stats';
import { Plus, Check, X, Minus, Sparkles, ChevronRight, Leaf } from 'lucide-react';
import { Link } from 'wouter';
import * as LucideIcons from 'lucide-react';

const TIPS = [
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Every action you take is a vote for the type of person you wish to become.",
  "Missing once is an accident. Missing twice is the start of a new habit.",
  "Habits are the compound interest of self-improvement.",
  "Focus on who you wish to become, not what you want to achieve.",
];

export function Dashboard() {
  const { data, setEntry } = useStore();
  const today = new Date();
  
  const habitsList = Object.values(data.habits);
  const entriesList = Object.values(data.entries);
  
  const todaysHabits = useMemo(() => getHabitsForDay(habitsList, today), [habitsList, today]);
  const streak = useMemo(() => getOverallStreak(habitsList, entriesList), [habitsList, entriesList]);
  const forestStage = getForestStage(streak);

  const dailyTip = useMemo(() => TIPS[today.getDate() % TIPS.length], [today.getDate()]);

  const handleStatus = (habitId: string, status: 'complete' | 'skip' | 'miss') => {
    setEntry({
      id: `${habitId}_${format(today, 'yyyy-MM-dd')}`,
      habitId,
      date: format(today, 'yyyy-MM-dd'),
      status,
    });
  };

  const getStageIcon = (stage: number) => {
    switch (stage) {
      case 0: return '🌱'; // seed (emoji only in comments, will use lucide)
      case 1: return '🌿';
      case 2: return '🪴';
      case 3: return '🌳';
      case 4: return '🌲';
      case 5: return '✨🌲✨';
      default: return '🌱';
    }
  };

  // We need to render actual SVG or CSS for the forest, let's use Lucide icons but scale them.
  const renderForest = () => {
    const stageNodes = [
      <div key="0" className="w-8 h-8 rounded-full border-2 border-primary border-dashed flex items-center justify-center opacity-50"><div className="w-2 h-2 bg-primary rounded-full" /></div>,
      <Leaf key="1" className="w-8 h-8 text-primary" />,
      <LucideIcons.Flower2 key="2" className="w-10 h-10 text-primary" />,
      <LucideIcons.TreePine key="3" className="w-12 h-12 text-primary" />,
      <div key="4" className="flex items-end gap-1"><LucideIcons.TreePine className="w-10 h-10 text-primary opacity-80" /><LucideIcons.TreeDeciduous className="w-14 h-14 text-primary" /><LucideIcons.TreePine className="w-8 h-8 text-primary opacity-70" /></div>,
      <div key="5" className="flex items-end gap-1 relative"><Sparkles className="w-4 h-4 text-accent absolute -top-4 right-2 animate-pulse" /><LucideIcons.TreeDeciduous className="w-12 h-12 text-primary" /><LucideIcons.TreePine className="w-16 h-16 text-primary" /><LucideIcons.TreeDeciduous className="w-10 h-10 text-primary" /></div>
    ];
    return stageNodes[Math.min(forestStage, 5)];
  };

  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="px-6 py-8 animate-slide-up">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">{greeting}</h1>
          <p className="text-muted-foreground">{format(today, 'EEEE, MMMM do')}</p>
        </header>

        {/* Forest Visualization */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-card-border mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-1 tracking-wider uppercase">Your Forest</h2>
            <div className="text-2xl font-bold font-serif">{streak} Day Streak</div>
            <p className="text-sm text-muted-foreground mt-1">Keep growing.</p>
          </div>
          <div className="h-20 w-24 flex items-end justify-center">
            {renderForest()}
          </div>
        </section>

        {/* Habits List */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold">Today's Seeds</h2>
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
              {todaysHabits.map((habit, index) => {
                const entry = getEntryForHabitAndDay(entriesList, habit.id, today);
                const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
                const isCompleted = entry?.status === 'complete';
                const isMissed = entry?.status === 'miss';
                const isSkipped = entry?.status === 'skip';

                return (
                  <div 
                    key={habit.id} 
                    className="group relative bg-card rounded-2xl p-4 shadow-sm border border-card-border overflow-hidden transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {isCompleted && (
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Link href={`/habit/${habit.id}`} className="flex-1 flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: habit.color }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {habit.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{habit.tinyHabit}</p>
                          {habit.anchorHabitId && data.habits[habit.anchorHabitId] && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                              <LucideIcons.Link2 className="w-3 h-3" />
                              After {data.habits[habit.anchorHabitId].name}
                            </p>
                          )}
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 ml-4">
                        {entry ? (
                          <button 
                            onClick={() => handleStatus(habit.id, 'complete')} // clicking again doesn't un-complete, maybe long press or detail page for edit
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
                              className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatus(habit.id, 'complete')}
                              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform shadow-md"
                            >
                              <Check className="w-6 h-6" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Tip of the day */}
        <section className="bg-secondary/30 rounded-3xl p-6 relative overflow-hidden">
          <Sparkles className="absolute -top-4 -right-4 w-16 h-16 text-secondary opacity-50" />
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <LucideIcons.Quote className="w-4 h-4" /> Insight
          </h2>
          <p className="text-foreground/80 font-serif leading-relaxed italic">
            "{dailyTip}"
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
