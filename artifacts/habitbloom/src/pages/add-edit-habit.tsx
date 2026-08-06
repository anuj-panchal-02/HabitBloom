import { useState, useEffect } from 'react';
import { useStore } from '../hooks/use-store';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Check, Circle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const COLORS = [
  '#558f62', // Sage
  '#173523', // Deep
  '#c5a059', // Terracotta
  '#749c81', // Leaf
  '#8d9c8c', // Muted green
  '#6b705c', // Moss
  '#b7b7a4', // Pale
  '#a5a58d', // Khaki
];

const ICONS = [
  'BookOpen', 'Droplet', 'CloudRain', 'Sun', 'Moon', 
  'Heart', 'Brain', 'Coffee', 'Dumbbell', 'Footprints',
  'PenTool', 'Smile', 'Star', 'TreePine', 'Wind'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AddEditHabit() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const id = params.id;
  const isEditing = id && id !== 'new';
  const { data, addHabit, updateHabit } = useStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [tinyHabit, setTinyHabit] = useState('');
  const [identityGoal, setIdentityGoal] = useState('');
  const [why, setWhy] = useState('');
  const [schedule, setSchedule] = useState<string[]>(DAYS);
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    if (isEditing && data.habits[id]) {
      const h = data.habits[id];
      setName(h.name);
      setIcon(h.icon);
      setColor(h.color);
      setTinyHabit(h.tinyHabit);
      setIdentityGoal(h.identityGoal);
      setWhy(h.why || '');
      setSchedule(h.repeatSchedule);
      setReminder(h.reminderTime || '');
    }
  }, [id, isEditing, data.habits]);

  const handleSave = () => {
    if (!name || !tinyHabit || !identityGoal || schedule.length === 0) return;

    if (isEditing) {
      updateHabit(id!, {
        name, icon, color, tinyHabit, identityGoal, why, repeatSchedule: schedule, reminderTime: reminder || undefined
      });
    } else {
      addHabit({
        id: `habit_${Date.now()}`,
        name, icon, color, tinyHabit, identityGoal, why, repeatSchedule: schedule, reminderTime: reminder || undefined,
        createdAt: new Date().toISOString(),
        isArchived: false,
      });
    }
    setLocation(-1); // go back
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const IconComp = (LucideIcons as any)[icon] || Circle;

  return (
    <div className="min-h-[100dvh] bg-background max-w-md mx-auto flex flex-col relative animate-slide-up">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between p-4 pt-safe-top">
        <button onClick={() => setLocation(-1)} className="p-2 -ml-2 text-foreground active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold">{isEditing ? 'Edit Habit' : 'Plant a Habit'}</h1>
        <button 
          onClick={handleSave}
          disabled={!name || !tinyHabit || !identityGoal || schedule.length === 0}
          className="p-2 -mr-2 text-primary font-semibold disabled:opacity-50 active:scale-95 transition-transform"
        >
          Save
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        
        {/* Visual Preview */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg mb-4 transition-colors duration-300" style={{ backgroundColor: color }}>
            <IconComp className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-center">{name || 'Habit Name'}</h2>
          <p className="text-muted-foreground text-center mt-1">{tinyHabit || 'The tiny action'}</p>
        </div>

        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Reading"
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase">The Tiny Action</label>
            <p className="text-xs text-muted-foreground mb-2">Make it so small you can't say no.</p>
            <input 
              type="text" 
              value={tinyHabit} 
              onChange={e => setTinyHabit(e.target.value)}
              placeholder="e.g., Read one page"
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase">Identity Goal</label>
            <p className="text-xs text-muted-foreground mb-2">Who are you becoming?</p>
            <input 
              type="text" 
              value={identityGoal} 
              onChange={e => setIdentityGoal(e.target.value)}
              placeholder="e.g., I am a reader."
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </section>

        <section className="space-y-4">
          <label className="block text-sm font-semibold text-muted-foreground tracking-wide uppercase">Visuals</label>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className="w-10 h-10 rounded-full flex-shrink-0 snap-center flex items-center justify-center text-white transition-transform active:scale-90"
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {ICONS.map(i => {
              const Ic = (LucideIcons as any)[i];
              return (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${icon === i ? 'bg-primary text-white' : 'bg-card text-muted-foreground border border-border'}`}
                >
                  <Ic className="w-6 h-6" />
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <label className="block text-sm font-semibold text-muted-foreground tracking-wide uppercase">Schedule</label>
          <div className="flex gap-2 justify-between">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${schedule.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}
              >
                {day[0]}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase">Reminder Time (Optional)</label>
            <input 
              type="time" 
              value={reminder} 
              onChange={e => setReminder(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1 tracking-wide uppercase">Why? (Optional)</label>
            <textarea 
              value={why} 
              onChange={e => setWhy(e.target.value)}
              placeholder="Your deeper reason..."
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            />
          </div>
        </section>

      </main>
    </div>
  );
}
