import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Video, 
  Users, 
  Globe, 
  Plus, 
  Clock, 
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Trophy,
  Mic2,
  Presentation
} from 'lucide-react';
import { AcademicEvent, UserProfile } from '../types';

interface AcademicEventsProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const AcademicEvents: React.FC<AcademicEventsProps> = ({ userProfile, onBack }) => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>(() => JSON.parse(localStorage.getItem('studysnap-joined-events') || '[]'));
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'seminar' as any,
    start_time: '',
    description: '',
    is_global: false
  });

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents);
  }, []);

  const handleJoin = (id: string) => { setJoinedEvents(prev => { const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]; localStorage.setItem('studysnap-joined-events', JSON.stringify(next)); return next; }); };

  const handleCreate = async () => {
    setMessage('');
    if (!newEvent.title.trim() || !newEvent.start_time) {
      setMessage('Add an event title and start time first.');
      return;
    }
    setSaving(true);
    const id = Math.random().toString(36).substr(2, 9);
    const payload = {
      id,
      ...newEvent,
      institution_id: userProfile.institution_id || 'global',
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Event creation failed');
      setEvents(prev => [payload, ...prev]);
      setIsCreating(false);
      setNewEvent({ title: '', type: 'seminar', start_time: '', description: '', is_global: false });
    } catch {
      setMessage('Could not publish the event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'competition': return <Trophy size={24} />;
      case 'seminar': return <Mic2 size={24} />;
      case 'presentation': return <Presentation size={24} />;
      default: return <Video size={24} />;
    }
  };

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-app-text">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-3xl font-black text-app-text">Academic Events</h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 rounded-2xl bg-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-100"
        >
          <Plus size={20} />
          Host Event
        </button>
      </div>

      {message && <div role="status" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{message}</div>}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-black text-app-text mb-4 flex items-center gap-2">
            <Globe className="text-indigo-600" size={24} />
            Global Conferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.filter(e => e.is_global).map(event => (
              <motion.div
                key={event.id}
                whileHover={{ y: -4 }}
                className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    {getIcon(event.type)}
                  </div>
                  <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Global</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center gap-4 text-white/70 text-xs font-bold mb-6">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(event.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>420+ Joined</span>
                  </div>
                </div>
                <button onClick={() => handleJoin(event.id)} className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50">{joinedEvents.includes(event.id) ? 'Joined ✓' : 'Join Event'}</button>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-app-text mb-4">Upcoming Local Events</h2>
          <div className="space-y-4">
            {events.filter(e => !e.is_global).map(event => (
              <div key={event.id} className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    {getIcon(event.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-app-text">{event.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-app-text-muted mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1 capitalize"><MapPin size={12} /> {event.type}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleJoin(event.id)} aria-label={`Join ${event.title}`} className="p-3 rounded-2xl bg-app-bg border border-app-border text-app-text hover:bg-neutral-50">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-[40px] p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black mb-6 text-app-text">Host Academic Event</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Event Title</label>
                  <input 
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-amber-500"
                    placeholder="e.g. Annual Science Debate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-amber-500"
                  >
                    <option value="seminar">Seminar</option>
                    <option value="presentation">Presentation</option>
                    <option value="debate">Debate</option>
                    <option value="competition">Competition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-app-text-muted mb-2">Start Time</label>
                  <input 
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-app-bg border border-app-border outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-app-bg border border-app-border">
                  <input 
                    type="checkbox"
                    checked={newEvent.is_global}
                    onChange={e => setNewEvent({ ...newEvent, is_global: e.target.checked })}
                    className="w-5 h-5 rounded border-app-border text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-bold text-app-text">Make this a Global Event</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 rounded-2xl bg-app-bg text-app-text font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-amber-600 text-white font-bold disabled:opacity-50"
                >
                  {saving ? 'Publishing…' : 'Host Event'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
