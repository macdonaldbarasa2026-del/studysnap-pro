import React from 'react';
import { MessageSquare, LayoutDashboard, Settings, Search, Sparkles, Menu } from 'lucide-react';

interface BottomNavigationProps {
  onAdd: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenMenu: () => void;
}

const items = [
  { id: 'home', icon: LayoutDashboard, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'chats', icon: MessageSquare, label: 'Chats' },
  { id: 'communities', icon: MessageSquare, label: 'Groups' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onAdd, onNavigate, currentView, onOpenMenu }) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="responsive-nav fixed z-50 bg-app-card/95 backdrop-blur-xl border border-app-border shadow-2xl shadow-black/10"
    >
      {/* Phone: simple, familiar bottom navigation */}
      <div className="responsive-nav-mobile">
        <div className="responsive-nav-items">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                onClick={() => onNavigate(item.id)}
                className={`responsive-nav-item ${active ? 'is-active' : ''}`}
              >
                <Icon size={20} strokeWidth={active ? 2.6 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button type="button" aria-label="Open more StudySnap tools" onClick={onOpenMenu} className="responsive-nav-menu">
            <Menu size={20} strokeWidth={2.5} />
            <span className="responsive-nav-more-label">More</span>
          </button>
        </div>
      </div>

      {/* Tablet: compact rail, keeping more vertical workspace */}
      <div className="responsive-nav-tablet">
        <div className="responsive-rail-brand" aria-label="StudySnap"><Sparkles size={18} /></div>
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => onNavigate(item.id)}
              className={`responsive-rail-item ${active ? 'is-active' : ''}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button type="button" aria-label="Open more StudySnap tools" onClick={onOpenMenu} className="responsive-rail-item"><Menu size={20} /><span>More</span></button>
      </div>

      {/* Laptop / desktop: labeled persistent sidebar */}
      <div className="responsive-nav-desktop">
        <div className="responsive-sidebar-brand">
          <div className="responsive-brand-mark"><Sparkles size={19} /></div>
          <div>
            <strong>StudySnap</strong>
            <span>Learning, simplified</span>
          </div>
        </div>
        <div className="responsive-sidebar-group">
          <p>Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
                className={`responsive-sidebar-item ${active ? 'is-active' : ''}`}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onOpenMenu} className="responsive-sidebar-more">
          <Menu size={18} />
          <span>All tools</span>
        </button>
        <button type="button" onClick={onAdd} className="responsive-sidebar-add">
          <Plus size={18} />
          <span>New study item</span>
        </button>
        <div className="responsive-sidebar-help">
          <MoreHorizontal size={16} />
          <span>More tools are available inside each workspace.</span>
        </div>
      </div>
    </nav>
  );
};
