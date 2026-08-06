import { useRef } from 'react';
import { useStore } from '../hooks/use-store';
import { AppLayout } from '../components/layout/app-layout';
import { Moon, Sun, Bell, Download, Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function SettingsView() {
  const { data, setAppState, resetAllData, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    const newTheme = data.appState.theme === 'light' ? 'dark' : 'light';
    setAppState({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleReminders = async () => {
    if (!data.appState.remindersEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setAppState({ remindersEnabled: true });
          alert('Reminders enabled. We will try our best while the tab is open.');
        } else {
          alert('Notification permission denied.');
        }
      } else {
        alert('Your browser does not support notifications.');
      }
    } else {
      setAppState({ remindersEnabled: false });
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitbloom-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (importData(json)) {
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset EVERYTHING? This will delete all habits, history, and reflections.')) {
      if (confirm('Are you ABSOLUTELY sure? This cannot be undone unless you have a backup.')) {
        resetAllData();
      }
    }
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 animate-slide-up">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your garden.</p>
        </header>

        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase px-2">Preferences</h2>
          
          <button 
            onClick={toggleTheme}
            className="w-full bg-card rounded-2xl p-4 shadow-sm border border-card-border flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {data.appState.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <span className="font-semibold text-foreground">Appearance</span>
            </div>
            <span className="text-sm text-muted-foreground capitalize">{data.appState.theme} Mode</span>
          </button>

          <button 
            onClick={toggleReminders}
            className="w-full bg-card rounded-2xl p-4 shadow-sm border border-card-border flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">Reminders</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${data.appState.remindersEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${data.appState.remindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase px-2">Data</h2>
          
          <button 
            onClick={handleExport}
            className="w-full bg-card rounded-2xl p-4 shadow-sm border border-card-border flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Export Backup</div>
              <div className="text-xs text-muted-foreground">Save your data to a JSON file</div>
            </div>
          </button>

          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-card rounded-2xl p-4 shadow-sm border border-card-border flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Import Backup</div>
              <div className="text-xs text-muted-foreground">Restore from a previous JSON file</div>
            </div>
          </button>
        </section>

        <section className="space-y-4 pt-4 border-t border-border">
          <button 
            onClick={handleReset}
            className="w-full bg-destructive/10 rounded-2xl p-4 border border-destructive/20 flex items-center gap-4 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-colors">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-destructive">Erase All Data</div>
              <div className="text-xs text-destructive/70">Danger zone. Cannot be undone.</div>
            </div>
          </button>
        </section>

      </div>
    </AppLayout>
  );
}
