import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  School, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft,
  Trash2,
  Clock
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  userName: string;
  onBack: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userName, onBack }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    fetch(`/api/notifications/${userName}`)
      .then(res => res.json())
      .then(setNotifications);
  }, [userName]);

  const markAsRead = async (id: string) => { try { const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' }); if (!res.ok) throw new Error('mark read failed'); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); } catch (e) { console.error(e); } };
  const markAllAsRead = async () => { await Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n.id))); };

  const getIcon = (type: string) => {
    switch (type) {
      case 'institution_join': return <School className="text-indigo-600" size={20} />;
      case 'assignment': return <BookOpen className="text-emerald-600" size={20} />;
      case 'exam': return <Calendar className="text-amber-600" size={20} />;
      case 'research': return <MessageSquare className="text-violet-600" size={20} />;
      default: return <Bell className="text-neutral-600" size={20} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="p-6 pb-32 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-app-text">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-3xl font-black text-app-text">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllAsRead} className="min-h-11 px-4 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50">Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center mx-auto mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-xl font-bold text-app-text mb-2">All caught up!</h3>
          <p className="text-app-text-muted">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map(notif => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  notif.read 
                    ? 'bg-app-card border-app-border opacity-70' 
                    : 'bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-neutral-50' : 'bg-indigo-50'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`font-bold text-app-text ${!notif.read && 'text-indigo-900'}`}>{notif.title}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-app-text-muted uppercase tracking-wider">
                        <Clock size={10} />
                        {formatTime(notif.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-app-text-muted leading-relaxed">{notif.message}</p>
                    {!notif.read && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-600">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        New Alert
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
