import React, { useState } from 'react';
import { ChevronLeft, FileText, Search, BookOpen, Video } from 'lucide-react';
import { Subject, Note } from '../../types';
import { TopicVideoShelf } from '../TopicVideoShelf';

interface SubjectViewProps {
  selectedSubject: Subject | null;
  notes: Note[];
  setView: (view: any) => void;
  onBack?: () => void;
  setSelectedNote: (note: Note) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  selectedSubject,
  notes,
  setView,
  onBack,
  setSelectedNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'videos'>('notes');

  const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="feature-workspace flex flex-col min-h-[100dvh] bg-app-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack || (() => setView('home'))} className="rounded-xl p-2 text-app-text hover:bg-app-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent" aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-app-text truncate max-w-[200px]">
            {selectedSubject?.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setView('search')} className="rounded-xl p-2 text-app-text hover:bg-app-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent" aria-label="Search notes">
              <Search size={24} />
           </button>
        </div>
      </header>

      <main className="feature-workspace-scroll flex-1 pb-20">
        {/* Subject Header / Stats */}
        <div className="bg-app-card p-6 flex flex-col items-center gap-4 border-b border-app-border">
           <div className={`w-20 h-20 rounded-full ${selectedSubject?.color} flex items-center justify-center text-white shadow-lg`}>
              <BookOpen size={40} />
           </div>
           <div className="text-center">
              <h2 className="text-xl font-bold text-app-text">{selectedSubject?.name}</h2>
              <p className="text-sm text-app-text-muted mt-1">Learning Area</p>
           </div>
           <div className="flex gap-10 mt-2">
              <div className="text-center">
                <div className="font-bold text-app-text">{notes.length}</div>
                <div className="text-xs text-app-text-muted">Notes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-app-text">0</div>
                <div className="text-xs text-app-text-muted">Following</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-app-text">0</div>
                <div className="text-xs text-app-text-muted">Study Hrs</div>
              </div>
           </div>
        </div>

        <div className="px-4 py-3 bg-app-card border-b border-app-border">
          <label className="flex items-center gap-2 rounded-xl border border-app-border bg-app-bg px-3 py-2 text-app-text-muted focus-within:border-app-accent">
            <Search size={16} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search this learning area" className="min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none" />
          </label>
        </div>

        {/* Functional content switcher. */}
        <div className="flex border-b border-app-border bg-app-card">
           <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-2 text-sm font-bold ${activeTab === 'notes' ? 'border-app-accent text-app-accent' : 'border-transparent text-app-text-muted'}`}>
              <FileText size={18} /> Notes
           </button>
           <button onClick={() => setActiveTab('videos')} className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-2 text-sm font-bold ${activeTab === 'videos' ? 'border-app-accent text-app-accent' : 'border-transparent text-app-text-muted'}`}>
              <Video size={18} /> Videos
           </button>
        </div>

        {activeTab === 'videos' ? (
          <div className="p-4"><TopicVideoShelf topic={selectedSubject?.name || 'Study skills'} /></div>
        ) : <div className="grid grid-cols-3 gap-0.5 mt-0.5">
           {filteredNotes.map(note => (
             <button 
               key={note.id} 
               onClick={() => { setSelectedNote(note); setView('note'); }}
               className="aspect-square bg-app-card border border-app-border/10 flex items-center justify-center p-2 text-center group active:opacity-70"
             >
                <div className="flex flex-col items-center gap-1">
                   <FileText size={24} className="text-app-accent opacity-40 group-hover:opacity-100" />
                   <span className="text-[10px] font-bold text-app-text line-clamp-2">{note.title}</span>
                </div>
             </button>
           ))}
           {filteredNotes.length === 0 && (
             <div className="col-span-3 py-20 text-center">
                <p className="text-sm text-app-text-muted">No notes yet in this area</p>
             </div>
           )}
        </div>}
      </main>
    </div>
  );
};
