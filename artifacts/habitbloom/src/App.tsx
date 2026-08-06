import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation, Link } from 'wouter';
import { useStore } from './hooks/use-store';
import { useEffect } from 'react';

import { useReminders } from './hooks/use-reminders';

// Pages
import { Splash } from './pages/splash';
import { Dashboard } from './pages/dashboard';
import { AddEditHabit } from './pages/add-edit-habit';
import { HabitDetail } from './pages/habit-detail';
import { CalendarView } from './pages/calendar';
import { Reflections } from './pages/reflections';
import { SettingsView } from './pages/settings';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center p-6 bg-background max-w-md mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">This path leads nowhere.</p>
      <Link href="/" className="text-primary font-semibold underline underline-offset-4">Return home</Link>
    </div>
  );
}

function Router() {
  const { data } = useStore();
  const [location, setLocation] = useLocation();

  useReminders();

  useEffect(() => {
    // Initial theme setup
    if (data.appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Redirect to splash if not seen
    if (!data.appState.hasSeenSplash && location !== '/splash') {
      setLocation('/splash');
    }
  }, [data.appState.theme, data.appState.hasSeenSplash, location, setLocation]);

  return (
    <Switch>
      <Route path="/splash" component={Splash} />
      <Route path="/" component={Dashboard} />
      <Route path="/habit/new" component={AddEditHabit} />
      <Route path="/habit/:id/edit" component={AddEditHabit} />
      <Route path="/habit/:id" component={HabitDetail} />
      <Route path="/calendar" component={CalendarView} />
      <Route path="/reflections" component={Reflections} />
      <Route path="/settings" component={SettingsView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
