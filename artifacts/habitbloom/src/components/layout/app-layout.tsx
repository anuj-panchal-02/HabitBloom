import { Link, useLocation } from 'wouter';
import { Home, Calendar, BookOpen, Settings } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/reflections', label: 'Reflections', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto bg-background shadow-2xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28 safe-top">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom,0)] z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} className="flex-1">
                <div className="flex flex-col items-center justify-center py-2 relative w-full h-full">
                  <Icon 
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pop" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
