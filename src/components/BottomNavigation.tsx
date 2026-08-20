import React from 'react';
import '../mobile-layout-fixes.css';
import { MessageSquare, LayoutDashboard, Settings, Search, Sparkles, Menu, Plus, MoreHorizontal, Video, User } from 'lucide-react';

interface BottomNavigationProps {
  onAdd: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenMenu: () => void;
}

const items = [
  { id: 'home', icon: LayoutDashboard, label: 'Feed' },
  { id: 'search', icon: Search, label: 'Explore' },
  { id: 'scanner', icon: Plus, label: 'Create' },
  { id: 'videos', icon: Video, label: 'Reels' },
  { id: 'settings', icon: User, label: 'Profile' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onAdd, onNavigate, currentView, onOpenMenu }) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-app-card border-t border-app-border pb-[var(--safe-bottom)]"
    >
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 ${
                active ? 'text-app-accent' : 'text-app-text-muted'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
