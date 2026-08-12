import { useLocation, useParams } from 'wouter';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { ArrowLeft, Edit2, Check, X, Minus, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { formatStackSentence } from '../lib/atomic-habits';

export function HabitDetail() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const id = params.id!;
  const { data, deleteHabit, updateHabit } = useStore();

  const habit = data.habits[id];
  
  if (!habit) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground">Habit not found.</p>
          <button onClick={() => setLocation('/')} className="mt-4 text-primary">Go Home</button>
        </div>
      </AppLayout>
    );
  }

  const IconComp = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;

  // Calculate habit specific stats
  const entries = Object.values(data.entries).filter(e => e.habitId === id);
  const totalCompleted = entries.filter(e => e.status === 'complete').length;
  
  // Calculate current streak for this habit
  let currentStreak = 0;
  let d = new Date();
  while(true) {
    const dayStr = format(d, 'E');
    if (habit.repeatSchedule.includes(dayStr)) {
      const e = entries.find(e => e.date === format(d, 'yyyy-MM-dd'));
      if (e?.status === 'complete') {
        currentStreak++;
      } else if (!e && isSameDay(d, new Date())) {
        // today not done yet, don't break streak
      } else if (e?.status === 'skip') {
        // skip doesn't break but doesn't add
      } else {
        break;
      }
    }
    d = subDays(d, 1);
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to uproot this habit? All history will be lost.')) {
      deleteHabit(id);
      setLocation('/');
    }
  };

  const handleArchive = () => {
    updateHabit(id, { isArchived: !habit.isArchived });
    setLocation('/');
  };

  // Generate last 28 days for a mini heatmap
  const heatmapDays = Array.from({length: 28}, (_, i) => subDays(new Date(), 27 - i));
  const createdDay = startOfDay(new Date(habit.createdAt));

  return (
    <AppLayout>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex items-center justify-between p-4 pt-safe-top">
        <button onClick={() => setLocation('/')} className="p-2.5 -ml-2.5 text-foreground active:scale-95 transition-transform" aria-label="Back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleArchive} className="p-2.5 text-muted-foreground hover:text-primary transition-colors" aria-label={habit.isArchived ? 'Restore habit' : 'Archive habit'} title={habit.isArchived ? 'Restore to your list' : 'Archive this habit'}>
            {habit.isArchived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
          </button>
          <button onClick={() => setLocation(`/habit/${id}/edit`)} className="p-2.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Edit habit">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete habit">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 pb-8 animate-slide-up">
        
        <div className="flex flex-col items-center justify-center py-6 mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg mb-6" style={{ backgroundColor: habit.color }}>
            <IconComp className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-center mb-2">{habit.name}</h1>
          <p className="text-muted-foreground text-center font-medium">{habit.tinyHabit}</p>
        </div>

        <section className="bg-card rounded-3xl p-6 shadow-sm border border-card-border mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">Identity</h2>
          <p className="text-foreground font-serif text-lg italic">"{habit.identityGoal}"</p>
          {habit.why && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wide uppercase">Why</h3>
              <p className="text-foreground/80">{habit.why}</p>
            </div>
          )}
          {habit.anchorHabitId && data.habits[habit.anchorHabitId] && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wide uppercase">Stacked On</h3>
              <p className="text-foreground/80 font-serif italic">
                &ldquo;{formatStackSentence(data.habits[habit.anchorHabitId], habit)}&rdquo;
              </p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-serif mb-1" style={{ color: habit.color }}>{currentStreak}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day Streak</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-foreground">{totalCompleted}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Done</span>
          </div>
        </div>

        <section className="bg-card rounded-3xl p-6 shadow-sm border border-card-border mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase">Recent History (28 Days)</h2>
          <div className="grid grid-cols-7 gap-2">
            {heatmapDays.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const entry = entries.find(e => e.date === dateStr);
              const isScheduled = habit.repeatSchedule.includes(format(date, 'E'));
              
              let bgColor = 'bg-muted/30'; // Not scheduled or no entry
              if (entry?.status === 'complete') bgColor = 'bg-primary';
              else if (entry?.status === 'miss') bgColor = 'bg-destructive/60';
              else if (entry?.status === 'skip') bgColor = 'bg-secondary';
              else if (isScheduled && date >= createdDay && date < new Date()) bgColor = 'bg-destructive/20'; // missed implicitly

              return (
                <div 
                  key={dateStr}
                  className={`aspect-square rounded-md ${bgColor} flex items-center justify-center text-white/90 text-xs`}
                  title={format(date, 'MMM do')}
                >
                  {entry?.status === 'complete' && <Check className="w-3 h-3" />}
                  {entry?.status === 'skip' && <Minus className="w-3 h-3" />}
                  {(entry?.status === 'miss' || (isScheduled && date >= createdDay && date < new Date() && !entry)) && <X className="w-3 h-3" />}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-card rounded-3xl p-6 shadow-sm border border-card-border">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase">Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium text-foreground">{habit.repeatSchedule.join(', ')}</span>
            </div>
            {habit.reminderTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reminder</span>
                <span className="font-medium text-foreground">{habit.reminderTime}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Planted on</span>
              <span className="font-medium text-foreground">{format(new Date(habit.createdAt), 'MMM do, yyyy')}</span>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
