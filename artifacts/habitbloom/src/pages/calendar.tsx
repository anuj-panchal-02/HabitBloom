import { useState, useMemo } from 'react';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { format, subDays, isSameDay } from 'date-fns';
import { getOverallStreak, getHabitsForDay, getEntryForHabitAndDay, cycleStatus, getCompletionRate } from '../lib/stats';
import { Check, X, Minus, FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export function CalendarView() {
  const { data, setEntry, removeEntry } = useStore();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const habitsList = Object.values(data.habits);
  const entriesList = Object.values(data.entries);

  // Generate heatmap data (last 16 weeks, 7 days a week = 112 days)
  const heatmapDays = useMemo(() => {
    const days = [];
    for (let i = 111; i >= 0; i--) {
      days.push(subDays(today, i));
    }
    return days;
  }, [today]);

  const currentStreak = useMemo(() => getOverallStreak(habitsList, entriesList), [habitsList, entriesList]);
  
  // Calculate longest streak and completion %
  // This is a simplified longest streak calc
  const stats = useMemo(() => {
    let longest = 0;
    let current = 0;
    let totalScheduled = 0;
    let totalCompleted = 0;

    // A simplified scan over the past 365 days for stats
    for(let i=365; i>=0; i--) {
      const d = subDays(today, i);
      const dayHabits = getHabitsForDay(habitsList, d);
      if (dayHabits.length === 0) continue;
      
      let allDone = true;
      let anyDone = false;
      for (const h of dayHabits) {
        totalScheduled++;
        const e = getEntryForHabitAndDay(entriesList, h.id, d);
        if (e?.status === 'complete') {
          totalCompleted++;
          anyDone = true;
        }
        if (!e || e.status === 'miss') {
          if (!isSameDay(d, today)) allDone = false;
        }
      }

      if (allDone) {
        // All-skip days are an intentional rest for the streak: they don't
        // add to it but don't break it either (matches getOverallStreak).
        if (anyDone) {
          current++;
          if (current > longest) longest = current;
        }
      } else {
        current = 0;
      }
    }

    return {
      longestStreak: longest,
      completionRate: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
      totalCompleted,
      weekRate: getCompletionRate(habitsList, entriesList, 7),
      monthRate: getCompletionRate(habitsList, entriesList, 30),
    };
  }, [habitsList, entriesList, today]);

  // Data for selected day
  const selectedHabits = getHabitsForDay(habitsList, selectedDate);

  const handleCycle = (habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const current = getEntryForHabitAndDay(entriesList, habitId, selectedDate)?.status;
    const next = cycleStatus(current);
    if (next) {
      setEntry({ id: `${habitId}_${dateStr}`, habitId, date: dateStr, status: next });
    } else {
      removeEntry(`${habitId}_${dateStr}`);
    }
  };

  const [noteEntryId, setNoteEntryId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const toggleNote = (entryId: string, notes?: string) => {
    setNoteEntryId(prev => (prev === entryId ? null : entryId));
    setNoteDraft(notes ?? '');
  };

  const handleSaveNote = (habitId: string, dateStr: string) => {
    const existing = getEntryForHabitAndDay(entriesList, habitId, selectedDate);
    if (!existing) return;
    const trimmed = noteDraft.trim();
    setEntry({ ...existing, notes: trimmed || undefined });
    setNoteEntryId(null);
  };

  // Split into Weeks for Heatmap (7 rows, N cols)
  // To render vertically (rows = days of week), we need to group by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  heatmapDays.forEach(d => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <AppLayout>
      <div className="px-6 py-8 animate-slide-up">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Journey</h1>
          <p className="text-muted-foreground">Watch your forest grow.</p>
        </header>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-primary">{currentStreak}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Streak</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-foreground">{stats.longestStreak}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Longest Streak</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-primary">{stats.weekRate}%</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">This Week</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-primary">{stats.monthRate}%</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">This Month</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-foreground">{stats.completionRate}%</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completion</span>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border flex flex-col justify-center">
            <span className="text-3xl font-bold font-serif mb-1 text-foreground">{stats.totalCompleted}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Habits Completed</span>
          </div>
        </div>

        {/* Heatmap */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-card-border mb-8 overflow-x-auto">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase">Consistency</h2>
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map(date => {
                  const dayHabits = getHabitsForDay(habitsList, date);
                  let completed = 0;
                  dayHabits.forEach(h => {
                    const e = getEntryForHabitAndDay(entriesList, h.id, date);
                    if (e?.status === 'complete') completed++;
                  });
                  
                  const isSelected = isSameDay(date, selectedDate);
                  
                  // Color intensity based on completion % for that day
                  let bgClass = 'bg-muted/30';
                  if (dayHabits.length > 0) {
                    const rate = completed / dayHabits.length;
                    if (rate === 1) bgClass = 'bg-primary';
                    else if (rate >= 0.5) bgClass = 'bg-primary/70';
                    else if (rate > 0) bgClass = 'bg-primary/40';
                  }

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`w-4 h-4 rounded-sm transition-all ${bgClass} ${isSelected ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : ''}`}
                      title={`${format(date, 'MMM do')}: ${completed}/${dayHabits.length}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Selected Day View */}
        <section>
          <h2 className="text-xl font-serif font-bold mb-4">{format(selectedDate, 'EEEE, MMMM do')}</h2>
          
          {selectedHabits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 bg-card rounded-3xl border border-card-border">No habits scheduled for this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedHabits.map((habit) => {
                const entry = getEntryForHabitAndDay(entriesList, habit.id, selectedDate);
                const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
                const isCompleted = entry?.status === 'complete';
                const isSkipped = entry?.status === 'skip';
                const isMissed = entry?.status === 'miss' || (!entry && selectedDate < today);

                let statusColor = 'text-muted-foreground bg-muted/20';
                let StatusIcon = Minus;
                
                if (isCompleted) {
                  statusColor = 'text-primary bg-primary/10';
                  StatusIcon = Check;
                } else if (isMissed) {
                  statusColor = 'text-destructive bg-destructive/10';
                  StatusIcon = X;
                } else if (isSkipped) {
                  statusColor = 'text-secondary-foreground bg-secondary';
                  StatusIcon = Minus;
                }

                return (
                  <div key={habit.id} className="bg-card rounded-2xl p-4 shadow-sm border border-card-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{habit.name}</h3>
                          {entry?.notes && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleNote(entry?.id ?? '', entry?.notes)}
                          disabled={!entry}
                          title={entry ? 'Add or edit a note' : 'Record a status first'}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border border-card-border text-muted-foreground active:scale-95 transition-transform ${entry ? '' : 'opacity-40'} ${noteEntryId === entry?.id ? 'bg-primary/10 text-primary' : ''}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCycle(habit.id)}
                          title="Tap to change status (complete → skip → missed → clear)"
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColor} active:scale-95 transition-transform`}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {noteEntryId === entry?.id && (
                      <textarea
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        onBlur={() => handleSaveNote(habit.id, format(selectedDate, 'yyyy-MM-dd'))}
                        placeholder="Tap to write a note…"
                        autoFocus
                        className="w-full mt-3 bg-input/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={2}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}
