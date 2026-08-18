import React, { useState } from 'react';
import { ChevronLeft, FileText, ArrowRight, Search, SortDesc, Filter, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Note } from '../../types';
import { TopicVideoShelf } from '../TopicVideoShelf';

interface SubjectViewProps {
  selectedSubject: Subject | null;
  notes: Note[];
  setView: (view: any) => void;
  setSelectedNote: (note: Note) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  selectedSubject,
  notes,
  setView,
  setSelectedNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const filteredNotes = notes
    .filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="p-8 pb-40 max-w-2xl mx-auto pt-[calc(2rem+var(--safe-top))]">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('home')} 
            className="p-2 -ml-2 text-app-text-muted hover:text-app-accent transition-colors"
          >
            <ChevronLeft size={28} />
          </motion.button>
          <h1 className="text-3xl font-black tracking-tight text-app-text">{selectedSubject?.name}</h1>
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-app-border transition-colors ${sortBy === 'title' ? 'bg-app-accent text-white' : 'bg-white text-app-text-muted'}`}
          >
            <SortDesc size={20} />
          </motion.button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-app-text-muted" size={20} />
        <input 
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-white border border-app-border focus:border-app-accent outline-none transition-all font-bold text-app-text placeholder:text-app-text-muted/50 card-shadow"
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-32 glass rounded-[40px] border border-dashed border-app-border"
            >
              <div className="w-20 h-20 rounded-full bg-app-bg flex items-center justify-center mx-auto mb-6 text-app-text-muted opacity-20">
                <FileText size={40} />
              </div>
              <p className="text-app-text-muted font-bold uppercase tracking-widest text-xs">No entries found</p>
              <p className="text-app-text-muted/60 text-sm mt-2">Try a different search term</p>
            </motion.div>
          ) : (
            filteredNotes.map(note => (
              <motion.button
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedNote(note);
                  setView('note');
                }}
                className="w-full p-6 rounded-[32px] bg-app-card shadow-sm border border-app-border flex items-center gap-5 text-left card-shadow group"
              >
                <div className={`w-16 h-16 rounded-2xl ${selectedSubject?.color} bg-opacity-10 flex items-center justify-center text-app-accent group-hover:scale-110 transition-transform`}>
                  <FileText size={28} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg text-app-text truncate">{note.title}</h3>
                    {note.is_locked && <Lock size={14} className="text-rose-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-app-text-muted text-[10px] font-black uppercase tracking-widest">{new Date(note.created_at).toLocaleDateString()}</p>
                    <div className="w-1 h-1 rounded-full bg-app-border" />
                    <p className="text-app-accent text-[10px] font-black uppercase tracking-widest">
                      {note.content.split(' ').length} words
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-app-bg flex items-center justify-center text-app-text-muted group-hover:bg-app-accent group-hover:text-white transition-all">
                  <ArrowRight size={20} />
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {selectedSubject && (
        <div className="mt-10">
          <TopicVideoShelf
            topic={`${selectedSubject.name} tutorial course`}
            category={selectedSubject.name}
          />
        </div>
      )}
    </div>
  );
};
