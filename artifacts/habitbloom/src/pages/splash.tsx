import { useLocation } from 'wouter';
import { useStore } from '../hooks/use-store';
import { Leaf } from 'lucide-react';

export function Splash() {
  const [, setLocation] = useLocation();
  const { setAppState } = useStore();

  const handleStart = () => {
    setAppState({ hasSeenSplash: true });
    setLocation('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center animate-slide-up bg-background max-w-md mx-auto">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-8 animate-pop">
        <Leaf className="w-12 h-12" />
      </div>
      
      <h1 className="text-3xl font-serif font-bold mb-4 text-foreground">
        Welcome to HabitBloom
      </h1>
      
      <p className="text-lg text-muted-foreground mb-12">
        A quiet space to build the person you want to become, one tiny action at a time.
      </p>

      <button 
        onClick={handleStart}
        className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg flex items-center justify-center shadow-lg active:scale-[0.98] transition-transform"
      >
        Plant the first seed
      </button>
    </div>
  );
}
